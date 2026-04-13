# Pawtal Prototype — Tech Stack

> Last updated: 2026-04-10 | Scope: `pawtal_prototype` (frontend prototype)

---

## Frontend Framework

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | **Next.js** | `16.2.2` | App Router, file-based routing, `"use client"` components |
| UI Library | **React** | `19.2.4` | |
| Language | **TypeScript** | `^5` | Strict mode, `ES2017` target, `@/*` path alias |

## Styling

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Primary | **Plain CSS** | — | `app/globals.css` — custom class prefixes: `vd-*`, `ovw-*`, `svc-*`, `prof-*`, `bk-*` |
| Installed | **Tailwind CSS** | `^4` | Installed but not actively used — custom CSS is the primary styling system |

## Backend / Database

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Database | **Supabase (PostgreSQL)** | `^2.101.1` | Direct client calls from frontend |
| Auth | **Supabase SSR** | `^0.10.0` | `createBrowserClient`, cookie-based session |

## Payments

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Gateway | **Omise** | `^1.1.0` | Thai payment gateway — installed, UI flow built, live integration pending |

## Dev Tooling

| Tool | Version | Notes |
|------|---------|-------|
| ESLint | `^9` + `eslint-config-next 16.2.2` | |
| TypeScript compiler | `^5` | `noEmit: true`, strict mode |

---

## Current Route Coverage

### Customer

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/deals` | Browse off-peak deals |
| `/explore` | Explore providers |
| `/for-business` | B2B landing / interest form |
| `/login` `/signup` | Customer auth |
| `/forgot-password` `/reset-password` | Password recovery |
| `/bookings` `/bookings/[id]` | Booking history & detail |
| `/book` | Booking flow |
| `/payment` `/payment/success` `/payment/failed` `/payment/timeout` | Payment flow |
| `/profile` | Customer profile |
| `/pets` `/pets/new` `/pets/[id]/edit` | Pet management |

### Vendor

| Route | Description |
|-------|-------------|
| `/vendor/login` `/vendor/signup` | Vendor auth |
| `/vendor/dashboard` | Overview — stats, heatmap, revenue chart |
| `/vendor/bookings` | Booking list & management |
| `/vendor/services` | Service catalogue CRUD |
| `/vendor/profile` | Shop profile & settings |

---

## Known Gaps vs. Roadmap

| Gap | Impact |
|-----|--------|
| No backend API layer (NestJS per roadmap) | All DB calls are direct Supabase client — not production-ready |
| Omise not wired end-to-end | Payment UI exists but no live webhook / confirmation logic |
| Tailwind installed but unused | Styling is inconsistent if Tailwind is adopted later — needs a decision |
| Vendor pages missing: `/vendor/calendar`, `/vendor/revenue`, `/vendor/reviews` | Dashboard nav links to unbuilt pages |
| Google Maps API not installed | Required for area-based deal discovery (MVP#2.5) |

---

## CSS Prefix Convention

Each feature area owns a dedicated CSS prefix to prevent collisions:

| Prefix | Area |
|--------|------|
| `vd-` | Vendor dashboard shell (sidebar, shared topbar, layout) |
| `ovw-` | Vendor overview / dashboard page |
| `svc-` | Vendor services CRUD page |
| `prof-` | Vendor profile & settings page |
| `bk-` | Vendor bookings page |
| `ps-` | _(legacy — replaced by `prof-*`)_ |
