# Product Requirements Document — MVP#2: Provider Foundation

> **Version:** 1.0
> **Date:** 2026-03-28
> **Status:** Draft → Review
> **Owner:** Product Squad · Pawtal
> **Phase:** MVP#2

---

## 1. Overview

### 1.1 Goal

Equip registered pet service providers with the core tools they need to run their business on Pawtal: a complete public profile, a booking calendar, and a service catalogue. This is the **foundation layer** that makes the platform usable before customers are introduced in MVP#3.

### 1.2 Problem Statement

After MVP#1.5, providers can register and log in — but there is nothing for them to do inside the dashboard. A provider with no profile, no calendar, and no services configured cannot be presented to pet owners. MVP#2 closes this gap.

### 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| Profile completion rate (registered → full profile) | ≥ 70% within 7 days of registration |
| Services configured per provider | ≥ 3 services |
| Calendar bookings created (manual) per provider in first month | ≥ 5 |
| Provider session length (dashboard) | ≥ 5 min average |
| Provider retention (D7 return) | ≥ 60% |

---

## 2. User Personas

### Primary — Pet Service Provider (Registered)

> "ฉันเพิ่งสมัครเข้าแพลตฟอร์มแล้ว แต่ยังไม่รู้จะทำอะไรต่อ อยากให้ลูกค้าเห็นร้านของฉัน"

- Just completed registration in MVP#1.5
- Has an existing business (grooming salon, mobile groomer, vet clinic, etc.)
- Currently manages bookings via LINE / phone call
- Pain point: no digital presence, no scheduling system

**Jobs to be done:**
1. "Let me set up my shop so it looks professional"
2. "Let me see what bookings I have this week"
3. "Let me add all my services and prices"
4. "Let me block off days I'm on holiday"

---

## 3. Features

---

### Feature 1 — Provider Profile Setup

#### 3.1.1 Overview

A multi-section profile editor where providers configure their public-facing business information. Profile completeness is tracked with a progress indicator.

#### 3.1.2 Sections

**Section A — Business Information**

| Field | Type | Required |
|-------|------|----------|
| Shop name | Text | Yes |
| Short description | Textarea (max 300 chars) | Yes |
| Service category (primary) | Select | Yes |
| Address | Text | Yes |
| Service area | Multi-select (Sukhumvit zones) | Yes |
| Phone number | Tel | Yes |
| Email | Email | Yes |
| LINE ID | Text | No |
| Website | URL | No |

**Section B — Operation Hours**

- Toggle per day: Monday – Sunday
- Per active day: open time + close time (30-min increments, 06:00–22:00)
- Option: "Same hours every day" shortcut
- Option: Mark day as "Closed"

**Section C — Photos & Logo**

| Asset | Specs |
|-------|-------|
| Logo | Square, recommended 400×400px, PNG/JPG |
| Cover photo | 16:9, recommended 1280×720px |
| Gallery | Up to 10 images, any ratio |

- Drag-and-drop upload zone
- Preview before save
- Stored in Supabase Storage (`provider-assets` bucket)

#### 3.1.3 Profile Completion Indicator

- Shown in Dashboard Home header
- % calculated: Business Info (40%) + Hours (30%) + Photos (30%)
- Prompt to complete if < 100%

#### 3.1.4 User Flow

```
Dashboard → Profile → [Tab: Business Info] → [Tab: Operation Hours] → [Tab: Photos]
Each tab: Edit → Save → Success toast
```

---

### Feature 2 — Calendar & Booking System

#### 3.2.1 Overview

A full-featured calendar for viewing and managing bookings. Two views: monthly overview and weekly detail. Providers can create manual bookings and block time slots.

#### 3.2.2 Monthly View

- Standard 7-column, 5–6 row calendar grid
- Current day highlighted
- Each day cell shows:
  - Booking count badge (e.g. "3 คิว")
  - Colour dot per status: pending (amber), confirmed (blue), in_progress (sky), completed (green)
- Click a day → jump to weekly view for that week

#### 3.2.3 Weekly View

- 7-column layout (Mon–Sun), time rows from 08:00–20:00 in 30-min slots
- Booking cards placed in correct time slot, spanning rows based on duration
- Card shows: pet name, service, customer name, status colour
- Click card → booking detail modal
- Empty slot → click → "Add booking / Block slot" quick action

#### 3.2.4 Manual Booking (Provider-Created)

Provider can create a booking on behalf of a walk-in or phone customer.

**Modal fields:**

| Field | Type | Required |
|-------|------|----------|
| Customer name | Text | Yes |
| Pet name | Text | Yes |
| Service | Select (from configured services) | Yes |
| Date | Date picker | Yes |
| Start time | Time picker (30-min steps) | Yes |
| Notes | Textarea | No |

Duration auto-filled from selected service. Status defaults to `confirmed`.

#### 3.2.5 Block Slot

Provider marks time as unavailable.

**Modal fields:**

| Field | Type | Required |
|-------|------|----------|
| Label | Text (e.g. "พักกลางวัน", "ปิดร้าน") | Yes |
| Date | Date picker | Yes |
| All day | Toggle | No |
| Start time | Time picker | If not all-day |
| End time | Time picker | If not all-day |

Blocked slots render with a grey striped pattern in the weekly view.

#### 3.2.6 Booking Status Flow

```
pending → confirmed → in_progress → completed
                   ↘ cancelled
```

Provider can update status from the booking detail modal.

---

### Feature 3 — Service & Package Configuration

#### 3.3.1 Overview

Providers configure the services they offer. These services are referenced in bookings and will be displayed on the public profile in MVP#3.

#### 3.3.2 Services

**Service fields:**

| Field | Type | Required |
|-------|------|----------|
| Service name | Text | Yes |
| Category | Select (grooming / veterinary / boarding / day_care / training / other) | Yes |
| Price | Number (฿) | Yes |
| Duration | Select (30 / 60 / 90 / 120 / 180 min) | Yes |
| Description | Textarea (max 200 chars) | No |
| Active | Toggle | Yes (default: on) |

**Actions:** Add, Edit, Toggle active, Delete (soft)

#### 3.3.3 Packages

A package bundles multiple services at a bundled price.

**Package fields:**

| Field | Type | Required |
|-------|------|----------|
| Package name | Text | Yes |
| Included services | Multi-select (from active services) | Yes (min 2) |
| Package price | Number (฿) | Yes |
| Savings label | Auto-calculated | — |
| Active | Toggle | Yes |

---

## 4. Navigation Structure

```
Dashboard (sidebar)
├── ภาพรวม          /dashboard
├── ปฏิทิน          /dashboard/calendar        ← NEW
├── การจอง          /dashboard/bookings
├── บริการ          /dashboard/services         ← NEW
├── ลูกค้า          /dashboard/customers
└── โปรไฟล์ร้าน    /dashboard/profile          ← NEW
```

---

## 5. Technical Requirements

### 5.1 Database Schema (Supabase)

**`provider_profiles`**
```sql
id uuid primary key references auth.users(id)
shop_name text
description text
address text
service_areas text[]
phone text
email text
line_id text
website text
logo_url text
cover_url text
gallery_urls text[]
operation_hours jsonb  -- { mon: {open:"09:00", close:"18:00"}, ... }
profile_complete_pct int
created_at timestamptz
updated_at timestamptz
```

**`services`**
```sql
id uuid primary key default gen_random_uuid()
provider_id uuid references auth.users(id)
name text
category text
price numeric
duration_minutes int
description text
is_active boolean default true
created_at timestamptz
```

**`packages`**
```sql
id uuid primary key default gen_random_uuid()
provider_id uuid references auth.users(id)
name text
service_ids uuid[]
price numeric
is_active boolean default true
created_at timestamptz
```

**`bookings`** (extends existing)
```sql
id uuid primary key default gen_random_uuid()
provider_id uuid references auth.users(id)
customer_name text
pet_name text
service_id uuid references services(id)
date date
start_time time
end_time time
status text  -- pending | confirmed | in_progress | completed | cancelled
notes text
is_manual boolean default false
created_at timestamptz
```

**`blocked_slots`**
```sql
id uuid primary key default gen_random_uuid()
provider_id uuid references auth.users(id)
label text
date date
is_all_day boolean default false
start_time time
end_time time
created_at timestamptz
```

### 5.2 Auth & Security
- All routes under `/dashboard/*` protected by existing Supabase Auth middleware
- RLS policies on all new tables: `provider_id = auth.uid()`

### 5.3 Frontend
- Next.js App Router — each new page is a server component wrapping a `"use client"` component
- No additional libraries required — calendar built with pure React state
- Tailwind CSS with existing Pawtal CI tokens

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Calendar render time | < 200ms on view switch |
| Profile save | Optimistic update + toast confirmation |
| Mobile responsiveness | All pages functional on 375px width |
| Accessibility | Keyboard-navigable calendar, ARIA labels on modals |

---

## 7. Out of Scope (MVP#2)

- Customer-facing app, registration, login
- Public provider profile URL
- Online booking by customers
- Payment processing
- Notifications (SMS, email, LINE OA)
- Analytics beyond existing dashboard home stats
- Multi-staff / staff management

---

## 8. Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Calendar complexity delays ship | Medium | Build weekly view first; monthly is simpler |
| Photo upload requires storage config | Low | Use Supabase Storage — already provisioned |
| Providers skip profile setup | Medium | Add completion gate before going live |

---

## 9. Definition of Done

- [ ] All 3 features (Profile, Calendar, Services) are live in `/dashboard`
- [ ] Dashboard sidebar updated with new nav items
- [ ] All routes protected by auth middleware
- [ ] Local build passes (`npm run dev` — zero errors)
- [ ] Deployed to Vercel production
- [ ] CRD filed at `docs/crd-mvp1-5-to-mvp2.md`
