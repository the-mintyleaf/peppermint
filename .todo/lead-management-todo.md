# Lead management module — Grandway

Plan: `~/.claude/plans/we-are-now-integrating-silly-wozniak.md`
Backend contract: `.backend/backend/leads/docs/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md`

## Phase 0 — API sync + planning artifacts

- [x] Run `/mint-api-sync` for the leads domain into `apps/grandway/docs/backend/lead-management/` (CONCEPT.md, FLOWS.md, INTEGRATION.md)
- [x] Resolve open gaps: exact trimmed list-vs-detail field diff, `study_level` enum values, `language_test_status` enum values, full `LEADS_*` error code list (all resolved by reading backend source directly — serializers.py, constants.py, views.py)
- [ ] Phase 0 commit

## Phase 1 — Foundation

- [x] `modules/admin/lead-management/leadManagement.types.ts` — Lead, LeadBoardRow, LeadSource, LossReason, LeadNote, HistoryEntry, enums
- [x] `modules/admin/lead-management/leadManagement.queryKeys.ts` — createQueryKeys x3 + notes/history key helpers
- [x] `modules/admin/lead-management/leadManagement.api.ts` — createResourceApi + fetchAllLeads aggregator + sources/loss-reasons/notes/history reads
- [x] `components/RequireLeadAccess/` — new gate (admin + lead_manager, excludes superadmin)
- [x] `config/nav/admin-nav.ts` — `canAccessLeads` branch, "Leads" nav entry
- [x] `layouts/admin/Admin.tsx` — update `buildAdminConfig` call site
- [x] `configureAppMutations()` call — added to `layouts/admin/Admin.tsx` instead of `layouts/app/App.tsx` (App.tsx is a Server Component; Admin.tsx is already `"use client"` and is where every `useAppMutation` call in this module actually runs)
- [x] `lib/authErrorMessages.ts` — append `LEADS_*` error codes
- [x] `app/admin/lead-management/page.tsx` — route re-export
- [x] Empty `LeadManagementBoard.tsx` behind the gate (loading/empty state only)
- [x] Phase 1 verify (`prettier` scoped to touched files, `turbo check-types --filter=grandway`, `turbo lint --filter=grandway`) + commit + dual adversarial review
  - Dual review (Codex + adversarial-reviewer) found: `LeadStage`-typed stage payloads didn't exclude `lost`/`converted` at the type level (fixed — new `SelectableLeadStage`), wrong error message text for `LEADS_STAGE_INVALID_TRANSITION` (fixed), `converted_at_bs` missing from the INTEGRATION.md digest (fixed), `docs/AI.md` stale (fixed — Leads module + RequireLeadAccess gate added), and local `PagedResult<T>` duplicating `@peppermint/admin`'s `ResourceListResponse<T>` (fixed — now reused). No access-control or pagination-loop bugs found.

## Phase 2 — List + categorization

- [x] `leadCategory.utils.ts` — categorizeLead(), stage labels/colors, freshness thresholds
- [x] `pages/list/leadManagement.columns.tsx`
- [x] Tabs wired with live counts (Active / Needs attention today / Upcoming & follow-ups / Dead-closed)
- [x] In-shell source/stage column filters
- [x] Fiscal-year scope selector (real `fiscal_year=` server param)
- [x] Read-only board fully working end to end
- [x] Phase 2 verify + commit + dual adversarial review
  - 3 review rounds (Codex + adversarial-reviewer in parallel, then 2 Codex-only follow-ups
    chasing the same bug). Real bugs found and fixed: (1) `ModalTableShell`'s `tabs[].filter`
    writes into the same store the active-filters bar renders as a removable chip — clicking
    it away desynced the tab highlight from the actual filtered data, and `forceFilter` isn't
    a safe alternative either (applied after client pagination, breaks totals). Fixed upstream
    in `@peppermint/admin` (`DataTableShellActiveFilters` `hiddenKeys` prop, separate commit) —
    confirmed the same latent bug already existed in every other tabs+filter consumer in the
    repo. (2) Fiscal-year query-key sentinel (`fiscalYear ?? "all"`) collided with a user
    literally typing "all" — fixed by making key length, not string content, the no-fiscal-year
    signal.

## Phase 3 — Create/edit

- [x] Run `/form-builder`
- [x] `form/LeadForm.tsx` + `LeadForm.types.ts`
- [x] `form/ContactNumbersField.tsx` (repeater, whole-set-replace, single primary)
- [x] `form/StudyInterestSection.tsx` (collapsible optional block)
- [x] Wire `onCreateApi` / `onEditApi` / `onEditTrigger`
- [x] `LeadBoardRow` restructured to extend `LeadDetail` (not trimmed `Lead`) so `onEditTrigger` can return real fetched detail without a second row type; `toLeadBoardRow()` fills detail-only fields with safe defaults for list rows
- [x] Phase 3 verify + commit + dual adversarial review
  - 4 review rounds (Codex + adversarial-reviewer in parallel, then 3 Codex-only follow-ups
    as fixes surfaced new edge cases each time — converged to zero findings on the final pass).
    Real bugs found and fixed: frozen zod validation (`FormWrapper` freezes `validation` at
    mount — added a live-closure safety-net check in `finalSubmitFn`, which _is_ kept fresh);
    blank `study_interest` always sent (now omitted unless touched or the record already had
    one — the latter distinction matters so clearing existing data actually clears it, not
    silently no-ops under PATCH semantics); editing a lead with a retired source always 400'd
    (backend rejects any PATCH containing an inactive source even unchanged — fixed via
    `toUpdatePayload` in the board, which has the original record to compare against);
    contact-number `id` sent despite the write contract not accepting it; Mantine
    Select/NumberInput clearing to `null`/`""` instead of `""`/`null` breaking zod validation;
    pre-existing malformed contact_numbers (zero/multiple primaries) never normalized on edit-load;
    stale `source_detail` surviving a source change.

## Phase 4 — Lifecycle actions + detail

- [ ] `pages/list/components/LeadRowActionsMenu/`
- [ ] `ChangeStageModal/` (6 selectable stages only)
- [ ] `RecordFollowUpModal/`
- [ ] `MarkLeadLostModal/` (required reason + conditional detail)
- [ ] `ReopenLeadModal/`
- [ ] `LeadDetailDrawer/` — Overview / Notes / History tabs
- [ ] Phase 4 verify + commit + dual adversarial review

## Phase 5 — Polish/verify

- [ ] `/design-check`
- [ ] `/visual-review /admin/lead-management` (light+dark, all breakpoints)
- [ ] `modules/admin/lead-management/docs/AI.md` (if warranted) + `/update-ai-map`
- [ ] Full verification checklist per plan's Verification section
- [ ] Final commit + push branch
