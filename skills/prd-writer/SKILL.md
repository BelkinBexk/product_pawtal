---
name: prd-writer
description: >
  Use this skill to write a Product Requirements Document (PRD) for any Pawtal feature
  or phase. Triggers include: "write a PRD", "product requirements", "feature spec",
  "requirements doc", "define requirements", "what should we build", "MVP requirements".
  Always use this skill when producing a PRD or feature specification document.
---

# PRD Writer Skill — Pawtal

This skill produces a structured Product Requirements Document for Pawtal features or phases.

## Output Format

Produce a professional `.docx` file using the docx skill. Structure with these sections:

---

### Cover Block
- Document Title: PRD — [Feature/Phase Name]
- Version, Date, Author, Status (Draft / In Review / Approved)
- Reviewers table: Name | Role | Sign-off Date

### 1. Overview & Problem Statement
- What are we building and why?
- What problem does this solve for which user?
- What does success look like?

### 2. Goals & Non-Goals
| Type | Description |
|------|-------------|
| Goal | What this feature WILL achieve |
| Non-Goal | What this feature will NOT include (scope boundary) |

### 3. User Personas
For each persona: Name, Role, Goal, Pain Point, Success Scenario.
Always include at minimum:
- **Provider Persona** (for MVP#1 features)
- **Customer Persona** (for MVP#2+ features)

### 4. User Journey / Flow Summary
High-level narrative of the end-to-end user journey for this feature. Written as prose, 1–2 paragraphs per major flow.

### 5. Functional Requirements
Table: REQ-ID | Requirement Description | Priority (Must/Should/Could) | Notes

Priority scale:
- **Must Have**: Core to MVP success. Ship blocker if missing.
- **Should Have**: Important but can ship without for early release.
- **Could Have**: Nice-to-have. Defer to next iteration.

### 6. Non-Functional Requirements
- Performance: Page load targets
- Security: Auth, data protection requirements
- Scalability: Expected load, concurrent users
- Accessibility: WCAG compliance level
- Mobile: Mobile-first constraints

### 7. Dependencies & Integrations
Table: Dependency | Type (Internal/External) | Owner | Status | Risk

### 8. Out of Scope
Explicit list of things explicitly NOT included in this PRD phase.

### 9. Success Metrics / KPIs
Table: Metric | Definition | Baseline | Target | Measurement Method

### 10. Timeline & Milestones
Table: Milestone | Description | Target Date | Owner

### 11. Open Questions
Numbered list of unresolved decisions or assumptions to be validated.

### 12. Appendix
Links to related docs, Jira epic, Figma, research.

---

## Behaviour Notes
- Write requirements as action-oriented statements: "The system SHALL..." or "Users MUST be able to..."
- Avoid solution-prescribing in requirements unless technically constrained.
- Flag assumptions clearly with [ASSUMPTION] tag.
- Flag open questions that need stakeholder input.
- Always output a `.docx` file using the docx skill.
- Use Pawtal naming convention: REQ-PWL-[phase]-[###].
