# 07 - Admin Portal, Management & Operational Workflows
## Back-Office Dashboard, Campaign Setup, Editor & Reporting

> **Purpose:** Ye document WAP Manager ke back-office admin dashboard, user roles, campaign configuration, GrapesJS visual editing, session logs, aur postback reporting ke complete operation flow ko explain karta hai.

---

### 1. Authentication & Security (Admin Credentials)

Admin dashboard access ke liye JWT (JSON Web Token) authentication use hoti hai:

* **Single Superadmin:**
  - Email: `abhivishwkarmaa52@gmail.com`
  - Password: `******` *(Local test environment)*
  - Role: `superadmin` / `admin` (Has full access to User Management, Markets, System Logs, and Global Settings).
* **JWT Token Lifespan:**
  - Token validity 24 hours hoti hai (`JWT_EXPIRATION="24h"`).
  - Frontend token ko `localStorage` me store karta hai aur har API call ke `Authorization: Bearer <token>` header me attach karta hai.
* **Role-Based Guards (`RequireAdmin`):**
  - Standard users campaigns aur templates create kar sakte hain.
  - User management (naya user banana, suspend karna) aur system-wide cache clearance sirf superadmin kar sakta hai.

---

### 2. The 6 Core Administrative Modules

Dashboard me 6 main sections hote hain jo pure subscription operations ko manage karte hain:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MARKETS & OPERATORS                                                      │
│ Manage countries (UAE, Saudi, Kenya, etc.), operators (Etisalat, Zain),     │
│ currency codes, and telephone dial prefixes.                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CAMPAIGN MANAGEMENT                                                      │
│ Create campaigns, set verification mode (BOTH, OTP_ONLY, DCB), layout,      │
│ daily conversion capping, and assign vendor payouts.                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. VISUAL TEMPLATE CANVAS EDITOR                                            │
│ Drag-and-drop page builder (GrapesJS) for all 8 funnel pages with live      │
│ mobile/tablet preview.                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. VENDORS & PARTNER POSTBACKS                                              │
│ Configure affiliate network postback URLs with macros ({click_id}, {payout})│
│ and monitor S2S delivery logs.                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. REAL-TIME SESSION LOGS & API CALL TRACE                                  │
│ Inspect every click: HE token, masked MSISDN, checksub response, billing     │
│ callbacks, and terminal redirect status.                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. DAILY STATS & CONVERSION ANALYTICS                                       │
│ Aggregate views, visits, clicks, OTPs, conversions, revenue, and CR% per    │
│ campaign and per vendor.                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Step-by-Step Operator Workflow: Launching a New Campaign

Ek nayi telecom campaign launch karne ka exact operational flow ye hota hai:

#### Step 1: Select Market (Country & Operator)
- Admin `Markets` section me jata hai.
- Country choose karta hai (e.g. `United Arab Emirates`) aur Operator select karta hai (e.g. `Etisalat`).
- Operator ka country code (`AE`) aur operator code (`ETISALAT`) automatically load ho jate hain.

#### Step 2: Create Campaign
- Admin `Create Campaign` modal open karta hai:
  - **Campaign Name:** `Gamerz Hub UAE`
  - **Verification Mode:** `BOTH` (Smart Detection) ya `OTP_ONLY`.
  - **Funnel Layout:** `packs_on_home` (Fast 1-step checkout) ya `classic`.
  - **Daily Capping (Optional):** Max conversions limit (e.g. 500 per day). Capping exceed hone par offer automatically stop ho jata hai ya fallback campaign par switch ho jata hai.
- Save hote hi campaign ka tracking ID generate hota hai: `AE-ETISALAT-101`.

#### Step 3: Configure Partner APIs (`api_configs`)
- Campaign Detail page par jaakar `API & HE Settings` open kiya jata hai:
  - **HE Provider:** `header` (Carrier SIM detection).
  - **Checksub API URL:** `https://telco-gw.com/sub/checksub?msisdn={{msisdn}}&serviceId=GAME`
  - **SMS OTP URLs:** Send OTP aur Verify OTP endpoints enter kiye jate hain.
  - **Success / Fail Redirect URLs:** Agar already active users ko kisi gaming portal par bhejna ho toh link save kiya jata hai.

#### Step 4: Design Funnel in Canvas Editor
- Admin `Edit Template` click karta hai.
- GrapesJS editor open hota hai:
  - Mobile Viewport (375px x 812px) select karta hai.
  - Required flow blocks drag karta hai (Subscribe button, OTP phone field, Verify button).
  - Button properties me action set karta hai (`data-action="SUBSCRIBE"`).
  - Changes save karta hai (`Save Campaign Pages`).

#### Step 5: Assign Vendors & Get Tracking Link
- Admin `Vendor Assign` par jata hai.
- Affiliate network choose karta hai (e.g. `TikTok Media / Aff 101`).
- Payout set karta hai (e.g. `$2.50 per conversion`).
- Final Tracking Link generate hota hai:
  ```
  https://my-wap-domain.com/subscription?country=AE&operator=Etisalat&tracking_campid=AE-ETISALAT-101&campid={vendor_camp}&click_id={clickid}
  ```
- Ye link ad network me paste kar diya jata hai.

---

### 4. Real-Time Debugging & Session Inspection (`api_call_logs`)

Jab koi user complaints kare ya testing me issue aaye, toh admin `Campaign Logs` / `Session Detail` me jakar kisi bhi visit ka 100% exact trace dekh sakta hai:

```
[Session Trace: Visit #14829]
├── 09:15:01.120 [VISIT] Created from IP 197.232.88.10 (User-Agent: iPhone iOS 17)
├── 09:15:01.350 [HE_TOKEN] Safaricom OAuth Token HTTP 200 OK
├── 09:15:01.520 [HE_MSISDN] Resolved Masked Phone: 2547****4589
├── 09:15:01.680 [CHECK_SUB] Status: "new" (Eligible for subscription)
├── 09:15:01.710 [HE_REDIRECT] Outcome: "stay" (Show HOME Funnel)
├── 09:15:08.400 [TRANSITION] Action: "SUBSCRIBE" (Pack: daily)
├── 09:15:09.100 [SUBSCRIBE] Direct Billing HTTP 200 OK (Charged 10 KES)
└── 09:15:09.450 [VENDOR_POSTBACK] Fired to https://adnetwork.com/pb?clickid=aff123 (HTTP 200 OK)
```

Is deep traceability ki wajah se telecom discrepancies, carrier header drops, aur affiliate disputes seconds me resolve ho jate hain!
