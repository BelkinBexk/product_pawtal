---
name: sprint-planner
description: >
  Use this skill to plan a sprint for the Pawtal squad. Triggers include:
  "plan a sprint", "sprint backlog", "sprint goal", "story points", "sprint capacity",
  "what should we build this sprint", "prioritise backlog". Always use when producing
  a sprint plan or backlog prioritisation document.
---

# Sprint Planner Skill — Pawtal

This skill produces a sprint plan document for the Pawtal squad.

## Assumptions (overridable by user)
- Sprint duration: 2 weeks
- Team capacity: FE (1), BE (1), QA (1), PM (0.5)
- Story point scale: Fibonacci (1, 2, 3, 5, 8, 13)
- Average velocity: ~30 SP per sprint (adjust from actuals)

---

## Output Format

Produce a `.docx` file using the docx skill with these sections:

### Sprint Header
- Sprint number, dates, squad members, goal statement

### Sprint Goal
One clear, outcome-oriented sentence:
*"By end of Sprint [X], [persona] will be able to [action], enabling [business outcome]."*

### Sprint Backlog Table
Columns: Story ID | Title | SP Estimate | Assignee | Priority | Status | Notes

### Capacity Planning
Table: Team Member | Role | Available Days | Capacity (SP)

### Definition of Done (DoD)
Checklist Claude will pre-fill with Pawtal standards:
- [ ] Code reviewed and merged
- [ ] Unit tests written (>80% coverage for new code)
- [ ] QA signed off
- [ ] Product Owner accepted in staging
- [ ] No P1/P2 bugs open
- [ ] Feature flag enabled in staging

### Risks & Dependencies
Table: Risk | Impact | Likelihood | Mitigation

### Carry-Over from Previous Sprint
List any unfinished items with reason and revised estimate.

---

## Behaviour Notes
- If no story list is provided, ask for the current backlog or Jira epic link.
- Always include a sprint goal sentence — don't skip it.
- Flag if total SP exceeds team capacity.
- Output `.docx` using the docx skill.
