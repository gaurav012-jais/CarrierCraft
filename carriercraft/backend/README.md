# ⚡ CarrierCraft Backend: Micro-Module Telecom Carrier Billing API

Clean, modular, enterprise-grade Express.js backend for the **CarrierCraft WAP Manager Platform**.

---

## 🌟 Architecture Highlights
* **Zero Spaghetti Code:** Every single file is strictly under 150 lines.
* **Feature Micro-Modules:** Routes, Controllers, Services, and Helpers are neatly separated.
* **100% Free & Open-Source:** Node.js, Express, PostgreSQL, Bcrypt, JWT.
* **In-Memory & E2E Tested:** Automated 15-point test suite verifies every module end-to-end.

---

## 📂 Directory Structure
```
carriercraft/backend/
├── src/
│   ├── app.js                   # Express application setup (< 45 lines)
│   ├── server.js                # Port listener & DB connect (< 40 lines)
│   ├── config/                  # Environment config (< 30 lines)
│   ├── database/                # Connection pool, schema.sql, seed.js (< 60 lines each)
│   ├── middlewares/             # Auth & Global error handling (< 40 lines each)
│   ├── utils/                   # Standard API response helpers (< 25 lines)
│   ├── routes/                  # Central route registry (< 35 lines)
│   └── modules/
│       ├── auth/                # Admin Login & JWT (/api/auth)
│       ├── users/               # Admin Team Management (/api/users)
│       ├── markets/             # Countries & Operators (/api/markets)
│       ├── campaigns/           # Offers & Flow Modes (/api/campaigns)
│       ├── templates/           # GrapesJS Canvas HTML/CSS (/api/templates)
│       ├── partners/            # Vendors & Postback Templates (/api/partners)
│       ├── flow/                # Core Public Runtime (/api/flow)
│       ├── otp/                 # SMS OTP & Direct Billing (/api/otp)
│       ├── analytics/           # Dashboard KPIs & Waterfall (/api/analytics)
│       └── postbacks/           # S2S Postbacks & Retry Engine (/api/postbacks)
└── scripts/
    ├── setup-db.js              # Complete DB & Seed Runner
    └── smoke-test-inmemory.js   # Automated 15-Point End-to-End Test Suite
```

---

## 🚀 Getting Started

### 1. Database Setup & Demo Seed
```bash
node scripts/setup-db.js
```

### 2. Run Comprehensive Test Suite
```bash
node scripts/smoke-test-inmemory.js
```

### 3. Start Backend Server
```bash
npm run dev
# Server will run on: http://localhost:4000
```
