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
