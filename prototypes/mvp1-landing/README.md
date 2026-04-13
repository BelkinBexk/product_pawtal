# 🐾 Pawtal MVP#1 — Multi-Platform Landing Prototype

> **Type:** Interactive HTML Prototype
> **Version:** v1.0 | **Date:** March 2026
> **Role:** UX/UI Designer
> **Phase:** MVP#1 — Provider Acquisition

---

## How to Open

**Just double-click `prototype.html`** — opens directly in any browser. No install, no build step required.

> Recommended browsers: Chrome 120+, Safari 17+, Firefox 121+

---

## What's Inside

A fully interactive prototype simulating two distinct acquisition channels for pet service providers to discover and join Pawtal.

### Two Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| **LINE OA** | Click "LINE OA" tab | Simulates provider discovery via Pawtal's LINE Official Account |
| **Desktop** | Click "Desktop" tab | Simulates direct web access — full landing page in a browser frame |

Switch between modes using the tab bar at the top of the prototype.

---

## Mode 1 — LINE OA (Mobile)

### 3 Screens

| # | Screen ID | Phase | Description |
|---|-----------|-------|-------------|
| L1 | `line-s0` | Discovery | LINE OA Profile — search result with verified badge, follower count, posts, Follow button |
| L2 | `line-s1` | Engagement | LINE Chat — welcome message sequence, quick reply buttons, Rich Menu (3×2 grid) |
| L3 | `line-s2` | Conversion | LIFF Landing — mobile landing page inside LINE with special LINE-exclusive offer banner |

### Rich Menu Design

```
┌─────────────────────┬───────────┬───────────┐
│                     │  บริการของ │  คำถามที่   │
│  ลงทะเบียน           │  เรา       │  พบบ่อย    │
│  พาร์ทเนอร์ฟรี        ├───────────┼───────────┤
│  (Primary CTA)      │  พื้นที่ให้  │  ติดต่อ    │
│                     │  บริการ    │  เรา       │
└─────────────────────┴───────────┴───────────┘
  grid-column: 1        col: 2      col: 3
  grid-row: 1 / 3       row: 1      row: 1
  (spans both rows)     row: 2      row: 2
```

- **Grid spec:** `grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 118px 78px`
- **LINE API spec:** 2506×1686px (full height), minimum 200px per cell at device width
- **Primary cell action:** URI type → opens LIFF URL
- **Secondary cell actions:** Message type → postback text to OA

### LIFF Integration Notes

- LIFF size: `Full` (covers entire screen, no LINE UI beneath)
- Init: `liff.init({ liffId })` on page load
- Pre-fill: `liff.getProfile()` → populate first name + LINE avatar in form Step 1
- LINE context badge (`🟢 มาจาก LINE`) shown to reinforce channel trust
- Special offer banner exclusive to LINE channel visitors

---

## Mode 2 — Desktop Landing

### 1 Scrollable Screen

Full desktop landing page displayed inside a browser frame simulation (1080×672px viewport).

| Section | Element | Purpose |
|---------|---------|---------|
| Nav | Logo + 4 links + 2 CTAs | Sticky navigation, primary CTA "เริ่มต้นฟรี" |
| Hero | 2-col layout | Left: headline + stats + CTAs. Right: phone mockup with dashboard preview |
| Trust bar | Provider logo pills | Social proof — "Already trusted by X providers" |
| Features | 3-col icon grid | Value props: New clients, Scheduling, Payments |
| How It Works | 3-step timeline | Step 1: Register → Step 2: Set up profile → Step 3: Get bookings |
| Testimonials | 2-col quote cards | Authentic Thai provider testimonials |
| CTA Banner | Full-width gradient | Final conversion push before footer |
| Footer | 4-col links | About, Services, Support, Social |

---

## Prototype Layout

```
┌─────────────────┬───────────────────────────────────┬──────────────┐
│  Left Panel     │        Prototype Frame             │ Right Panel  │
│                 │                                    │              │
│  Mode Tabs      │  ┌─ LINE OA mode ───────────────┐  │  UX Designer │
│  ● LINE OA      │  │  iPhone 14 frame (390×844px) │  │  Annotations │
│  ● Desktop      │  │  Dynamic Island              │  │              │
│                 │  │  [Active Screen]             │  │  Per-screen  │
│  Screen Nav     │  └──────────────────────────────┘  │  design      │
│  - L1           │                                    │  decisions   │
│  - L2 ← curr   │  ┌─ Desktop mode ───────────────┐  │              │
│  - L3           │  │  Browser frame (1080×672px)  │  │  Tag legend  │
│                 │  │  URL bar, nav chrome         │  │              │
│  Journey Map    │  │  [Full landing page]         │  │              │
│                 │  └──────────────────────────────┘  │              │
└─────────────────┴───────────────────────────────────┴──────────────┘
```

---

## Design Decisions

### Channel Strategy
Two distinct acquisition channels require different UX patterns:
- **LINE OA** — constraint-first (Rich Menu is 196×196px per cell on mobile); trust built through LINE verified badge; conversion happens inside LIFF to avoid context-switching friction
- **Desktop** — space-rich; scrollable narrative; hero with proof → features → social proof → CTA flow

### LINE-Exclusive Offer
LIFF landing page surfaces a special offer ("ฟรี 3 เดือน") not shown on direct web access. This:
1. Rewards LINE channel discovery
2. Creates urgency and differentiation
3. Allows A/B testing LINE vs. direct web conversion rates

### Mobile-First Always
Both channel designs begin at 375–390px. The Rich Menu CSS grid adapts to LINE's rendering constraints. The LIFF page matches the `mvp1-provider` prototype's mobile layout exactly.

### Pawtal Design Tokens Applied
| Token | Value | Used For |
|-------|-------|----------|
| Brand Blue | `#1A3C5E` | Headers, nav, CTA buttons, Rich Menu primary cell |
| Accent Teal | `#0D7377` | Hover states, progress indicators, links |
| Success Green | `#16A34A` | Confirmation, "Live" badges |
| Warning Amber | `#D97706` | Special offer banners |
| Base fonts | Inter + Noto Sans Thai | All UI text, bilingual from day one |

---

## Handoff Notes for Engineering

### LINE OA Setup

| Item | Spec |
|------|------|
| LINE Official Account | Register at [LINE Official Account Manager](https://manager.line.biz) |
| Messaging API channel | Required for Rich Menu API + Webhook |
| Rich Menu API | `POST https://api.line.me/v2/bot/richmenu` |
| LIFF app | Register at [LINE Developers Console](https://developers.line.biz); set size to `Full` |
| LIFF URL | `liff.line.me/{liffId}` → maps to `/providers/join` |
| Webhook events | `follow` event → trigger welcome message sequence |

### Desktop Landing

| Screen | Route | Component |
|--------|-------|-----------|
| Landing | `/providers/join` | `app/providers/join/page.tsx` |

### LINE Context Detection (Frontend)
```typescript
// Detect if user arrived from LINE (for special offer banner)
import liff from '@line/liff';

await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
const isInLineClient = liff.isInClient();
const profile = isInLineClient ? await liff.getProfile() : null;
```

---

## Next Steps

- [ ] Usability test LINE OA flow with 3 Thai pet grooming business owners
- [ ] Validate Rich Menu icon assets with brand designer (current icons are CSS/emoji placeholders)
- [ ] Build Figma component: Rich Menu tile system
- [ ] Implement LIFF registration flow in `apps/web` — see `LOCAL-DEV.md` for setup
- [ ] Design error states for LIFF (network error, LINE permission denied)
- [ ] Create desktop breakpoint at 768px (tablet) — currently 1080px only
- [ ] A/B test LINE channel offer copy ("ฟรี 3 เดือน" vs. "ลดค่าธรรมเนียม 50%")

---

*Questions? Check `CLAUDE.md` or invoke the UX Designer agent: "Act as UX Designer and [task]"*
