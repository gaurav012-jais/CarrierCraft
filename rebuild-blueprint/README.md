# 🚀 WAP Manager: Enterprise Carrier Billing & Funnel Platform Blueprint

Welcome to the **Master Rebuild Blueprint** for the complete **WAP Manager Enterprise SaaS Platform**.

Yeh documentation specially design ki gayi hai taaki aap is project ko **shuru se (scratch se)** bina kisi confusion ya code-mess ke step-by-step bana sakein. Isme **Admin Management SaaS Portal** aur **Public High-Speed Mobile Funnel Engine** dono ko complete detail me cover kiya gaya hai.

---

## 📚 Complete Blueprint Table of Contents

| File | Topic & Scope |
| :--- | :--- |
| **[01-PROJECT-OVERVIEW.md](file:///d:/dddd/rebuild-blueprint/01-PROJECT-OVERVIEW.md)** | **Full Platform Overview (Non-Tech Friendly)**<br>Yeh project asal me kya karta hai, WAP Manager ke dono major worlds (Admin Portal + Public Mobile Funnel), Telecom Carrier Billing (DCB), aur purani kichdi ko kaise door kiya gaya hai. |
| **[02-NON-TECH-ARCHITECTURE-AND-CLEAN-CODE.md](file:///d:/dddd/rebuild-blueprint/02-NON-TECH-ARCHITECTURE-AND-CLEAN-CODE.md)** | **Architecture & Clean Code Standards**<br>3 Saaf Layers ka Mental Model (The Bouncer, The Stage, The Cashier), End-to-End Sequence Diagram, aur Strict 150-200 lines per file ka rule. |
| **[03-BACKEND-SPECIFICATION.md](file:///d:/dddd/rebuild-blueprint/03-BACKEND-SPECIFICATION.md)** | **Backend Architecture & APIs (10 Micro-Modules)**<br>Auth, Markets, Campaigns, Templates, Vendors/Affiliates, Public Flow Engine, Partner Billing Gateway Proxy, Postback Retry Worker, Session Waterfall Inspector, aur Cache Management. |
| **[04-FRONTEND-SPECIFICATION.md](file:///d:/dddd/rebuild-blueprint/04-FRONTEND-SPECIFICATION.md)** | **Frontend & MASTER FIGMA-STYLE PROTOTYPE PROMPT**<br>React/Tailwind/Zustand architecture + **Master Playable Design Prompt** jo **Admin SaaS Web Portal** (Dashboard, Markets, Campaigns, GrapesJS Canvas, Logs, Postbacks) aur **Public Mobile Funnel** dono ko Figma "Play" prototype format me cover karta hai! |
| **[05-DATABASE-SCHEMA.md](file:///d:/dddd/rebuild-blueprint/05-DATABASE-SCHEMA.md)** | **Database Tables, Relations & Performance Indexes (15 Tables)**<br>Complete ER diagram, har table ka role, SQL DDL schema, high-traffic indexes, aur dead code cleanup. |
| **[06-STEP-BY-STEP-BUILD-ROADMAP.md](file:///d:/dddd/rebuild-blueprint/06-STEP-BY-STEP-BUILD-ROADMAP.md)** | **Step-by-Step Build Roadmap & Checklist**<br>Phase 1 se Phase 7 tak ka execution plan aur code commit karne se pehle ka self-review checklist. |
| **[07-FREE-TECH-STACK-AND-ALTERNATIVES.md](file:///d:/dddd/rebuild-blueprint/07-FREE-TECH-STACK-AND-ALTERNATIVES.md)** | **100% Free & Open-Source Tech Stack & ₹0 Cloud Guide**<br>Purane stack ke saare free components ki detail + Modern cleaner alternatives (Drizzle vs TypeORM, Local disk vs Cloudinary, Zero-cost cloud tiers). |

---

## 🎯 Golden Rules For Scratch Rebuild
1. **100% Free / Open-Source (Zero Paid Licenses).**
2. **Never write a file longer than 200 lines.** Agar lamba hone lage, split into helpers/services/hooks.
3. **Single Responsibility:** Routes route karenge, Controllers input validate karenge, Services business logic chalayenge, DB sirf data dega.
4. **No Mixed Sources of Truth:** Campaign flow mode (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`) Campaign Detail me set hoga, aur Canvas buttons simple standardized actions fire karenge.
