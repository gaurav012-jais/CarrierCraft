# Backend Specification: Architecture, Micro-Modules & APIs

> **Document Type:** Full Platform Backend Technical Specification  
> **Platform Scope:** Entire WAP Manager SaaS Platform (Admin Management + Partner Integrations + Runtime Flow Engine)  
> **Tech Stack:** Node.js 20+, Express.js (ESM), TypeORM / PostgreSQL (or MySQL), Redis (caching & rate-limiting)  
> **Key Goal:** 100% Modular, Clean Architecture, Max 150-200 lines per file.

---

## 1. Backend Design Philosophy & Micro-Module Architecture

Backend ko feature-specific micro-modules me divide kiya gaya hai taaki koi bhi monolithic ya lamba file create na ho:

```
src/modules/
├── auth/          # Admin authentication, JWT token, profile
├── users/         # Admin user management & RBAC (superadmin, manager)
├── markets/       # Countries & Telecom Operators management
├── campaigns/     # Campaign creation, flow modes, daily capping
├── templates/     # GrapesJS HTML/CSS/JSON canvas storage
├── partners/      # Vendors (Ad networks), Affiliates & Postback URLs
├── flow/          # Public Flow Engine (/detect-msisdn, /page, /transition)
├── otp/           # Telecom partner OTP proxy + Local mock engine
├── analytics/     # Traffic visits, session inspector waterfall, aggregated stats
├── postbacks/     # S2S postback worker with exponential retry queue
├── cache/         # Redis cache flush & pre-fetch management
└── callbacks/     # Incoming telecom operator billing renewal webhooks
```

Har module ke andar strict 4 files hongi:
- `*.routes.js` (< 40 lines): Sirf Express paths aur authentication middleware.
- `*.controller.js` (< 80 lines): Request validation (`req.body`, `req.params`) aur HTTP response format (`res.json`).
- `*.service.js` (< 150 lines): Pure business logic aur database queries.
- `helpers/*.js` (< 60 lines each): Small pure functions (e.g. tracking macro parser, header resolver).

---

## 2. Complete Module Specifications

### 2.1 Module: `auth` & `users` (Admin Authentication & RBAC)
*   **Purpose:** Secure admin access with JWT and role-based permissions (`superadmin`, `manager`, `viewer`).
*   **Endpoints:**
    *   `POST /api/auth/login`: Accepts `{ email, password }` -> Returns `{ token, user }`. Password verified with `bcrypt`.
    *   `GET /api/auth/me`: Returns logged-in user profile from JWT payload.
    *   `GET /api/users`: Lists admin team members (Admin-only guard).
    *   `POST /api/users`: Creates a new operator/manager with hashed password.

---

### 2.2 Module: `markets` (Countries & Telecom Operators)
*   **Purpose:** Manage target geographies and telecom carrier configurations.
*   **Endpoints:**
    *   `GET /api/markets`: Returns all countries with nested operators, currency, dial codes, and campaign counts.
    *   `POST /api/markets/countries`: Adds a new country (e.g. UAE, code: `AE`, dialCode: `+971`, currency: `AED`).
    *   `POST /api/markets/operators`: Adds a telecom operator (e.g. `ETISALAT` under `AE`) with Header Enrichment detection header list: `["x-msisdn", "x-network-info", "x-up-calling-line-id"]`.
    *   `PATCH /api/markets/operators/:id/toggle`: Activates/pauses an operator.

---

### 2.3 Module: `campaigns` & `templates` (Offer & Page Manager)
*   **Purpose:** Configure campaign offers, assign verification modes, and manage GrapesJS templates.
*   **Endpoints:**
    *   `GET /api/campaigns`: Filterable list of campaigns by country, operator, and status.
    *   `POST /api/campaigns`: Creates a new campaign and auto-generates tracking ID: `{COUNTRY}-{OPERATOR}-{ID}` (e.g. `AE-ETISALAT-101`).
    *   `GET /api/campaigns/:id`: Returns campaign details, assigned verification mode (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`, `NONE`), daily conversion cap, and assigned pages.
    *   `PUT /api/campaigns/:id/mode`: Updates verification flow mode.
    *   `GET /api/templates/:id`: Fetches GrapesJS projectData JSON, HTML, and CSS.
    *   `PUT /api/templates/:id`: Saves visual editor changes from GrapesJS Canvas.

---

### 2.4 Module: `partners` (Traffic Sources, Affiliates & Postbacks)
*   **Purpose:** Manage Ad Networks (Vendors) and their S2S Postback templates.
*   **Endpoints:**
    *   `GET /api/partners/vendors`: Lists all ad networks (e.g. PropellerAds, Mobidea) with assigned campaigns.
    *   `POST /api/partners/vendors`: Creates a vendor with a Postback URL template:
        `https://adnetwork.com/postback?clickid={click_id}&payout={payout}&campid={campid}`
    *   `POST /api/partners/campaign-tracking`: Assigns a vendor to a campaign with custom payout (e.g. $2.00) and daily cap.
    *   `GET /api/partners/tracking-link`: Generates a ready-to-use tracking link for the affiliate:
        `https://engine.domain.com/subscription?country=AE&operator=Etisalat&campid=AE-ETISALAT-101&vid=ADM01&click_id={CLICK_ID}`

---

### 2.5 Module: `flow` (Public Runtime Engine)
*   **Purpose:** Handle real user traffic on `/subscription` with maximum speed (< 50ms latency).
*   **Endpoints:**
    *   `GET /api/flow/detect-msisdn`:
        - Ingests headers and query parameters (`country`, `operator`, `campid`, `vid`, `click_id`).
        - Evaluates Header Enrichment (HE).
        - Creates a new `Visit` record in database.
        - Returns `{ success: true, visitId, msisdn, detected, verificationMode, entryPage }`.
    *   `GET /api/flow/page`:
        - Takes `campid` and `pageType` (`HOME`, `OTP`, `CONFIRM`, `THANKYOU`, `BLOCKED`, `LOW_BALANCE`).
        - Replaces dynamic macros: `{{msisdn}}` -> user's phone, `{{price}}` -> campaign price, `{{serviceName}}` -> offer title.
        - Returns `{ pageType, html, css, buttons }`.
    *   `POST /api/flow/transition`:
        - Handles CTA clicks (e.g. user clicks "SUBSCRIBE NOW").
        - If phone is already verified -> Triggers telecom partner billing call.
        - If billing succeeds -> Sets status to `SUBSCRIBED`, queues conversion postback, and returns `nextPage: "THANKYOU"`.
        - If phone is not verified -> Returns `nextPage: "OTP"`.

---

### 2.6 Module: `otp` (Partner SMS OTP Proxy & Local Mock)
*   **Purpose:** Communicate with telecom partner SMS gateways without storing OTPs locally.
*   **Endpoints:**
    *   `POST /api/otp/send`: Calls partner `send_otp_url` with `{{msisdn}}` and `{{serviceId}}`.
    *   `POST /api/otp/verify`: Calls partner `verify_otp_url` with `{{msisdn}}` and `{{otp}}`.
*   **Developer Mock Engine:**
    - If `MOCK_PARTNER_OTP=true` in `.env`:
      - No real SMS is sent. Console logs: `[MOCK OTP DELIVERED]: Code 1234 for +971501234567`.
      - Verification with `1234` returns instant `SUCCESS`.

---

### 2.7 Module: `postbacks` (S2S Postback Worker & Retry Engine)
*   **Purpose:** Guarantee delivery of conversion postbacks to ad networks.
*   **Logic:**
    1. When a visit reaches `SUBSCRIBED` status, an async task is pushed to the postback worker.
    2. Postback URL macros are parsed (`{click_id}`, `{payout}`, `{campid}`).
    3. An outbound HTTP GET call is executed with a 5-second timeout.
    4. Result (HTTP Status, Latency, Response Body) is logged in `conversion_postbacks`.
    5. If ad network server returns 500/timeout, worker schedules up to 3 automatic retries with exponential backoff (1m, 5m, 15m).
*   **Endpoints:**
    *   `GET /api/postbacks`: Lists all sent postbacks with status (`SUCCESS` / `FAILED`).
    *   `POST /api/postbacks/:id/retry`: Allows admin to manually trigger a retry for any failed postback.

---

### 2.8 Module: `analytics` & `logs` (Session Waterfall Inspector)
*   **Purpose:** Real-time visibility into traffic, conversion rates, and individual session debug trails.
*   **Endpoints:**
    *   `GET /api/analytics/dashboard`: Aggregated KPIs (Visits, HE%, Conversions, CR%, Revenue) with hourly sparklines.
    *   `GET /api/analytics/visits`: Searchable list of all user visits with filters by country, vendor, status.
    *   `GET /api/analytics/visits/:visitId`: Returns the **Full Granular Timeline Waterfall** of a visit:
        - `00:00:00` - Hit recorded.
        - `00:00:080ms` - HE Check completed.
        - `00:00:150ms` - Page rendered.
        - `00:00:850ms` - CTA clicked.
        - `00:01:120ms` - Telecom billing response received.
        - `00:01:310ms` - Postback sent.

---

### 2.9 Module: `callbacks` (Telecom Webhook Ingestion)
*   **Purpose:** Handle asynchronous renewal, billing success, and churn notifications from telecom carriers.
*   **Endpoint:**
    *   `POST /api/flow/callback`: Ingests carrier webhooks, verifies signature, deduplicates transactions via Redis lock, and updates subscription records.

---

### 2.10 Module: `cache` (Performance & Cache Invalidation)
*   **Purpose:** Manage Redis cache for campaign configurations and templates.
*   **Endpoints:**
    *   `POST /api/admin/cache/flush`: Purges template and campaign cache so changes in Canvas reflect instantly in production.
    *   `GET /api/admin/cache/stats`: Returns Redis memory usage and hit/miss ratio.
