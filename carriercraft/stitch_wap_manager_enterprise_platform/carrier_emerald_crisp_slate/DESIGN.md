---
name: Carrier Emerald & Crisp Slate
colors:
  surface: '#f9f9ff'
  surface-dim: '#d1daf4'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2fc'
  on-surface: '#121b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#273044'
  inverse-on-surface: '#edf0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#5248c9'
  on-secondary: '#ffffff'
  secondary-container: '#6b63e3'
  on-secondary-container: '#fffbff'
  tertiary: '#00647c'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f9d'
  on-tertiary-container: '#fafdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c0ff'
  on-secondary-fixed: '#120068'
  on-secondary-fixed-variant: '#3b2fb3'
  tertiary-fixed: '#b7eaff'
  tertiary-fixed-dim: '#6cd3f7'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e61'
  background: '#f9f9ff'
  on-background: '#121b2e'
  surface-variant: '#d9e2fc'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-macro:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption-legal:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system mediates between high-stakes telecom infrastructure and frictionless consumer payment conversion. The visual identity addresses two distinct operational contexts:

1. **Enterprise Admin Surface:** Built for telco aggregators, revenue operations, and content merchants managing direct carrier billing (DCB), MT/MO messaging nodes, and recurring subscriptions. The aesthetic is modern, analytical, and authoritative—utilizing cool slate undertones, structural border alignments, deep navy anchor navigation, and data-dense layouts that eliminate cognitive friction.
2. **Mobile Consumer Funnel Surface:** Engineered for micro-moment billing funnels (1-click DCB, OTP handshakes, MSISDN header enrichment). The visual style emphasizes clarity, consumer reassurance, and instantaneous conversion feedback with generous hit zones, high-contrast CTA pathways, regulatory telecom trust badges, and zero-distraction focus states.

The design philosophy harmonizes **Modern SaaS Precision** with **Conversion-Centric Ergonomics**. High-contrast emerald accents signify transactional authorization and solvency, complemented by deep telecom cyan and digital gaming violet accents across balance alerts, routing pathways, and pricing tiers.

## Colors

The system uses a calibrated light mode optimized for legibility during long operational cycles and high ambient sunlight conversion events:

### Core Hues
- **Primary Emerald (`#059669`):** Authoritative transaction affirmative. Used for final billing authorization CTAs, positive reconciliation states, live throughput status, and conversion triggers.
- **Secondary Violet (`#635BDB`):** Digital service and gaming indicator. Applied to merchant tags, interactive funnel selectors, and active state highlights.
- **Tertiary Cyan (`#0891B2`):** Telecom gateway and carrier routing identifier. Used for network operator badges, MSISDN detection indicators, and API endpoint routing.
- **Deep Navy (`#172554`):** Institutional enterprise anchor. Exclusively applied to administrative structural sidebars, dark badge backgrounds, and primary data visualization axes.

### Neutral & Surface Hierarchy
- **Canvas Base (Admin):** `#F5F7FB` (Slate-50 tone providing subtle separation from white cards).
- **Secondary Surface (Admin/Funnel):** `#EEF2F7` (Input backgrounds, table headers, segmented controls).
- **Canvas Base (Funnel):** `#F8FAFC` (Cool crisp foundation optimized for mobile card containment).
- **Card Surfaces:** `#FFFFFF` (Pristine elevation target for transactional cards and data clusters).
- **Text Primary:** `#172033` (Deep slate for optimal contrast without stark absolute black).
- **Text Secondary / Muted:** `#64748B` (Secondary metadata, regulatory compliance copy, inline labels).
- **Subtle Borders:** `#E2E8F0` (Structural demarcations, card framing, input boundaries).
- **Warning / Alert Amber:** `#D97706` (Low carrier balance alerts, renewal warnings).
- **Critical / Drop-off Red:** `#DC2626` (Failed billing pings, invalid OTP, chargebacks).

## Typography

The typographic hierarchy separates structural headlines, conversational UI, and technical infrastructure:

- **Plus Jakarta Sans (Headings):** Selected for warm, geometric authority. It injects a modern, friendly polish into high-stress payment steps and administrative dashboards.
- **Inter (Body & Controls):** Used across operational metrics, customer service logs, transactional legal disclosures, and form controls for optimal rendering across varying device screen sizes.
- **JetBrains Mono (Technical Data):** Handles MSISDN hashes, dynamic shortcodes, carrier gateway parameters, billing transaction IDs, and currency amounts. This guarantees tabular consistency and clarity in verification interfaces.

## Layout & Spacing

### Enterprise Admin Grid
- **Desktop Grid:** 12-column fluid grid with a fixed `16rem` (256px) deep navy navigation rail. Standard gutter of `1.5rem` (`24px`) with `2rem` (`32px`) canvas boundary margins.
- **Reflow Architecture:** At `< 1280px`, the admin table views compress tertiary status flags into expandable sub-rows. At `< 1024px`, the navy rail folds into a persistent bottom sheet or slide-over drawer.

### Mobile Consumer Funnel Layout
- **Mobile Container:** Single-column centered canvas constrained to a maximum width of `440px`.
- **Canvas Margins:** `1rem` (`16px`) safe-area padding on horizontal edges.
- **Vertical Spacing:** Tightly grouped input and CTA clusters using `space-md` (`16px`) spacing, with `space-xl` (`32px`) separation between header carrier logos, pricing summary cards, and confirmation triggers.

## Elevation & Depth

Visual hierarchy relies on structural tonal separation combined with soft, layered ambient shadows.

### Ambient Shadows
- **Level 1 (Form inputs, muted badges):** `0 1px 2px 0 rgba(23, 32, 51, 0.05)`
- **Level 2 (Admin Data Cards, Funnel Payment Modules):** `0 4px 6px -1px rgba(23, 32, 51, 0.06), 0 2px 4px -2px rgba(23, 32, 51, 0.04)`
- **Level 3 (Modal verification dialogs, OTP Prompts, Pinned CTAs):** `0 20px 25px -5px rgba(23, 32, 51, 0.08), 0 8px 10px -6px rgba(23, 32, 51, 0.04)`

### Structural Demarcation
To preserve data readability across high-volume admin panels, surfaces do not rely exclusively on shadows. All white card surfaces implement a continuous `1px` border using `#E2E8F0`. When elevated into modal focus states or active hover stages, the border transitions cleanly to `#CBD5E1`.

## Shapes

The design uses a calculated curvature scale to project modern engineering precision:
- **Base Components (Inputs, buttons, dropdown triggers):** `0.5rem` (`8px`) to `0.75rem` (`12px`).
- **Elevated Surfaces & Cards:** `0.75rem` (`12px`) for dense admin metric cards; `1rem` (`16px`) for consumer funnel payment sheets.
- **Badges, Carrier Tags, and Segmented Pills:** Full pill format (`9999px`) to visually isolate status indicators, network routes, and telecom tags from structural UI elements.

## Components

### 1. Primary Action Buttons (Conversion CTAs)
- **Funnel Confirmation:** Height `52px`, background `#059669`, text `#FFFFFF`, font weight `600`, border-radius `12px`. Hover state: `#047857`. Active scale: `0.98`. Focus ring: `3px` solid `rgba(5, 150, 105, 0.3)`.
- **Admin Secondary Action:** Height `38px`, background `#EEF2F7`, text `#172033`, border `1px` solid `#E2E8F0`, border-radius `8px`. Hover state: background `#E2E8F0`.

### 2. Carrier Badges & Tags
- Telecom operator chips (e.g., Vodafone, Orange, STC, MTN) utilize a height of `28px`, padding `0 10px`, radius `9999px`.
- Background: `#F0FDFA` (Emerald-tinted) or `#ECFEFF` (Cyan-tinted) with a corresponding `1px` border of `#CCFBF1` or `#CFFAFE`. Text rendered in `label-code` in `#0891B2` or `#059669`.

### 3. OTP Verification Inputs
- Discrete 4- to 6-box input clusters. Individual boxes: `48px` x `56px`, centered text using `JetBrains Mono` at `24px`.
- Default: background `#FFFFFF`, border `1.5px` solid `#E2E8F0`.
- Focused state: border `2px` solid `#059669`, soft ring `0 0 0 4px rgba(5, 150, 105, 0.15)`.

### 4. Admin Metric Cards & Data Tables
- **Cards:** Background `#FFFFFF`, border `1px` solid `#E2E8F0`, radius `12px`, padding `20px`. Top accent line utilizes categorical color (e.g., `#059669` for DCB conversions, `#635BDB` for active subscribers).
- **Tables:** Header background `#EEF2F7`, uppercase `11px` Inter medium text tracking `0.05em`. Cells vertically aligned at `48px` height with clean borders on row bottoms (`#E2E8F0`).

### 5. Telecom Balance & Safety Alerts
- Warning container with `12px` radius, background `#FFFBEB`, border `1px` solid `#FDE68A`.
- Balance indicator displayed via `JetBrains Mono` semibold text with an inline icon and contextual microcopy reassuring the consumer about direct mobile bill charging.