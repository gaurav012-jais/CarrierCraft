# 05 - Canvas Editor & Button Interactions
## GrapesJS Visual Builder, The 8 Page Types & Runtime Button Routing

> **Purpose:** Ye document detail me explain karta hai ki WAP Manager ka visual canvas editor (GrapesJS) kaise kaam karta hai, 8 funnel page types kya hote hain, aur canvas ke buttons par click karne se runtime par kaunsa action trigger hota hai.

---

### 1. The 8 Page Types in WAP Manager

Har campaign ke paas 8 standardized pages hote hain jinhe admin GrapesJS editor me visually design kar sakta hai:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. HOME        : First content page (Banners, value props, subscribe CTAs)   │
│ 2. OTP         : Phone number entry, SMS code entry, resend timer           │
│ 3. CONFIRM     : Optional pack selector & final subscription confirmation   │
│ 4. THANKYOU    : Success confirmation, transaction receipt, access link     │
│ 5. INPROGRESS  : Telecom pending/processing screen                          │
│ 6. LOW_BALANCE : Insufficient mobile airtime balance (Recharge alert)       │
│ 7. BLOCKED     : DND active, fraud detection, or restricted network         │
│ 8. ERROR       : General billing failure or service error                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Page Specifications Table:

| Page Type | Required Elements | Optional Elements | Purpose |
| :--- | :--- | :--- | :--- |
| `HOME` | None | `data-action="SUBSCRIBE"`, `data-pack="daily"`, `data-action="SUBSCRIBE_ROUTE"` | Main offer screen jahan user feature dekhta hai aur subscribe start karta hai. |
| `OTP` | Phone input (`data-otp-field="phone"`), Get OTP button (`data-otp-action="send"`), PIN input (`data-otp-field="otp"`), Verify button (`data-otp-action="verify"`), Status slot, Error slot | Resend timer button, change number link | Mobile number verify karna via real-time SMS. |
| `CONFIRM` | None | Pack picker (`data-pack="daily|weekly|monthly"`), Confirm button (`data-action="CONFIRM"`) | User ko plan choose karwana aur telecom charge confirm karwana. |
| `THANKYOU` | None | "Start Playing / Access Content" button | User ko successful subscription ki receipt aur content portal ka link dena. |
| `INPROGRESS` | None | Reload / Check status button | Telco pending transaction ka status display karna. |
| `LOW_BALANCE` | None | "Recharge & Retry" button, change number link | User ko balance khatam hone par alert karna. |
| `BLOCKED` | None | Support email, Return home button | Blocklist / DND numbers ko safe message dikhana. |
| `ERROR` | None | "Try Again" button | Network timeouts ya gateway failures ko safely handle karna. |

---

### 2. Canvas Button Actions (What Happens When User Clicks?)

Visual editor me banaye gaye buttons aur hotspots ke upar attributes set hote hain jo frontend runtime (`useShadowInteractions.js`) me alag-alag behaviors execute karte hain:

```
                                  [BUTTON CLICK EVENT]
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            ▼                              ▼                              ▼
    [Flow Actions]                 [Canvas Page Jumps]           [Advanced Routing]
• data-action="SUBSCRIBE"         • href="CONFIRM"               • Priority Chain
• data-action="CONFIRM"           • href="HOME"                  • External Web URL
• data-action="SUBSCRIBE_ROUTE"   • href="OTP"
```

#### Detailed Action Breakdown:

#### 1. `data-action="SUBSCRIBE"`
- **Kaam:** Ye Layer B engine action hai.
- **Runtime Flow:** Frontend backend ko `POST /api/flow/transition` bhejta hai with `action: 'SUBSCRIBE'`.
- Backend campaign ke verification mode ko dekhta hai:
  - Agar mode `BOTH` hai aur number already known hai -> seedhe `CONFIRM` ya direct billing.
  - Agar number known nahi hai -> `OTP` page return karta hai.
  - Agar mode `NONE` hai -> external Carrier Gateway URL return karta hai.

#### 2. `data-action="CONFIRM"`
- **Kaam:** Final billing charge execute karna.
- **Runtime Flow:** Frontend `POST /api/flow/transition` bhejta hai with `action: 'CONFIRM'` aur `planId` (e.g. daily/weekly).
- Backend blocklist aur checksub verify karke telecom billing API `subscribeApi` hit karta hai.
- Success par user `THANKYOU` page par pahunch jata hai aur vendor postback fire ho jata hai.

#### 3. `data-action="SUBSCRIBE_ROUTE"` (Direct Pack Subscription)
- **Kaam:** Single-click me pack select aur billing execute karna (Classic Confirm page ko skip karke).
- Button ke upar attribute hota hai: `data-pack="daily"` aur `data-action="SUBSCRIBE_ROUTE"`.
- User ke click karte hi system bina kisi beech ke confirm page ke direct subscribe API execute kar deta hai.

#### 4. Direct Page Jump (`href="CONFIRM"` / `href="OTP"`)
- **Kaam:** Instant client-side page switch.
- Agar button me href kisi page ka naam hai (jaise `href="CONFIRM"`), toh frontend backend transition ko call kiye bina turant Shadow DOM me us page ka template load kar deta hai.

#### 5. Priority Chain (`data-actions`)
- **Kaam:** Multi-API sequential fallback check (Advanced carrier routing).
- Jab button par click hota hai, toh browser backend proxy `/api/flow/priority-check` ke through ek ke baad ek 3-4 partner APIs ko test karta hai. Jo pehla API success deta hai, user usi target page ya redirect URL par route ho jata hai.

---

### 3. Clickable Areas & Hotspots (`data-tc-type="hotspot"`)

Bahut saari high-converting mobile campaigns me graphic designers pre-made background images (jaise 3D gaming ya fitness poster) use karte hain jisme buttons pehle se draw hote hain.

Unke liye canvas me **Clickable Hotspots** support hote hain:
- Ek invisible transparent layer (`<a>` tag with absolute positioning).
- Designer use image ke button area ke upar drag and drop karke stretch kar sakta hai.
- Hotspot ke upar `data-action="SUBSCRIBE"` ya direct link set ho jata hai.
- Mobile screen par jab user image ke button area par tap karta hai, toh hotspot seamlessly action execute kar deta hai.
