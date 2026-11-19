# Project Overview: WAP Manager — Enterprise Carrier Billing & Funnel Platform

> **Document Type:** High-Level Product & System Blueprint  
> **Target Audience:** Developers, Product Managers, Founders & Non-Tech Stakeholders  
> **Platform Scope:** Full-Stack Enterprise SaaS Platform (Admin Management Portal + Visual Canvas Builder + Public Mobile Subscription Engine)  
> **Language:** Hinglish (Hindi + English) + Clean Diagrams  

---

## 1. Yeh Project Asal Me Kya Hai? (Non-Tech Explanation)

Yeh project sirf ek mobile page nahi hai — yeh ek **Full-Fledged B2B Enterprise SaaS Platform (WAP Manager)** hai jo digital marketing agencies aur telecom aggregators use karte hain.

Is platform ke **Do Bade Hisse (Two Halves)** hote hain:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 WAP MANAGER PLATFORM                                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
┌─────────────────────────────────────────────┐           ┌─────────────────────────────────────────────┐
│ 1. ADMIN MANAGEMENT SAAS PORTAL             │           │ 2. PUBLIC MOBILE FUNNEL ENGINE              │
│ (Aapki company ke operations ke liye)       │           │ (Ad traffic & end-users ke liye)            │
├─────────────────────────────────────────────┤           ├─────────────────────────────────────────────┤
│ • Countries & Telecom Operators add karna   │           │ • Ad click se super-fast landing load       │
│ • Campaigns & Offers configure karna        │           │ • Header Enrichment (HE) 1-Click detect     │
│ • Drag-and-Drop Visual Page Builder         │           │ • Carrier-branded SMS OTP verification      │
│ • Partner Billing APIs (URLs/Keys) jodna    │           │ • Direct SIM balance se payment katna       │
│ • Vendors/Affiliates ko tracking links dena │           │ • Success/Access unlock screen              │
│ • Real-time Traffic Logs & Conversion Audit │           │ • Ad Networks ko S2S Conversion Postbacks   │
│ • Executive Dashboard & Revenue Stats       │           └─────────────────────────────────────────────┘
└─────────────────────────────────────────────┘
```

---

## 2. Real-World Business Use Case (Kaise Business Chalta Hai)

1. **Client / Product Owner:** Aapke paas gaming, fitness, ya entertainment portal hai.
2. **Telecom Operator Contract:** Aap Middle East (UAE - Etisalat, Zain) ya Africa (Kenya - Safaricom) ke telecom operators se tie-up karte hain ki user apne **SIM balance** se subscription le sake.
3. **Admin Portal Setup:** Aap hamare WAP Manager ke Admin Panel me login karte hain:
   - Country & Operator banate hain.
   - Campaign configure karte hain (`AE-ETISALAT-101`) aur flow mode set karte hain (`BOTH` - HE + OTP).
   - Visual Drag-and-Drop Editor me attractive landing pages design karte hain.
   - Partner Billing APIs configure karte hain.
   - Ad Networks (Vendors jaise PropellerAds) ko tracking link dete hain.
4. **Traffic & Conversions:** Lakhon users ads par click karke `/subscription?...` par aate hain.
5. **Money & Postbacks:** Jo user subscribe karta hai, uska mobile balance cut hota hai, aur system automatically Ad Network ko S2S postback bhej deta hai taaki traffic partner ko unka commission mil sake.
6. **Real-Time Monitoring:** Admin Panel ke Dashboard par live dikhta hai ki aaj kitne clicks aaye, kitne conversions hue, HE success rate kitna tha, aur kitna revenue bana!

---

## 3. Core Modules of the WAP Manager Ecosystem

| Module | What it does in the Business |
| :--- | :--- |
| **Executive Dashboard** | Real-time graphs, revenue tracking, conversion rate (CR%), HE percentage, hourly trends. |
| **Markets & Operators Hub** | Countries (UAE, Kenya, etc.) aur unke operators (Etisalat, Zain, Safaricom) manage karna, plus HTTP Header Enrichment detection patterns define karna. |
| **Campaigns & Flow Modes** | Offer creation, verification mode (`BOTH`, `OTP_ONLY`, `HEADER_INJECTION`, `NONE`), daily conversion capping, dynamic pricing tags. |
| **Visual Canvas Builder (GrapesJS)** | Visual drag-and-drop designer jisme button click actions set hote hain (`SUBSCRIBE Flow`, `Go to Page`, `External URL`). |
| **Partner Billing Gateway Hub** | Telecom partner ke CheckSub, OTP Send, OTP Verify, aur Direct Charge URLs ka dynamic placeholder mapping (`{{msisdn}}`, `{{serviceId}}`, `{{otp}}`). |
| **Vendors & Affiliates Hub** | Traffic sources (Ad Networks) manage karna, payout define karna ($2.00/conversion), aur S2S Postback templates set karna. |
| **Public Funnel Runtime** | End-user mobile experience (`/subscription`) jo ultra-fast load hota hai aur bina kisi lag ke payment confirm karata hai. |
| **Traffic Logs & Session Waterfall** | Har click ka deep audit timeline (Kab user aaya -> kab HE detect hua -> kab button dabaya -> partner API ka latency kitna tha -> postback kab gaya). |
| **Postback Audit & Retry Queue** | Agar ad network ka server down tha toh failed postback ko retry karna aur response body check karna. |
| **System Cache & Webhooks** | Redis cache purge karna aur incoming telecom billing renewal callbacks simulate aur test karna. |

---

## 4. Purana Mess vs Naya Clean Architecture

Purane project me sabse bada issue yeh tha ki **Admin Features aur Runtime Funnel ka code ek doosre me mix ho gaya tha**:
- Canvas button click settings, backend detect logic, aur drag-drop flow graph aapas me lad rahe the ("Triple Source of Truth").
- Files 500+ lines ki ho gayi thi jisme kisi bhi feature ko samajhna mushkil tha.

### Naye Blueprint Ka Solution:
- **Clean Separation:** Admin Portal aur Public Funnel ko 100% independent banaya gaya hai.
- **Single Source of Flow Truth:** Flow mode hamesha Campaign Detail par set hoga (`BOTH`, `OTP_ONLY`, etc.), aur Canvas buttons standard action (`SUBSCRIBE`) fire karenge.
- **Strict File Limit:** Koi bhi file 150-200 lines se badi nahi hogi.
- **Full Platform Coverage:** Is blueprint me WAP Manager ka har ek feature (Markets se lekar Postbacks tak) fully specified hai.
