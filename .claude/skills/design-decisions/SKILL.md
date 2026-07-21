---
name: design-decisions
description: >-
  Pre-build design-reasoning pass for a Peppermint module or sub-module. Decides
  what pages and functionality must exist over the framework, the order and layout
  of form fields, column order and the icons each column carries, and checks that
  the direction is feasible against the @peppermint/admin shells — then confirms the
  design vision with the user before any of it is committed. Run this WHENEVER you
  are about to build, restyle, or extend any Peppermint module, sub-module, page,
  form, table, dashboard, or admin screen — even when the ask is just "build the X
  module," "add a page for Y," or "make this look right," with no mention of design.
  Run it BEFORE mint-requirements-tuner: this skill produces the design decisions,
  the tuner turns them into a tagged requirements doc, the builder implements,
  design-check audits.
  This skill OWNS the reasoning and the usability call; it DEFERS admin doctrine to
  .claude/DESIGN.md and visual tokens to the app's design-system.md — it decides,
  it does not restate the rulebook.
model: opus
---

# Design decisions (Peppermint, pre-build)

This skill is a **decision process**, not a style, and not a rulebook. Its job is to make the
design choices for a module _earned_ — derived from the specific job and real content, and
**confirmed with the user** — before anyone opens a shell or writes a column array. The failure
mode it exists to prevent is a technically-correct module that is generic, over-decorated, or
subtly wrong for the person who has to use it eight hours a day.

Where it sits in the pipeline:

```
design-decisions  →  mint-requirements-tuner  →  build  →  design-check
(reason + confirm)   (tagged requirements doc)   (code)    (audit gate)
```

**Division of authority — do not blur these:**

- **`.claude/DESIGN.md`** owns the admin doctrine (hierarchy, anchors, the Find→Understand→Decide→
  Act→Confirm→Recover spine, the output contract, the decision ladder). Cite it; never re-derive it.
- **`apps/<app>/docs/design/design-system.md`** owns the visual identity — color, type, spacing,
  radius, shadow, icon sizes. It is the in-repo owner of "the look" (the role a generic frontend-design
  skill plays elsewhere). Reference tokens from it; never invent new visual values.
- **`mint-requirements-tuner` / `mint-module-builder`** own the _how to build it_ mechanics
  (the tuner structures the tagged requirements doc + reuse map; the builder implements).
- **This skill** owns _what should exist and why, in what order_ — and confirms that with the user.

Run the phases in order. Do not produce DECIDE output before Phase 1.5 answers are in.

```
FRAME  →  CONFIRM VISION  →  DECIDE  →  VERIFY
narrows   the mandatory      mostly    quick self-check,
the space question gate       derived   then hand to planner
```

## Pre-flight reading (before Phase 1)

Read only what the module needs — do not scan speculatively:

1. `.claude/CLAUDE.md` — architecture, module types, anti-patterns.
2. `apps/<app>/docs/AI.md` and, if the domain exists, that module's `docs/AI.md`.
3. `.claude/DESIGN.md` — Parts 2, 5, 6, 7 especially.
4. `apps/<app>/docs/design/design-system.md` — the token vocabulary you must decide within.
5. If the domain has backend docs: `apps/<app>/docs/api-contracts/<domain>.md` (the contract digest is
   the authority on the real entity, fields, statuses, and endpoints — the raw material of Phase 1).

---

## Phase 1 — Frame (before any pixel)

Skipping this is the single biggest cause of generic output. State each answer explicitly in your
reasoning. Where the source docs don't say, **make a specific assumption and name it** — you will
put the load-bearing ones to the user in Phase 1.5, never default silently.

1. **Job — the one question this page answers.** In one sentence, in the operator's words, not the
   schema's ("Who needs attention?" not "User management"). `DESIGN.md` Part 2: a page without a
   question is a data dump with no basis for hierarchy.
2. **Audience & context of use.** Who, on what device, how often, in what state of mind? A tool used
   all day by a trained operator wants density and keyboard control; a rarely-seen settings page wants
   clarity and one obvious next step. These pull opposite ways — pick.
3. **Content inventory — the real entity.** Name the primary entity and list its _actual_ fields,
   statuses, longest realistic label, and worst-case counts (pull from the contract digest when it
   exists). You cannot lay out what you have not inventoried. Note that the builder requires the entity
   to extend `Record<string, unknown>`, and that its status set drives tabs, badges, and columns.
4. **Tone.** Two or three adjectives for how it should feel (e.g. "calm, precise, trustworthy"). This
   constrains density, color use, and motion — always within `design-system.md` tokens.
5. **Primary hierarchy.** Rank what matters: the page-level anchor (#1), then each region's local
   anchor, and confirm they don't compete (`DESIGN.md` §1.1). Most screens have exactly one thing that
   should win the eye.
6. **Hard constraints.** Existing module patterns in the domain, the `@peppermint/admin` shells, the
   design tokens, permissions, backend contract. Note what is fixed vs. free.

Done well, Phase 1 **narrows the space** so most of Phase 2 stops being a free choice. If Phase 2 still
feels arbitrary, Phase 1 wasn't answered hard enough — go back.

---

## Phase 1.5 — Confirm the vision (mandatory question gate)

**This gate runs every single time. It is not optional and not skippable when the answer "seems
obvious."** Before committing to any DECIDE output, use **`AskUserQuestion`** to put the load-bearing
design decisions to the user and confirm the direction you are forming is the one they want. A named
assumption is _confirmed_, not silently taken.

These are **highly-crafted design questions about the vision**, not a requirements interview. Craft
them so each one is worth the user's attention:

- **Ask about design decisions, not facts the repo already answers.** Never ask what `CLAUDE.md`, the
  app `AI.md`, the contract digest, or `DESIGN.md` already state. If you can read it, don't ask it.
- **State the fork and your recommendation.** Each question names the tension you see, the two or three
  real options, and _which one you'd pick and why_ in one line — put the recommended option first and
  mark it `(Recommended)`. The user is choosing between considered directions, not filling a blank.
- **Show, don't describe, when the fork is visual.** Use option `preview`s for anything spatial — a
  modal form vs. a dedicated page, column-set A vs. B, a quiet table vs. an expressive signal board.
- **Keep it to what changes the build.** 2–4 questions. Prefer the decisions with the largest downstream
  blast radius. Fold the rest into your stated assumptions.

Cover, as applicable to the module:

- **The job & its anchor** — is the primary question and the #1 element what the user actually expects?
- **Surface / route shape** — how much to add _over_ the framework: a single ContainedModule page, a
  MultiPageModule with detail/wizard routes, or a sub-module under an existing parent? (This is the most
  expensive decision to get wrong — always confirm it.)
- **Form depth & placement** — modal/drawer form vs. a multi-step dedicated-page wizard, and how fields
  group.
- **Density & fidelity** — quiet efficient admin table, or an expressive signature surface (the
  glass/gradient dashboard treatment). Right-shooting is task-dependent; confirm which side of the line.
- **The one primary action** — is the single primary action per view the right one to make loud?

Only after the answers land do you produce DECIDE output. If an answer redirects the frame, revise
Phase 1 before continuing.

---

## Phase 2 — Decide (choices, now mostly derived)

Every decision here traces to a Phase 1 answer or a Phase 1.5 confirmation. The discipline that
separates _designed_ from _decorated_: **for every element, state why it exists, why it is that size,
and why it sits there.** If the honest answer is "it looked empty," cut it.

Match the module to an admin page pattern from `DESIGN.md` Part 5 — **List / Detail / Dashboard /
Settings / Review** — and design the eye's path with that pattern's anchors, not a marketing scan
pattern. The eye enters at the page-level anchor and should rest on the primary action or key takeaway.
**Exactly one primary action per view;** everything else is secondary or quiet.

### 2.1 Page & functionality inventory — what must exist over the framework

Decide the surface, and justify every page:

- List the pages/routes the functionality _requires_ to be complete and honest — not what's easy to
  bolt on. A create flow implies where create lives; an entity you can inspect implies a detail/view;
  a multi-field entity may imply a wizard. If a page can't name the question it answers, it shouldn't
  exist.
- Map that to a module shape (per `mint-module-builder` §2–3): **ContainedModule** (one route, modal
  create/edit, ≤ ~8 fields) vs. **MultiPageModule** (list + new + edit + view routes, complex/stepped
  form) vs. a **sub-module** nested under an existing parent (never a sibling `<module>-<sub>/` folder).
- Separate **reuse from build-new**: what is already covered by `@peppermint/admin`
  (`ModalTableShell`, `DataTableShell`, `FormWrapper`, `FormShell`) and `@peppermint/ui` (`ModalPaper`,
  inputs, `Badge`, `Text`) — and the _only_ net-new pieces this module genuinely adds over them. Don't
  rebuild a shell to add one column.

**Step 1 — Classify the module: independent vs nested (verify against the API URL, not the UI).**
The contract digest / `API.md` is the source of truth here — read the endpoint shape, don't guess from
the feature name.

- **Independent** — has its own top-level collection endpoint (`/api/v1/product`), _even if_ it carries
  a foreign key to another resource (a category FK doesn't make it nested). Build it as its own
  module/page.
- **Nested** — exists only under a parent resource id (`/api/v1/applicant/<applicant-id>/information`).
  Do **not** stand up a top-level module for it. It is managed from within its parent — and the next
  step decides _how_.

> `/api/v1/category` + `/api/v1/product` → product is independent (references category, stands alone).
> `/api/v1/applicant` + `/api/v1/applicant/<id>/information` → information is nested (belongs entirely
> to an applicant).

**Step 2 — For a nested module, decide Modal vs Detail page with the scored rubric.**
Sum the points that apply. **> 4 → manage it inside the parent's Detail page** (`DESIGN.md` Part 5B).
**≤ 4 → manage it in a Modal** (`DESIGN.md` Part 5F). The rubric is the default; the hard overrides win
outright.

| Signal                                                                   | Points      |
| ------------------------------------------------------------------------ | ----------- |
| Field count ≤ 5 / 6–12 / > 12                                            | 0 / +2 / +3 |
| Full create/edit/delete with real validation (vs read-only / light edit) | +2          |
| Owns a list/table needing search, sort, filter, or pagination            | +2          |
| Has further nested children of its own                                   | +3          |
| Multi-step / wizard-style flow                                           | +2          |
| Needs history, audit trail, comments, or activity feed                   | +1          |
| More than ~3 logical sections/tabs of content                            | +1          |
| File uploads, media galleries, or document previews                      | +1          |
| Bulk actions across many records                                         | +2          |
| High-frequency core workflow (users effectively live in this screen)     | +1          |

**Hard overrides — force a Detail page regardless of score** — it must be deep-linkable /
bookmarkable / shareable by URL; it must render alongside other data for comparison; or its content
can't fit without heavy internal scrolling.

The Modal-vs-page split, once made, is a **Phase 1.5 confirmation item** — surface the score and your
call to the user, don't take it silently. Modal structure/UX doctrine (structure order, no nested
modals, cards over tables, one primary action) lives in `DESIGN.md` Part 5F — cite it, don't restate
it. Building the resulting **page** routes through `/plan-module` → `mint-module-builder`; a **modal**
is built inline in its parent (`ModalTableShell` / `FormWrapper`), never via the page builder.

### 2.2 Form order & layout

- **Order fields by decision importance, not schema order.** Identity/name first, the fields the
  operator needs to think about next, and the highest-risk/most-consequential last.
- **Group by meaning, with space between groups** (`DESIGN.md` §1.2, Layer 2). Never one giant
  undifferentiated form.
- **Scale deliberation to risk** (`DESIGN.md` Layer 2 form table): low-risk → inline/modal, light
  validation; medium → sectioned + validated; high/critical → explicit review step, consequence
  summary. This is also the wizard-step map for a MultiPageModule: each step is one field group,
  ordered identity → detail → pricing/risk/critical.
- **Placement follows the surface decision** from 2.1: modal/drawer for the contained case, dedicated
  `pages/new` + `pages/edit` for the multi-page case.

### 2.3 Column order & icons

- **Derive columns from the common decision, not the row's full schema** (`DESIGN.md` Layer 2). Decision
  columns first: identity → the load-bearing statuses → the few metrics that drive action → owner /
  next action. Push technical fields to the drawer, expandable row, or export.
- **Order left-to-right by scan priority.** The strong left edge carries identity and meaning.
- **Status as word + color + position, never color alone** (`DESIGN.md` §1.9, Layer 4). Statuses get a
  `render` with a `<Badge size="xs">`; keep the state visually distinct from any action that changes it.
- **Every column carries a Phosphor `icon`** — a hard framework rule (`mint-module-builder`): a column
  without an `icon` breaks the `DataTableShell` header convention.
- **Use `render` only when plain text can't express the cell** — a badge, an icon, a stacked cell. Never
  wrap plain text in `<Text>` just to have a `render`; text inside a `render` is `size="xs"` unless
  there's a documented reason otherwise.

### 2.4 Icon selection

- **Name the consequence, favor recognition over recall** (`DESIGN.md` §1.4). Pick the Phosphor glyph an
  operator would match to the concept (`Envelope` for email, `Pulse`/`CheckCircle` for status), not a
  decorative one.
- **One icon per recurring concept, everywhere.** Consistency is automaticity (`DESIGN.md` §1.8) —
  the same concept must not wear two icons across the module.
- **Sizes snap to `design-system.md` §8** (12–13 inline, 14 default action, 16 button/header, larger for
  empty-state illustration). `aria-label` on every meaningful icon.

### 2.5 Fidelity calibration — don't over- or undershoot

- **Overshooting:** gradients, glass, stacked shadows, and motion on a _utility_ table. If a flourish
  doesn't serve the operator's decision, it's noise. Before you finish, remove one thing.
- **Undershooting:** no hierarchy, one text size, no spacing rhythm, unstyled controls — the raw-shell
  look. Also a failure.
- **Right-shooting is task-dependent.** A dense admin list should look _efficient and quiet_; the
  expressive signature (the glass/gradient home/dashboard surface in `design-system.md` §1.4) is
  reserved for surfaces that earn it. Put the one bold moment on the dashboard, not the CRUD table.

---

## Anti-generic guardrails (the "not-machine-made" test)

Treat each as a smell, not a ban — any can be right for a brief, but if you reach for it _by default_,
stop and choose. The deeper fix is always the same: **derive the design from the specific entity and its
real content and workflow (Phase 1), not from a general idea of "a nice admin page."**

- **Over-bordering** — boxes around things that proximity and alignment alone would group. Remove a
  border before you add one (`DESIGN.md` §1.2). White space is the primary grouping tool.
- **State/action blur** — a status styled like a button or a button styled like a badge; `onClick` on a
  badge. The worst class of admin error (`DESIGN.md` §1.9).
- **Color-only status** — meaning carried by color with no word/icon/position (`DESIGN.md` Layer 4).
- **Even visual weight everywhere** — fails the squint test; nothing anchors. Real hierarchy needs
  suppression, usually some asymmetry.
- **Decorative charts on a signal board** — a dashboard is exceptions and health, not a wall of trend
  charts (`DESIGN.md` Layer 2).
- **Columns without icons; plain-text `render`; every-row icon that helps nothing** — framework tells.
- **Placeholder-driven layout** — three tidy example rows that collapse the moment real data arrives.
  Design around the messy inventory from Phase 1.

---

## Phase 3 — Verify (quick self-check, then hand off)

This is a fast sanity pass, **not** a duplicate audit — the authoritative gate is `DESIGN.md` Part 8 and
the `/design-check` skill after the build. Confirm before handing off:

- **Primary task.** Can the Phase 1 user complete the job without instruction? Walk it as them.
- **All states named, not just the happy one:** empty, no-results, loading, request-failed,
  permission-denied, read-only, and pending-mutation — mapped to the pattern's output contract
  (`DESIGN.md` Part 6). Empty and error states orient ("here's what to do"), never dead-end.
- **Real & extreme content** from the inventory: longest label, zero items, huge counts, missing values
  — nothing breaks.
- **Accessibility floor:** contrast, visible keyboard focus, semantic elements, labels tied to inputs,
  `aria-label` on meaningful icons, reduced-motion respected. Never color-alone meaning.
- **Consistency:** spacing/type/color on the `design-system.md` scale; one icon per concept; actions
  named for their consequence.
- **Squint test:** with detail blurred, the page-level anchor still reads first, then #2.

If any check fails, fix the decision before adding anything new. Then **hand the confirmed decisions to
`mint-requirements-tuner`** — page inventory, module shape, form order, column list + icons, states — as the
input to its tagged requirements doc.

---

## How to communicate the work

Do the framing and iteration in your reasoning. Show the user the Phase 1.5 questions, then — after they
answer — the decisions and _one paragraph_ of intent, not the whole decision tree:

> **Job:** let an ops admin find and act on the accounts that need attention. **So:** a ContainedModule
> list (density over polish), identity + status + risk are the decision columns and lead the scan, one
> primary "Invite" action, destructive actions quiet and separated, a modal form ordered identity →
> access → role. The red suspended state is the only loud color; everything else is deliberately quiet.

---

## Quick reference

**Frame:** job (one question)? audience? real entity + fields/statuses? tone? hierarchy rank? fixed vs
free constraints?
**Confirm (always):** ask 2–4 crafted, fork-and-recommendation questions on surface/route shape, form
depth & placement, density/fidelity, the one primary action — with visual previews where it's spatial.
**Decide:** pages that each answer a question (module shape); reuse vs. net-new over the shells; form
ordered by importance & risk; columns by scan priority with word+color+position status and a Phosphor
icon each; icons that name the consequence, one per concept, sized per `design-system.md`; fidelity
matched to the surface.
**Verify:** primary task succeeds; all contract states + real/extreme content; a11y floor; squint test;
remove one thing → hand to `mint-requirements-tuner`.
