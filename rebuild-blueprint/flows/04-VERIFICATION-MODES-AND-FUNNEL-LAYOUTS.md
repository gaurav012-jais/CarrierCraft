# 04 - Verification Modes & Funnel Layouts
## 6 Verification Engines & The Two Landing Architecture Layouts

> **Purpose:** Ye document WAP Manager ke 6 verification modes (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`, `NONE`, `UNIVERSE_DCB`, `ORANGE_BF`) aur 2 core funnel layouts (`classic` vs `packs_on_home`) ko crystal-clear explain karta hai.

---

### 1. The 6 Verification Modes (Verification Engines)

Har country aur operator ka billing mechanism alag hota hai. WAP Manager me campaign create karte waqt ek **Verification Mode** select kiya jata hai jo decide karta hai ki subscription ka exact engine kaunsa hoga:

```
                          ┌────────────────────────┐
                          │   VERIFICATION MODES   │
                          └────────────────────────┘
                                       │
     ┌─────────────┬─────────────┬─────┴───────┬──────────────┬──────────────┐
     ▼             ▼             ▼             ▼              ▼              ▼
   [BOTH]      [OTP_ONLY]     [HEADER_     [NONE]         [UNIVERSE_     [ORANGE_BF]
 Smart Auto-   Manual SMS    INJECTION]   Null-Flow CG       DCB]        Orange Burkina
 Detect + SMS  Verification  Strict SIM    Direct Telco   Direct Telco   Faso Gateway
  Fallback                   Data Only       Redirect     Pin Protocol
```

---

#### 1.1 `BOTH` (Smart Auto-Detection with SMS Fallback) - *The Industry Standard*
* **Kiske liye hai:** UAE (Etisalat/du), Saudi Arabia (STC/Mobily), South Africa (Vodacom/MTN), etc.
* **Working Principle:**
  1. System pehle silently SIM number detect karne ki koshish karta hai (Header Enrichment).
  2. **Scenario A (SIM Data User):** Number mil gaya (e.g. `+971 50 *** 4589`). User ko HOME page dikhega jisme number pre-filled hoga. User sirf **"SUBSCRIBE NOW"** button dabayega aur instant 1-Click subscription ho jayegi.
  3. **Scenario B (Wi-Fi User):** Number nahi mila. System automatically OTP page dikhayega. User apna number enter karega, SMS me 4-digit PIN aayega, enter karke verify karega. Verify hone ke baad billing execute ho jayegi.

---

#### 1.2 `OTP_ONLY` (Strict SMS Verification)
* **Kiske liye hai:** Jahan carrier header available nahi hota ya regulation compulsory SMS OTP maangti hai (e.g. India, Egypt, Jordan Zain, South Sudan Zain).
* **Working Principle:**
  1. Header enrichment kabhi nahi chalta.
  2. User hamesha mobile number input screen par aata hai.
  3. Number type karne ke baad user "GET OTP" click karta hai.
  4. Backend telco SMS gateway par request bhejta hai (`/api/otp/send`).
  5. 30-second ka countdown timer chalta hai. User OTP enter karke "VERIFY & SUBSCRIBE" dabata hai.
  6. Backend OTP validate karta hai (`/api/otp/verify`) aur user ko THANKYOU page par bhejta hai.

---

#### 1.3 `HEADER_INJECTION` (Strict SIM Mobile Data Only)
* **Kiske liye hai:** Premium 1-Click affiliate offers jahan Wi-Fi traffic allowed nahi hota (e.g. France, Iraq, Kuwait).
* **Working Principle:**
  1. User ka SIM header hona mandatory hai.
  2. Agar user SIM data par hai -> Instant HOME screen -> 1-Click Subscribe.
  3. Agar user Wi-Fi ya desktop par hai -> System user ko seedhe **ERROR** ya **BLOCKED** page dikhayega ("Please switch to mobile data to access this offer"). Manual phone input allow hi nahi hota.

---

#### 1.4 `NONE` (Null-Flow Carrier Gateway Redirect)
* **Kiske liye hai:** Jab telecom operator apni khud ki hosted payment screen par user ko redirect karne ko bolta hai (e.g. Safaricom Kenya Consent Gateway).
* **Working Principle:**
  1. Koi internal OTP ya confirm screen nahi hoti.
  2. Jaise hi user landing page par aata hai ya HOME par "SUBSCRIBE" dabata hai, system user ko configured Carrier Gateway URL (`cgRedirectUrl`) par redirect kar deta hai.
  3. User operator ke official portal par payment approve karta hai. Operator payment hone ke baad humare `/api/flow/callback` par webhook bhejta hai.

---

#### 1.5 `UNIVERSE_DCB` (Direct Carrier Billing with Pack & PIN Protocol)
* **Kiske liye hai:** Middle East aur Africa ke custom telecom aggregators (e.g. Palestine Ooredoo, Universe Telecom).
* **Working Principle:**
  1. **Stage 1 (Phone Input):** User apna mobile number enter karta hai.
  2. **Stage 2 (Pack Selection):** User pack choose karta hai (Daily, Weekly, Monthly).
  3. **Stage 3 (PIN Entry):** Aggregator SMS me PIN bhejta hai. User PIN enter karta hai.
  4. **Stage 4 (Status Polling):** Frontend background me `/api/flow/dcb-status` poll karta hai jab tak telco side se charge confirmation na aa jaye.

---

#### 1.6 `ORANGE_BF` (Orange Burkina Faso Native Telecom Integration)
* **Kiske liye hai:** West Africa (Burkina Faso Orange network).
* **Working Principle:**
  1. Direct integrated checksub API (`/subapi/checksub`).
  2. Native SMS OTP generator (`/subapi/auth/otp/generate`).
  3. Native OTP validator (`/subapi/auth/otp/validate`).
  4. Subscription sync engine (`/Subs_Engine/subscription/sync`) jo telco billing core ke sath directly synched rehta hai.

---

### 2. Funnel Layouts: `classic` vs `packs_on_home`

WAP Manager me do landing layout options hote hain jo campaign settings me toggle kiye ja sakte hain:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CLASSIC FUNNEL LAYOUT (The Traditional Sequence)                        │
│ Landing -> HOME (Intro CTA) -> OTP Screen -> CONFIRM (Pack Selection)      │
│            -> THANKYOU                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CHECKS BEFORE HOME (funnel_layout = 'packs_on_home')                     │
│ Identity & Partner Checks RUN BEFORE HOME -> HOME (Free Pack Canvas)        │
│ (Any pack button on HOME directly subscribes without Confirm page!)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Comparison of Funnel Layouts:

| Feature | `classic` Layout | `packs_on_home` Layout |
| :--- | :--- | :--- |
| **First Page User Sees** | Hamesha **HOME** screen (Intro/Banner) | Status check ke baad **HOME** (ya Wi-Fi hone par pehle OTP) |
| **Pack Selection** | Alag se **CONFIRM** page par hota hai | **HOME** canvas ke upar hi pack buttons (Daily / Weekly / Monthly) hote hain |
| **Action On Pack Click** | Pehle select hota hai, fir confirm button dabana padta hai | Pack button dabate hi **Direct Subscribe** execute ho jata hai |
| **Conversion Speed** | 3 Steps (Zyada clicks) | **1 Step** (Super fast conversion) |
| **Best For** | Generic affiliate offers jahan pehle product explain karna zaroori ho | Gaming / Streaming portals jahan direct plan buy karwana ho |

---

### 3. Summary of How Layout and Mode Work Together

```
Layout: packs_on_home
Mode: BOTH
Outcome:
- User on SIM Data:
  Checks complete in background -> HOME page opens with packs -> User taps "Daily Pack" -> DIRECT BILLING SUCCESS -> THANKYOU.
- User on Wi-Fi:
  Detect detects Wi-Fi -> Opens OTP screen directly -> User verifies OTP -> Redirects to HOME -> User taps "Daily Pack" -> DIRECT BILLING SUCCESS -> THANKYOU.
```
