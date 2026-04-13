# Pawtal — Product Positioning v1.0
## Off Peak Hour Served

> **Version:** 1.0
> **Date:** 2026-03-29
> **Status:** Approved — guiding MVP#2.5 and beyond
> **Owner:** Product Squad · Pawtal

---

## 1. The Problem We're Solving

### For Pet Service Providers

Every pet grooming salon, mobile groomer, and vet clinic in Bangkok faces the same silent problem: **empty chairs during off-peak hours**.

- Monday to Wednesday mornings: the waiting area is quiet
- Lunchtime weekdays: staff stand around between appointments
- The last slot of the day: often unfilled, wasted

This idle capacity represents real lost revenue. A groomer with 2 open slots per day at ฿500/slot is leaving **฿30,000+ per month** on the table — not from a lack of demand, but from a lack of a mechanism to reach price-flexible customers at the right moment.

Current tools don't solve this:
- **LINE OA**: passive, only reaches existing followers
- **Facebook/Instagram**: manual, time-consuming, no booking flow
- **Generic booking platforms**: no off-peak deal mechanics, no urgency for the customer

### For Pet Owners

Bangkok has tens of thousands of pet owners who want quality grooming and care for their pets but are price-sensitive during non-urgent moments. They're not booking because:

- Standard prices feel high for a spontaneous grooming session
- They don't know which providers near them have availability today
- There's no discovery platform for pet services with transparent, upfront pricing

These are not bargain hunters — they're **flexible-timing buyers** who will happily book a Tuesday morning slot at a fair price.

---

## 2. Our Solution — Off Peak Hour Served

Pawtal is a **time-slot marketplace for pet services** built around one core mechanic:

> **Providers list discounted slots during their slow hours.
> Customers discover and book those deals in real time.**

This is not a general booking platform with a discount feature bolted on. The **off-peak deal is the product**. Time-sensitivity and price together create the booking trigger.

### How It Works

**Provider side:**
1. Provider completes their Pawtal profile (services, photos, hours)
2. In the Calendar view, provider marks specific time windows as "Off-Peak"
3. Provider sets a discount (e.g. 20%, 30%, 40%) or a fixed deal price for each service during that window
4. The slot goes live on the customer-facing marketplace
5. When a customer books, the slot is removed from available deals
6. Provider receives confirmed, pre-paid booking with zero effort

**Customer side:**
1. Customer opens Pawtal, sees "Deals Near You Today" — off-peak slots available now or soon
2. Filters by area (e.g. สุขุมวิท), service type (grooming, spa, vet), pet type (dog/cat)
3. Sees provider card: shop name, deal price, original price, time window, distance, rating
4. Taps to view provider profile, reviews, service details
5. Selects the slot, confirms pet info, pays upfront via card/PromptPay
6. Receives booking confirmation; provider is notified instantly

---

## 3. Why This Model Works — Comparable Platforms

### Gowabi (Thailand — Beauty & Wellness)

| Dimension | Gowabi | Pawtal |
|-----------|--------|--------|
| Supply | Beauty salons, spas, clinics | Pet groomers, salons, vets |
| Demand trigger | Discounted treatments during slow hours | Discounted pet services during off-peak |
| Payment | Upfront via platform | Upfront via platform |
| Business model | Commission per booking | Commission per booking |
| Discovery mechanic | Deal browsing by area/category | Deal browsing by area/pet/service type |
| Geographic focus | Thailand (Bangkok-first) | Thailand (Bangkok-first) |

Gowabi validated that Thai consumers will book beauty services online if the deal is good enough. Pawtal applies this exact model to pet services — an equally habitual, recurring spend category.

### ClassPass (Global — Fitness)

| Dimension | ClassPass | Pawtal |
|-----------|-----------|--------|
| Core mechanic | Studios list unfilled class slots; users book with credits | Providers list off-peak service slots; customers book at deal price |
| Supply motivation | Fill empty class spots, reach new clients | Fill empty grooming slots, reach deal-seeking customers |
| Demand motivation | Variety + savings vs. single-studio membership | Savings + discovery of new providers |
| Recurring behaviour | Weekly fitness habit → repeat bookings | Monthly grooming habit → repeat bookings |

ClassPass showed that service businesses with fixed time-slot capacity will trade some margin to avoid total revenue loss on unused capacity. The incremental revenue from an off-peak booking (at 70% of full price) is always better than ฿0 from an empty slot.

### What Makes Pawtal Different

- **Vertical focus:** Pet services only — not trying to be Gowabi for everything. Depth in one vertical builds trust and network effects faster.
- **Provider-first onboarding:** We acquire providers first (MVP#1/1.5/2), build their tools (MVP#2), then flip on the customer-facing marketplace (MVP#2.5). Providers are ready on Day 1 of customer launch.
- **Bangkok density advantage:** Sukhumvit has the highest concentration of premium pet service providers and pet-owning households in Thailand. Starting here maximises deal density = better customer experience = faster growth.

---

## 4. Business Model

### Revenue: Commission on Off-Peak Bookings

Pawtal earns a commission on each completed booking made through the off-peak deal system.

| Tier | Commission Rate | Conditions |
|------|----------------|------------|
| Standard | 15% | All off-peak bookings in Year 1 |
| Premium Provider | 12% | Providers with 4.8★+ and 50+ reviews |
| Future: Subscription | TBD | Monthly provider subscription as alternative to per-booking fee |

The commission is deducted from the transaction at point of payment. Providers receive the net amount (deal price minus commission) via weekly payout.

### Unit Economics (Illustrative)

| Metric | Assumption |
|--------|------------|
| Average deal price | ฿500 |
| Platform commission | 15% = ฿75 per booking |
| Provider net | ฿425 |
| Target: bookings per provider/month | 20 off-peak bookings |
| Revenue per provider/month | ฿1,500 |
| 50 active providers | ฿75,000/month GMV → ฿11,250 revenue |
| 200 active providers (Scale) | ฿300,000/month GMV → ฿45,000 revenue |

These are conservative — providers with strong off-peak adoption can generate 40–60 incremental bookings/month.

---

## 5. Value Proposition by Persona

### For Pet Service Providers

> **"Turn your empty chairs into revenue — without extra marketing."**

- Zero effort to fill off-peak slots: set your discount once, Pawtal finds the customer
- Reach deal-seeking customers you'd never reach through LINE or Facebook
- Guaranteed upfront payment: no no-shows, no cash handling
- Build a rating and review history that attracts full-price regulars over time
- Free to join during early access; commission only on off-peak bookings

### For Pet Owners

> **"Book your pet's next grooming now, and pay less for it."**

- Discover deals on quality pet services near you, available today
- Save 20–40% by booking during off-peak windows
- Verified providers with real reviews — not random LINE groups
- Upfront booking with instant confirmation — no back-and-forth
- Easy re-booking for your regular provider

---

## 6. Roadmap Implications

### MVP#2 (Complete — Shipped 2026-03-29)
Provider-side foundation: profile, calendar, services, packages. All the building blocks a provider needs before off-peak mechanics are introduced.

### MVP#2.5 — Off-Peak Core (Next)
The first version of the off-peak mechanic, introducing both sides of the marketplace:

**Provider side:**
- Mark calendar slots as "Off-Peak" with a discount %
- Off-peak slots visible in their own calendar view segment
- Dashboard analytics: off-peak bookings vs. standard bookings

**Customer side:**
- Customer registration and login (email / Google)
- "Deals Near You" discovery feed — off-peak slots, sorted by proximity
- Provider profile page (public-facing)
- Booking flow: select slot → confirm pet → pay upfront
- Booking history

**Platform:**
- Payment processing integration (PromptPay / card via Omise or 2C2P)
- Commission deduction at point of payment
- Provider payout mechanism (weekly, via bank transfer)

### MVP#3 — Growth & Retention
Reviews + ratings, loyalty credits, re-booking nudges, provider analytics dashboard, multi-area expansion (Thonglor, Ari, On Nut).

---

## 7. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Providers don't adopt off-peak pricing (fear of devaluing their brand) | High | Educate during onboarding: frame as "incremental revenue, not discounting your brand"; show revenue simulation |
| Customer discovery is thin at launch (few deals available) | High | Launch with minimum 20 confirmed providers before opening customer sign-up; incentivise early providers with reduced commission |
| Customers book off-peak then demand peak prices | Low | Clear UI: deal price is for the selected time slot only; full price shown separately |
| Payment processing complexity in Thailand | Medium | Use Omise (Thai-native, widely trusted) for MVP; PromptPay QR as fallback |
| Providers prefer cash; resist upfront payment | Medium | Show provider that upfront payment eliminates no-shows and guarantees revenue |

---

## 8. Success Metrics — MVP#2.5

| Metric | Target (30 days post-launch) |
|--------|------------------------------|
| Active providers listing off-peak slots | ≥ 20 |
| Off-peak deals available at any given time | ≥ 50 |
| Customer registrations | ≥ 200 |
| Completed off-peak bookings | ≥ 100 |
| Booking conversion rate (deal view → booked) | ≥ 15% |
| Provider satisfaction (off-peak tool NPS) | ≥ 40 |
| Average deal discount depth | 20–35% |
