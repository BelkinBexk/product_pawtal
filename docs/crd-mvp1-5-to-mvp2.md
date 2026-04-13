# Change Requirement Document — MVP#1.5 → MVP#2

> **Version:** 1.0
> **Date:** 2026-03-28
> **Author:** Product Squad · Pawtal
> **Status:** Approved

---

## 1. Purpose

This CRD documents all planned changes from **MVP#1.5 (Provider Acquisition + Auth)** to **MVP#2 (Provider Foundation)**.

MVP#2 is a strategic pivot from external acquisition to internal product depth. Following successful conceptual product validation with pet service providers in MVP#1.5, the squad has decided to invest in **solidifying the provider-side product foundation** before opening the platform to end customers (pet owners).

---

## 2. Strategic Context

| Decision | Rationale |
|----------|-----------|
| Delay customer-facing features | MVP#1.5 validation confirmed provider interest. Now we need a product worth sending them to. |
| Focus on provider depth | A provider with no profile, no calendar, and no services configured cannot serve customers. |
| Pre-requisite for MVP#3 | Booking & payment (MVP#3) requires a working calendar and service catalogue. |

---

## 3. Change Summary

| ID | Feature | Type | Priority |
|----|---------|------|----------|
| CR-01 | Provider Profile Setup | New Feature | P0 |
| CR-02 | Calendar & Booking System | New Feature | P0 |
| CR-03 | Service / Package Configuration | New Feature | P0 |
| CR-04 | Dashboard Navigation Update | Enhancement | P1 |
| CR-05 | PRD Documentation | Documentation | P1 |

---

## 4. Detailed Change Log

### CR-01 — Provider Profile Setup

**Description:** Providers can complete their business profile after registration. A complete profile is required before the store goes live for customers.

**Sections:**
- **Business Info** — shop name, short description, address, service area, phone, email, LINE ID, website (optional)
- **Operation Hours** — toggle per day (Mon–Sun), open/close time picker per day
- **Photos & Logo** — logo upload, cover photo, gallery (up to 10 images)

**Acceptance Criteria:**
- Provider can save draft at any time
- Incomplete profile shows a completion progress indicator in the dashboard
- Profile data is stored in Supabase `provider_profiles` table
- Photo uploads go to Supabase Storage

**Out of Scope (MVP#2):**
- Public-facing profile URL (deferred to MVP#3)
- Verification badge flow

---

### CR-02 — Calendar & Booking System

**Description:** Providers get a full calendar interface to view, manage, and create bookings.

**Views:**
- **Monthly View** — grid calendar showing booking count per day, colour-coded by status
- **Weekly View** — time-slot grid (08:00–20:00, 30-min slots) showing booking cards per day

**Actions:**
- View existing customer bookings (read from Supabase `bookings` table)
- **Manual booking** — provider creates a booking on behalf of a customer (walk-in / phone call)
- **Block slots** — provider marks time as unavailable (e.g. lunch break, personal event, holiday)
- **Booking detail** — click a booking to see full details

**Acceptance Criteria:**
- Switching between month/week view is instant (no page reload)
- Blocked slots render with a distinct visual (striped / grey)
- Manual booking modal collects: customer name, pet name, service, date, time, duration
- Block modal collects: label, date, start/end time (or full day)

**Out of Scope (MVP#2):**
- Customer-initiated online booking (deferred to MVP#3)
- Payment processing on booking

---

### CR-03 — Service / Package Configuration

**Description:** Providers configure the services and packages they offer, which will later be displayed on their public profile and selected during booking.

**Service fields:**
- Name, category (grooming / veterinary / boarding / etc.), price, duration (minutes), description, active toggle

**Package fields:**
- Package name, included services, total price (vs. sum of individual), active toggle

**Acceptance Criteria:**
- Provider can add, edit, deactivate, and delete services
- Packages reference existing services
- Active/inactive toggle controls visibility (soft delete only — no hard delete)
- Stored in Supabase `services` and `packages` tables

---

### CR-04 — Dashboard Navigation Update

**Description:** Sidebar navigation updated to surface new MVP#2 pages.

| Before (MVP#1.5) | After (MVP#2) |
|------------------|---------------|
| ภาพรวม | ภาพรวม |
| การจอง | ปฏิทิน *(new)* |
| ลูกค้า | การจอง |
| *(removed)* ผู้ให้บริการ | บริการ *(new)* |
| — | ลูกค้า |
| — | โปรไฟล์ร้าน *(new)* |

---

## 5. Deferred Items (Not in MVP#2)

| Item | Reason |
|------|--------|
| Customer registration & login | Deferred to MVP#3 |
| Public provider profile page | Deferred to MVP#3 — requires customer-facing app |
| Online booking by customer | Deferred to MVP#3 |
| Payment / credit wallet | Deferred to MVP#3 |
| Review & rating system | Deferred to Scale phase |
| Push / SMS notifications | Deferred to MVP#3 |

---

## 6. Impact Assessment

| Area | Impact |
|------|--------|
| Frontend | 3 new pages, sidebar update, new components |
| Backend / DB | New tables: `provider_profiles`, `services`, `packages`, `bookings`, `blocked_slots` |
| Auth | No change — existing Supabase Auth used |
| Hosting | No change — Vercel + Supabase |
| Design | New components follow existing CI (Sky Blue #1AB0EB, Deep Blue #002949) |

---

## 7. Definition of Done (MVP#2)

- [ ] Provider can complete all 3 profile sections and save
- [ ] Calendar shows monthly and weekly views with booking data
- [ ] Provider can create a manual booking via calendar
- [ ] Provider can block a time slot via calendar
- [ ] Provider can add, edit, toggle, and delete services
- [ ] Provider can create a package from existing services
- [ ] All new pages follow Pawtal CI and are responsive
- [ ] All new routes are protected by Supabase Auth middleware
- [ ] Local build runs without errors (`npm run dev`)
- [ ] Changes committed and deployed to Vercel

---

## 8. File Change Index (Planned)

| File | Change Type |
|------|------------|
| `apps/web/src/components/dashboard/DashboardShell.tsx` | Modified — add new nav items |
| `apps/web/src/components/dashboard/ProfilePage.tsx` | New |
| `apps/web/src/components/dashboard/CalendarPage.tsx` | New |
| `apps/web/src/components/dashboard/ServicesPage.tsx` | New |
| `apps/web/src/app/dashboard/profile/page.tsx` | New |
| `apps/web/src/app/dashboard/calendar/page.tsx` | New |
| `apps/web/src/app/dashboard/services/page.tsx` | New |
| `docs/prd-mvp2.md` | New |
| `docs/crd-mvp1-5-to-mvp2.md` | New (this file) |
