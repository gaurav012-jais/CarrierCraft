# WAP Manager — Complete Architecture & Flow Documentation Index

> **Welcome:** Ye series of documents WAP Manager platform ke poore architecture, working flows, telecom integrations, aur operational lifecycles ko complete depth me cover karti hai. Isse aap pure system ko deeply samajh sakte hain aur kisi bhi client, team member ya partner ko confidently explain kar sakte hain.

---

### Table of Contents

| File | Topic & Scope | Key Concepts Covered |
| :--- | :--- | :--- |
| **[01-MASTER-ARCHITECTURE-AND-CONCEPTUAL-FLOW.md](file:///d:/dddd/rebuild-blueprint/flows/01-MASTER-ARCHITECTURE-AND-CONCEPTUAL-FLOW.md)** | **Master Architecture & Conceptual Model** | • Core business purpose (Telecom DCB & WAP billing)<br>• The 3 Layers: Layer A (Detect), Layer B (Graph Mode), Layer C (Canvas Hotspots)<br>• 2 Non-Negotiable Invariants: Visit-First rule & Third-party privacy boundary<br>• End-to-end user journey flowchart |
| **[02-ATTRIBUTION-VISIT-LIFECYCLE-AND-POSTBACKS.md](file:///d:/dddd/rebuild-blueprint/flows/02-ATTRIBUTION-VISIT-LIFECYCLE-AND-POSTBACKS.md)** | **Attribution, Visits & S2S Postbacks** | • `rcid` (Affiliate click ID) vs `click_id` (Internal UUID)<br>• Dual Campaign IDs: `tracking_campid` vs `campid`<br>• Redis 120s locking & deduplication<br>• S2S Conversion Postbacks: `registerPending()`, billing callbacks, vendor macro expansion |
| **[03-HE-DETECT-AND-DECISION-MATRIX.md](file:///d:/dddd/rebuild-blueprint/flows/03-HE-DETECT-AND-DECISION-MATRIX.md)** | **Header Enrichment & The 8-Way Decision Matrix** | • What is Header Enrichment (HE)?<br>• 4 HE Providers (`header`, `none`, `custom_http`, `safaricom_masked`)<br>• Complete 8-Way Decision Matrix of `/detect-msisdn`<br>• Silent Exit vs Funnel Mode (Zero-Flash Guarantee) |
| **[04-VERIFICATION-MODES-AND-FUNNEL-LAYOUTS.md](file:///d:/dddd/rebuild-blueprint/flows/04-VERIFICATION-MODES-AND-FUNNEL-LAYOUTS.md)** | **Verification Modes & Funnel Layouts** | • 6 Verification Modes: `BOTH`, `OTP_ONLY`, `HEADER_INJECTION`, `NONE`, `UNIVERSE_DCB`, `ORANGE_BF`<br>• `classic` Layout (Step-by-step) vs `packs_on_home` Layout (Fast 1-step checkout)<br>• Behavior comparison matrix |
| **[05-CANVAS-EDITOR-AND-BUTTON-INTERACTIONS.md](file:///d:/dddd/rebuild-blueprint/flows/05-CANVAS-EDITOR-AND-BUTTON-INTERACTIONS.md)** | **Visual Canvas Editor & Button Behaviors** | • GrapesJS Visual Editor integration<br>• The 8 Funnel Page Types: `HOME`, `OTP`, `CONFIRM`, `THANKYOU`, `INPROGRESS`, `LOW_BALANCE`, `BLOCKED`, `ERROR`<br>• Button action types: `SUBSCRIBE`, `CONFIRM`, `SUBSCRIBE_ROUTE`, direct page jumps, and Priority Chain<br>• Clickable Area Hotspots |
| **[06-PARTNER-APIS-OTP-LIFECYCLE-AND-DCB-BILLING.md](file:///d:/dddd/rebuild-blueprint/flows/06-PARTNER-APIS-OTP-LIFECYCLE-AND-DCB-BILLING.md)** | **Partner APIs, OTP & Direct Billing Execution** | • `api_configs` schema & parameter templates<br>• Checksub & Blocklist HTTP contracts & status normalization<br>• OTP Lifecycle: Send, 30s countdown cooldown, max 5 attempts, dev OTP preview, verify<br>• Direct Carrier Billing (`subscribeApi`) execution & balance deduction |
| **[07-ADMIN-PORTAL-AND-OPERATION-FLOW.md](file:///d:/dddd/rebuild-blueprint/flows/07-ADMIN-PORTAL-AND-OPERATION-FLOW.md)** | **Admin Portal, Operations & Session Tracing** | • Admin Login (`abhivishwkarmaa52@gmail.com` / `123456`) & JWT Auth<br>• 6 Dashboard modules (Markets, Campaigns, Canvas Editor, Vendors, Session Logs, Daily Stats)<br>• Step-by-step campaign creation to tracking link generation<br>• Deep real-time click trace via `api_call_logs` |

---

### Clean Design Standards Reminder
* **No Green Color:** Primary actions use Royal Blue / Electric Indigo (`#2563EB` / `#4F46E5`), accents use Slate / Cyan (`#0284C7`), warnings use Amber (`#F59E0B`), errors use Crimson (`#DC2626`).
* **Light Theme Only:** Crisp white backgrounds (`#FFFFFF`), light gray surfaces (`#F8FAFC`), modern subtle borders (`#E2E8F0`), and dark charcoal typography (`#0F172A`).
