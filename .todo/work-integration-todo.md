# MintFlow `work` — Frontend Integration

Source of truth for the phased integration of the MintFlow `cases`/`tasks`/`dashboard`/`calendar`
surfaces onto the already-built backend `work` module (60 endpoints, live at
`http://192.168.110.97:8000`). Plan: `~/.claude/plans/you-are-to-fully-snappy-planet.md`.

Decisions: **faithful reshape** (adapt UI to real backend domain) · **full domain, phased**.

---

## Phase 0 — Contract intake, typed layer, vocabulary freeze, design reshape

- [x] Relocate contract docs from `.todo/work/` → repo-root `docs/backend/work/` (API, DATA_CONTRACT,
      INTEGRATION, SECURITY + LIFECYCLE, HIERARCHY_RESOLUTION and remaining concern docs)
- [x] Run `/sync-api mintflow work` → contract digest at `apps/mintflow/docs/api-contracts/work.md`
      (Endpoints, DTO blocks, pagination/filtering, error→UI map, Gaps)
- [x] Build the frozen shared work-domain typed layer (types / enums / queryKeys / errors / mappers)
      at `apps/mintflow/lib/work/`
- [x] Freeze module vocabulary: enum sets, error catalogue, endpoint→policy-key list (60),
      gated-feature list, DTO→view-model field map
- [x] `pnpm check-types` green; commit Phase 0 foundation
- [x] Resolve two blocking reshape gaps with user: **fetch names from auth/org**; **drop + remap Files → attachments/evidence**
- [x] Record reshape decisions → `apps/mintflow/docs/api-contracts/work.reshape.md`

**Phase 0 DoD: ✅ complete** — intake relocated, digest + typed layer committed, vocabulary frozen, reshape approved, check-types green.

## Phase 1 — Cases read path (WorkItem list + detail/profile)

**List slice — ✅ done (commits c7dc922 / ddc82d3 / 12664cc):**

- [x] Actor/unit directory resolver (`lib/work/directory.ts`) + cases read fetchers (`cases.api.ts`)
- [x] Real style maps keyed to WorkStatus/WorkPriority (`cases.styles.ts`)
- [x] `Cases.hooks.ts` real (`useWorkItems`, server `?status`, client search/sort) + `Cases.tsx` (loading/error-retry/empty)
- [x] block-view (CaseCard) + list-view (CaseRow) on real WorkItem + resolved names; Files rail + orphan CaseDetailModal removed

**Profile slice — remaining:**

- [ ] `profile/profile.api.ts` + `CaseProfile.hooks.ts` → real `getWorkItem`/`getTaskTree`/`listActivities`/`getHierarchyPreview`
- [ ] Reshape `CaseProfile.tsx` + WorkDetail / TaskStrip / ActivityTimeline / InsightsRail / WorkTabs to real DTOs; Files tab → Attachments+Evidence (P4 fills those)
- [ ] Handle 404-as-not-found on unknown/invisible id; BS+Gregorian dates
- [ ] Delete mock `module.api.ts` once profile migrated (last mock consumer)
- [ ] `/visual-review /cases` + `/cases/[id]` against live backend; `/verify` green; commit

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
