---
name: market-analysis
description: >
  Use this skill to conduct market analysis research for Pawtal. Triggers include:
  "market analysis", "market research", "competitive landscape", "competitor analysis",
  "TAM SAM SOM", "market size", "user persona", "target audience", "industry overview",
  "market opportunity". Always use this skill when producing a market analysis document.
---

# Market Analysis Skill — Pawtal

This skill produces a structured Market Analysis document for the Pawtal pet service platform.

## Output Format

Produce a professional `.docx` file using the docx skill. Structure the document with these sections:

---

### 1. Executive Summary
- 3–5 sentence overview of the market opportunity
- Key finding highlights (bullet summary)

### 2. Industry Overview
- Thailand pet industry size and growth trends
- Digital adoption in pet services
- Post-COVID pet ownership trends in urban Thailand

### 3. Market Sizing (TAM / SAM / SOM)
| Level | Definition | Estimate | Basis |
|-------|-----------|---------|-------|
| TAM | Total pet services market (Thailand) | THB X bn | Source |
| SAM | Urban Bangkok pet grooming & services | THB X bn | Source |
| SOM | Sukhumvit-area reachable in Y1 | THB X m | Assumption |

### 4. Target Customer Segments
For each segment, cover: Who they are, key behaviours, pain points, willingness to pay.
- Segment A: Pet Service Providers (B2B — MVP#1 focus)
- Segment B: Urban Pet Owners (B2C — MVP#2 focus)

### 5. Competitive Landscape
Table: Competitor | Type | Geography | Strengths | Weaknesses | Pricing Model

Include: direct competitors (pet service apps), indirect (LINE OA, Facebook Groups, standalone booking tools).

### 6. Customer Pain Points & Unmet Needs
Map pain points to opportunities. Use a 2-column table: Pain Point | Pawtal's Solution.

### 7. Market Trends & Tailwinds
- Humanisation of pets in Thailand
- Rise of premium pet services
- Mobile-first booking behaviour
- Post-pandemic urban pet adoption surge

### 8. Risks & Challenges
- Market education needed
- Provider onboarding friction
- Payment trust in digital wallets
- Competition from large regional players

### 9. Strategic Recommendation
- Why Sukhumvit is the right starting area
- Why provider-first (B2B) is the right MVP strategy
- 12-month market entry recommendation

---

## Behaviour Notes
- Use real data where available (web search). Flag estimates clearly as "~estimated" or cite source.
- Tailor all content to Thailand / Bangkok context. Avoid generic global stats unless to benchmark.
- Keep language executive-ready: clear, direct, data-backed.
- Always output a `.docx` file using the docx skill.
