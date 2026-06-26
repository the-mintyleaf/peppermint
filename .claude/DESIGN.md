# Admin Portal Design Operating Guide

_A design doctrine for admin portals, back-office tools, dashboards, and internal tools.
Written to be derived from, not copied._

---

## Part 0 — How to use this guide (read first)

You are building UI. Most UI you have seen was made by imitation, so your instinct is to reproduce
the _appearance_ of good interfaces. That instinct is the problem. Appearance is a side effect; it
is not the cause of a good interface. This guide gives you the causes, then the patterns that
follow from them.

Three operating rules:

1. **Derive, don't match.** Every concrete rule below — column counts, action placement,
   confirmation copy, page layouts — is downstream of a perceptual or cognitive fact in Part 1.
   When you hit a case this guide doesn't name, return to the mechanism and derive the answer. Do
   not reach for the closest-looking reference.

2. **When principles conflict, use the decision ladder in Part 3.** They _will_ conflict — density
   fights calm, disclosure fights reach, consistency fights role-fit. A framework that pretends
   they don't is useless at exactly the moment you need it. The ladder is the tiebreak.

3. **Ship the whole product, not the happy path.** The default output of an AI building UI is the
   one perfect state: data present, request succeeded, permission granted. Real tools live in the
   other states. The output contract in Part 6 is not optional.

Scope: tuned for **interfaces used repeatedly by trained users to make consequential decisions.**
Part 1 is universal; Parts 2–8 are domain-specific. Consumer/marketing UI optimizes for first-touch
persuasion and inverts several of these priorities.

How the parts fit together: Part 1 is the _why_. Part 2 is the _job_. Part 3 is how to _choose_
when goals collide. Part 4 is the _design layers_. Part 5 is concrete _page patterns_. Part 6 is the
_definition of done_. Part 7 is the _routine_ you run before building. Part 8 is the _gate_ before
you ship.

---

## Part 1 — First principles (why any UI works)

These are the mechanisms. Everything else is a consequence. If you internalize only this part, you
can rebuild the rest yourself.

### 1.1 Hierarchy is contrast, and attention is zero-sum

The eye is pulled pre-attentively — before reading — to whatever differs most from its surroundings
in **size, weight, color, or isolation (whitespace)**. You cannot make something prominent by
making it big. You make it prominent by making _everything else quieter_. Emphasis is relative; it
is borrowed from what you suppress.

> Consequence: the screen has one **dominant, page-level anchor** — the first thing the eye lands
> on (the leverage point). Complex pages also carry **local anchors**, one per working region. On a
> fraud-review screen, identity/status anchors the _page_, risk evidence anchors the _decision_
> region, and approve/reject anchors the _action_ region. The rule is a _hierarchy of attention_,
> not a single point: regions may each own a local leverage point, but they must not compete with
> the page-level anchor or with each other. If everything is bold, nothing is.

### 1.2 Things near or alike read as one group (Gestalt)

The brain decides "these belong together" using proximity, shared region (a common background or
border), alignment, and similarity — automatically, faster than it reads. Grouping is therefore
done with **space and alignment first; borders and color last.**

> Consequence: most "cluttered" admin UIs are _over-bordered_. They draw boxes around things that
> proximity alone would have grouped, spending the attention budget on chrome. Remove a border
> before you add one. White space is not empty; it is the primary grouping tool.

### 1.3 Working memory is tiny (~4 chunks); the interface is the memory

Anything the admin must hold in their head while moving between screens is a leak, and leaks cause
errors. The interface's job is to hold context so the human doesn't have to.

> Consequence: keep decision-relevant context visible _at the moment of decision_ — sticky summary
> headers, drawers instead of full-page jumps, consequences shown inside the confirmation rather
> than on a page you just left. **Cognitive switching is the dominant tax on admin work.** Design to
> reduce it before you design anything else.

### 1.4 Recognition beats recall

People find things by matching what they see against their goal, not by remembering where things
live or what a control does.

> Consequence: labels name the consequence ("Suspend user," never "Manage"). Navigation uses the
> operator's vocabulary, not the schema's. Search accepts the identifiers humans actually remember.
> Never make someone recall what you could let them recognize.

### 1.5 Fitts's law — frequent targets big and near, dangerous targets small and far

Time to hit a target scales with its distance and shrinks with its size. This is motor cost, not
taste.

> Consequence: action placement is physics. Frequent safe actions get large, close, low-friction
> targets. Rare destructive actions get small, separated targets behind a deliberate step — you
> make them _physically harder to hit_ on purpose, because friction is protective exactly where
> being wrong is expensive.

### 1.6 Hick's law — choice cost rises with the number of options

Every additional always-visible option (column, button, filter) slows _every_ decision, for _every_
user, _every_ time.

> Consequence: default to the minimum set that serves the **common** decision; push the rest behind
> disclosure. An extra column isn't free because it's "just one more" — its cost is paid on every
> scan for the life of the product.

### 1.7 Feedback has a clock

Under ~100ms feels instant. Under ~1s preserves the sense of direct manipulation. Past that, flow
breaks and the interface must explicitly account for the wait. This clock is the physics of the word
"fluent."

> Consequence: optimistic updates, skeleton/loading states, and progress feedback are not polish —
> they are how you stay under the perceptual thresholds when the network won't. A correct action
> that _feels_ slow is, in the user's body, a slow action.

### 1.8 Repetition builds automaticity; novelty destroys it

When a control sits in the same place and behaves identically every time, expert users stop
_looking_ and start _reaching_ — it becomes motor memory. Every inconsistency drags them back into
conscious attention.

> Consequence: consistency beats novelty in daily tools for a mechanical reason, not an aesthetic
> one — novelty levies a recurring tax on your most valuable users. Reserve novelty for _meaningful_
> emphasis; make every page operationally predictable.

### 1.9 Affordance, and the hard line between state and action

A control should look like what it does. And — the cardinal rule of admin UI — a **state** (a fact
about the world: "Suspended," "Failed," "Verified") and an **action** (a lever that changes the
world: "Suspend," "Retry," "Verify") must never look like the same kind of object.

> Consequence: badges are facts; buttons are levers; they get different shapes, weights, and
> positions. Confusing them produces the worst class of admin error — acting when you meant to read.
> A red "Suspended" badge next to a red "Suspend" button is a bug, not a style.

### 1.10 Two kinds of error need two kinds of defense

**Slips** = right intent, wrong execution (clicked the wrong row). Prevented by constraints and
confirmation. **Mistakes** = wrong intent (didn't understand the consequence). Prevented by
_information shown before the act_. Prevention is never complete, so both also need **recovery**.

> Consequence: every consequential flow does three things — constrain the slip, inform against the
> mistake, and leave a way back (undo, audit, restore). "Are you sure?" defends against neither; it
> only adds a click.

---

## Part 2 — The job of an admin interface

Universal principles, pointed at a specific job.

**The thesis:** an admin tool exists to help a trained user make a **correct decision faster, and
recover when it was wrong.** Not to look clean. Clean is a means; correct-decision-faster is the
end. A beautiful portal that hides risk or slows the expert is a failure.

**The spine — every page serves one loop:**

```
Find  →  Understand  →  Decide  →  Act  →  Confirm  →  Recover
```

| Step       | What the UI owes the admin                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Find       | Search by real-world identifiers, filters that match the workflow, saved views, sane default sort |
| Understand | Current state, summary, ownership, what changed and by whom — at a glance, no tab-hunting         |
| Decide     | The specific details, warnings, dependencies, and consequences relevant to _this_ decision        |
| Act        | One obvious primary action; secondary actions present but quiet; dangerous actions separated      |
| Confirm    | Feedback fast enough to feel instant; a clear record of what just happened                        |
| Recover    | Undo, audit trail, retry, restore, and a path to help                                             |

**One question per page.** Before laying out anything, name the single operational question the page
answers — "Which orders are stuck, risky, or urgent?" not "Orders." A page without a question
becomes a data dump, because nothing tells you what to make prominent (1.1) or what to cut (1.6).

| Page      | Weak framing    | The admin question                                          |
| --------- | --------------- | ----------------------------------------------------------- |
| Users     | User management | Who needs attention?                                        |
| Orders    | Order list      | Which orders are stuck, risky, or urgent?                   |
| Dashboard | Overview        | Is the system healthy right now?                            |
| Detail    | User details    | What happened, what is the state, what can I do next?       |
| Settings  | Configuration   | What am I changing, and what will it affect?                |
| Review    | Approvals       | What's the evidence, what's risky, what decision is needed? |

---

## Part 3 — The decision ladder (how to resolve conflicts)

When two principles pull in opposite directions, resolve in this order — top wins:

```
1. Safety        Never make an irreversible harmful action easy or unexplained.
2. Truth         Never present stale, partial, or uncertain data as certain.
3. Clarity       The admin must understand state and consequence before acting.
4. Speed         Minimize steps and time on the common path.
5. Density       Fit more decision-relevant information per screen.
6. Consistency   Reuse patterns; same control, same place, same behavior.
7. Aesthetics    Visual refinement — serves the above, never overrides them.
```

**The one modifier:** for actions that are **frequent, safe, and reversible**, Speed jumps above
Clarity — you do not re-explain the thing an expert does 200 times a day. Friction is a resource;
spend it only where a mistake is expensive (1.5/1.10). This single rule resolves most real disputes:

- **Density vs. Calm.** Density wins _within_ a group; calm wins _between_ groups. Pack related
  fields tightly (proximity, 1.2), then put real air between groups. "Calm" is not low density; it's
  high density with clear seams.
- **Disclosure vs. Reach.** Hide only what isn't needed for the _current_ decision (1.3/1.6). If a
  detail is load-bearing for the common case, it stays on the surface even if it's labeled
  "advanced." The test is the decision, not the label.
- **Consistency vs. Role-fit.** Keep _patterns_ consistent (badge style, save placement, danger
  treatment); vary _content and defaults_ by role. A finance admin and a support agent see the same
  table component with different default columns — not two different table components.
- **Repeat-user speed vs. First-timer clarity.** Default to the expert (daily efficiency compounds),
  but make the expert path _discoverable_, not hidden — shortcuts shown next to the slow path, not
  instead of it. Exception: high-turnover teams and rarely-touched destructive flows tilt back
  toward first-timer clarity. Decide per flow, not globally.

---

## Part 4 — The six design layers

The thirty-rule lists collapse into six layers. Each is one decision domain, named by the tension it
resolves.

### Layer 1 — Information architecture: group by task, weight by stakes

- **Group by the admin's mental model, not the schema** (1.4). Operators think in tasks ("Identity,
  Access, Billing, Risk, Activity"), not tables (`users`, `profiles`, `roles`). Caveat: the schema
  is still the source of truth, and UI groupings that drift from it breed bugs. The real rule is
  _group by task_ — and sometimes the schema already reflects the task. Diverge deliberately, not
  reflexively.
- **Hierarchy = operational importance, not visual taste** (1.1). The most prominent thing is the
  thing needed for the next decision: state and risk above metadata, next-action above history. A
  user detail page reads identity → account status → risk/verification → open issues → primary
  actions → history; _not_ avatar → name → random fields → buttons.
- **Separate navigation levels so they stop competing** (1.3): global (product areas) → page header
  (this entity, its status, its primary action) → local tabs (sections of this entity) →
  filters/search (this view) → work area → context drawer. The admin should always know _where they
  are, what object they're on, and what level they're affecting._

### Layer 2 — The working surfaces

**Tables are decision surfaces, not data dumps.** A table lets an operator find, compare, spot the
exception, read status, and act. Derive columns from the _common decision_ (1.6), not the row's full
schema. For orders: `Order · Customer · Order status · Payment status · Risk · Total · Created ·
Owner · Next action` — not every timestamp and foreign key. Push technical fields to expandable rows,
a detail drawer, column customization, or export. Non-negotiables: meaningful default sort, visible
status, row + bulk actions, sticky headers when dense, real empty/no-result states.

**Filters are the control system, not clutter above the table.** Primary filters (used daily) are
visible; advanced ones reachable but out of the way (1.6). Active filters are obvious and one click
to clear. Saved views exist for repeated workflows (1.8). If admins use a filter every day, it is
never hidden in a drawer.

**Detail pages build decision confidence.** The admin should never hunt across five tabs to learn
whether an action is safe (1.3). Header (entity, status, key IDs, primary action) → summary (state,
warnings, ownership, last activity) → grouped detail + related records + notes → timeline (audit,
changes). The timeline is often as important as the current values — trust comes from traceability.

**Dashboards are signal boards, not walls of charts.** A dashboard answers: is everything okay, what
changed, what needs attention, what do I do next. Every element earns its place by answering one of
those (1.1/1.6). Health indicators and exceptions outrank decorative trend charts. Always show the
time range and data freshness (Truth, Part 3).

**Forms scale deliberation to risk and reversibility** (1.5/1.10):

| Risk               | Form behavior                                               |
| ------------------ | ----------------------------------------------------------- |
| Low (display name) | Inline edit, optimistic save, light validation              |
| Medium (billing)   | Sectioned, validated, save confirmation                     |
| High (permissions) | Explanation, warnings, explicit review step                 |
| Critical (delete)  | Consequence summary, reason field, possible second approver |

Group fields by meaning, validate early, never ship one giant undifferentiated form, and protect
unsaved changes.

### Layer 3 — Interaction & fluency

"Fluent" is not a look; it is **staying under the perceptual clock** (1.7) and **never breaking the
operator's flow.**

- **Latency budget.** Local UI feedback under ~100ms, always. If a server round-trip will take
  longer, respond _optimistically_ — apply the change in the UI immediately, reconcile when the
  server answers, roll back visibly on failure. The interface should feel like direct manipulation
  of the data, not submit-and-wait.
- **Preserve state across navigation** (1.3). Back-to-list keeps scroll position, filters, and
  selection. Losing an operator's hard-built context on one click is the most common way "powerful"
  tools feel hostile.
- **Keyboard-first for experts** (1.8). Daily users live on the keyboard: a command palette
  (jump-to-anything, run-any-action), navigable tables, focus that lands where work continues,
  shortcuts for frequent actions. A pillar for repeat-use tools, not a footnote.
- **Motion is feedback, not decoration.** Use it to show causality — what changed, where a thing
  went, that a row was removed. Keep it short and interruptible; long or gratuitous animation is
  friction in a nice coat, and it breaks the calm (Layer 6).
- **Real-time and concurrency.** If multiple admins touch the same records, you owe a concurrency
  strategy, not just a "conflicting edits" error: optimistic locking with clear resolution, presence
  where edits collide, and live updates that don't yank the ground out mid-action.

### Layer 4 — Status, color, and feedback as a system

- **State is a system, expressed in words first** (1.9). Consistent labels, positions, and color
  logic everywhere. Show when a state changed and by whom when it matters. Keep the state visually
  distinct from the action that changes it.
- **Color carries meaning or it carries nothing.** Status, severity, risk,
  success/warning/error, category, focus — yes. Decoration, ten badge colors, brand color on every
  button — no. Always pair color with text/icon/position; color-only meaning fails for colorblind
  operators (and Truth > Aesthetics, Part 3).
- **Data freshness is visible** (Truth). "Last updated 2 min ago; payments may lag up to 10 min." An
  admin must always know whether they're acting on fresh, stale, partial, or failed data. Acting
  confidently on a lie is worse than acting slowly on the truth.

### Layer 5 — Safety, consequences, and recovery

- **Action treatment follows frequency × risk × reversibility** (1.5). Frequent+safe: fast,
  low-friction. Frequent+important: clear, prominent. Rare+dangerous: deliberate, protected.
  Secondary: available but quiet.
- **Confirmations explain consequences; they don't ask for certainty** (1.10). Not "Are you sure?"
  but: _who_ is affected, _what_ happens, whether it's reversible, whether the user is notified,
  whether it's audited. Put the information at the point of no return, not on a page the admin
  already left.
- **Bulk actions: speed without hidden blast radius.** Show the selected count, make selection
  obvious, warn when it spans pages, preview the breakdown ("32 pending, 12 failed, 4 under review
  will be skipped"), show progress, give a success/failure summary with a recovery path.
- **Permissions explain themselves** (1.4). A disabled control states _why_ ("Only workspace owners
  can change billing") and who can. Hidden-by-permission data says it's hidden, not just absent.
- **Auditability is first-class.** Who, when, previous value, why, manual-vs-automated, source. For
  important entities the activity timeline is primary content, not a buried tab.
- **Design for recovery, not just prevention** (1.10). Undo, drafts, autosave, version history,
  reopen/restore, retry, cancel-job, clear failure explanations, partial-success summaries. A system
  that tries to prevent every mistake becomes slow; one that makes recovery cheap stays fast _and_
  safe.

### Layer 6 — The humane layer

These tools are used eight hours a day, often while something is on fire, sometimes doing grim work
(moderation, fraud, account closures). Humane is not softness; it is respect for the operator under
load.

- **Calm under pressure.** The more serious the workflow, the calmer the interface should feel —
  stable layout, predictable navigation, restrained motion, quiet color, reliable feedback. Panic in
  the UI becomes panic in the operator. When things are worst, the tool should feel most solid.
- **Tone of language is part of the design.** Errors explain and offer a next step instead of
  blaming. Empty states orient instead of shrugging. Destructive confirmations are sober, not jokey.
  The voice is a competent, unflappable colleague.
- **Reduce the dread of irreversible work.** Reversibility, consequence summaries, and "this is
  recorded" framing don't just prevent errors — they lower the standing anxiety of an operator whose
  mistakes affect real people and money. Forgiveness is a feature.
- **Long-session comfort.** Honor dark mode and reduced-motion preferences. Respect contrast and
  reading comfort for people who stare at this for hours. Don't punish fatigue with eye strain.
- **Ramp without coddling.** Default to the expert, but make the expert path discoverable for the
  newcomer (shortcuts beside the slow path, not instead of it). Turnover is real; the tool should
  teach itself in passing without slowing the veteran.

---

## Part 5 — Page patterns

Concrete scaffolds derived from the layers above. Each pattern names what the page must answer, then
a layout skeleton. Treat skeletons as default ordering by operational importance (1.1), not rigid
templates.

### A. List page — _users, orders, tickets, products, transactions, requests_

Must answer: What records exist? Which need attention? How do I find the right one? What can I do in
bulk? What's the status of each?

```
Page title + the admin question
Primary action
Search
Primary filters            (advanced filters tucked behind a control)
Saved views
Table                      (decision columns; visible status; row actions)
Pagination / infinite load
Bulk action bar            (appears on selection; shows count + consequence)
Empty + no-results states
```

### B. Detail page — _user, order, ticket, payment_

Must answer: What is this? What state is it in? What matters most right now? What happened before?
What can I do next? Is the action safe?

```
Header        entity name, current status, key identifiers, primary action
Summary       load-bearing state, warnings/blockers, ownership, last activity
Main          core details grouped by task, related records, internal notes
Side panel    metadata, secondary actions, tags, permissions, quick links
Timeline      activity log, audit history, before/after changes
```

The admin should not need five tabs to decide whether an action is safe.

### C. Dashboard — _system, operations, workload, finance, compliance_

Must answer: Is everything okay? What changed? What needs attention? What do I do next?

```
Time range + data freshness
Key health indicators        (with context, not bare numbers)
Exception cards              (the things that need a human)
Trend charts                 (only where a trend drives a decision)
Work queues                  (tasks requiring attention)
Recent activity
Shortcuts to common actions
```

A dashboard is an operational signal board, not a wall of charts.

### D. Settings page — _billing, permissions, feature flags, config, notifications_

Must answer: What's configured now? What happens if I change it? Who's affected? Can it be undone?
Who's allowed to change it?

```
Setting group
Current value
Plain explanation
Impact note            (who/what this affects)
Edit control + validation
Save / cancel          (review step for high/critical risk — see Layer 2 forms)
Change history
```

### E. Review / approval page — _KYC, refunds, moderation, access requests, compliance_

Must answer: What's being reviewed? What evidence supports a decision? What's risky? What decision is
needed? What happens after approve/reject?

```
Review object summary
Risk / status indicator        (page-level anchor)
Evidence / details             (decision-region anchor)
Related history
Decision actions               (action-region anchor — approve / reject)
Reason / comment field
Confirmation (consequences)
Audit trail
```

Note the three non-competing anchors (1.1): status anchors the page, evidence anchors the decision,
the decision buttons anchor the action.

---

## Part 6 — Default output contract (definition of done)

Unless told otherwise, anything you build ships with all of this. Producing only the happy path is an
incomplete deliverable.

- **States, always:** empty (no data yet), no-results (filtered to nothing), loading and partial
  loading, request-failed, permission-denied, read-only, archived/deleted record, conflicting edits,
  unsaved changes, expired session, long-running/background job. Edge states are not edge cases here;
  they are the product.
- **A page-level leverage point** plus non-competing regional anchors; everything else deliberately
  recessive (1.1).
- **Actions labeled by risk tier** (safe / important / risky / destructive) with treatment to match
  (Layer 5); dangerous actions visually and spatially separated (1.5).
- **Status as words + color + position**, never color alone (Layer 4).
- **Keyboard support and preserved navigation state** for anything used repeatedly (Layer 3).
- **Data freshness** shown wherever data can be stale (Truth).
- **A recovery path** for every consequential action (undo / audit / retry / restore).
- **Consistent components** — reuse the table, drawer, confirmation, badge; don't reinvent per page
  (1.8).

---

## Part 7 — Composition procedure (run before building)

Before generating a page, resolve these in order. This is the routine that turns the principles into
a layout. Do not start placing elements until you can answer all ten.

1. **The admin question.** The single operational question this page answers (Part 2).
2. **The primary entity.** What object is this page about?
3. **The anchors.** The page-level leverage point, and the local anchor for each working region —
   confirm they don't compete (1.1).
4. **The load-bearing statuses.** Which states drive the decision here?
5. **The workflow.** Walk Find → Understand → Decide → Act → Confirm → Recover and note what each
   step needs _on this page_.
6. **The actions.** Enumerate them; tag each safe / important / risky / destructive and reversible /
   irreversible (Layer 5).
7. **The data hierarchy.** Order information by operational importance, not schema or aesthetics
   (Layer 1).
8. **The states.** Which of the Part 6 states apply, and what does each look like?
9. **Audit & history.** What must be traceable, and where does the timeline live?
10. **Repeat-use affordances.** Saved views, shortcuts, preserved context, customizable columns.

Only then lay out structure, surfaces, action placement, and interaction states.

**Worked example — orders page for an operations manager finding delayed/failed/risky orders:**
the question is "which orders are stuck, risky, or urgent?"; the entity is the order; the page anchor
is the exception count / risk summary, with the table as the work region; load-bearing statuses are
order status, payment status, and risk flag; decision columns are `Order · Customer · Order status ·
Payment status · Risk · Total · Created · Owner · Next action`; primary filters are status, date
range, payment state, fulfillment state, search; row actions are safe-to-important; bulk status
change is risky and gets a consequence preview; required states include no-results, loading, failed
request, and a partial-success summary for bulk; audit lives in each order's timeline; repeat-use
gets saved views ("failed today," "high-risk unassigned") and remembered filters.

---

## Part 8 — Pre-flight self-check (the gate)

Before emitting a screen, answer these. They're derived from Part 1, so each failure points at a
mechanism to fix — not a box to tick. (This replaces a long compliance checklist on purpose: the
page patterns, output contract, and these ten questions cover the same ground without the
redundancy.)

1. **What single question does this page answer?** If you can't say it in one sentence, you have a
   data dump and no basis for hierarchy (Part 2, 1.1).
2. **What's the page-level anchor, and does each region's local anchor stay subordinate to it
   without competing?** (1.1)
3. **Where is the admin in Find→Understand→Decide→Act→Confirm→Recover, and is the next step the
   easiest thing to do?** (Part 2)
4. **What must the operator hold in their head?** Every item is a leak to close with visible context
   (1.3).
5. **Is every state distinct from every action that changes it?** (1.9)
6. **For each action: how often, how risky, how reversible — and does its treatment match?**
   (1.5/1.10)
7. **For the dangerous ones: does the confirmation inform against the mistake and leave a way back?**
   (1.10)
8. **Did I design the unhappy states, or only the populated one?** (Part 6)
9. **Does it stay under the perceptual clock — instant local feedback, optimistic where the network
   is slow, no lost context on navigation?** (1.7/1.3)
10. **Does it stay calm and humane under load — restrained motion, sober tone, forgiving of error?**
    (Layer 6)

---

## Part 9 — One-paragraph compression

A good admin interface helps a trained person decide correctly and faster, and recover when wrong.
Attention is zero-sum, so emphasis is bought by suppression; working memory is tiny, so the interface
holds context; choice and distance have measurable costs, so frequent things are near and cheap and
dangerous things are far and deliberate; feedback has a clock, so "fluent" means staying under it;
consistency is automaticity, so novelty taxes your experts; state and action are different categories
and must never blur; and because prevention is never complete, recovery is part of usability. When
these collide, resolve **Safety > Truth > Clarity > Speed > Density > Consistency > Aesthetics**,
letting Speed rise for the frequent-safe-reversible. Build the whole product — every state — and keep
it calm when everything else isn't.
