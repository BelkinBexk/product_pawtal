# Change Requirements Document
## MVP#2 → MVP#2.5: Off-Peak Hour Served — Core Marketplace

> **CRD ID:** CRD-PWL-003
> **Version:** 1.0
> **Date:** 2026-03-29
> **Status:** Draft
> **Author:** Product Squad · Pawtal
> **From:** MVP#2 — Provider Foundation (shipped 2026-03-29)
> **To:** MVP#2.5 — Off-Peak Core Marketplace

---

## 1. Context & Motivation

MVP#2 delivered the provider-side foundation: profile setup, calendar management, and service/package configuration. Providers are now equipped with the tools to run their business on Pawtal.

MVP#2.5 activates the platform's core product concept: **Off Peak Hour Served**. This is the first release where both sides of the marketplace are live simultaneously — providers list discounted off-peak slots, and customers can discover, browse, and book them.

This phase represents a fundamental shift from "provider tool" to "two-sided marketplace." The strategic rationale is documented in `docs/product-positioning-v1.md`.

---

## 2. What Changes in MVP#2.5

### CR-001 — Off-Peak Slot Management (Provider)

**Type:** New Feature — Provider Dashboard
**Priority:** P0 — Core off-peak mechanic

Providers can designate time slots in their calendar as "Off-Peak" and attach a discount to those slots.

**Changes required:**
- Calendar UI: add "Set as Off-Peak" action on any time slot or block
- Off-Peak config panel: select applicable services, set discount % (10–50%), set validity window
- Visual distinction in calendar: off-peak slots shown in a different colour/badge
- Dashboard widget: "Off-Peak Performance" — shows # of off-peak bookings vs. empty slots this week
- DB: new `off_peak_slots` table (see Section 5)

**Acceptance criteria:**
- Provider can mark any future slot as off-peak with a discount in under 60 seconds
- Off-peak slots are immediately visible on the customer discovery feed
- Provider can edit or cancel an off-peak slot up until it is booked

---

### CR-002 — Customer Registration & Login

**Type:** New Feature — Customer Side
**Priority:** P0 — Required before any customer flow

Customer-facing auth: register with email/password or Google OAuth, log in, manage basic profile.

**Changes required:**
- `/customer/register` — registration page (name, email, password, phone, PDPA consent)
- `/customer/login` — login page
- Supabase Auth: customer role (separate from provider role)
- `customers` table already exists — link `user_id` on registration
- Middleware: `/customer/*` routes protected; redirect to `/customer/login`

---

### CR-003 — Customer Deal Discovery Feed

**Type:** New Feature — Customer Side
**Priority:** P0 — Core off-peak mechanic, customer view

The main customer screen: a browsable feed of available off-peak deals near the customer.

**Changes required:**
- `/deals` — deal discovery page (default landing for logged-in customers)
- Deal card component: provider name, service, deal price, original price, discount badge, time window (e.g. "Today 10:00–12:00"), distance from customer, provider rating
- Filters: area (Sukhumvit zones), service type, pet type (dog/cat/other), date (today/tomorrow/this week)
- Sort options: discount %, distance, rating
- Empty state: "No deals in your area right now — check back later"
- DB query: `off_peak_slots` joined with `providers` and `services`, filtered by `available = true` and `start_time > now()`

---

### CR-004 — Provider Public Profile Page

**Type:** New Feature — Customer Side
**Priority:** P1 — Required for booking flow

Public-facing provider profile page accessible to customers from the deal discovery feed.

**Changes required:**
- `/providers/[id]` — public provider page
- Sections: shop photos, name, description, services list with full prices, location/area, operation hours, rating + review count
- "Available Off-Peak Deals" section: shows current/upcoming off-peak slots for this provider
- "Book a Deal" CTA on each off-peak slot card

---

### CR-005 — Booking Flow with Upfront Payment

**Type:** New Feature — Customer Side + Payment
**Priority:** P0 — Revenue mechanism

End-to-end booking flow: customer selects an off-peak slot, confirms pet details, and pays upfront.

**Changes required:**
- `/book/[slot_id]` — booking page
  - Step 1: Confirm service + time slot (read-only, from selected deal)
  - Step 2: Pet details (name, species, breed, notes for provider)
  - Step 3: Payment — card or PromptPay QR (Omise integration)
  - Step 4: Confirmation screen with booking reference
- On payment success:
  - Create `bookings` record (`is_manual = false`, `payment_status = paid`)
  - Mark off-peak slot as `booked`
  - Notify provider (in-app notification + LINE OA webhook, if configured)
- Payment method: customer pays via **THB** (card / PromptPay via Omise) or **Paw Credits** (platform virtual currency, pre-loaded wallet)
- Commission deduction: calculated at transaction time (**20%**), stored on booking record
- DB: add `commission_amount`, `provider_payout_amount`, `payment_method`, `paw_credits_used` columns to `bookings`

---

### CR-006 — Customer Booking History

**Type:** New Feature — Customer Side
**Priority:** P1

Simple booking history page for customers showing upcoming and past bookings.

**Changes required:**
- `/customer/bookings` — booking history page
- List view: upcoming (sorted by date) + past (with status badges)
- Booking card: provider name + logo, service, date/time, price paid, status
- Re-book shortcut: "Book again" → pre-fills the same provider/service in the booking flow

---

### CR-007 — Payment Infrastructure

**Type:** New Feature — Platform
**Priority:** P0 — Required for CR-005

**Changes required:**
- Omise account setup and API key configuration
- Server-side payment intent creation (Next.js API route: `/api/payments/create-intent`)
- Webhook handler: `/api/payments/webhook` — handles payment success/failure events
- Payment UI: Omise.js card form embedded in booking flow
- PromptPay QR: Omise PromptPay charge API
- Payout tracking: `provider_payouts` table (batch weekly, manual trigger for MVP#2.5)

---

### CR-009 — Payment & Transaction Feature

**Type:** New Feature — Platform + Provider Dashboard
**Priority:** P0 — Core revenue transparency

Defines the full payment model and surfaces commission/payout data to providers in the dashboard.

**Payment methods (customer side):**
- **THB** — card (Omise) or PromptPay QR; displayed as "THB ฿xxx"
- **Paw Credits** — platform virtual currency; displayed as "🐾 xxx credits" (1 credit = ฿1)
- Payment method recorded on every booking; visible to provider in booking detail

**Commission model:**
- Platform commission: **20% per booking** (calculated on deal price at transaction time)
- Formula: `commission_amount = deal_price × 0.20`, `provider_payout_amount = deal_price × 0.80`
- Commission displayed in two places:
  1. **Booking detail** — shows Service Amount, Commission Fee (20%), and Provider Net in the payment summary widget
  2. **Transactions screen** — line-by-line transaction ledger for the provider

**Provider Service Configuration display:**
- Each service in the Services list shows three figures:
  - **Service Amount** — full listed price (฿xxx)
  - **Commission Fee** — 20% deducted by platform (฿xxx)
  - **You Receive** — provider net after commission (฿xxx)

**New: Transactions screen (`/dashboard/transactions`):**
- Provider-facing ledger of all completed bookings with payment
- Columns: Date, Booking Ref, Customer, Service, Payment Method, Service Amount, Commission (20%), Provider Net, Status
- Summary cards at top: Total Earned (net), Total Commission paid, Total Bookings this month
- Filter by payment method (All / Paw Credits / THB), date range
- Status badges: Paid Out / Pending / Processing

**Changes required:**
- New `/dashboard/transactions` page
- Update booking detail widget to include commission breakdown
- Update service list items to show amount / commission / net split
- DB: alter `bookings` — add `payment_method text` (`thb_card` | `thb_promptpay` | `paw_credits`), `paw_credits_used numeric`
- DB: new `paw_credit_wallets` table (customer wallet balance)

---

### CR-008 — Platform Navigation & Routing Update

**Type:** Enhancement — Frontend
**Priority:** P1

The existing routing was provider-only. With customers added, routing needs restructuring.

**Changes required:**
- Provider routes stay at `/dashboard/*` (unchanged)
- Customer routes at `/customer/*` (new)
- Public routes: `/`, `/providers/[id]`, `/deals` (accessible without login)
- Middleware: separate auth guards for provider vs. customer sessions
- Landing page (`/`): update hero CTA to reflect dual audience (providers join, customers browse deals)

---

## 3. What Stays the Same (MVP#2 carried forward)

| Feature | Status |
|---------|--------|
| Provider dashboard shell (sidebar, topbar) | Unchanged |
| Calendar — standard booking management | Unchanged |
| Services & packages CRUD | Unchanged |
| Provider profile setup (3 tabs) | Unchanged — profile data powers public profile page (CR-004) |
| Customer & booking tables in DB | Extended (new columns), not replaced |
| Auth (provider login/register) | Unchanged |

---

## 4. What Is Deferred (Not in MVP#2.5)

| Feature | Reason for deferral |
|---------|---------------------|
| Reviews & ratings | Requires completed bookings history — available in MVP#3 |
| Provider analytics dashboard | Off-peak performance widget (CR-001) is sufficient for now |
| Multi-area expansion | Validate Sukhumvit first before expanding |
| Subscription / credit pack for customers | Direct pay is simpler to validate unit economics first |
| Provider-set availability rules (recurring off-peak) | Manual slot creation covers MVP#2.5; automation in MVP#3 |
| SMS/LINE push notifications | In-app notification sufficient; LINE OA webhook is P2 |
| Loyalty credits | MVP#3 |

---

## 5. Database Changes Required

### New table: `off_peak_slots`

```sql
id              uuid      PK default gen_random_uuid()
provider_id     uuid      FK → auth.users(id)
service_id      uuid      FK → services(id)
date            date      NOT NULL
start_time      time      NOT NULL
end_time        time      NOT NULL
discount_pct    int       NOT NULL CHECK (discount_pct BETWEEN 10 AND 50)
deal_price      numeric   NOT NULL  -- pre-calculated: price * (1 - discount_pct/100)
original_price  numeric   NOT NULL
status          text      NOT NULL DEFAULT 'available'  -- available | booked | cancelled | expired
booked_at       timestamptz
booking_id      uuid      FK → bookings(id)
created_at      timestamptz DEFAULT now()
```

### Alter table: `bookings`

```sql
ADD COLUMN commission_amount       numeric
ADD COLUMN provider_payout_amount  numeric
ADD COLUMN off_peak_slot_id        uuid FK → off_peak_slots(id)
ADD COLUMN payment_method          text   -- thb_card | thb_promptpay | paw_credits
ADD COLUMN paw_credits_used        numeric DEFAULT 0
```

### New table: `paw_credit_wallets`

```sql
id              uuid      PK default gen_random_uuid()
customer_id     uuid      FK → customers(id)
balance         numeric   NOT NULL DEFAULT 0  -- in credits (1 credit = ฿1)
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### New table: `provider_payouts`

```sql
id              uuid      PK
provider_id     uuid      FK → auth.users(id)
period_start    date
period_end      date
total_bookings  int
gross_amount    numeric
commission      numeric
net_amount      numeric
status          text      DEFAULT 'pending'  -- pending | paid
paid_at         timestamptz
created_at      timestamptz DEFAULT now()
```

### Alter table: `customers` (if not already done)

```sql
ADD COLUMN pet_type   text  -- dog | cat | other (primary pet, for feed personalisation)
```

---

## 6. Impact Assessment

| Area | Impact | Notes |
|------|--------|-------|
| Provider dashboard | Low — additive only | Off-peak slot management added to Calendar; no existing features removed |
| Database | Medium | 3 new tables, 5 columns added to bookings |
| Frontend | High | Entire customer-facing app is new (discovery, profile, booking, history) |
| Payment | High | New integration (Omise); requires PCI-compliant handling |
| Auth/Middleware | Medium | Second user type (customer) added alongside provider |
| Infrastructure | Low | Supabase + Vercel handles scale; no new services needed |

---

## 7. Definition of Done — MVP#2.5

- [ ] Provider can mark calendar slots as off-peak with a discount in the dashboard
- [ ] Off-peak slots appear live on the `/deals` customer feed within 60 seconds of creation
- [ ] Customer can register, log in, browse deals, and complete a booking with payment
- [ ] Payment is processed via Omise (card + PromptPay QR) and Paw Credits wallet
- [ ] Booking confirmation delivered to both provider and customer
- [ ] Commission amount (20%) correctly recorded on each booking
- [ ] Booking detail shows Service Amount, Commission Fee, and Provider Net
- [ ] Provider Transactions screen shows full ledger with payment method per booking
- [ ] Service list shows per-service commission split (amount / fee / you receive)
- [ ] Provider can see their off-peak bookings alongside manual bookings in calendar
- [ ] All `/customer/*` routes protected; unauthenticated users redirected to login
- [ ] Public provider profile page renders with correct data for any provider
- [ ] Mobile-responsive: full booking flow works on 375px viewport
- [ ] No TypeScript errors; all new DB tables have RLS policies
- [ ] Git tag `mvp2.5` created before production deploy
