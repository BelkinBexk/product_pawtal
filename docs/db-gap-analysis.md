# Pawtal — Database Gap Analysis
## What the current UI needs vs. what the schema has

> **Reviewed against:** All prototype pages built as of 2026-04-06
> **Method:** Every UI field and interaction cross-checked against `docs/tech-routes-and-db.md`

---

## Summary

| Gap type | Count |
|----------|-------|
| Missing tables | 3 |
| Missing columns on existing tables | 18 |
| Missing join/relation | 2 |
| Column type mismatch | 2 |

---

## 1. Missing Tables

### 1.1 `provider_hours`

**Why:** The Profile & Settings page has a full working-hours UI — open/closed per day, open time, close time. There is currently **no table** for this data; it would be lost on every page refresh.

```sql
CREATE TABLE provider_hours (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  uuid        NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week  text        NOT NULL,  -- MON | TUE | WED | THU | FRI | SAT | SUN
  is_open      boolean     NOT NULL DEFAULT true,
  open_time    time,                  -- null when is_open = false
  close_time   time,                  -- null when is_open = false
  UNIQUE (provider_id, day_of_week)
);
```

**Used by:** `/vendor/profile` (Working Hour Availability section)

---

### 1.2 `reviews`

**Why:** The dashboard shows "Avg. Rating 4.9 · 128 total reviews" and the sidebar has a "Reviews · 2 new" badge. Neither has a backing table.

```sql
CREATE TABLE reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid        NOT NULL REFERENCES bookings(id),
  customer_id   uuid        NOT NULL REFERENCES customers(id),
  provider_id   uuid        NOT NULL REFERENCES providers(id),
  rating        smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  is_published  boolean     NOT NULL DEFAULT true,
  is_read       boolean     NOT NULL DEFAULT false,  -- for "2 new" badge
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

**Used by:** `/vendor/dashboard` (Avg Rating KPI), `/vendor/reviews` (planned page), deals page (star rating on deal card)

---

### 1.3 `notifications`

**Why:** Every page in the vendor dashboard has a bell icon in the topbar. Without a notifications table there is nothing to show or count.

```sql
CREATE TABLE notifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text        NOT NULL,  -- new_booking | booking_cancelled | new_review | payout_ready
  title        text        NOT NULL,
  body         text,
  is_read      boolean     NOT NULL DEFAULT false,
  related_id   uuid,                  -- optional FK to booking / review / payout
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

**Used by:** Bell icon topbar on all vendor dashboard pages

---

## 2. Missing Columns on Existing Tables

### 2.1 `providers` — 7 missing columns

| Column | Type | Why it's needed |
|--------|------|-----------------|
| `logo_url` | text | Shop avatar shown in sidebar ("NP" initials are a placeholder), deals page card, and live preview |
| `cover_url` | text | Cover photo in live preview panel (currently a CSS gradient placeholder) |
| `lat` | numeric | Latitude — needed for distance calculation on `/deals` page ("near you" filter) |
| `lng` | numeric | Longitude — same as above |
| `line_id` | text | LINE OA handle — standard contact method in Thailand; referenced in CRD docs |
| `rating_avg` | numeric | Denormalised average rating shown on dashboard KPI card and deals page. Recomputed after each new review. |
| `review_count` | int | Denormalised total review count ("128 total reviews"). Avoids expensive COUNT query on every page load. |
| `is_verified` | boolean | "Verified" badge shown on the live preview panel and planned for the public provider page |

---

### 2.2 `services` — 3 missing columns

| Column | Type | Why it's needed |
|--------|------|-----------------|
| `pet_types` | text[] | Array of applicable pets: `{"dog","cat","other"}`. The `/deals` page has a pet-type filter; without this column, filtering is impossible. |
| `buffer_min` | int | Already in the UI (Buffer Time dropdown in service modal). Not in current schema definition. |
| `sort_order` | int | Controls display order in the services list on the profile page and public shop page. |

---

### 2.3 `bookings` — 4 missing columns

| Column | Type | Why it's needed |
|--------|------|-----------------|
| `booking_reference` | text | The bookings table UI shows "BK-001", "BK-002" etc. A human-readable reference needs to be stored (e.g. `PAWTAL-20260406-001`). Cannot rely on UUID for this. |
| `end_time` | time | Required to show booking blocks correctly in a future calendar view. Can be computed from `start_time + services.duration_min` but worth storing. |
| `cancellation_reason` | text | Cancelled bookings (status = "cancelled") should record why. Needed for the bookings page filter and future analytics. |
| `pet_notes` | text | Customer's notes about their pet for this specific booking (e.g. "allergic to X shampoo"). Distinct from `pets.medical_notes` which is permanent. |

---

### 2.4 `customers` — 2 missing columns

| Column | Type | Why it's needed |
|--------|------|-----------------|
| `avatar_url` | text | Customer avatar shown in the bookings table (currently using initials + colour). Needed when customers can upload a profile photo. |
| `line_id` | text | LINE contact for booking confirmations — standard in Thailand. |

---

### 2.5 `off_peak_slots` — 2 missing columns

| Column | Type | Why it's needed |
|--------|------|-----------------|
| `pet_types` | text[] | Which pets this slot is for. The deals page has a pet-type filter that must narrow to relevant slots. |
| `slot_label` | text | Optional vendor label for the slot (e.g. "Morning special"). Shown on the deal card. |

---

## 3. Missing Relations

### 3.1 `services` ↔ `packages`

The CRD documents a `packages` table but it is never defined. The profile page currently only has services — packages are deferred — but the relation needs to be established before MVP#3.

```sql
CREATE TABLE packages (
  id           uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  uuid     NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name         text     NOT NULL,
  total_price  numeric  NOT NULL,
  is_active    boolean  NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE package_services (
  package_id   uuid  REFERENCES packages(id) ON DELETE CASCADE,
  service_id   uuid  REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, service_id)
);
```

---

### 3.2 `bookings` → `pets` (nullable)

The bookings table has `pet_id uuid FK → pets(id)` but the current schema marks it as `nullable`. For off-peak bookings, the pet ID should be **required** (so providers know what pet they're grooming). For manual bookings it can remain nullable (walk-in without a registered account).

**Recommendation:** Add a DB constraint or application-level validation:
- `is_manual = false` → `pet_id NOT NULL`
- `is_manual = true` → `pet_id` nullable, add `walk_in_pet_name text` and `walk_in_pet_species text` columns instead

---

## 4. Type / Constraint Mismatches

### 4.1 `service_pricing.fur_type` values

**UI uses:** `"Short fur"`, `"Long fur"`, `"Special / Double coat"`
**Schema says:** `short | long | special`

These need to match. Recommend storing as the short enum (`short | long | special`) in the DB and mapping to display labels in the frontend.

---

### 4.2 `bookings.status` missing `"New"` value

**UI shows 4 statuses:** `Confirmed | Pending | New | Cancelled`
**Schema defines:** `pending | confirmed | cancelled | completed`

`"New"` is used in the dashboard for bookings that just arrived and haven't been actioned yet. Add it:

```sql
ALTER TABLE bookings
  DROP CONSTRAINT bookings_status_check,
  ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('new', 'pending', 'confirmed', 'cancelled', 'completed'));
```

---

## 5. Priority Order for Implementation

| Priority | Item | Blocks |
|----------|------|--------|
| **P0** | `provider_hours` table | Profile & Settings save/load |
| **P0** | `bookings.booking_reference` | Bookings page display |
| **P0** | `bookings.status` add `"new"` | Dashboard + bookings filter |
| **P0** | `services.pet_types` | Deals page filter |
| **P0** | `off_peak_slots.pet_types` | Deals page filter |
| **P1** | `reviews` table | Reviews page + dashboard KPI |
| **P1** | `providers.rating_avg` + `review_count` | Dashboard KPI, deals card |
| **P1** | `providers.lat` + `lng` | Deals "near you" filter |
| **P1** | `providers.is_verified` | Verified badge on deals card |
| **P2** | `notifications` table | Bell icon topbar |
| **P2** | `providers.logo_url` + `cover_url` | Shop avatar, live preview |
| **P2** | `bookings.pet_notes` | Booking detail view |
| **P2** | `bookings.cancellation_reason` | Cancelled booking detail |
| **P3** | `packages` + `package_services` | Future packages feature |
| **P3** | `customers.avatar_url` | Customer profile photo |
