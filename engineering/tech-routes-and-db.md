# Pawtal — Routes & Database Reference

> **Version:** 1.0 · **Date:** 2026-04-06 · **Scope:** Prototype (MVP#0.5 → MVP#2.5)

---

## 1. Route Map

### 1.1 Public Routes (no auth required)

| URL | File | Description |
| --- | --- | --- |
| `/` | `app/page.tsx` | Main landing page — hero, features, for-pet-owners CTA |
| `/for-business` | `app/for-business/page.tsx` | Vendor landing page — B2B acquisition, links to vendor signup/login |

---

### 1.2 Customer Routes

#### Auth

| URL | File | Description |
| --- | --- | --- |
| `/login` | `app/login/page.tsx` | Customer login — email/password · redirects to `/deals` on success |
| `/signup` | `app/signup/page.tsx` | Customer registration — 2-step (account → pet profile) · stores to `customers` + `pets` |
| `/forgot-password` | `app/forgot-password/page.tsx` | Sends Supabase password reset email |
| `/reset-password` | `app/reset-password/page.tsx` | Handles reset token from email link · calls `supabase.auth.updateUser` |

#### App (post-login)

| URL | File | Description |
| --- | --- | --- |
| `/deals` | `app/deals/page.tsx` | Main customer feed — browse off-peak deals, search, location filter, category pills, pagination · "My Account" dropdown (My Bookings, Profile Settings) |

> **Planned (not yet built):** `/book/[slot_id]`, `/bookings`, `/profile`, `/providers/[id]`

---

### 1.3 Vendor Routes

All vendor routes share the `/vendor` prefix. They are split into two **Next.js route groups** so auth pages never inherit the dashboard sidebar layout.

#### Auth group — `app/vendor/(auth)/` — no sidebar

| URL | File | Description |
| --- | --- | --- |
| `/vendor/login` | `app/vendor/(auth)/login/page.tsx` | Vendor login · checks `user_metadata.role === "provider"` · redirects non-vendors back with error |
| `/vendor/signup` | `app/vendor/(auth)/signup/page.tsx` | Vendor registration — 3-step (Personal Info → Business Info → Review & Submit) · stores to `providers` table + sets `role: "provider"` in `user_metadata` |

#### Dashboard group — `app/vendor/(dashboard)/` — sidebar via shared layout

| URL | File | Description |
| --- | --- | --- |
| `/vendor/dashboard` | `app/vendor/(dashboard)/dashboard/page.tsx` | Overview — 4 KPI cards, today's appointments, upcoming appointments, revenue sparkline chart |
| `/vendor/bookings` | `app/vendor/(dashboard)/bookings/page.tsx` | Booking list — search, filter pills (All / Today / Pending / Confirmed / Cancelled), sortable table, Export Excel (CSV) |
| `/vendor/transactions` | *(not yet built)* | Transaction & payout history — renamed from "Revenue" |
| `/vendor/reviews` | *(not yet built)* | Customer reviews — "2 new" badge |
| `/vendor/profile` | `app/vendor/(dashboard)/profile/page.tsx` | Profile & Settings — 3 sections: Business Info, Services Offered (with pricing matrix modal + per-service live preview), Working Hours |

> **Shared layout:** `app/vendor/(dashboard)/layout.tsx` — renders `VendorSidebar` for all dashboard pages. Uses `usePathname()` for active nav state.

---

### 1.4 Route Summary Diagram

```
/                          ← Landing page (public)
/for-business              ← Vendor acquisition (public)

/login                     ← Customer login
/signup                    ← Customer signup (2-step)
/forgot-password           ← Password reset request
/reset-password            ← Password reset confirm
/deals                     ← Customer deal feed (auth required)

/vendor/login              ← Vendor login (no sidebar)
/vendor/signup             ← Vendor signup (no sidebar)
/vendor/dashboard          ← Vendor overview (sidebar)
/vendor/bookings           ← Vendor bookings (sidebar)
/vendor/transactions       ← Vendor transactions (sidebar) [planned]
/vendor/reviews            ← Vendor reviews (sidebar) [planned]
/vendor/profile            ← Vendor profile & settings (sidebar)
```

---

## 2. Authentication Model

Pawtal uses **Supabase Auth** (`auth.users`) as the single identity store for both customers and vendors. Role is determined by `user_metadata.role` set at sign-up.

| Role value | Who | Signup route | Post-login destination |
| --- | --- | --- | --- |
| `"customer"` | Pet owners | `/signup` | `/deals` |
| `"provider"` | Pet service vendors | `/vendor/signup` | `/vendor/dashboard` |

**Vendor login guard** — `/vendor/login` explicitly checks `user_metadata.role`. If a customer account tries to log in via the vendor portal, it is rejected and the session is immediately signed out:

```ts
const role = data.user?.user_metadata?.role;
if (role !== "provider") {
  await supabase.auth.signOut();
  setError("This account is not registered as a vendor.");
}
```

---

## 3. Database Schema

### 3.1 Entity Overview

```
auth.users  (managed by Supabase Auth)
    │
    ├──▶ customers          (role = "customer")
    │        └──▶ pets
    │        └──▶ paw_credit_wallets
    │
    └──▶ providers          (role = "provider")
             └──▶ services
             └──▶ packages
             └──▶ off_peak_slots
             └──▶ provider_payouts

bookings   (joins customers ↔ providers ↔ services ↔ off_peak_slots)
```

---

### 3.2 Table Definitions

#### `customers`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid FK | → `auth.users(id)` |
| `first_name` | text |  |
| `last_name` | text |  |
| `phone` | text |  |
| `area` | text | Bangkok district (e.g. "Sukhumvit") |
| `pet_type` | text | `dog \ | cat \ | other` — primary pet for feed personalisation |
| `created_at` | timestamptz | `now()` |

> **Trigger:** Supabase creates a row here automatically on `auth.users` insert when `role = "customer"`.

---

#### `pets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `customer_id` | uuid FK | → `customers(id)` |
| `name` | text |  |
| `species` | text | `dog \ | cat \ | other` |
| `breed` | text | nullable |
| `gender` | text | `male \ | female \ | unknown` |
| `weight_kg` | numeric | nullable |
| `medical_notes` | text | nullable |
| `created_at` | timestamptz |  |

---

#### `providers`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `user_id` | uuid FK | → `auth.users(id)` |
| `shop_name` | text |  |
| `owner_name` | text |  |
| `phone` | text |  |
| `email` | text |  |
| `service_type` | text | e.g. "Grooming", "Day Care" |
| `area` | text | Bangkok district |
| `address` | text |  |
| `description` | text | nullable |
| `is_active` | boolean | `true` when profile is live to customers |
| `created_at` | timestamptz |  |

---

#### `services`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `provider_id` | uuid FK | → `providers(id)` |
| `name` | text | e.g. "Full Grooming" |
| `category` | text | Grooming / Bath & Trim / Day Care / Training / Boarding / Vet |
| `duration_min` | int | service duration in minutes |
| `buffer_min` | int | post-service buffer time in minutes |
| `base_price` | numeric | nullable — used when `varies_by_size = false` |
| `varies_by_size` | boolean | if true, pricing is in `service_pricing` matrix |
| `description` | text | nullable |
| `is_active` | boolean |  |
| `created_at` | timestamptz |  |

---

#### `service_pricing` *(pricing matrix for size-variable services)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `service_id` | uuid FK | → `services(id)` |
| `fur_type` | text | `short \ | long \ | special` |
| `size_key` | text | `XXS \ | XS \ | S \ | M \ | L \ | XL \ | 2XL` |
| `price` | numeric | blank = not offered for this combination |

---

#### `off_peak_slots`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `provider_id` | uuid FK | → `providers(id)` |
| `service_id` | uuid FK | → `services(id)` |
| `date` | date |  |
| `start_time` | time |  |
| `end_time` | time |  |
| `discount_pct` | int | `CHECK (10 ≤ discount_pct ≤ 50)` |
| `original_price` | numeric | price at time of slot creation |
| `deal_price` | numeric | `original_price × (1 - discount_pct / 100)` |
| `status` | text | `available \ | booked \ | cancelled \ | expired` |
| `booked_at` | timestamptz | nullable |
| `booking_id` | uuid FK | → `bookings(id)` nullable |
| `created_at` | timestamptz |  |

---

#### `bookings`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `customer_id` | uuid FK | → `customers(id)` |
| `provider_id` | uuid FK | → `providers(id)` |
| `service_id` | uuid FK | → `services(id)` |
| `pet_id` | uuid FK | → `pets(id)` nullable |
| `off_peak_slot_id` | uuid FK | → `off_peak_slots(id)` nullable — null for manual bookings |
| `date` | date |  |
| `start_time` | time |  |
| `status` | text | `pending \ | confirmed \ | cancelled \ | completed` |
| `is_manual` | boolean | `true` = vendor created it; `false` = customer booked online |
| `price` | numeric | price charged to customer |
| `commission_amount` | numeric | 20% platform fee |
| `provider_payout_amount` | numeric | `price - commission_amount` |
| `payment_status` | text | `unpaid \ | paid \ | refunded` |
| `payment_method` | text | `thb_card \ | thb_promptpay \ | paw_credits` nullable |
| `paw_credits_used` | numeric | `DEFAULT 0` |
| `notes` | text | customer notes for provider |
| `created_at` | timestamptz |  |

---

#### `paw_credit_wallets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `customer_id` | uuid FK | → `customers(id)` |
| `balance` | numeric | `DEFAULT 0` — 1 credit = ฿1 |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |

---

#### `provider_payouts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK |  |
| `provider_id` | uuid FK | → `providers(id)` |
| `period_start` | date |  |
| `period_end` | date |  |
| `total_bookings` | int |  |
| `gross_amount` | numeric | sum of `bookings.price` in period |
| `commission` | numeric | 20% withheld |
| `net_amount` | numeric | `gross_amount - commission` |
| `status` | text | `pending \ | paid` |
| `paid_at` | timestamptz | nullable |
| `created_at` | timestamptz |  |

---

### 3.3 Entity-Relationship Diagram (text)

```
auth.users
  │  user_metadata: { role, first_name, last_name }
  │
  ├─[1:1]─▶ customers
  │              │
  │              ├─[1:N]─▶ pets
  │              ├─[1:1]─▶ paw_credit_wallets
  │              └─[1:N]─▶ bookings ◀──────────────────────┐
  │                                                          │
  └─[1:1]─▶ providers                                       │
                 │                                           │
                 ├─[1:N]─▶ services                         │
                 │              └─[1:N]─▶ service_pricing   │
                 ├─[1:N]─▶ off_peak_slots ──[1:1]──▶ bookings
                 └─[1:N]─▶ provider_payouts
```

---

## 4. Key Data Flows

### Customer books an off-peak deal

```
1.  Customer browses /deals
        └─ query: off_peak_slots JOIN providers JOIN services
           WHERE status = 'available' AND date >= today

2.  Customer selects deal → /book/[slot_id]
        └─ read off_peak_slots + services + providers for display

3.  Customer confirms + pays (Omise)
        └─ INSERT bookings (is_manual=false, payment_status='paid')
        └─ UPDATE off_peak_slots SET status='booked', booking_id=...
        └─ DEDUCT paw_credits_used from paw_credit_wallets (if used)

4.  Vendor sees booking in /vendor/bookings
        └─ query: bookings WHERE provider_id = current_user
```

### Vendor creates a manual booking

```
1.  Vendor opens /vendor/bookings → "+ Add booking"
        └─ INSERT bookings (is_manual=true, payment_status='unpaid')

2.  Booking appears in dashboard today's appointments
        └─ query: bookings WHERE provider_id = ? AND date = today
```

---

## 5. Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
```

---

## 6. Build Status by Route

| Route | Auth wired | DB wired | UI complete |
| --- | --- | --- | --- |
| `/` | — | — | ✅ |
| `/for-business` | — | — | ✅ |
| `/login` | ✅ | ✅ | ✅ |
| `/signup` | ✅ | ✅ customers + pets | ✅ |
| `/forgot-password` | ✅ | — | ✅ |
| `/reset-password` | ✅ | — | ✅ |
| `/deals` | — | mock data | ✅ |
| `/vendor/login` | ✅ role check | — | ✅ |
| `/vendor/signup` | ✅ | ✅ providers | ✅ |
| `/vendor/dashboard` | — | mock data | ✅ |
| `/vendor/bookings` | — | mock data | ✅ |
| `/vendor/transactions` | — | — | ⏳ not built |
| `/vendor/reviews` | — | — | ⏳ not built |
| `/vendor/profile` | — | mock data | ✅ |
