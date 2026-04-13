---
name: user-story-writer
description: >
  Use this skill to write, draft, refine, or structure user stories for Pawtal features.
  Trigger on: "write a user story", "create a ticket", "draft a feature spec",
  "acceptance criteria", "Given/When/Then", "user story template", "break into sub-stories",
  "epic breakdown", "QA test cases". Always use for any user story or AC writing task.
---

# User Story Writer Skill — Pawtal

This skill turns a rough idea, epic, or feature request into a fully structured user story
(or set of sub-stories) following the Pawtal squad template.

## Story ID Convention
- Provider features: `US-PWL-P-[##]` (e.g. US-PWL-P-01)
- Customer features: `US-PWL-C-[##]` (e.g. US-PWL-C-01)
- Admin/internal: `US-PWL-A-[##]`

---

## Output: Single User Story (.docx)

Produce all 7 sections below using the docx skill.

### 1. Background
2–4 sentences covering context, problem, and Pawtal-specific nuance (pet services, B2B/B2C).

### 2. Business Value
Three-line callout block (light blue background, bold left border):

  As a **[role]**,
  I want to **[capability]**,
  So that **[outcome]**.

Roles for Pawtal:
- Pet Service Provider, Groomer, Pet Salon Owner (MVP#1)
- Pet Owner, Customer (MVP#2+)
- Pawtal Admin, Business Dev Team (internal)

### 3. Flow Diagram
📎 Flow diagram to be attached by the author.

### 4. Acceptance Criteria
Table: Test Scenario | Given | When | Then
- 3–5 scenarios. Happy path first, then edge cases.
- Edge cases relevant to Pawtal: unauthenticated access, area not covered, wallet insufficient balance, provider not available.

### 5. UX/UI Design
📎 UX/UI design mockups to be attached by the author.

### 6. Software Engineer Sub-Tasks
Table: Component / Screen | Description | Dependencies
Split by distinct UI components, API endpoints, or screens.

### 7. QA Test Cases
Table: TC ID | Test Case Name | Pre-condition | Test Steps | Expected Result | Dependencies
- TC IDs: TC-PWL-[###]
- 6–10 test cases per story.

---

## Output: Epic Breakdown (Multiple Sub-Stories)

1. One epic overview `.docx` containing summary, story table, dependency table.
2. One `.docx` per sub-story using the 7-section template.

Split at UI component or screen level — one story per independently testable user action.

---

## Behaviour Notes
- Ask 1–2 clarifying questions if role or core action is ambiguous.
- Never invent specific business rules — use [PLACEHOLDER] tags.
- Always output `.docx` files using the docx skill.
