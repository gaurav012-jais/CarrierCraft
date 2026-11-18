# Backend Specification: Architecture, Modules & APIs

> **Document Type:** Technical & Functional Backend Specification  
> **Tech Stack:** Node.js 20+, Express.js (ESM), TypeORM / PostgreSQL (or MySQL), Redis (optional for rate-limiting/cache)  
> **Key Goal:** 100% Modular, Zero Spaghetti, Max 150-200 lines per file.

---

## 1. Backend Design Philosophy & Micro-Module Architecture

Backend ko humne **Feature-Based Modules** me organize kiya hai. Har module apne aap me complete hota hai aur uska apna routes, controller, service aur helpers folder hota hai:

```
module-name/
├── module-name.routes.js      # Sirf HTTP Endpoints & Auth Middleware (< 40 lines)
├── module-name.controller.js  # Req validation, Service call, Res return (< 80 lines)
├── module-name.service.js     # Pure business logic & Database queries (< 150 lines)
└── helpers/                   # Small pure utility functions (< 50 lines each)
```

---

## 2. All Backend Modules & Their Responsibilities

| Module | Purpose (Simple Hindi-English) | Key Endpoints |
| :--- | :--- | :--- |
| **`auth`** | Admin user login, JWT token generation, password hashing (bcrypt). | `POST /api/auth/login`, `GET /api/auth/me` |
| **`users`** | Admin system users manage karna (super-admin, campaign-manager). | `GET /api/users`, `POST /api/users` |
| **`markets`** | Countries (UAE, Kenya, etc.) aur Telecom Operators (Etisalat, Safaricom) define karna. | `GET /api/markets`, `POST /api/markets/countries`, `POST /api/markets/operators` |
| **`campaigns`** | Landing page offers create karna, verification mode set karna (`BOTH`, `OTP_ONLY`, etc.). | `GET /api/campaigns`, `POST /api/campaigns`, `GET /api/campaigns/:id` |
| **`templates`** | GrapesJS visual editor ka HTML, CSS aur JSON state save aur load karna. | `GET /api/templates/:id`, `PUT /api/templates/:id` |
| **`partners`** | Traffic sources (Vendors jaise PropellerAds) aur unke sub-affiliates manage karna. | `GET /api/partners/vendors`, `POST /api/partners/vendors` |
| **`flow`** | **[CORE ENGINE]** Public user session start karna, HE detect karna, page HTML serve karna, transitions handle karna. | `GET /api/flow/detect-msisdn`, `GET /api/flow/page`, `POST /api/flow/transition` |
| **`otp`** | Telecom Partner ke gateway se real SMS OTP bhejna aur verify karna. | `POST /api/otp/send`, `POST /api/otp/verify` |
| **`analytics`** | Visits log karna, conversion record karna, aur ad network ko S2S Postback bhejna. | `GET /api/analytics/dashboard`, `POST /api/flow/callback` |

---

## 3. Core Engine: Flow & Detection Deep-Dive

Yeh system ka sabse critical hissa hai. Ise clean rakhne ke liye humne 3 specific endpoints banaye hain:

### Endpoint 1: `GET /api/flow/detect-msisdn`
Jab user ad par click karke landing page par aata hai, toh frontend sabse pehle yeh endpoint call karta hai.

*   **Input (Query Params & Headers):**
    *   `campid` ya `tracking_campid`: e.g. `AE-ETISALAT-10`
    *   `vid`: Vendor ID (e.g. `ADM01`)
    *   `click_id`: Ad network click identifier
    *   Incoming HTTP Headers: `x-msisdn`, `x-network-info`, etc.
*   **Logic (Clean Service):**
    1. Campaign aur Operator ki settings check karo.
    2. Kya HTTP Headers me phone number (MSISDN) mila?
    3. Agar nahi mila, toh kya partner ka remote `resolve_msisdn_url` configured hai? Agar haan, toh background API call karke phone fetch karo.
    4. Database me naya `Visit` record insert karo (status: `VISIT` ya `DETECT_SUCCESS`).
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "visitId": "vst_987654321",
      "msisdn": "971501234567",       // Agar detect hua, nahi toh null
      "detected": true,
      "verificationMode": "BOTH",
      "entryPage": "HOME",
      "redirectUrl": null             // Agar carrier gateway pe redirect karna ho
    }
    ```

---

### Endpoint 2: `GET /api/flow/page`
Frontend ko current step ka HTML aur CSS chahiye hota hai render karne ke liye.

*   **Input (Query Params):**
    *   `campid`: `AE-ETISALAT-10`
    *   `pageType`: `HOME` | `OTP` | `CONFIRM` | `THANKYOU` | `BLOCKED` | `ERROR`
*   **Logic:**
    1. Campaign ke assigned template ko fetch karo.
    2. Dynamic tags replace karo:
       *   `{{msisdn}}` -> User ka actual phone number (or blank if not known).
       *   `{{price}}` -> Campaign ka billing price (e.g. `5 AED/week`).
       *   `{{serviceName}}` -> Service name (e.g. `Gamerz Hub`).
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "pageType": "HOME",
      "html": "<div class='container'><h1>Play 500+ Games</h1>...</div>",
      "css": ".container { background: #000; color: #fff; }",
      "buttons": [
        { "id": "btn_sub", "action": "SUBSCRIBE", "target": "CONFIRM" }
      ]
    }
    ```

---

### Endpoint 3: `POST /api/flow/transition`
Jab user landing page par CTA button ("Subscribe", "Continue", etc.) click karta hai.

*   **Input (Body):**
    ```json
    {
      "visitId": "vst_987654321",
      "action": "SUBSCRIBE",
      "currentPage": "HOME",
      "phone": "971501234567"
    }
    ```
*   **Decision Matrix (Extremely Clean Logic):**
    *   Agar phone number pehle se verified hai (HE ya OTP se) -> Telecom Billing API call karo (`partner.subscribe()`).
        *   Agar Billing SUCCESS hui -> Status set karo `SUBSCRIBED`, postback trigger karo, aur `nextPage: "THANKYOU"` return karo.
        *   Agar Low Balance hai -> `nextPage: "LOW_BALANCE"` return karo.
    *   Agar phone number nahi hai -> `nextPage: "OTP"` return karo taaki user OTP daal sake.

---

## 4. Telecom Partner Gateway Integration (Billing & OTP)

Hum real-world telecom aggregator APIs (jaise TickHighs, SubOTP, Safaricom Daraja, etc.) ke sath connect karte hain. Partner ke sath communication ka clean wrapper service hota hai:

### Partner Client (`partner-billing.service.js`)
```javascript
// Clean & Modular Partner Gateway Client
export class PartnerBillingService {
  async sendOtp({ msisdn, serviceId, apiConfig }) {
    const url = apiConfig.sendOtpUrl
      .replace('{{msisdn}}', msisdn)
      .replace('{{serviceId}}', serviceId);
    
    // Outbound API Call with Timeout & Log
    const response = await httpClient.get(url, { timeout: 5000 });
    return {
      success: response.data.responseCode === "0",
      raw: response.data
    };
  }

  async verifyOtp({ msisdn, otp, apiConfig }) {
    const url = apiConfig.verifyOtpUrl
      .replace('{{msisdn}}', msisdn)
      .replace('{{otp}}', otp);

    const response = await httpClient.get(url, { timeout: 5000 });
    return {
      success: response.data.responseCode === "0",
      subscribed: response.data.isSubscribed === true,
      raw: response.data
    };
  }
}
```

### Local Dev Mock Mode (Very Important!)
Developers ko local laptop par bina real SIM ya SMS balance kharch kiye test karne ke liye ek **Mock Provider** inbuilt rahega:
- Agar environment variable `MOCK_PARTNER_OTP=true` hai:
  - Phone par fake SMS bhejta hai aur console me print karta hai: `[DEV MOCK OTP]: 1234`.
  - Har OTP verification `1234` par automatically `SUCCESS` ho jati hai.
  - Isse developers fast develop aur debug kar sakte hain.

---

## 5. Conversion Postback & Attribution Engine

Jab koi user successfully subscribe kar leta hai, toh jis Ad Network (Vendor) ne traffic bheja tha, usko commission ka notification bhejna zaroori hota hai:

1. System check karta hai kya is `Visit` ke sath `click_id` aur `vid` tha.
2. Vendor ki settings se `postback_url` template fetch karta hai:
   `https://network.com/postback?clickid={click_id}&payout={payout}`
3. Placeholders replace karta hai:
   `https://network.com/postback?clickid=XYZ98765&payout=2.50`
4. Background non-blocking HTTP GET call execute hoti hai.
5. Postback ka status (`SUCCESS` / `FAILED`, HTTP Status, Response Body, Timestamp) `conversion_postbacks` table me log hota hai for audit.

---

## 6. Backend Error Handling & Logging Standard

- Har API response ka format standard hoga:
  ```json
  // Success
  { "success": true, "data": { ... }, "message": "Success message" }

  // Error
  { "success": false, "error": { "code": "INVALID_OTP", "message": "The OTP you entered is expired or invalid" } }
  ```
- **Winston / Pino Logger:** Console.log ki jagah structured JSON logging use hogi. Har outbound telecom API call ka latency record kiya jayega taaki pata chale telecom partner slow toh nahi ho raha.
