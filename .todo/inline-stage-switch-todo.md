# Inline in-column stage/status switch (leads, journeys, applicants)

## Phase 1 — Shared components

- [ ] `apps/grandway/components/StatusSwitchButton/` (`.tsx`, `.types.ts`, `index.ts`) — port pill trigger from mintway
- [ ] `apps/grandway/components/InlineStageSwitch/` (`.tsx`, `.types.ts`, `index.ts`) — Menu + inline-confirm control
- [ ] Commit Phase 1 + post-phase review

## Phase 2 — Applicants

- [ ] `applicants/pages/list/components/ApplicantStatusSwitch/` — wraps InlineStageSwitch, no modals
- [ ] `applicants.columns.tsx` — status column render → switch; drop `onChangeStatus` option
- [ ] `ApplicantRowActionsMenu.tsx` — remove "Change status" item + prop; fix stale comment
- [ ] `ApplicantsList.tsx` — remove statusApplicant state + modal mount + plumbing
- [ ] Keep `ChangeApplicantStatusModal` (detail header still uses it)
- [ ] Commit Phase 2 + post-phase review

## Phase 3 — Leads

- [ ] `lead-management/pages/list/components/LeadStageSwitch/` — targets + Mark lost/Convert/Reopen actions, mounts modals
- [ ] `leadManagement.columns.tsx` — Stage render → switch (keep filter)
- [ ] `LeadRowActionsMenu.tsx` — keep View/Edit/Follow-up; remove stage/lost/convert/reopen + their modals
- [ ] Delete `ChangeStageModal/`
- [ ] Commit Phase 3 + post-phase review

## Phase 4 — Journeys

- [ ] `applicant-journeys/pages/list/components/JourneyStageSwitch/` — targets + Defer/Close/Reopen actions, mounts modals
- [ ] `journeys.columns.tsx` — stage column → switch (keep filter/icon)
- [ ] `JourneyRowActionsMenu.tsx` — reduce to View/Edit
- [ ] Delete `ChangeJourneyStageModal/`
- [ ] Commit Phase 4 + post-phase review

## Phase 5 — Verify & docs

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] `/design-check` + `/visual-review` on the 3 list routes
- [ ] Update each module `docs/AI.md`
- [ ] Delete this todo file
