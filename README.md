# 🚀 Rebuild Blueprint: Clean Scratch Development Guide

Welcome to the **Master Rebuild Blueprint** for the Telecom WAP Carrier Billing & Dynamic Subscription Funnel Platform.

Yeh documentation specially design ki gayi hai taaki aap is project ko **shuru se (scratch se)** bina kisi confusion ya code-mess ke step-by-step bana sakein.

---

## 📚 Complete Blueprint Table of Contents

| File | Topic & Scope |
| :--- | :--- |
| **[01-PROJECT-OVERVIEW.md](file:///d:/dddd/rebuild-blueprint/01-PROJECT-OVERVIEW.md)** | **Project Ka A-to-Z Overview (Non-Tech Friendly)**<br>Yeh project asal me kya karta hai, Telecom Carrier Billing (DCB) kya hoti hai, aur purani kichdi ko kaise door kiya gaya hai. |
| **[02-NON-TECH-ARCHITECTURE-AND-CLEAN-CODE.md](file:///d:/dddd/rebuild-blueprint/02-NON-TECH-ARCHITECTURE-AND-CLEAN-CODE.md)** | **Architecture & Clean Code Standards**<br>3 Saaf Layers ka Mental Model, End-to-End Sequence Diagram, aur Strict 150-200 lines per file ka rule. |
| **[03-BACKEND-SPECIFICATION.md](file:///d:/dddd/rebuild-blueprint/03-BACKEND-SPECIFICATION.md)** | **Backend Architecture & APIs**<br>Express micro-modules, `/detect-msisdn`, `/page`, `/transition` endpoints, Telecom Partner gateway proxy, aur local dev mock mode. |
| **[04-FRONTEND-SPECIFICATION.md](file:///d:/dddd/rebuild-blueprint/04-FRONTEND-SPECIFICATION.md)** | **Frontend & Master Interactive Figma Prototype Prompt**<br>React/Tailwind/Zustand architecture + **Master Playable Design Prompt** (Figma interactive prototype style: Screen 1 se Screen 7 tak ka working flow). |
| **[05-DATABASE-SCHEMA.md](file:///d:/dddd/rebuild-blueprint/05-DATABASE-SCHEMA.md)** | **Database Tables, Relations & Indexes**<br>Complete ER diagram, har table ka role, SQL DDL schema, high-traffic indexes, aur dead code cleanup. |
| **[06-STEP-BY-STEP-BUILD-ROADMAP.md](file:///d:/dddd/rebuild-blueprint/06-STEP-BY-STEP-BUILD-ROADMAP.md)** | **Step-by-Step Build Roadmap & Checklist**<br>Phase 1 se Phase 7 tak ka execution plan aur code commit karne se pehle ka self-review checklist. |

---

## 🎯 Golden Rules For Scratch Rebuild
1. **Never write a file longer than 200 lines.** Agar lamba hone lage, split into helpers/services/hooks.
2. **Single Responsibility:** Routes route karenge, Controllers input validate karenge, Services business logic chalayenge, DB sirf data dega.
3. **No Mixed Sources of Truth:** Campaign flow mode (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`) Campaign Detail me set hoga, aur Canvas buttons simple standardized actions fire karenge.
