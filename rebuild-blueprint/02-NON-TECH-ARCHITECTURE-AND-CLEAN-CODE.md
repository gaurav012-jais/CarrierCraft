# Architecture & Clean Code Standards (Non-Tech Friendly)

> **Document Type:** System Architecture & Clean Engineering Guidelines  
> **Key Focus:** Clean mental model, zero spaghetti code, modular files (under 150-200 lines), non-tech friendly clarity.

---

## 1. The Clean Mental Model: 3 Saaf Layers (No More Kichdi!)

Purane system me jo sabse badi dikkat thi woh thi ki **Detect, Routing, aur Canvas Actions** aapas me ulajh gaye the. Clean architecture me hum isko **3 alag-alag layers** me baantte hain:

```mermaid
graph TD
    subgraph "Layer 1: Identity & Gateway Decision (The Bouncer)"
        L1["Traffic Aata Hai (URL Parameters)\nCheck karo: User ka phone number (MSISDN) mila ya nahi?"]
        L1_DEC{"Decision"}
        L1 --> L1_DEC
        L1_DEC -- "HE Phone Mil Gaya" --> L1_A["Set Session Phone = MSISDN\nDirect Home ya 1-Click Subscribe"]
        L1_DEC -- "WiFi / No Phone" --> L1_B["Set Session Phone = null\nForce OTP Required"]
        L1_DEC -- "Blocked / Fraud" --> L1_C["Show BLOCKED Page Immediately"]
    end

    subgraph "Layer 2: Visual Presentation (The Stage / UI)"
        L2["React Pages (HOME, OTP, CONFIRM, THANKYOU)\nCanvas Se Generated HTML/CSS Render Hoti Hai"]
        L2_BTN["User Button Click Karta Hai\nButton Action: SUBSCRIBE ya GOTO_PAGE"]
    end

    subgraph "Layer 3: Partner Billing & Delivery (The Cashier)"
        L3["Telecom Operator Gateway (Zain, Etisalat, MTN)\nActual Billing & SMS Execution"]
        L3_RES["Result: Success (Postback fire karo) ya Low Balance / Error"]
    end

    L1_A --> L2
    L1_B --> L2
    L2_BTN --> L3
    L3 --> L3_RES
```

### Simple Rules For Each Layer:
1. **Layer 1 (The Bouncer - Detect Engine):** Iska kaam sirf yeh tay karna hai ki user ko andar aane dena hai ya nahi, aur kya uska phone number network se automatically mil gaya (HE) ya nahi. Iska visual design se koi lena-dena nahi hai.
2. **Layer 2 (The Stage - Frontend Pages):** Yeh sirf screen dikhata hai (`HOME`, `OTP`, `CONFIRM`, `THANKYOU`). Jab user CTA button dabata hai, yeh bas ek event fire karta hai: *"Hey Backend, user wants to SUBSCRIBE with this phone number!"*.
3. **Layer 3 (The Cashier - Partner Service):** Yeh backend ka worker hai jo Telecom Operator ke API se baat karke paise deduct karwata hai aur agar user valid hai toh usko Thank You page par bhejta hai.

---

## 2. End-to-End Sequence Diagram (Kaise Data Flow Hota Hai)

Ek non-tech person ke liye poori journey niche diye sequence diagram me asani se samjhi ja sakti hai:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Mobile User
    participant Front as 📱 React Funnel (/subscription)
    participant Back as ⚙️ Express Backend (/api/flow)
    participant Telco as 🏢 Telecom Partner (Billing Gateway)
    participant AdNet as 📊 Ad Network (Traffic Source)

    User->>Front: Ad par click kiya (URL: ?country=AE&campid=101&click_id=XYZ)
    Front->>Back: GET /api/flow/detect-msisdn (Headers + Query params)
    
    alt Header Enrichment (HE) Available
        Back-->>Front: { status: "HE_SUCCESS", msisdn: "97150xxxxxxx" }
        Front->>User: Dikhata hai HOME Page (with 1-Click "Subscribe Now" button)
        User->>Front: Clicks "Subscribe Now"
        Front->>Back: POST /api/flow/transition { action: "SUBSCRIBE" }
        Back->>Telco: POST /subscribe { msisdn: "97150xxxxxxx" }
        Telco-->>Back: { responseCode: "0", status: "SUCCESS" }
    else WiFi / No HE (OTP Path)
        Back-->>Front: { status: "OTP_REQUIRED", msisdn: null }
        Front->>User: Dikhata hai HOME Page (or direct Phone Input)
        User->>Front: Apna phone number enter karke "Submit" kiya
        Front->>Back: POST /api/otp/send { phone: "97150xxxxxxx" }
        Back->>Telco: GET /otp/subscribe?msisdn=...
        Telco-->>User: Real SMS with 4-digit OTP
        User->>Front: 4-digit OTP enter karta hai
        Front->>Back: POST /api/otp/verify { phone, otp: "1234" }
        Back->>Telco: GET /otp/validate_otp?msisdn=...&otp=1234
        Telco-->>Back: { responseCode: "0", status: "SUBSCRIBED" }
    end

    Back->>Back: Mark Visit as SUBSCRIBED in DB
    Back--)AdNet: S2S Postback (GET /postback?click_id=XYZ&payout=2.50)
    Back-->>Front: { nextPage: "THANKYOU" }
    Front->>User: 🎉 THANK YOU PAGE (Access to Games / Content Granted)
```

---

## 3. Clean Code Rules: Code Kabhi Messy Aur Lamba Na Ho

Purane codebase me functions 200 lines ke the aur files 500+ lines ki. Naye project me hum **Strict Coding Rules** follow karenge:

### Rule 1: 150-200 Lines Per File Limit (Strict Rule)
- Koi bhi JavaScript ya React file **200 lines se badi nahi hogi**.
- Agar koi file 180 lines cross karne lage, toh turant logic ko chote `helpers/`, `services/`, ya `hooks/` me split karo.

### Rule 2: Single Responsibility Principle (Ek File, Ek Kaam)
- **Routes File (`*.routes.js`):** Sirf paths aur middleware batayega (10-30 lines). Business logic bilkul nahi hoga.
- **Controller File (`*.controller.js`):** Sirf request se data nikalega (`req.body`), service ko dega, aur response bhejega (`res.json`). Maximum 40-70 lines.
- **Service File (`*.service.js`):** Saara business logic, database queries, aur calculations yahan honge.
- **Helper File (`helpers/*.js`):** Chote reusable calculation functions (e.g., phone format karna, tracking ID parse karna).

### Rule 3: Frontend "Smart Hook + Dumb Component" Pattern
- **UI Components (Dumb):** React components sirf HTML aur styling render karenge. Unke andar koi lamba API logic nahi hoga.
- **Custom Hooks (Smart):** Saara API call, timer, aur validation logic alag hook file me rahega (e.g., `useOtpHandler.js`, `useSubscriptionFlow.js`).

### Rule 4: Self-Descriptive Naming (No Guesswork)
- Variables ke naam itne saaf hone chahiye ki bina comment padhe samajh aa jaye:
  - ❌ `const res = await chk(p);` (Ganda code)
  - ✅ `const partnerCheckResponse = await partnerBillingService.checkSubscription(msisdn);` (Saaf code)

---

## 4. Ideal Folder Structure (Scratch Rebuild Blueprint)

### Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── app.js                   # Express app config (CORS, JSON parser) < 50 lines
│   ├── server.js                # Port listener & DB connect < 40 lines
│   ├── config/                  # Environment variables & constants
│   ├── database/
│   │   ├── connection.js        # DB connect instance (TypeORM / Prisma)
│   │   └── entities/            # Har table ka alag schema file (Clean & Typed)
│   ├── middlewares/             # Auth JWT guard, Error handler, Rate limiter
│   ├── modules/                 # Modular micro-features (Self-contained)
│   │   ├── auth/                # Login, signup, JWT
│   │   ├── markets/             # Countries & Operators management
│   │   ├── campaigns/           # Campaign creation & offer configuration
│   │   ├── templates/           # GrapesJS HTML/CSS storage
│   │   ├── partners/            # Vendors & Affiliates management
│   │   ├── flow/                # /detect-msisdn, /page, /transition
│   │   │   ├── flow.routes.js
│   │   │   ├── flow.controller.js
│   │   │   ├── flow.service.js
│   │   │   └── helpers/         # he-resolver.js, tracking-parser.js
│   │   ├── otp/                 # Partner OTP send/verify + local mock
│   │   └── analytics/           # Visit tracking, conversions, postbacks
│   └── utils/                   # logger.js, http-client.js, response.js
```

### Frontend Structure (`/frontend`)
```
frontend/
├── src/
│   ├── main.jsx                 # App entry point
│   ├── app/                     # App router & layout shell
│   ├── assets/                  # Logos, icons, default graphics
│   ├── components/              # Reusable UI widgets (Buttons, Modals, Tables)
│   ├── pages/
│   │   ├── admin/               # Admin Portal Pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MarketsPage.jsx
│   │   │   ├── CampaignsPage.jsx
│   │   │   ├── CampaignDetailPage.jsx
│   │   │   └── VisualEditorPage.jsx (GrapesJS Canvas)
│   │   └── subscription/        # Public End-User Landing (/subscription)
│   │       ├── SubscriptionPage.jsx     # Master container (< 100 lines)
│   │       ├── hooks/                   # useDetect.js, useOtpFlow.js, usePageRenderer.js
│   │       └── components/              # PhoneInput.jsx, OtpModal.jsx, StatusCard.jsx
│   ├── services/                # Axios API callers (adminApi.js, flowApi.js)
│   ├── store/                   # Zustand stores (useAuthStore.js, useFunnelStore.js)
│   └── styles/                  # Tailwind CSS configuration
```

Is clean structure se naya developer bhi 10 minute me samajh jayega ki kaunsi cheez kahan rakhi hai!
