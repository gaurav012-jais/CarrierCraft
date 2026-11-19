# 🚀 CarrierCraft: Enterprise Telecom Carrier Billing & Funnel Platform

Clean, modular, and enterprise-grade rebuild of the **WAP Manager Platform**.

---

## 🌟 What Was Built
* **Backend (`/backend`):** Node.js + Express + PostgreSQL with 10 Micro-Modules (Auth, Markets, Campaigns, Templates, Partners, Flow Engine, OTP, Analytics, Postbacks, Webhooks). Every file is strictly under 150 lines.
* **Database (`127.0.0.1:5432`):** PostgreSQL database `carriercraft` with 15 normalized tables, high-throughput indexes, and complete demo seed data.
* **Frontend (`/frontend`):** React 19 + Vite + Tailwind CSS + Lucide Icons + Material Symbols.
  * **100% Light Theme:** Crisp white cards, slate-50 background, elegant borders.
  * **Zero Green Color:** Styled with a modern **Royal Blue (`#2563eb`)** and **Cyan / Sky Blue (`#0284c7`)** palette.
  * **Fully Working & Connected:** Dashboard, Markets, Campaigns, Visual Funnel Canvas, Traffic Logs & Waterfall Inspector, Vendors, Postbacks, and an Interactive Live Funnel Test Lab!

---

## ⚡ How to Run and Test (Quick Start)

### 1. Start the Backend API (Port 4000)
Open a terminal:
```bash
cd d:\dddd\carriercraft\backend
npm run dev
# Backend runs on: http://localhost:4000
```

### 2. Start the Frontend Web App (Port 5173)
Open another terminal:
```bash
cd d:\dddd\carriercraft\frontend
npm run dev
# Frontend runs on: http://localhost:5173
```

### 3. Log In & Test
1. Open your browser: `http://localhost:5173`
2. Sign in with:
   * **Email:** `admin@carriercraft.com`
   * **Password:** `admin123`
3. Explore the pages:
   * **Dashboard:** Live executive telemetry, KPI cards, real-time conversions stream.
   * **Markets:** View UAE / Etisalat, add new countries and carriers.
   * **Campaigns:** View Gamerz Hub offer, switch flow modes (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`).
   * **Flow Canvas:** Edit landing page copy, switch viewports (Mobile 375px vs Desktop), configure CTA button actions.
   * **Traffic Logs:** View incoming visits and click **Waterfall** to inspect granular timeline events.
   * **Postbacks:** View S2S delivery logs with manual retry support.
   * **Live Funnel Lab (`/simulator`):** Test live subscriber conversion:
     - Try 1-Click HE Mode (Instant subscribe).
     - Try WiFi Mode (Sends mock OTP code `1234` -> Enter `1234` -> Instant Subscribe).
     - Then check Dashboard & Traffic Logs to see your test conversion recorded live!
