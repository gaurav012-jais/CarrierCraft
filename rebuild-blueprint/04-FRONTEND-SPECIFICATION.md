# Frontend Specification & Master Full-Platform Figma Prototype Prompt

> **Document Type:** Frontend Architecture & Master UI/UX Design System Specification  
> **Scope:** Entire WAP Manager Enterprise SaaS Platform (Admin Management Portal + Visual Canvas Builder + Public Mobile Subscription Runtime)  
> **Tech Stack:** React 19, Vite, Tailwind CSS, Zustand, GrapesJS Canvas, Lucide Icons, Framer Motion

---

## 1. Full Platform Architecture: The Two Major Worlds

WAP Manager koi simple mobile app nahi hai; yeh ek **Full-Scale Enterprise SaaS Platform** hai jisme do alag-alag major interfaces kaam karte hain:

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                 WAP MANAGER ECOSYSTEM                       │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
     ┌───────────────────────────────────────────────┐                                 ┌───────────────────────────────────────────────┐
     │      1. ADMIN MANAGEMENT SAAS PORTAL          │                                 │      2. PUBLIC MOBILE FUNNEL RUNTIME          │
     │      (Desktop Web App: 1440px / Responsive)   │                                 │      (Ultra-Fast Mobile Web: 375px x 812px)   │
     ├───────────────────────────────────────────────┤                                 ├───────────────────────────────────────────────┤
     │ • Executive KPI Dashboard & Real-Time Stats   │                                 │ • Ad Traffic Ingestion (/subscription)        │
     │ • Markets (Countries & Telecom Operators)     │                                 │ • Header Enrichment (HE) Auto-Detect          │
     │ • Campaigns Hub (Flow Modes: BOTH, OTP, HE)   │                                 │ • Dynamic Template Renderer (HTML/CSS)        │
     │ • Visual GrapesJS Canvas Landing Page Builder │                                 │ • 1-Click Subscribe & Partner OTP Flow        │
     │ • Telecom Partner API Configurations          │                                 │ • Charging Micro-State & Thank You Page       │
     │ • Traffic Partners (Vendors, Affiliates, Caps)│                                 │ • Insufficient Balance & Blocked Handling     │
     │ • Real-time Traffic Logs & Session Inspector  │                                 │ • Automated Conversion Postback Trigger       │
     │ • Conversion Postbacks & S2S Retry Audit      │                                 └───────────────────────────────────────────────┘
     │ • Cache & Webhook Callback Simulator          │
     └───────────────────────────────────────────────┘
```

---

## 2. MASTER DESIGN PROMPT: Entire WAP Manager Platform (Figma Play Prototype)

> 💡 **KAISE USE KAREIN:** Yeh prompt aap Galileo, v0, Bolt, Figma AI, ya kisi bhi Senior UI/UX Designer ko de sakte hain. Yeh poor WAP Manager project ke **Admin Portal (Desktop)** aur **Public Mobile Funnel** dono ko ek integrated Figma Interactive Prototype (Play Button View) ke roop me define karta hai.

```markdown
### ==============================================================================================
### [MASTER DESIGN PROMPT]: WAP MANAGER — ENTERPRISE TELECOM CARRIER BILLING & FUNNEL PLATFORM
### ==============================================================================================

System Type: Dual-Surface SaaS Platform (Surface 1: Desktop Admin Portal | Surface 2: Mobile Funnel Runtime)
Design Language: Modern Dark/Slate Enterprise Theme
Color Palette:
  - Base Background: Slate-950 (#0B0F19)
  - Surface Cards: Slate-900 (#0F172A) with 1px border (#1E293B)
  - Primary Accent: Electric Emerald (#10B981) for Actions, Conversions & Success
  - Secondary Accent: Neon Cyan (#06B6D4) for Telecom & Identity Metrics
  - Warning Accent: Warm Amber (#F59E0B) for Low Balance & Cap Alerts
  - Danger Accent: Rose (#F43F5E) for Errors, Blocked Users & Failed Postbacks
  - Typography: Inter & JetBrains Mono (for logs/macros)

==================================================================================================
PART 1: ADMIN MANAGEMENT SAAS PORTAL (DESKTOP VIEWPORT: 1440px x 900px)
==================================================================================================

### GLOBAL LAYOUT STRUCTURE (Admin Shell):
* Left Sidebar (Fixed 260px, Slate-900, Border-r Slate-800):
  - Brand Header: Neon Logo ("⚡ WAP Manager") with version badge "v2.5 Enterprise".
  - Nav Section 1 [ANALYTICS]:
    - Dashboard (Icon: LayoutDashboard, Badge: "Live")
    - Traffic Logs & Sessions (Icon: Activity)
    - Postbacks & Audit (Icon: Send)
  - Nav Section 2 [OPERATIONS]:
    - Markets & Telcos (Icon: Globe2)
    - Campaigns Hub (Icon: Flame)
    - Visual Canvas Builder (Icon: Palette)
  - Nav Section 3 [PARTNERS]:
    - Vendors & Affiliates (Icon: Users)
    - Billing API Configs (Icon: Cpu)
  - Nav Section 4 [SYSTEM]:
    - Cache & Webhooks (Icon: Database)
    - Users & Access (Icon: ShieldCheck)
  - Bottom User Profile: Avatar, Name ("Gaurav J."), Role ("Super Admin"), Logout icon.

---

### SCREEN A: EXECUTIVE LIVE DASHBOARD (/dashboard)
* Header: "Real-Time Performance Dashboard" + Timeframe filter [Today, Yesterday, Last 7 Days, Custom] + Market Filter dropdown (All Countries, UAE, Kenya, South Sudan).
* KPI Metric Cards (Top Grid of 4):
  1. Total Ad Clicks / Visits: "248,920" (↑ 14.2% vs yesterday) + Mini Sparkline.
  2. Header Enrichment (HE) Rate: "42.8%" (106,537 auto-detected numbers) [Cyan Badge].
  3. Total Conversions (Subscribers): "9,842" [Emerald Highlight] with CR of 3.95%.
  4. Gross Revenue: "$24,605.00" (Average Payout $2.50/sub).
* Charts Section (Split 60/40):
  - Left Chart (60%): Multi-line Area chart showing hourly traffic vs conversions (Visits in Slate-500, Conversions in Emerald-500).
  - Right Chart (40%): Donut chart showing Conversion Breakdown by Mode (1-Click HE: 58%, OTP Verified: 38%, Direct CG: 4%).
* Live Conversions Feed (Bottom Table):
  - Real-time rolling table: Timestamp, Country (Flag icon), Operator (Etisalat/Zain), MSISDN (masked `97150****89`), Vendor (`ADM01`), Payout (`$2.50`), Status (`SUCCESS` pill).

---

### SCREEN B: MARKETS & OPERATORS (/markets)
* Purpose: Configure telecom operators and define HTTP Header Enrichment rules.
* View: Grid of Country Cards (e.g., UAE 🇦🇪, Kenya 🇰🇪, South Sudan 🇸🇸, Burkina Faso 🇧🇫).
* Inside a Country Card (e.g., UAE):
  - Operator list: "Etisalat" (Active, 3 Campaigns), "du" (Active, 1 Campaign).
  - Operator Detail Drawer (Opens on click):
    - Operator Code: `ETISALAT`
    - Dial Code: `+971`, Currency: `AED`
    - Detection Headers JSON Editor: `["x-msisdn", "x-network-info", "x-up-calling-line-id"]`
    - Status Toggle: [Active / Maintenance]
    - Action Button: "+ Create New Campaign for Etisalat"

---

### SCREEN C: CAMPAIGN DETAIL & FUNNEL CONTROL HUB (/markets/:cc/:oc/campaigns/:id)
* Header: Campaign Name ("Etisalat Gamerz Hub") + Tracking ID badge (`AE-ETISALAT-101`) + Status toggle [LIVE].
* Section 1: Verification Flow Mode Selector (Crucial Control):
  - Segmented Radio Switcher with 3 clear options:
    1. `BOTH` (Recommended: Auto-detects phone via HE; falls back to OTP if on WiFi).
    2. `OTP_ONLY` (Forces phone entry & SMS OTP verification for every user).
    3. `HEADER_INJECTION` (Strict HE: Users without mobile data are rejected).
* Section 2: Funnel Pages Manager (Visual Cards for the 6 Core Pages):
  - 6 Interactive Cards: [1. HOME] [2. OTP] [3. CONFIRM] [4. THANKYOU] [5. BLOCKED] [6. LOW_BALANCE].
  - Each card shows: Page thumbnail preview, Last edited time, and Action button: "🎨 Open in Visual Canvas Editor".
* Section 3: Partner Telecom API Configuration Modal:
  - Form Fields:
    - Check Subscription API: `https://partner.com/api/checksub?msisdn={{msisdn}}&serviceId={{serviceId}}`
    - Send OTP API: `https://partner.com/api/send_otp?msisdn={{msisdn}}`
    - Verify OTP API: `https://partner.com/api/validate_otp?msisdn={{msisdn}}&otp={{otp}}`
    - Direct Subscribe API (1-Click HE): `https://partner.com/api/charge?msisdn={{msisdn}}`
    - Remote Resolve MSISDN URL (HE fallback): `https://partner.com/api/he_detect`
* Section 4: Traffic Vendors & Attribution Tracking Links:
  - Assign Vendor dropdown (e.g., PropellerAds, Mobidea).
  - Set Payout ($2.00) & Daily Conversion Cap (500 conversions/day).
  - Auto-generated Tracking URL with 1-click Copy:
    `https://engine.domain.com/subscription?country=AE&operator=Etisalat&campid=AE-ETISALAT-101&vid=ADM01&click_id={CLICK_ID}`

---

### SCREEN D: VISUAL CANVAS PAGE BUILDER (/campaigns/:id/edit/:pageType)
* Purpose: Drag-and-drop landing page editor (built with GrapesJS).
* Top Bar:
  - Left: Back to Campaign link + Current editing page badge ("Editing: HOME Page").
  - Center: Viewport Switcher [🖥️ Desktop | 📱 Mobile 375px | 📱 Tablet 768px] (Default: Mobile).
  - Right: Undo/Redo, Clear Canvas, "👁️ Preview", and "💾 Save & Publish" (Emerald Button).
* Left Sidebar (Component Blocks Drawer):
  - Drag-and-drop block categories:
    - Layout: Containers, Grids, Floating Cards.
    - Funnel Specific: "Subscribe CTA Button", "Phone Number Input Group", "4-Digit OTP Box", "Pricing Pill", "Disclaimer Footer", "Operator Logo Badge".
* Center Canvas:
  - Mobile Device Frame (375px x 812px) with live WYSIWYG editing, drag-and-drop reordering, and instant text editing.
* Right Sidebar (Action & Styling Property Panel):
  - Custom "When Clicked" Action Inspector for Buttons:
    - Action Type Dropdown:
      * `SUBSCRIBE Flow` -> Triggers the core 1-click HE or OTP engine transition.
      * `Go to Page` -> Jump directly to another page (e.g., OTP or Terms).
      * `External URL` -> Redirect out to partner content.
    - Button Styling: Background gradient, hover effects, corner radius, drop shadow.

---

### SCREEN E: TRAFFIC LOGS & SESSION WATERFALL INSPECTOR (/analytics)
* Purpose: Complete visibility into every single visitor click.
* Main View: Searchable table of visits with filters by Date, Country, Operator, Vendor, and Status (`SUBSCRIBED`, `BLOCKED`, `FAILED`).
* Granular Session Detail Drawer (Opens on clicking any visit row):
  - Visitor Meta: IP (`197.234.12.8`), User Agent (Chrome Mobile / Android 14), Click ID (`prop_987213`).
  - Interactive Visual Waterfall Timeline:
    * 00:00:00 - User landed from Ad link.
    * 00:00:080ms - Headers evaluated -> Header Enrichment (HE) Resolved MSISDN `+971501234567`.
    * 00:00:150ms - HOME Page rendered.
    * 00:00:850ms - User tapped primary CTA button (`data-action="SUBSCRIBE"`).
    * 00:01:120ms - Telecom Partner API called (`POST /subscribe`) -> Latency: 180ms -> ResponseCode: "0" (SUCCESS).
    * 00:01:200ms - Status updated to `SUBSCRIBED`.
    * 00:01:310ms - S2S Conversion Postback fired to PropellerAds -> HTTP 200 OK.

---

### SCREEN F: POSTBACKS & S2S AUDIT (/postbacks)
* Purpose: Monitor and retry server-to-server affiliate conversion postbacks.
* Table Columns: Timestamp, Vendor Name, Campaign, Click ID, Payout ($), HTTP Status (200 / 500 / Timeout), Retry Count, Action ("🔄 Retry Now").
* Day Logs Tab: Summary by date showing Total Conversions vs Postbacks Successfully Delivered.

==================================================================================================
PART 2: PUBLIC MOBILE FUNNEL RUNTIME (MOBILE VIEWPORT: 375px x 812px)
==================================================================================================

### SCREEN 1: SMART DETECTOR (Loading & Identity Ingestion)
* URL: `/subscription?country=AE&operator=Etisalat&campid=AE-ETISALAT-101&vid=ADM01&click_id=XYZ`
* Visuals: Dark pulse background, Animated neon spinner, "Connecting securely to Etisalat network...", SSL lock badge.
* Outcome:
  - If HE detected -> Instant crossfade to SCREEN 2 (HOME - 1-Click).
  - If WiFi / No HE -> Instant crossfade to SCREEN 3A (Phone Input).

### SCREEN 2: HOME OFFER PAGE (1-Click HE Flow)
* Header: Operator Logo (Etisalat) + Language switch (EN/AR).
* Hero: 3D Gaming graphics, Headline "UNLIMITED GAMING VAULT", 3 value pills ([✓ Ad-Free] [✓ 500+ Games] [✓ Cancel Anytime]).
* Identity Card: "Subscribing with SIM: +971 50 *** 4589" (Cyan badge) + "Price: 3.50 AED/day".
* CTA Button: Full-width Emerald Button "SUBSCRIBE NOW & PLAY" with right arrow.
* Click Action: Shows inline spinner -> Crossfades to SCREEN 4.

### SCREEN 3A & 3B: PHONE INPUT & 4-DIGIT OTP VERIFICATION (WiFi Flow)
* 3A: Input phone with +971 prefix -> Click "Send Code" -> Slides left to 3B.
* 3B: 4 individual PIN boxes (50x60px), 30s resend timer, "VERIFY & CONFIRM" button.
* Error state: Wrong code shakes boxes with red border.
* Success state: Crossfades to SCREEN 4.

### SCREEN 4: CHARGING EXECUTION (Micro-State)
* Pulsing shield animation: "Confirming subscription with mobile carrier...".
* Routes to SCREEN 5 (Success), SCREEN 6 (Low Balance), or SCREEN 7 (Blocked).

### SCREEN 5: THANK YOU / SUCCESS PAGE
* Celebration: Confetti particles + Green animated checkmark.
* Headline: "WELCOME TO GAMERZ HUB!".
* Details: Transaction ID, 3.50 AED billed, STOP 1111 info.
* CTA Button: Indigo Button "START PLAYING NOW 🎮" (Opens actual games portal).

### SCREEN 6 & 7: LOW BALANCE & BLOCKED STATES
* 6 (Low Balance): Amber wallet icon, "Insufficient Balance", "RETRY" button.
* 7 (Blocked): Red shield icon, "Service Unavailable in your region".

==================================================================================================
PART 3: THE INTERACTIVE PROTOTYPE BRIDGE (FIGMA PLAY BUTTON VIEW)
==================================================================================================
* In Figma Prototype Mode:
  - Step 1: Admin logs in -> Views Dashboard metrics -> Clicks Markets.
  - Step 2: Clicks "Etisalat" -> Selects "Gamerz Hub" Campaign -> Sets Verification Mode to `BOTH`.
  - Step 3: Clicks "Open in Visual Canvas" on HOME card -> Changes Button text to "SUBSCRIBE NOW" -> Clicks Save.
  - Step 4: Clicks "Test Live Funnel Link" -> Simulator launches the Mobile Viewport (Screen 1 through Screen 5).
  - Step 5: After completing mobile subscription, Admin navigates to "Traffic Logs" and sees the new visit marked "SUBSCRIBED" with green postback delivered!
```

---

## 3. Frontend State Architecture: Clear Separation

Admin Portal aur Public Funnel ka state mix na ho, isliye Zustand stores ko isolated rakha gaya hai:

```
store/
├── admin/
│   ├── useAuthStore.js          # Admin tokens, user roles (< 60 lines)
│   ├── useMarketStore.js        # Countries, operators, detection headers (< 80 lines)
│   ├── useCampaignStore.js      # Campaign details, flow mode, API configs (< 120 lines)
│   └── useAnalyticsStore.js     # Dashboard metrics, logs filters, postbacks (< 90 lines)
│
└── runtime/
    ├── useFunnelSessionStore.js # Visit ID, MSISDN, entry parameters (< 70 lines)
    └── useOtpStore.js           # OTP countdown, PIN input state, attempts (< 60 lines)
```

Is clean separation se code hamesha manageable rehta hai aur kabhi kisi feature me collision nahi hota!
