# Pawtal Platform — Tech Cost Analysis
## MVP#1: Provider Acquisition (Vercel Deployment)

> **Author:** Tech Lead
> **Date:** 2026-03-19
> **Scope:** MVP#1 — Provider landing page, lead capture form, email confirmation, admin CRM via Supabase
> **Deployment Target:** Vercel (Frontend) + Railway (Backend API) + Supabase (DB/Auth/Storage)

---

## Executive Summary

MVP#1 is a lean B2B lead-capture product. Traffic will be low and driven by direct outreach — not consumer advertising. This favours **free-tier-first** infrastructure with a clear upgrade path once provider submissions scale.

| Scenario | Monthly Cost (USD) | Monthly Cost (THB ~36 THB/USD) |
|----------|-------------------|-------------------------------|
| **Free Tier Launch** | $0 – $5 | ฿0 – ฿180 |
| **Production (Recommended)** | $55 – $75 | ฿1,980 – ฿2,700 |
| **Production + Sentry Monitoring** | $81 – $101 | ฿2,916 – ฿3,636 |
| **Annual Estimate (Production)** | $660 – $900 /yr | ฿23,760 – ฿32,400 /yr |

> Domain cost (~$20/yr) is additive and listed separately below.

---

## 1. Service-by-Service Breakdown

### 1.1 Frontend Hosting — Vercel

| Tier | Cost | Limits | Recommendation |
|------|------|--------|----------------|
| Hobby (Free) | $0/mo | 100 GB bandwidth, 1 seat, no password protection, no team collaboration | OK for solo dev/staging only |
| **Pro** | **$20/mo per seat** | 1 TB bandwidth, team collaboration, preview deploys, password-protected staging, SLA | **Recommended for production** |

**MVP#1 Assessment:**
- Next.js SSG/SSR landing page — minimal bandwidth; well within free limits on traffic alone
- Vercel Pro is required as soon as you need **more than 1 developer**, password-protected staging environment, or a commercial SLA
- For a squad of 2–3 engineers: **$40–$60/mo** (2–3 seats)

**Recommended: Vercel Pro — 2 seats = $40/mo**

---

### 1.2 Backend Hosting — Railway

| Tier | Cost | Limits | Recommendation |
|------|------|--------|----------------|
| Free | $0/mo | $5 credit/mo, sleeps after inactivity, no custom domain | Dev/prototyping only |
| **Starter** | **~$5–15/mo** | Usage-based: $0.000463/vCPU-min, $0.000231/GB-min RAM; no sleep | **Recommended for MVP#1** |
| Pro | $20/mo base + usage | Multi-region, private networking, priority support | MVP#2+ |

**MVP#1 NestJS API Estimate:**
- 0.5 vCPU / 512 MB RAM is sufficient for lead submission API
- Assuming ~20 hours/day active: ~$8–12/mo at low traffic
- No sleep mode is critical — Railway Starter handles this

**Recommended: Railway Starter — estimated $10/mo**

---

### 1.3 Database + Auth + Storage — Supabase

| Tier | Cost | Limits | Recommendation |
|------|------|--------|----------------|
| Free | $0/mo | 500 MB DB, 1 GB file storage, 50 MB uploads, 2 active projects, 50K MAU auth | OK for MVP#1 early launch |
| **Pro** | **$25/mo per project** | 8 GB DB, 100 GB storage, daily backups (7 days), no pausing, email support | **Recommended for production** |
| Team | $599/mo | SSO, advanced audit logs, priority support | Scale phase |

**MVP#1 Assessment:**
- Leads table will be tiny (< 1,000 rows at MVP#1 scale) — well within free tier DB limits
- **Key risk with Free tier:** Supabase pauses free projects after 1 week of inactivity — **unacceptable for production**
- Pro also provides **Point-in-Time Recovery** and daily backups, important for protecting lead data

**Recommended: Supabase Pro — $25/mo**

---

### 1.4 Transactional Email — Resend

| Tier | Cost | Limits | Recommendation |
|------|------|--------|----------------|
| **Free** | **$0/mo** | 3,000 emails/mo, 100 emails/day, 1 domain | **Sufficient for MVP#1** |
| Pro | $20/mo | 50,000 emails/mo, multi-domain, webhooks, logs | MVP#2+ (customer emails) |
| Scale | $90/mo | 200,000 emails/mo | Scale phase |

**MVP#1 Assessment:**
- Email use case: provider interest confirmation + internal team notification
- Assuming 50–200 provider submissions/month: free tier covers this with headroom
- The 100 emails/day cap is not a concern for B2B outreach volumes

**Recommended: Resend Free — $0/mo**

---

### 1.5 Error Tracking — Sentry

| Tier | Cost | Limits | Recommendation |
|------|------|--------|----------------|
| **Free** | **$0/mo** | 5,000 errors/mo, 10,000 performance units, 1 member | OK for solo dev |
| Team | $26/mo | 50K errors/mo, all members, releases, uptime alerts | Recommended for team |
| Business | $80/mo | Unlimited members, SAML, custom retention | Scale |

**MVP#1 Assessment:**
- Sentry is optional but strongly recommended from day 1 to catch production errors silently missed
- Team tier needed for multi-developer access; Free is acceptable for early-stage solo dev

**Recommended: Sentry Free initially → upgrade to Team ($26/mo) at team onboarding**

---

### 1.6 Analytics — Google Analytics 4

| Tier | Cost |
|------|------|
| **GA4 Standard** | **$0** |
| GA4 360 | $50K+/yr (enterprise) |

**MVP#1 Assessment:** GA4 Standard is free and sufficient for tracking landing page performance, conversion funnel (form views → submissions), and UTM campaign attribution for B2B outreach.

**Recommended: GA4 Free — $0/mo**

---

### 1.7 Domain — pawtal.co.th

| Item | Cost | Provider Options |
|------|------|-----------------|
| `.co.th` domain registration | ~$18–25/yr (~฿650–900) | Namecheap, GoDaddy, or Thai registrar (nic.th) |
| DNS management | Free | Vercel DNS, Cloudflare (recommended) |
| SSL/TLS | Free | Auto-provisioned by Vercel |

**Recommended: Register via Cloudflare or Namecheap + use Cloudflare DNS free tier**

---

### 1.8 CI/CD — GitHub Actions

| Tier | Cost | Limits |
|------|------|--------|
| **Free** | **$0/mo** | 2,000 Actions minutes/mo (public repos: unlimited) | Sufficient |
| Team | $4/user/mo | Unlimited minutes (private repos), code owners, protected branches | Optional |

**MVP#1 Assessment:** GitHub Free is sufficient for a small private repo with basic CI pipelines. GitHub Team adds protected branch rules and required reviewers — useful but optional at MVP#1.

**Recommended: GitHub Free — $0/mo** (upgrade to Team $4/user/mo as team grows)

---

## 2. Cost Summary Tables

### 2.1 Monthly Cost — Production (Recommended)

| Service | Plan | Monthly Cost (USD) |
|---------|------|-------------------|
| Vercel | Pro — 2 seats | $40.00 |
| Railway | Starter (estimated) | $10.00 |
| Supabase | Pro | $25.00 |
| Resend | Free | $0.00 |
| Sentry | Free (→ Team later) | $0.00 |
| GA4 | Free | $0.00 |
| GitHub | Free | $0.00 |
| **Total/month** | | **$75.00** |
| **Total/month (THB)** | | **฿2,700** |

> Domain: ~$20/yr (~฿720) billed annually — not included in monthly.

---

### 2.2 Monthly Cost — Minimum / Free Tier Launch

> Use this only for pre-launch development, not for production with real user data.

| Service | Plan | Monthly Cost (USD) |
|---------|------|-------------------|
| Vercel | Hobby (Free) | $0.00 |
| Railway | Free ($5 credit) | $0.00 |
| Supabase | Free | $0.00 |
| Resend | Free | $0.00 |
| Sentry | Free | $0.00 |
| GA4 | Free | $0.00 |
| GitHub | Free | $0.00 |
| **Total/month** | | **$0.00** |

**Limitations of Free Tier in Production:**
- Supabase pauses the project after 7 days of inactivity — leads lost
- Railway free tier sleeps — API unresponsive on first request after idle period
- Vercel Hobby has no team collaboration and no password-protected staging

---

### 2.3 Annual Cost Projection

| Scenario | Annual USD | Annual THB |
|----------|-----------|-----------|
| Free Tier (dev only) | $0 | ฿0 |
| Production Recommended | $920 | ฿33,120 |
| Production + Sentry Team | $1,232 | ฿44,352 |
| Production + Sentry + GitHub Team (3 devs) | $1,376 | ฿49,536 |

> Domain (~$20/yr) included in production estimates above.

---

## 3. MVP#1 → MVP#2 Cost Delta

When advancing to MVP#2 (customer registration, browse providers), expect the following cost increases:

| Service | Change | Estimated Uplift |
|---------|--------|-----------------|
| Vercel | +1 seat (3 devs) | +$20/mo |
| Railway | Higher traffic, more RAM | +$10–20/mo |
| Supabase | More tables, file uploads (provider photos) | Pro already covers this |
| Resend | Customer emails (OTP, booking) — upgrade to Pro | +$20/mo |
| Sentry | Team tier (error tracking for customer flows) | +$26/mo |
| Google Maps Platform | Provider location rendering | ~$0 (free $200 credit/mo) or +$10/mo if exceeded |
| **MVP#2 Delta** | | **+$76–96/mo** |
| **MVP#2 Total** | | **~$151–171/mo** |

---

## 4. Cost Optimisation Recommendations

1. **Start with Supabase Pro immediately** — the pause behaviour on free tier is a showstopper for any real user data
2. **Use Vercel Pro with 2 seats minimum** — staging environment password protection is essential for B2B demos
3. **Defer Sentry Team** until you have 2+ developers actively monitoring production; Free tier is fine for solo
4. **Use Cloudflare free DNS** in front of Vercel — adds DDoS protection and caching at no cost
5. **Resend Free tier handles MVP#1 completely** — only upgrade when customer OTP flows begin in MVP#2
6. **Railway Starter is right-sized** — do not over-provision CPU/RAM at MVP#1; scale up per Railway's usage metrics
7. **Avoid paid Google Maps credits at MVP#1** — Maps is not needed until MVP#2 (provider browse/map view)

---

## 5. Risk Flags

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Supabase Free pauses inactive projects | High | Upgrade to Pro before go-live |
| Railway cold-start on free tier | High | Use Starter paid tier for production API |
| Vercel bandwidth spike from viral B2B share | Low | Pro tier covers 1TB/mo — very unlikely to hit |
| Resend daily cap (100/day) if outreach spikes | Medium | Monitor; Pro upgrade is $20/mo and instant |
| Vercel seat cost scales with engineering team | Low | Budget $20/seat/mo per new developer added |

---

## 6. Recommended Production Configuration for MVP#1 Go-Live

```
Frontend:    Vercel Pro       → $40/mo (2 seats)
Backend:     Railway Starter  → $10/mo (estimated)
Database:    Supabase Pro     → $25/mo
Email:       Resend Free      → $0/mo
Monitoring:  Sentry Free      → $0/mo
Analytics:   GA4 Free         → $0/mo
CI/CD:       GitHub Free      → $0/mo
DNS:         Cloudflare Free  → $0/mo
Domain:      pawtal.co.th     → $20/yr

TOTAL:  ~$75/mo + $20/yr domain
        = ~฿2,700/mo + ฿720/yr
```

---

*Document maintained by: Tech Lead*
*Next review: Prior to MVP#2 sprint planning*
