# Grandway: integrate `applicants` + `applicant_journeys`

Plan: `/Users/decoffee/.claude/plans/in-the-same-branch-mossy-ripple.md`

## Phase 0 — Backend contract sync

- [x] `/sync-api grandway applicants` (grandway's own CONCEPT/FLOWS/INTEGRATION convention, per logged governance reconciliation)
- [x] `/sync-api grandway applicant_journeys` (folder: `applicant-journeys`, kebab-case)
- [x] Re-sync `/sync-api grandway leads` (convert endpoint, Requires table, new HistoryEntry.action values)
- [x] Re-sync `CORE_INTEGRATION.md` (was missing `leads` entirely; added `leads`/`applicants`/`applicant_journeys`)
- [ ] Commit Phase 0

## Phase 1 — Build modules (parallel)

- [x] `/design-decisions` (both modules, consolidated): plain filtered applicant list (no tabs), plain stage-filter journey worklist (no tabs), passport expiry as colored badge in-panel (no banner)
- [x] `/form-builder` for `ApplicantForm`: 4-step FormShell (Identity & Contact → Addresses → Passport → Family & Emergency Contacts), only full_name_np + contact_numbers required
- [x] `/form-builder` for `JourneyForm`: single-view modal, grouped sections (Destination & Level / Timing & Budget / Notes), only `applicant` required
- [ ] Dispatch `module-builder` for `applicants` (types/api/queryKeys/hooks, form, list/new/[id]/[id]/edit pages — panel component stubbed, wired in Phase 2)
- [ ] Dispatch `module-builder` for `applicant-journeys` (types/api/queryKeys/hooks, form, list/[id] pages)
- [ ] Dual adversarial review (Codex + adversarial-reviewer) on Phase 1 diff
- [ ] Apply fixes
- [ ] Commit Phase 1

## Phase 2 — Cross-module wiring (orchestrator)

- [ ] `ApplicantJourneysPanel` (applicants detail → applicant-journeys)
- [ ] `app/admin/applicants/{page,new/page,[id]/page,[id]/edit/page}.tsx`
- [ ] `app/admin/applicant-journeys/{page,[id]/page}.tsx`
- [ ] `RequireApplicantAccess` component
- [ ] `config/nav/admin-nav.ts` — `canAccessApplicants` + grouped nav entry
- [ ] Commit Phase 2

## Phase 3 — Lead conversion integration

- [ ] `leadManagement.types.ts` — `converted_applicant_id`/`converted_journey_id`
- [ ] `leadManagement.api.ts` — `.action(id, "convert")`
- [ ] `leadManagement.hooks.ts` — `useConvertLead()`
- [ ] `LeadRowActionsMenu` — "Convert to Applicant" action (Admin-only, hidden when terminal)
- [ ] `ConvertLeadModal`
- [ ] `LeadDetailDrawer` overview — converted link
- [ ] Review + fixes
- [ ] Commit Phase 3

## Phase 4 — Home dashboard

- [ ] Restructure `modules/admin/home/` (`home.hooks.ts`, `components/`)
- [ ] `ApplicantStatusPanel`
- [ ] `JourneyStagePanel`
- [ ] `RecentApplicantsPanel`
- [ ] Review + fixes
- [ ] Commit Phase 4

## Phase 5 — Docs + verification

- [ ] Update `apps/grandway/docs/AI.md` (Modules table, structure tree, integration notes)
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Manual exercise: create applicant, role gating, journey lifecycle, lead convert flow, nav/Home per role
- [ ] `/visual-review` on `/admin/applicants`, `/admin/applicants/[id]`, `/admin/applicant-journeys`, `/admin`
- [ ] `/pre-pr`
- [ ] Delete this todo file
