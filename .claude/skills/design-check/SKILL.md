---
name: design-check
description: >
  Full pre-flight design audit for UI/UX work in the Peppermint monorepo. Reads the
  admin design doctrine (.claude/DESIGN.md), identifies the page pattern in scope,
  runs the 10-question pre-flight self-check against the actual component files,
  audits all output contract states, and checks the 7 non-negotiables. Produces a
  structured pass/fail report with file:line citations and actionable fixes.
  Run proactively before marking any substantial UI task done, or invoke explicitly
  with /design-check. Use /verify for the lighter mechanical scan.
model: opus
---

# Design Check — Pre-Flight Audit

You are running a design audit against the Peppermint design doctrine. This is the deep analysis pass — not a linter, but a reasoned review of whether the UI work in scope is sound.

---

## 0. Setup — what is in scope?

If arguments were passed (`$ARGUMENTS`), treat them as file paths or module names to audit.

If no arguments were passed, determine scope from git:

```bash
git diff --name-only HEAD 2>/dev/null | grep -E "(layouts|modules|components)/.*\.tsx$"
```

If git diff returns nothing (clean working tree), ask the user which module or files to audit.

Read `.claude/DESIGN.md` in full before proceeding. Every finding must cite a principle from that document (e.g., "DESIGN.md §1.9" or "DESIGN.md Part 6").

**With screenshots (recommended for new pages and pre-release polish):** if the scoped modules have routes and a dev server is available, also run `/visual-review` on those routes first — this audit then covers both the code and the rendered result, and findings can cite screenshot evidence in addition to file:line.

---

## 1. Identify the page pattern

For each file in scope, determine which page pattern it most closely maps to:

| Pattern             | Signals                                                               |
| ------------------- | --------------------------------------------------------------------- |
| **List**            | Table, DataTable, grid of records, search + filters, bulk actions     |
| **Detail**          | Single entity view, header + summary + timeline, status + actions     |
| **Dashboard**       | Health indicators, exception cards, trend charts, work queues         |
| **Settings**        | Form groups, current value display, save/cancel, change history       |
| **Review/Approval** | Evidence display, risk indicator, approve/reject actions, audit trail |
| **Component**       | Reusable UI piece used by other modules — no standalone page pattern  |

Note the pattern for each file — it determines which output contract states are required vs. N/A.

---

## 2. Run the Part 8 pre-flight self-check (10 questions)

For each file in scope, answer all 10 questions. For each:

- State PASS or FAIL
- If FAIL: cite the file, the approximate line range, the principle violated, and an actionable fix

**Q1 — What single question does this page/component answer?**
Can you state it in one sentence? If not, the hierarchy has no basis. (DESIGN.md Part 2, §1.1)

Look for: a clear primary purpose in the component name, top-level comments, or obvious dominant element.

**Q2 — What is the page-level anchor, and do regional anchors stay subordinate without competing?**
Is there one element that the eye would land on first? Are secondary regions visually quieter? (DESIGN.md §1.1)

Look for: multiple elements competing at the same visual weight (same size, same color, same prominence). Flag if more than one element claims "most important."

**Q3 — Is the next step in Find→Understand→Decide→Act→Confirm→Recover the easiest thing to do?**
Where is the user in this flow? Is the next action obvious and low-friction? (DESIGN.md Part 2)

Look for: primary action buried below fold, dangerous action equally prominent as safe action, no obvious "what now" signal.

**Q4 — What must the operator hold in their head?**
Every item of context they must remember is a working memory leak. (DESIGN.md §1.3)

Look for: navigation away from the current entity to find context that could be inline, confirmation dialogs that don't restate what's being confirmed, multi-step flows that don't carry state forward.

**Q5 — Is every state visually distinct from every action that changes it?**
Badges are facts. Buttons are levers. They must look different and sit in different positions. (DESIGN.md §1.9)

Look for: `onClick` on badge/tag elements, action buttons styled as status pills, or status labels styled as interactive controls. Check color, shape, and position.

**Q6 — For each action: how often, how risky, how reversible — and does its treatment match?**
Frequent+safe: large, close, low-friction. Rare+destructive: small, separated, behind a step. (DESIGN.md §1.5/1.10)

Read the action list. For each:

- Is delete/suspend/revoke/ban visually separated from approve/save/create?
- Is a destructive action ever the most prominent element on the page?
- Are safe frequent actions easy to reach?

**Q7 — For dangerous actions: does the confirmation inform against the mistake and leave a way back?**
"Are you sure?" is not a confirmation. The confirmation must state who is affected, what happens, whether it's reversible, and what the audit record will show. (DESIGN.md §1.10)

Look for: modal/dialog content that is only a yes/no prompt without consequence detail. Flag any confirmation that doesn't name the specific entity being acted on.

**Q8 — Are all unhappy states designed, not just the populated/success state?**
Check against the output contract for this pattern type. (DESIGN.md Part 6)

This question is answered fully in Section 3 below.

**Q9 — Does it stay under the perceptual clock?**
Local UI feedback under ~100ms. Mutations must show pending state. Navigation must not lose context. (DESIGN.md §1.7/1.3)

Look for: mutation buttons that don't disable while submitting, no loading indicator on async actions, no optimistic update strategy, filters/pagination not preserved on navigation back.

**Q10 — Does it stay calm and humane under load?**
Stable layout, predictable behavior, restrained motion, sober language, dark mode and reduced-motion respected. (DESIGN.md Layer 6)

Look for: animation that runs for > 300ms without a `useReducedMotion()` check, error messages that blame the user, empty state messages that are unhelpful, frivolous motion in serious workflows.

---

## 3. Audit the output contract states

**If the feature's `tuned_requirement.md` records `### UI States` / `### Error → UI Behavior`**
(produced by `mint-requirements-tuner`), audit the component against those recorded cells
(required-vs-present) — they are the feature's agreed state contract — rather than re-deriving the
list. Fall back to the table below when the artifact is absent or omits them. This reads an existing
artifact; it is not a new rule.

For each file, check which of the 11 required states are present. Map to the detected pattern to determine required vs. N/A.

| State                         | Required for            | How to detect                                                   |
| ----------------------------- | ----------------------- | --------------------------------------------------------------- |
| Empty (no data yet)           | List, Detail, Dashboard | `data?.length === 0` or `!data` conditional with empty-state UI |
| No-results (filtered)         | List                    | `data.length === 0` after search/filter, distinct from empty    |
| Loading                       | All                     | `isLoading` or `isPending` conditional with skeleton/spinner    |
| Partial loading               | Dashboard, Detail       | Skeleton for partial sections while others load                 |
| Request-failed                | All                     | `isError` conditional with error UI and retry option            |
| Permission-denied             | Any with auth           | `403` handling or role-check resulting in denied-state UI       |
| Read-only                     | Form, Detail            | `disabled` props on all inputs, or explicit read-only layout    |
| Archived/deleted record       | Detail                  | State for when the record no longer exists or is archived       |
| Conflicting edits             | Form (multi-user)       | Stale data warning when concurrent edits detected               |
| Unsaved changes               | Form, Settings          | Warning before navigation away with pending changes             |
| Long-running / background job | Dashboard, Action flows | Progress feedback for async operations that take > 1s           |

For each state:

- PRESENT: state is clearly handled in the component
- ABSENT: state is not handled (flag as FAIL with file:line of the related data fetch or form)
- N/A: state is architecturally impossible for this component type (state the reason)

---

## 4. Check the 7 non-negotiables

**N1 — Page-level leverage point + non-competing regional anchors**
See Q2 above. (DESIGN.md Part 6, §1.1)

**N2 — Actions labeled by risk tier; dangerous actions spatially separated**
See Q6 above. Check that delete/irreversible actions are not next to safe actions without visual separation. (DESIGN.md Part 6, Layer 5)

**N3 — Status as words + color + position — never color alone**
Look for any status, severity, or state indicator that uses only color to communicate meaning (no label, no icon, no position difference). Flag any `color="red"` or similar on a badge without a text label. (DESIGN.md Part 6, Layer 4)

**N4 — Keyboard support and preserved navigation state**
For components used repeatedly: are interactive elements keyboard-reachable? Does navigating away and back preserve filters/selection/scroll? (DESIGN.md Part 6, Layer 3)

**N5 — Data freshness shown wherever data can be stale**
For dashboards, analytics, or any component showing cached/polled data: is there a "last updated" indicator or refresh mechanism? (DESIGN.md Part 6, Truth)

**N6 — Recovery path for every consequential action**
For every action that changes or deletes data: is there undo, audit trail, retry, or restore? (DESIGN.md Part 6, Layer 5)

**N7 — Consistent components — no per-page reinvention**
Are shared patterns (table, drawer, confirmation, badge) reused from `@peppermint/ui` or existing module components? Flag any bespoke table, dialog, or badge that duplicates existing shared components. (DESIGN.md Part 6, §1.8)

---

## 5. Report

Structure the report as follows:

```
## Design Audit Report
Files audited: <list>
Pattern identified: <list/detail/dashboard/settings/review/component>

### Pre-flight self-check (10 questions)
Q1  [PASS/FAIL] <brief finding>
Q2  [PASS/FAIL] <brief finding, file:line if FAIL>
...
Q10 [PASS/FAIL] <brief finding>

### Output contract
State                  Status    Note
─────────────────────────────────────────────
Empty                  [PASS]
No-results             [N/A]     Not a filterable list
Loading                [FAIL]    src/modules/users/UserList.tsx:45 — useQuery present, no isLoading branch
Request-failed         [FAIL]    src/modules/users/UserList.tsx:45 — no isError branch
...

### Non-negotiables
N1  [PASS/FAIL] <brief finding>
N2  [PASS/FAIL] <brief finding>
...
N7  [PASS/FAIL] <brief finding>

### Actionable fixes
1. [file:line] <specific fix description, citing DESIGN.md principle>
2. ...

### Verdict
PASS — all checks passed. Ready to ship.
  — or —
FAIL — N issues require attention before this can be marked done.
  BLOCK items: <list>
  Remaining items: <list>
```

Do not inflate the report with passing checks that need no action. Keep findings concise and specific.

---

## 6. After the report

If the verdict is PASS: tell the user the work is design-sound and ready for `/pre-pr`.

If the verdict is FAIL:

- List only the actionable items
- Offer to fix BLOCK items immediately if the user confirms
- Do not mark the task complete until BLOCK items are resolved or dismissed with documented reasoning (log to `.todo/design-dismissals.md`)

Always end with a reminder that this audit covers design intent — `/verify` covers static correctness (types, lint, build).
