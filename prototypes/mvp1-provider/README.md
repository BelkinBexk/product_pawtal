# 🐾 Pawtal MVP#1 — Provider Journey Prototype

> **Type:** Interactive HTML Prototype
> **Version:** v1.0 | **Date:** March 2026
> **Role:** UX/UI Designer
> **Phase:** MVP#1 — Provider Acquisition

---

## How to Open

**Just double-click `prototype.html`** — it opens directly in any browser. No install, no build step required.

> Recommended browsers: Chrome 120+, Safari 17+, Firefox 121+

---

## What's Inside

A fully interactive, mobile-first prototype simulating the **Pet Service Provider user journey** from first touchpoint to form submission confirmation.

### 5 Screens

| # | Screen | Journey Phase | Description |
|---|--------|--------------|-------------|
| S1 | Landing Page | Awareness → Discovery | Provider-facing landing with hero, value props, How It Works, testimonial, FAQ, CTA |
| S2 | Form Step 1/3 | Form Fill | Personal & business info: name, business name, phone, email |
| S3 | Form Step 2/3 | Form Fill | Service type selection (multi-select cards) + location area |
| S4 | Form Step 3/3 | Review + PDPA | Data review summary + PDPA consent checkbox + submit |
| S5 | Success State | Confirmation | Animated success + what's next timeline + email confirmation notice |

---

## Prototype Layout

```
┌──────────────┬──────────────────────────────────┬──────────────┐
│  Left Panel  │         Phone Frame              │ Right Panel  │
│              │  (390px × 844px iPhone 14 sim)   │              │
│  Screen Nav  │                                  │  UX Designer │
│  - S1        │  ┌─────────────────────────┐     │  Annotations │
│  - S2        │  │  Dynamic Island         │     │              │
│  - S3 ← curr │  │                         │     │  Per-screen  │
│  - S4        │  │  [Active Screen]        │     │  design      │
│  - S5        │  │                         │     │  decisions   │
│              │  └─────────────────────────┘     │              │
│  Journey     │                                  │  Legend      │
│  Phase Key   │  ● ● ● ● ●  (nav dots)          │              │
└──────────────┴──────────────────────────────────┴──────────────┘
```

---

## Design Decisions

### Mobile-First (375px)
All screens designed at 375px viewport width (iPhone SE / standard Android). Scaled up for tablet/desktop.

### Pawtal Design Tokens Applied
- Brand Blue: `#1A3C5E` — headers, CTAs, primary actions
- Accent Teal: `#0D7377` — hover states, progress bars, checkmarks
- Success Green: `#16A34A` — confirmation screen
- Base font: Inter + Noto Sans Thai — bilingual from day one

### PDPA Compliance
- Consent checkbox is **unchecked by default** (legally required)
- Consent timestamp and IP recorded on submission (see backend schema)
- Privacy Policy linked inline within consent copy

### Conversion Optimisation
- Landing page: Outcome-first hero copy ("รับลูกค้าใหม่") before feature explanation
- Form: 3 steps with visible progress bar — reduces abandonment vs. single long form
- Social proof (testimonial + stats) positioned to reduce friction before the form CTA

---

## Handoff Notes for Engineering

| Screen | Route | Component |
|--------|-------|-----------|
| Landing | `/providers/join` | `app/providers/join/page.tsx` |
| Form Step 1 | `/providers/join/step-1` | `app/providers/join/step-1/page.tsx` |
| Form Step 2 | `/providers/join/step-2` | `app/providers/join/step-2/page.tsx` |
| Form Step 3 | `/providers/join/step-3` | `app/providers/join/step-3/page.tsx` |
| Success | `/providers/join/success` | `app/providers/join/success/page.tsx` |

Form state should be managed in a React context or Zustand store — not URL params — to avoid data loss on refresh.

---

## Next Steps

- [ ] Usability test with 3–5 Thai pet grooming business owners (screen S2–S4)
- [ ] Validate Thai copy with native speaker review
- [ ] Create desktop breakpoint variant (768px+ layout)
- [ ] Design error states (field validation, API failure, network error)
- [ ] Build Figma component library from this prototype
- [ ] Implement in `apps/web` — see `LOCAL-DEV.md` for setup
