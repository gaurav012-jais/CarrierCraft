# CarrierCraft — Telecom WAP Carrier Billing & Dynamic Subscription Platform

Enterprise-grade Telecom WAP billing, subscriber Header Enrichment (HE) detection, dynamic multi-step subscription funnels, and partner attribution platform.

---

## 📁 Repository Structure

This repository contains both the **core platform codebase** (`carriercraft/`) and the complete **architectural redirect & verification flow specifications** (`rebuild-blueprint/`):

```
CarrierCraft/
├── carriercraft/                               # Full platform source code
│   ├── backend/                                # Node.js / Express modular API
│   │   ├── src/
│   │   │   ├── modules/                        # auth, markets, campaigns, flow, otp, partners, analytics
│   │   │   ├── database/                       # PostgreSQL schema & connection
│   │   │   └── server.js                       # Server entry point (port 4000)
│   │   ├── scripts/                            # DB setup, seeds & smoke tests
│   │   └── package.json
│   ├── frontend/                               # React 19 + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/                     # Layout, campaigns, flow nodes, live preview
│   │   │   ├── pages/                          # MarketsPage, MarketCampaignsPage, CampaignDetailPage, SubscriptionPage
│   │   │   └── services/api.js                 # API client
│   │   └── package.json
│   └── stitch_wap_manager_enterprise_platform/ # UI prototypes and Stitch assets
└── rebuild-blueprint/                          # Complete architectural blueprint & flow guides
    ├── flows/                                  # Detailed operational flow documentation
    │   ├── 01-MASTER-ARCHITECTURE-AND-CONCEPTUAL-FLOW.md
    │   ├── 02-ATTRIBUTION-VISIT-LIFECYCLE-AND-POSTBACKS.md
    │   ├── 03-HE-DETECT-AND-DECISION-MATRIX.md
    │   ├── 04-VERIFICATION-MODES-AND-FUNNEL-LAYOUTS.md
    │   ├── 05-CANVAS-EDITOR-AND-BUTTON-INTERACTIONS.md
    │   ├── 06-PARTNER-APIS-OTP-LIFECYCLE-AND-DCB-BILLING.md
    │   ├── 07-ADMIN-PORTAL-AND-OPERATION-FLOW.md
    │   └── INDEX.md
    └── 01-PROJECT-OVERVIEW.md ... 07-FREE-TECH-STACK.md
```

---

## 🚀 Key Features

1. **Carrier Header Enrichment (HE) & Wi-Fi Fallback**:
   - Automatic 1-Click subscriber recognition via cellular telco headers (`x-msisdn`, `x-network-info`).
   - Seamless fallback to SMS OTP verification when browsing on Wi-Fi.

2. **7 Verification Modes**:
   - `Header Injection`, `OTP only`, `Header Injection + OTP`, `Universe Telecom DCB`, `Orange Burkina Faso`, `None (null / CG redirect)`, and `CG via HOME (no HE)`.

3. **Markets & Carrier Campaigns Management**:
   - Clean tabular hierarchy for countries and telecom operators (`/markets`).
   - Deep campaign tracking (`{COUNTRY}-{OPERATOR}-{ID}`).
   - Tabbed flow builder with live lock/unlock and layout defaults.

4. **Live Funnel Testing & Simulator**:
   - Live testing URL: `/subscription?country={CC}&operator={OP}&tracking_campid={ID}`.
   - Built-in interactive mobile drawer in the campaign flow canvas for instant 1-click end-to-end testing.

---

## 🛠️ Quick Start

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port `5432`:
```bash
cd carriercraft/backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
node scripts/setup-db.js
node scripts/seed-wap-markets.js
```

### 2. Run Backend API
```bash
cd carriercraft/backend
npm run start
# Running at http://localhost:4000
```

### 3. Run Frontend
```bash
cd carriercraft/frontend
npm install
npm run dev
# Running at http://localhost:5173
```

Default credentials:
- **Email**: `abhivishwkarmaa52@gmail.com`
- **Password**: `123456`
