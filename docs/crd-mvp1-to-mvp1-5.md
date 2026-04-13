# Change Requirement Document — MVP#1 → MVP#1.5

> **Document Type:** Change Requirement Document (CRD)
> **From Version:** MVP#1 · v1.0.0 (2026-03-28)
> **To Version:** MVP#1.5 · v1.5.0 (2026-03-28)
> **Phase Name:** Provider Portal Launch
> **Author:** Product Squad — Pawtal
> **Status:** Delivered ✅

---

## 1. Purpose of this Document

This Change Requirement Document (CRD) records all deliberate changes made between **MVP#1 (Provider Acquisition)** and **MVP#1.5 (Provider Portal Launch)**. It serves as the canonical reference for:

- What changed and why
- What was added, modified, or removed
- Impact on the tech stack, UX, and codebase
- What was deferred and why
- What must be done before MVP#2 begins

This document is to be produced at every MVP boundary and kept in `docs/` alongside the release document for that phase.

---

## 2. Change Summary

| Category | MVP#1 State | MVP#1.5 State |
|----------|-------------|---------------|
| **Brand & CI** | Teal-navy gradient, Inter font, 🐾 paw logo | Sky Blue CI, Lexend Deca font, Pawtal wordmark |
| **Authentication** | Not implemented | Email/password login + forgot password via Supabase Auth |
| **Provider Dashboard** | Not implemented | Full shell: overview, bookings, customers, detail |
| **Registration Flow** | 3-step lead capture (anonymous) | 3-step lead capture + Step 4 account creation |
| **Login Page** | Not implemented | `/login` with email, password, forgot password, register CTA |
| **Route Protection** | None | Middleware guards `/dashboard/*` — redirects to `/login` |
| **LINE Login** | Placeholder button on planned login page | Removed — replaced by Registration button |
| **Prototype** | MVP#1 mobile prototype (5 screens) | MVP#1.5 desktop dashboard prototype (7 screens + CI revamp) |

---

## 3. Detailed Change Log

---

### CR-01 · Brand & CI Revamp

**Type:** Enhancement — UI/Brand
**Priority:** High
**Trigger:** New Figma Brand & CI Guidelines delivered by design team

#### What Changed

| Element | Before | After |
|---------|--------|-------|
| Primary colour | `#0D7377` Teal | `#1AB0EB` Sky Blue |
| Secondary colour | `#1A3C5E` Dark Navy | `#00508D` Ocean Blue |
| Dark background | `#1A3C5E` | `#002949` Deep Blue |
| Footer background | `#0F172A` Slate | `#00131F` Blue Black |
| Light surface | `#E8F0F7` | `#E6F6FD` Sky Blue tint |
| Font (EN) | Inter | **Lexend Deca** (300–800) |
| Font (TH) | Noto Sans Thai | **Noto Sans Thai** (kept, weight range expanded) |
| Logo | `🐾 Pawtal` (emoji wordmark) | `Pawtal` (clean typographic wordmark — Lexend Deca Bold) |
| Hero background | Gradient `#1A3C5E → #0D7377` | Flat `#002949` Deep Blue |
| Step circles | Gradient | Flat `#1AB0EB` Sky Blue |
| Stat numbers | White | `#1AB0EB` Sky Blue |
| CTA buttons | Teal gradient | Flat `#1AB0EB` with box-shadow glow |

#### Files Affected

| File | Change |
|------|--------|
| `tailwind.config.ts` | New `brand.sky/ocean/deep/black/light` color tokens |
| `globals.css` | Lexend Deca + Noto Sans Thai imports; CI CSS custom properties |
| `app/layout.tsx` | `Lexend_Deca` Next.js font loader replaces `Inter` |
| `SiteNav.tsx` | New logo wordmark; Sky Blue CTA; updated hover states |
| `HeroSection.tsx` | Flat Deep Blue hero; Sky Blue badge & CTA; updated mockup |
| `ValueProps.tsx` | White cards; Sky Blue section label; Deep Blue headings |
| `HowItWorks.tsx` | Sky Blue step circles with glow shadow |
| `StatsBar.tsx` | Deep Blue background; Sky Blue stat numbers |
| `Testimonials.tsx` | Sky Blue tint cards; Deep Blue avatar |
| `CtaBanner.tsx` | Flat Deep Blue; Sky Blue CTA button |
| `Footer.tsx` | Blue Black background; Pawtal wordmark |
| `prototype.html` | Full CI applied — fonts, variables, all sections, logos |

#### Rationale

The MVP#1 colour palette (teal-navy gradient) was an internal placeholder. The brand team delivered the official CI specification sourced from Figma. Applying it at MVP#1.5 ensures all subsequent builds are on-brand before the first external audience sees the product.

---

### CR-02 · Authentication System

**Type:** New Feature
**Priority:** Critical
**Trigger:** Provider Dashboard requires identity-based access control

#### What Was Added

| Feature | Route / Component | Description |
|---------|-------------------|-------------|
| Login page | `/login` | Email + password auth via Supabase Auth |
| Forgot Password | `/login` (inline view) | Sends reset link via `supabase.auth.resetPasswordForEmail()` |
| Forgot Sent confirmation | `/login` (inline view) | Email-sent confirmation screen with inbox visual |
| Registration button | `/login` | Replaces LINE Login — links to `/providers/join/register` |
| Auth middleware | `middleware.ts` | Server-side route protection for all `/dashboard/*` |
| Sign-out | `DashboardShell` | Calls `supabase.auth.signOut()` → redirects to `/login` |
| Auth client | `lib/supabase/auth-client.ts` | Browser-side Supabase client for auth operations |
| Sign-out API | `app/api/auth/signout/route.ts` | Server-side signout route handler |

#### What Was Removed

| Feature | Reason |
|---------|--------|
| LINE Login button | LINE SSO not implemented — removed placeholder to avoid misleading providers. Replaced with Registration CTA which is actionable. |

#### Login Flow (New)

```
User visits /dashboard/*
    → middleware checks session
    → no session → redirect to /login
    → valid session → allow through

/login page
    → email + password submit
    → Supabase Auth signInWithPassword()
    → success → redirect to /dashboard
    → error → inline error message (Thai)

Forgot Password flow
    → click "ลืมรหัสผ่าน?"
    → email pre-filled from login field
    → submit → resetPasswordForEmail()
    → success → show "check your inbox" screen
```

#### Error Handling (Thai-language)

| Error Code | User-facing Message |
|------------|---------------------|
| Email not confirmed | "กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ" |
| Invalid credentials | "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" |
| Network error | "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" |

#### Files Added / Modified

| File | Status |
|------|--------|
| `app/login/page.tsx` | Added |
| `components/auth/LoginForm.tsx` | Added |
| `lib/supabase/auth-client.ts` | Added |
| `middleware.ts` | Added |
| `app/api/auth/signout/route.ts` | Added |

---

### CR-03 · Provider Dashboard

**Type:** New Feature
**Priority:** High
**Trigger:** Providers who complete registration need a portal to manage their business

#### What Was Added

The Provider Dashboard is a fully protected, authenticated section of the product available at `/dashboard`.

##### 3.1 Dashboard Shell (`DashboardShell`)

A persistent layout wrapper with:
- **Sidebar** — Deep Blue (`#002949`), Lexend Deca wordmark, nav links, user section, sign-out
- **Sidebar active state** — Sky Blue (`#1AB0EB`) background pill
- **Top header** — breadcrumb, Online indicator, avatar
- **Mobile sidebar** — slide-in with overlay, hamburger trigger
- **Full-height fix** — `h-screen overflow-hidden` layout prevents short-column white-space bug

##### 3.2 Dashboard Pages

| Route | Component | Content |
|-------|-----------|---------|
| `/dashboard` | `DashboardHome` | Stats grid, weekly revenue chart, today's schedule, recent bookings table |
| `/dashboard/bookings` | `BookingsPage` | Bookings list (mock data) |
| `/dashboard/bookings/[id]` | `BookingDetailPage` | Individual booking detail |
| `/dashboard/customers` | `CustomersPage` | Customer list (mock data) |
| `/dashboard/providers` | Inline page | Provider management placeholder |

##### 3.3 Dashboard Home — Data Sections

| Section | Description |
|---------|-------------|
| Stats cards (4) | การจองเดือนนี้, รายได้เดือนนี้, คะแนนเฉลี่ย, ลูกค้าใหม่ |
| Weekly revenue chart | 7-bar chart; today's bar highlighted in `#1AB0EB`; others in 20% tint |
| Today's schedule | Time + booking name + status badge |
| Recent bookings table | BK-ID, customer, pet, service, amount, status, date |

##### 3.4 Status Colour System

| Status | Thai Label | Background | Text |
|--------|------------|------------|------|
| `completed` | เสร็จสิ้น | `#DCFCE7` | `#16A34A` |
| `in_progress` | กำลังดำเนินการ | `#E6F6FD` | `#1AB0EB` |
| `pending` | รอยืนยัน | `#FEF3C7` | `#D97706` |
| `confirmed` | ยืนยันแล้ว | `#E6F6FD` | `#00508D` |
| `cancelled` | ยกเลิก | `#FEE2E2` | `#DC2626` |

> **Note:** All dashboard data is currently mocked. Live Supabase queries will be wired in MVP#2.

#### Files Added

| File | Description |
|------|-------------|
| `app/dashboard/layout.tsx` | Dashboard route layout — renders `DashboardShell` |
| `app/dashboard/page.tsx` | Renders `DashboardHome` |
| `app/dashboard/bookings/page.tsx` | Renders `BookingsPage` |
| `app/dashboard/bookings/[id]/page.tsx` | Renders `BookingDetailPage` |
| `app/dashboard/customers/page.tsx` | Renders `CustomersPage` |
| `app/dashboard/providers/page.tsx` | Placeholder page |
| `components/dashboard/DashboardShell.tsx` | Added |
| `components/dashboard/DashboardHome.tsx` | Added |
| `components/dashboard/BookingsPage.tsx` | Added |
| `components/dashboard/BookingDetailPage.tsx` | Added |
| `components/dashboard/CustomersPage.tsx` | Added |

---

### CR-04 · Registration Flow — Step 4 Account Creation

**Type:** Enhancement — Existing Feature
**Priority:** High
**Trigger:** Providers completing the interest form should immediately create an account to access the dashboard

#### What Changed

| | MVP#1 | MVP#1.5 |
|--|-------|---------|
| Steps | 3 steps (lead capture) + Success screen | 3 steps (lead capture) + Step 4 (account creation) + Success |
| Outcome | Lead stored in `provider_leads` | Lead stored + Supabase Auth account created |
| Post-success | Static success screen | Success screen → auto-redirect to `/dashboard` |

#### Step 4 — Create Account (`Step4CreateAccount`)

New step appended to the registration form:
- Email field (pre-filled from Step 1)
- Password field with strength indicator
- Confirm password field
- Show/hide password toggle
- On submit: `supabase.auth.signUp()` → success → redirect to `/dashboard`

#### Files Added / Modified

| File | Status |
|------|--------|
| `components/providers/registration/Step4CreateAccount.tsx` | Added |
| `components/providers/registration/RegistrationForm.tsx` | Modified — step count 3→4, routing |
| `components/providers/registration/FormProgress.tsx` | Modified — 4-step progress bar |

---

### CR-05 · Prototype — MVP#1.5 Desktop Dashboard

**Type:** New Artefact
**Priority:** Medium
**Trigger:** Stakeholder alignment on dashboard UX before engineering; CI revamp needed visual reference

#### What Was Added / Changed

| | MVP#1 Prototype | MVP#1.5 Prototype |
|--|-----------------|-------------------|
| Format | Mobile-first (390px) | Desktop-first (1280px) |
| Screens | 5 (Landing → Form → Success) | 7 (Landing, Register, Login, Dashboard, Bookings, Customers, Booking Detail) |
| Navigation | Screen-by-screen proto nav | Tabbed proto nav with URL bar simulation |
| CI applied | Old teal-navy | New Sky Blue CI (`#1AB0EB`, `#002949`) |
| Font | Inter | Lexend Deca + Noto Sans Thai |
| Logo | 🐾 Pawtal | Pawtal wordmark |
| Login screen | N/A | Email + password + forgot password + registration CTA |
| Forgot password | N/A | Modal overlay with email input → success state |
| Dashboard | N/A | Sidebar + stats + chart + schedule + bookings table |

#### Location

```
prototypes/mvp1-5-dashboard/prototype.html
```

Self-contained HTML — no build step required. Open directly in any browser.

---

### CR-06 · Bug Fix — Dashboard Sidebar Height

**Type:** Bug Fix
**Priority:** Medium
**Symptom:** After login, the left sidebar appeared as a short column with white space below — not filling the full viewport height.

#### Root Cause

The sidebar used `fixed h-full` positioning on mobile (correct for overlay drawer), but on desktop `lg:static` caused the CSS `h-full` to resolve against the parent's `min-height: 100vh` instead of an explicit height — resulting in a zero-height computed value.

#### Fix Applied

| Element | Before | After |
|---------|--------|-------|
| Outer container | `min-h-screen flex` | `h-screen overflow-hidden flex` |
| Sidebar height | `h-full` | `h-screen` |
| Sidebar desktop | `lg:static` | `lg:static lg:h-screen lg:flex-shrink-0` |
| Main content | `flex-1 flex flex-col min-w-0` | Added `overflow-hidden` |
| `<main>` | `flex-1 overflow-auto` | Unchanged (scrolling preserved) |

---

## 4. What Was Deferred from MVP#1.5

| Item | Reason | Target |
|------|--------|--------|
| Admin CRM / leads view | Leads still accessible via Supabase dashboard; BizDev can operate without it | MVP#2 pre-work |
| LINE OA / LIFF integration | Not a confirmed acquisition channel yet — awaiting BizDev decision | TBD |
| Sentry error tracking | Not blocking for internal use; needed before external launch | Before go-live |
| GA4 analytics | Not blocking for internal use | Before go-live |
| Live Supabase queries in dashboard | Dashboard uses mock data — schema design pending MVP#2 | MVP#2 |
| Provider profile edit screen | Out of scope for MVP#1.5 | MVP#2 |
| Booking management (accept/decline) | Out of scope for MVP#1.5 | MVP#2 |
| Real-time notifications | Out of scope | MVP#3 |
| Password reset landing page (`/auth/reset-password`) | Forgot password email sends link but landing page not yet built | MVP#2 pre-work |

---

## 5. Impact Assessment

### 5.1 User-Facing Impact

| User | Impact |
|------|--------|
| **Providers (new)** | Can now register → create account → access dashboard in a single flow |
| **Providers (returning)** | Can log in, view mock dashboard, log out |
| **Providers (forgot password)** | Can request reset link via email |
| **Business team** | No change — leads still go to `provider_leads` table in Supabase |

### 5.2 Technical Impact

| Area | Impact |
|------|--------|
| Auth | Supabase Auth now active — requires `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` env vars |
| Routing | Middleware added — all `/dashboard/*` routes are now server-side protected |
| Bundle size | Lexend Deca loaded via Next.js font — no runtime impact; preloaded |
| Tailwind | New color token names — `brand-sky`, `brand-deep`, `brand-ocean`, `brand-black` |
| Database | No new tables; `auth.users` table now used (managed by Supabase Auth) |

### 5.3 Breaking Changes

| Change | Affected Parties | Migration |
|--------|-----------------|-----------|
| Tailwind colour token rename (`brand-blue` → `brand-deep`, `brand-teal` → `brand-sky`) | Any future component using old tokens | Search and replace `brand-blue` / `brand-teal` |
| Font variable change (`--font-inter` → `--font-lexend`) | Any CSS using `var(--font-inter)` directly | Update variable references |

---

## 6. Definition of Done — MVP#1.5

| Requirement | Status |
|-------------|--------|
| New CI (colours, fonts, logo) applied to all components | ✅ Done |
| Login page functional with Supabase Auth | ✅ Done |
| Forgot password flow (email reset) | ✅ Done |
| LINE Login removed; Registration CTA added | ✅ Done |
| Dashboard accessible only when authenticated | ✅ Done |
| Dashboard sidebar fills full viewport height | ✅ Done |
| Step 4 (account creation) added to registration | ✅ Done |
| Prototype updated to MVP#1.5 with full CI | ✅ Done |
| Password reset landing page (`/auth/reset-password`) | ⏳ Deferred |
| Live data in dashboard | ⏳ Deferred to MVP#2 |

---

## 7. Pre-MVP#2 Checklist

Before MVP#2 (Customer Launch) begins, the following must be completed:

### Must-Have
- [ ] Build `/auth/reset-password` page to handle password reset redirect from email
- [ ] Wire live Supabase queries to dashboard (replace mock data)
- [ ] QA full provider journey: Register → Account creation → Login → Dashboard → Logout
- [ ] Add GA4 tracking to login and dashboard entry events
- [ ] Integrate Sentry into Next.js for error capture

### Should-Have
- [ ] Admin leads view at `/admin/leads` for BizDev team
- [ ] Email verification flow for newly created provider accounts
- [ ] Session expiry handling (auto-logout on token expiry)

### Nice-to-Have
- [ ] LINE OA LIFF prototype production implementation (if BizDev confirms channel)
- [ ] Provider onboarding checklist on dashboard home (% profile complete)

---

## 8. Design Token Reference (MVP#1.5 Canonical)

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brand.sky` | `#1AB0EB` | Primary CTA, active states, links, accent |
| `brand.ocean` | `#00508D` | Secondary, hover, confirmed status |
| `brand.deep` | `#002949` | Headings, sidebar background, dark sections |
| `brand.black` | `#00131F` | Footer background, darkest surfaces |
| `brand.light` | `#E6F6FD` | Sky Blue 20% tint — light surfaces, cards |

### Typography

| Font | Language | Weights | Usage |
|------|----------|---------|-------|
| Lexend Deca | EN | 300, 400, 500, 600, 700, 800 | All English UI text, headings, CTAs |
| Noto Sans Thai | TH | 300, 400, 500, 600, 700, 800 | All Thai UI text, headings, CTAs |
| Fallback | — | — | Arial → Helvetica → system sans-serif |

### Type Scale (from CI)

| Level | Font | Weight | Size |
|-------|------|--------|------|
| H1 | Lexend Deca / Noto Sans Thai | SemiBold / Bold | 65pt |
| H2 | Lexend Deca / Noto Sans Thai | Regular / Medium | 46pt |
| H3 | Lexend Deca / Noto Sans Thai | Medium / Regular | 36pt |
| H4 | Lexend Deca / Noto Sans Thai | Bold / Regular | 28pt |
| Subheadline | Lexend Deca / Noto Sans Thai | Regular / Regular | 24pt |

### Logo

| Variant | Treatment |
|---------|-----------|
| On dark background | `Pawtal` in White — Lexend Deca ExtraBold |
| On light background | `Pawtal` in `#002949` Deep Blue — Lexend Deca ExtraBold |
| Colour accent | `Pawtal` in `#1AB0EB` Sky Blue (hero/login panels) |
| Rule | No paw emoji — typographic wordmark only |

---

## 9. Appendix — File Change Index

### New Files Added (MVP#1.5)

```
apps/web/src/
├── app/
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/page.tsx
│   │   └── providers/page.tsx
│   └── api/auth/signout/route.ts
├── components/
│   ├── auth/LoginForm.tsx
│   ├── dashboard/
│   │   ├── DashboardShell.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── BookingsPage.tsx
│   │   ├── BookingDetailPage.tsx
│   │   └── CustomersPage.tsx
│   └── providers/registration/Step4CreateAccount.tsx
├── lib/supabase/auth-client.ts
└── middleware.ts

prototypes/
└── mvp1-5-dashboard/prototype.html   ← Full desktop prototype (7 screens)
```

### Modified Files (MVP#1.5)

```
apps/web/
├── tailwind.config.ts                ← New CI color tokens
├── src/app/
│   ├── globals.css                   ← Lexend Deca import + CSS vars
│   └── layout.tsx                    ← Font loader: Inter → Lexend_Deca
└── src/components/
    ├── providers/
    │   ├── landing/
    │   │   ├── SiteNav.tsx
    │   │   ├── HeroSection.tsx
    │   │   ├── ValueProps.tsx
    │   │   ├── HowItWorks.tsx
    │   │   ├── StatsBar.tsx
    │   │   ├── Testimonials.tsx
    │   │   ├── CtaBanner.tsx
    │   │   └── Footer.tsx
    │   └── registration/
    │       ├── RegistrationForm.tsx
    │       └── FormProgress.tsx
    ├── auth/LoginForm.tsx
    └── dashboard/
        ├── DashboardShell.tsx
        └── DashboardHome.tsx
```

---

*Document produced by: Product Squad — Pawtal*
*Valid from: MVP#1.5 (v1.5.0) · 2026-03-28*
*Next CRD: MVP#1.5 → MVP#2 (Customer Launch)*
