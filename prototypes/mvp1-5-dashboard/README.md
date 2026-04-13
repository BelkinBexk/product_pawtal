# Pawtal MVP#1.5 — Provider Dashboard Prototype

> **Type:** Interactive HTML Prototype
> **Version:** v1.0 | **Date:** March 2026
> **Role:** UX/UI Designer
> **Phase:** MVP#1.5 — Provider Authentication + Dashboard

---

## How to Open

**Double-click `prototype.html`** — opens in any browser. No install required.

> Recommended: Chrome 120+, Safari 17+, Firefox 121+

---

## Screens

| # | Screen | Description |
|---|--------|-------------|
| S1 | Login | Email/password + LINE SSO. Links back to MVP#1.0 registration |
| S2 | Dashboard Home | Stats (bookings, revenue, rating), revenue chart, quick actions, upcoming bookings |
| S3 | Bookings List | All transactions with status filters, search, per-booking CTAs |
| S4 | Customers | CRM-lite: visit history, cumulative spend, new vs. repeat segmentation |
| S5 | Provider Directory | Browse all Pawtal-verified providers by area; own shop highlighted |
| S6 | Booking Detail | Itemised service + price, pet info, live service timeline, chat CTA |

---

## MVP#1.5 Scope vs. MVP#1.0

| Feature | MVP#1.0 | MVP#1.5 |
|---------|---------|---------|
| Provider landing page | ✅ | ✅ (unchanged) |
| Interest registration form | ✅ | ✅ (now creates auth account) |
| Login / authentication | ❌ | ✅ |
| Provider dashboard | ❌ | ✅ |
| Booking management | ❌ | ✅ |
| Customer visit history | ❌ | ✅ |
| Revenue chart | ❌ | ✅ |
| Provider directory | ❌ | ✅ |
| Booking detail + timeline | ❌ | ✅ |

---

## Engineering Handoff Notes

### Auth
- Use **Supabase Auth** (email/password + LINE OAuth provider)
- On registration (MVP#1.0 form), create auth account + `provider_leads` row atomically
- After login → redirect to `/dashboard`

### Routes

| Route | Component |
|-------|-----------|
| `/login` | `app/login/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/bookings` | `app/dashboard/bookings/page.tsx` |
| `/dashboard/bookings/[id]` | `app/dashboard/bookings/[id]/page.tsx` |
| `/dashboard/customers` | `app/dashboard/customers/page.tsx` |
| `/dashboard/providers` | `app/dashboard/providers/page.tsx` |

### New DB Tables Needed

```sql
-- Providers (upgraded from provider_leads)
CREATE TABLE providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  area          TEXT NOT NULL,
  service_types TEXT[],
  rating        NUMERIC(3,2) DEFAULT 0,
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID REFERENCES providers(id),
  customer_name TEXT NOT NULL,
  pet_name      TEXT,
  pet_breed     TEXT,
  service_items JSONB,
  total_amount  NUMERIC(10,2),
  status        TEXT DEFAULT 'pending',
  scheduled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID REFERENCES providers(id),
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

*Questions? Check `CLAUDE.md` or invoke the relevant agent.*
