# Pawtal — MVP#1 Release Document

> **Version:** v1.0.0
> **Release Date:** 2026-03-28
> **Phase:** MVP#1 — Provider Acquisition
> **Tag:** `v1.0.0` | **Branch:** `v1-stable`
> **Author:** Product Squad

---

## 1. Executive Summary

MVP#1 delivers a **B2B lead capture platform** designed to acquire pet service providers in Bangkok (Sukhumvit area). The product consists of a provider-facing landing page, a 3-step interest registration form, automated email confirmation, and a backend API + database to store leads for the Pawtal Business Development team.

This release fulfils the core MVP#1 mission: *"Enable the Business team to pursue B2B partnerships at scale by giving pet service providers a digital touchpoint to express interest in joining the platform."*

---

## 2. What Was Planned vs. What Was Delivered

| Feature | Planned | Delivered | Status |
|---------|---------|-----------|--------|
| Provider landing page (web) | Yes | Yes | **Done** |
| 3-step interest registration form | Yes | Yes | **Done** |
| PDPA consent capture + timestamp | Yes | Yes | **Done** |
| Automated confirmation email (Resend) | Yes | Yes | **Done** |
| Lead storage in Supabase (`provider_leads`) | Yes | Yes | **Done** |
| Backend API for lead submission | Yes | Yes | **Done** |
| Duplicate email detection (409 conflict) | Yes | Yes | **Done** |
| IP address capture for compliance | Yes | Yes | **Done** |
| Row Level Security on `provider_leads` | Yes | Yes | **Done** |
| Admin CRM / leads view | Yes (internal) | Not implemented | **Deferred** |
| LINE OA integration / LIFF | Prototype only | Prototype only | **Deferred** |
| Error tracking (Sentry) | Planned | Not wired | **Deferred** |
| Analytics (GA4) | Planned | Not wired | **Deferred** |
| Desktop breakpoint (768px+) | Planned | Prototype exists | **Partial** |

---

## 3. What Was Built — Feature Detail

### 3.1 Provider Landing Page (`/providers/join`)

A mobile-first, bilingual (Thai/English) landing page targeting pet service providers.

**Sections implemented:**

| Component | Description |
|-----------|-------------|
| `SiteNav` | Sticky navigation with CTA button |
| `HeroSection` | Outcome-first hero: "รับลูกค้าใหม่" + stats + primary CTA |
| `StatsBar` | Social proof bar with platform stats |
| `ValueProps` | 3 value propositions: New clients, Scheduling, Payments |
| `HowItWorks` | 3-step process: Register → Profile → Get bookings |
| `Testimonials` | Thai provider testimonials for trust building |
| `FaqSection` | Common provider objections addressed |
| `CtaBanner` | Final conversion CTA before footer |
| `Footer` | Links, legal, social |

**SEO:** Page metadata in Thai — title and description optimised for provider search intent.

---

### 3.2 Provider Registration Form (`/providers/join/register`)

A 3-step multi-step form with progress tracking, managed via React state.

| Step | Component | Fields |
|------|-----------|--------|
| Step 1 | `Step1PersonalInfo` | First name, Last name, Business name, Phone, Email |
| Step 2 | `Step2Services` | Service types (multi-select), Area (dropdown + other) |
| Step 3 | `Step3Review` | Data review summary + PDPA consent checkbox + submit |
| Success | `SuccessScreen` | Animated confirmation + next steps timeline |

**PDPA Compliance:**
- Consent checkbox is unchecked by default (legally required under Thai PDPA)
- Consent timestamp (`consent_at`) recorded on submission
- IP address captured for compliance audit trail

**Conversion design decisions:**
- 3-step form with visible `FormProgress` bar — reduces abandonment vs. single long form
- Review step allows users to verify their data before submitting
- Success screen shows a "what happens next" timeline to set expectations

---

### 3.3 Backend API

**Architecture:** Next.js API Route (`/api/leads`) — chose this over the NestJS backend for MVP#1 to reduce infrastructure complexity. NestJS backend (`apps/api`) exists and is operational, but the production lead submission path uses the Next.js route handler.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | `POST` | Submit provider interest form |
| `/api/v1/leads` | `POST` | NestJS equivalent (operational, not primary) |
| `/api/v1/leads` | `GET` | Retrieve all leads (NestJS — admin use) |
| `/api/v1/health` | `GET` | API health check |

**Validation:** Zod schema enforces all field types, lengths, formats, and required PDPA consent.

**Error handling:**
- `400` — Validation errors with field-level messages in Thai
- `409` — Duplicate email (unique constraint on `provider_leads.email`)
- `500` — Unexpected errors with Thai user-facing message

---

### 3.4 Database Schema

Table: `provider_leads` (PostgreSQL via Supabase)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `created_at` | TIMESTAMPTZ | Auto-set on insert |
| `first_name` | TEXT | Required |
| `last_name` | TEXT | Required |
| `business_name` | TEXT | Required |
| `phone` | TEXT | Required |
| `email` | TEXT | Required, unique |
| `service_types` | TEXT[] | Multi-select array |
| `area` | TEXT | Required |
| `area_other` | TEXT | Optional, free text |
| `message` | TEXT | Optional |
| `pdpa_consent` | BOOLEAN | Required, must be TRUE |
| `consent_at` | TIMESTAMPTZ | Timestamp of consent |
| `status` | TEXT | Default: `new` — for BizDev pipeline |
| `notes` | TEXT | Internal BizDev notes |
| `ip_address` | TEXT | Captured for compliance |

**Security:**
- Row Level Security (RLS) enabled
- Public INSERT policy: allows form submissions from anon users
- SELECT restricted to `service_role` only (admin/BizDev access only)
- Insert via `create_provider_lead` RPC function (SECURITY DEFINER)

---

### 3.5 Confirmation Email

Automated email sent to provider on successful form submission via **Resend**.

- **From:** `noreply@pawtal.app`
- **Subject:** "ยืนยันการสมัคร Pawtal 🐾"
- **Content:** Provider name, business, selected services, area, and 24-hour callback promise
- **Delivery:** Fire-and-forget — email failure does NOT block the API response
- **Fallback:** Logs a console warning if `RESEND_API_KEY` is not set (safe for local dev)

---

### 3.6 Typed Supabase Client

A typed Supabase client (`apps/web/src/lib/supabase/`) was implemented with:
- `client.ts` — browser client
- `server.ts` — server-side client (used in API route)
- `types.ts` — generated TypeScript types from Supabase schema
- `index.ts` — re-exports

---

### 3.7 Prototypes Delivered

| Prototype | Location | Description |
|-----------|----------|-------------|
| Provider Journey | `prototypes/mvp1-provider/` | 5-screen mobile prototype: Landing → Form Step 1→2→3 → Success |
| Multi-Platform Landing | `prototypes/mvp1-landing/` | LINE OA (LIFF) + Desktop landing page prototype |

Both prototypes are self-contained HTML files — no build step required.

---

## 4. Tech Stack Deployed

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend | Next.js (App Router) | 14+ | Live |
| Language | TypeScript | 5+ (strict) | Live |
| Styling | Tailwind CSS | 3+ | Live |
| Backend | NestJS | 10+ | Operational |
| Database | PostgreSQL (Supabase) | 15+ | Live |
| Auth | Supabase Auth | — | Ready (not used in MVP#1) |
| Email | Resend | Free tier | Live |
| Validation | Zod | — | Live |
| CI/CD | GitHub Actions | Free tier | Configured |
| FE Hosting | Vercel | — | Target |
| BE Hosting | Railway Starter | — | Target |

---

## 5. Infrastructure & Cost

**Recommended production configuration (from Tech Cost Analysis):**

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro — 2 seats | $40/mo |
| Railway | Starter | ~$10/mo |
| Supabase | Pro | $25/mo |
| Resend | Free | $0/mo |
| Sentry | Free | $0/mo |
| GA4 | Free | $0/mo |
| GitHub | Free | $0/mo |
| **Total** | | **~$75/mo (~฿2,700/mo)** |
| Domain | pawtal.co.th | ~$20/yr |

> Risk: Supabase Free tier **pauses after 7 days of inactivity** — upgrade to Pro before go-live to prevent lead data loss.

---

## 6. Known Gaps & Deferred Items

### 6.1 Admin CRM / Leads View (Deferred)
- **What was planned:** An internal web view for the BizDev team to see all provider leads, update status, and add notes
- **Current state:** Leads are accessible via Supabase dashboard directly using service_role credentials
- **Recommended next step:** Build a simple `/admin/leads` page in MVP#1.1 or early MVP#2

### 6.2 LINE OA / LIFF Integration (Deferred)
- **What was planned:** LINE Official Account + LIFF landing to capture providers from LINE channel
- **Current state:** Prototype complete (`prototypes/mvp1-landing/`) — not implemented in production code
- **Recommended next step:** Implement if LINE OA is a confirmed acquisition channel for BizDev

### 6.3 Error Tracking — Sentry (Not Wired)
- Sentry is in the tech stack but not yet integrated into Next.js or NestJS
- **Recommended:** Integrate before go-live to catch silent production errors

### 6.4 Analytics — GA4 (Not Wired)
- GA4 is planned but not yet added to the Next.js app
- **Recommended:** Add `gtag` or `@next/third-parties` integration before launch to track form funnel

### 6.5 Desktop / Tablet Breakpoints (Partial)
- Landing page and form are designed mobile-first
- Desktop prototype exists at 1080px
- **Recommended:** Verify and QA desktop layout before launch

### 6.6 End-to-End / Integration Tests (Not Implemented)
- No automated tests exist for the form submission flow
- **Recommended:** Manual UAT before go-live; add Playwright E2E tests in MVP#1.1

---

## 7. Go-Live Checklist

Before deploying MVP#1 to production, complete the following:

### Infrastructure
- [ ] Upgrade Supabase to **Pro** plan ($25/mo)
- [ ] Provision Vercel **Pro** — 2 seats ($40/mo)
- [ ] Provision Railway **Starter** for NestJS API ($10/mo)
- [ ] Register `pawtal.co.th` domain
- [ ] Configure Cloudflare DNS (free)
- [ ] Set up Resend domain authentication for `pawtal.app` or `pawtal.co.th`

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set in Vercel
- [ ] `RESEND_API_KEY` — set in Vercel
- [ ] `EMAIL_FROM` — set to verified sender domain
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set in Railway (NestJS backend)

### Database
- [ ] Run `provider_leads` migration on Supabase production project
- [ ] Create `create_provider_lead` RPC function
- [ ] Verify RLS policies are active
- [ ] Test INSERT from anon role works
- [ ] Confirm SELECT is blocked for anon role

### Testing
- [ ] Submit test lead end-to-end (form → DB → email)
- [ ] Confirm duplicate email returns 409
- [ ] Verify confirmation email renders correctly in Gmail / Apple Mail
- [ ] QA on iPhone (Safari) — primary target device
- [ ] QA on Android (Chrome)
- [ ] QA on desktop (Chrome, Safari)

### Monitoring
- [ ] Integrate Sentry into Next.js app
- [ ] Add GA4 tracking (`pageview`, `form_start`, `form_submit`, `form_success`)
- [ ] Set up Vercel deployment notifications

---

## 8. Lessons Learned (MVP#1 Build)

| Area | Observation |
|------|-------------|
| **Architecture** | Using Next.js API Routes instead of NestJS for the primary API simplified deployment — one Vercel deployment covers both frontend and API |
| **Database** | RPC function pattern (SECURITY DEFINER) is a clean way to bypass RLS for form submissions without exposing service_role key to the frontend |
| **Email** | Fire-and-forget pattern is correct for confirmation emails — never let email failure block the user |
| **Forms** | 3-step form with Zod validation on both client and server proved robust — no edge cases missed at the schema level |
| **Prototypes** | Self-contained HTML prototypes with UX annotations were valuable for stakeholder alignment before engineering began |

---

## 9. What's Next — MVP#2 Readiness

MVP#2 (Customer Launch) introduces: customer registration, login, provider browsing by area, and provider profile views.

**Key prerequisites before starting MVP#2:**
1. Go-live checklist above fully completed
2. Admin leads view built (so BizDev can manage MVP#1 pipeline)
3. At least 5 confirmed provider partners onboarded (content for customer-facing browse)
4. Supabase Auth configured for customer login
5. Google Maps Platform API key provisioned

**Expected MVP#2 cost delta:** +$76–96/mo → ~$151–171/mo total

---

*Document produced by: Product Squad — Pawtal*
*Next review: Sprint planning for MVP#2*
