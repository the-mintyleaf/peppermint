# Lead management module — Grandway

Plan: `~/.claude/plans/we-are-now-integrating-silly-wozniak.md`
Backend contract: `.backend/backend/leads/docs/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md`

## Phase 0 — API sync + planning artifacts

- [x] Run `/mint-api-sync` for the leads domain into `apps/grandway/docs/backend/lead-management/` (CONCEPT.md, FLOWS.md, INTEGRATION.md)
- [x] Resolve open gaps: exact trimmed list-vs-detail field diff, `study_level` enum values, `language_test_status` enum values, full `LEADS_*` error code list (all resolved by reading backend source directly — serializers.py, constants.py, views.py)
- [ ] Phase 0 commit

## Phase 1 — Foundation

- [ ] `modules/admin/lead-management/leadManagement.types.ts` — Lead, LeadBoardRow, LeadSource, LossReason, LeadNote, HistoryEntry, enums
- [ ] `modules/admin/lead-management/leadManagement.queryKeys.ts` — createQueryKeys x3 + notes/history key helpers
- [ ] `modules/admin/lead-management/leadManagement.api.ts` — createResourceApi + fetchAllLeads aggregator + sources/loss-reasons/notes/history reads
- [ ] `components/RequireLeadAccess/` — new gate (admin + lead_manager, excludes superadmin)
- [ ] `config/nav/admin-nav.ts` — `canAccessLeads` branch, "Leads" nav entry
- [ ] `layouts/admin/Admin.tsx` — update `buildAdminConfig` call site
- [ ] `layouts/app/App.tsx` — add `configureAppMutations()` call
- [ ] `lib/authErrorMessages.ts` — append `LEADS_*` error codes
- [ ] `app/admin/lead-management/page.tsx` — route re-export
- [ ] Empty `LeadManagementBoard.tsx` behind the gate (loading/empty state only)
- [ ] Phase 1 verify (`pnpm format && check-types && lint`) + commit + dual adversarial review

## Phase 2 — List + categorization

- [ ] `leadCategory.utils.ts` — categorizeLead(), stage labels/colors, freshness thresholds
- [ ] `pages/list/leadManagement.columns.tsx`
- [ ] Tabs wired with live counts (Active / Needs attention today / Upcoming & follow-ups / Dead-closed)
- [ ] In-shell source/stage column filters
- [ ] Fiscal-year scope selector (real `fiscal_year=` server param)
- [ ] Read-only board fully working end to end
- [ ] Phase 2 verify + commit + dual adversarial review

## Phase 3 — Create/edit

- [ ] Run `/form-builder`
- [ ] `form/LeadForm.tsx` + `LeadForm.types.ts`
- [ ] `form/ContactNumbersField.tsx` (repeater, whole-set-replace, single primary)
- [ ] `form/StudyInterestSection.tsx` (collapsible optional block)
- [ ] Wire `onCreateApi` / `onEditApi` / `onEditTrigger`
- [ ] Phase 3 verify + commit + dual adversarial review

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
