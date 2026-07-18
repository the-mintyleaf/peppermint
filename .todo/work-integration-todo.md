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

**Profile slice — ✅ done (commit 7cac811):**

- [x] `caseView.ts` view-model + `CaseProfile.hooks.ts` → real `getWorkItem` (404=not-found) + `getTaskTree` + `listActivities`, names resolved via directory
- [x] Reshaped `CaseProfile.tsx` + WorkDetail / TaskStrip / ActivityTimeline / InsightsRail / WorkTabs to real DTOs; People = owner + assignees; Files tab dropped (P4)
- [x] 404-as-not-found; BS+Gregorian dates; 5-level priority meter
- [x] Deleted last mock (`module.api.ts`, `profile.api.ts`, `CaseProfile.utils.ts`); full-app `check-types` + `lint` green

**Phase 1 DoD — remaining (needs live backend + session):**

- [ ] `/visual-review /cases` + `/cases/[id]` against `http://192.168.110.97:8000` (confirm names resolve / gated fallbacks)
- [x] Update app `docs/AI.md` cases section (mock → live)

## PIVOT (user directive 2026-07-18)

Only integrate surfaces with a **clean 1:1 backend** — no aggregation/workarounds/synthesized data.
Standalone `/tasks` board, `/calendar` (task-level), and rich dashboard widgets (metrics/flow/files)
have **no backend** → stay mock, listed in the final gap report. Remaining clean integration below.

## Phase 2 — Case task commands (in the case profile)

- [ ] `cases.commands.ts` task fetchers: create / reorder / start / complete / return / archive / block / unblock / assign / respond
- [ ] `useWorkMutation` helper (useMutation + notify + invalidate + 409/gated handling)
- [ ] Wire profile TaskStrip + Add-task to real commands; `aggregate_version` concurrency
- [ ] `/verify` green; commit

## Phase 3 — Case lifecycle commands

- [ ] Work-item fetchers: create / update-details / start / block / unblock / deadline-extend / submit-review / submit-closure / close / reopen / archive / restore / assign / respond / transfer / route / recover-owner / hierarchy-preview
- [ ] Wire profile action buttons; work-create form via `/form-builder`
- [ ] Conflict/permission/hierarchy/invalid-transition surfaced; `/verify` green; commit

## Phase 4 — Case sub-resources (profile tabs)

- [ ] activity (create/correct), evidence (text/structured; verify/reject; file gated), reviews (comment/decide), participants (add/end), stakeholders (create/update/notify)
- [ ] Field-level protection + gating respected; `/verify` green; commit

## Phase 5 — Dashboard /my/\* lists

- [ ] `GET /my/active/` + `/my/pending-assignments/` + `/my/pending-reviews/` into the dashboard's list widgets
- [ ] Non-/my widgets (metrics/flow/files) stay mock (no backend); `/verify` green; commit

## Gap report (compile at the end)

- [ ] Standalone `/tasks` board, `/calendar` (task-level), dashboard metrics/flow/files, file attachments/evidence, gated visibility, external notifications
