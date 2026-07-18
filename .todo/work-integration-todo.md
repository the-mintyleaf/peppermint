# MintFlow `work` — Frontend Integration

Source of truth for the phased integration of the MintFlow `cases`/`tasks`/`dashboard`/`calendar`
surfaces onto the already-built backend `work` module (60 endpoints, live at
`http://192.168.110.97:8000`). Plan: `~/.claude/plans/you-are-to-fully-snappy-planet.md`.

Decisions: **faithful reshape** (adapt UI to real backend domain) · **full domain, phased**.

---

## Phase 0 — Contract intake, typed layer, vocabulary freeze, design reshape

- [ ] Relocate contract docs from `.todo/work/` → repo-root `docs/backend/work/` (API, DATA_CONTRACT,
      INTEGRATION, SECURITY + LIFECYCLE, HIERARCHY_RESOLUTION and remaining concern docs)
- [ ] Run `/sync-api mintflow work` → contract digest at `apps/mintflow/docs/api-contracts/work.md`
      (Endpoints, DTO blocks, pagination/filtering, error→UI map, Gaps)
- [ ] Build the frozen shared work-domain typed layer (types / enums / queryKeys / errors / mappers)
      in the shared `_shared/` location (proposed `apps/mintflow/lib/work/`)
- [ ] Freeze module vocabulary: enum sets, error catalogue, endpoint→policy-key list (60),
      gated-feature list, DTO→view-model field map
- [ ] `/design-decisions` reshape pass per surface (read LIFECYCLE + HIERARCHY_RESOLUTION);
      record RESHAPE decisions
- [ ] `pnpm check-types` green; commit; DoD gate

## Phase 1 — Cases read path (WorkItem list + detail/profile)

- [ ] Reshape `modules/cases/module.api.ts` off mock (keep token maps re-keyed to real enums)
- [ ] Real query hooks: `Cases.hooks.ts`, `profile/CaseProfile.hooks.ts` (list, detail, tasks tree, activities, hierarchy-preview)
- [ ] Wire list-view / block-view / detail modal / profile/\* to real DTOs; all UI states + 404-as-not-found
- [ ] `/visual-review /cases` + `/cases/[id]`; `/verify` green; commit

## Phase 2 — Tasks read + task commands

- [ ] Reshape `modules/tasks/kanban/module.api.ts` off mock (1717 lines); real TaskStatus columns
- [ ] Task reads + commands (create/details/reorder/start/complete/return/archive/assign/respond/block/unblock)
- [ ] Optimistic concurrency (aggregate_version) + 409 handling; gated affordances disabled
- [ ] `/visual-review /tasks`; `/verify` green; commit

## Phase 3 — Work lifecycle commands (cases)

- [ ] Named-command mutations: create/update-details/start/assign/respond/transfer/route/recover/block/deadline
- [ ] Work-create form via `/form-builder` (forms-tension: FormWrapper vs bespoke — skill decides)
- [ ] Conflict/permission/hierarchy/invalid-transition surfaced; `/verify` green; commit

## Phase 4 — Review, closure, activity, evidence, participants, stakeholders

- [ ] Profile tabs: activity (immutable + corrections), evidence (text/structured; file gated), reviews, closure, participants, stakeholders
- [ ] Field-level protection + gating respected; `/verify` green; commit

## Phase 5 — Dashboards + Calendar + cleanup

- [ ] Dashboard 5 endpoints (my/\*, unit queue, hierarchy-overview) + `?overdue` + neutral metrics facts
- [ ] Calendar off mock (by due_at); no mock left in any work surface
- [ ] Full `/verify` + final `/visual-review` sweep; update `docs/AI.md`; walk read/command/dashboard paths live
