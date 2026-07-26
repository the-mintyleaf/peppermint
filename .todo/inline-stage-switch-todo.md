# Inline in-column stage/status switch (leads, journeys, applicants)

## Phase 1 — Shared components

- [x] `apps/grandway/components/StatusSwitchButton/` (`.tsx`, `.types.ts`, `index.ts`) — port pill trigger from mintway
- [x] `apps/grandway/components/InlineStageSwitch/` (`.tsx`, `.types.ts`, `index.ts`) — Menu + inline-confirm control
- [x] Commit Phase 1 + post-phase review

## Phase 2 — Applicants

- [x] `applicants/pages/list/components/ApplicantStatusSwitch/` — wraps InlineStageSwitch, no modals
- [x] `applicants.columns.tsx` — status column render → switch; drop `onChangeStatus` option
- [x] `ApplicantRowActionsMenu.tsx` — remove "Change status" item + prop; fix stale comment
- [x] `ApplicantsList.tsx` — remove statusApplicant state + modal mount + plumbing
- [x] Keep `ChangeApplicantStatusModal` (detail header still uses it)
- [x] Commit Phase 2 + post-phase review (Phase 1 review fixes applied)

## Phase 3 — Leads

- [x] `lead-management/pages/list/components/LeadStageSwitch/` — targets + Mark lost/Convert/Reopen actions, mounts modals
- [x] `leadManagement.columns.tsx` — Stage render → switch (keep filter)
- [x] `LeadRowActionsMenu.tsx` — keep View/Edit/Follow-up; remove stage/lost/convert/reopen + their modals
- [x] Delete `ChangeStageModal/` (only the row menu used it — safe)
- [x] Commit Phase 3

## Phase 4 — Journeys

- [x] `applicant-journeys/pages/list/components/JourneyStageSwitch/` — targets + Defer/Close/Reopen actions, mounts modals
- [x] `journeys.columns.tsx` — stage column → switch (keep filter/icon)
- [x] `JourneyRowActionsMenu.tsx` — reduce to View/Edit
- [x] KEEP `ChangeJourneyStageModal/` — the detail page (`JourneyDetail.tsx`) still uses it (parallel to applicants)
- [x] Commit Phase 4

## Phase 5 — Verify & docs

- [x] `check-types` (grandway clean for touched files; 4 pre-existing dashboard errors unrelated)
- [ ] `lint` on touched files
- [ ] Post-phase review of module wiring (Phases 2–4)
- [ ] Update each module `docs/AI.md`
- [ ] `/design-check` + `/visual-review` on the 3 list routes
- [ ] Delete this todo file
