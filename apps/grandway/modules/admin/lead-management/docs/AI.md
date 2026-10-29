# Lead Management Module AI Map

## Purpose

The leads board for `admin` (all leads) and `lead_manager` (own leads): record
enquiries, work them through stages, write notes, and convert them into
applicants. Contract: `docs/backend/lead-management/INTEGRATION.md` (v1.5.0,
2026-10-29) + FLOWS.md + CONCEPT.md.

## Module type · route · entry

- ContainedModule (one route; the lead opens in a drawer, never its own page).
- Route `/admin/lead-management` → `app/admin/lead-management/page.tsx` →
  `ModuleLeadManagement` (`pages/list/LeadManagementBoard.tsx`, via `index.ts`).
- Deep links: `?lead=<id>` opens `LeadDetailDrawer` (notifications link here);
  `?q=<name>` seeds the search (global search). Both read every render.

## Files

| Area             | Path                                                                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types / DTOs     | `leadManagement.types.ts` (`StudyInterest` academic fields, `LanguageCertificate`, `LeadNote` v2, `deleted_*`, `LeadListFilters`)                                                                                     |
| API              | `leadManagement.api.ts` — `fetchAllLeads` (aggregate, server filters), `deleteLead`/`restoreLead`/`fetchDeletedLeads`, notes CRUD, history                                                                            |
| Query keys       | `leadManagement.queryKeys.ts` — `leadNotesKey`, `leadHistoryKey`, `deletedLeadsKey` (under `lists()`)                                                                                                                 |
| Hooks            | `leadManagement.hooks.ts` — `useLeadBoardData(fiscalYear, filters)`, lifecycle mutations, `useDeleteLead`/`useRestoreLead`/`useDeletedLeads`, `useLeadNotesAdapter`, `useRefreshLead`                                 |
| Permissions      | `leadAccess.hooks.ts` — `useLeadAccess()` → `isLeadAdmin` (exact `admin` tier), `currentUserId`                                                                                                                       |
| Labels           | `studyInterest.labels.ts` (study level, test status); `leadCategory.utils.ts` (board categories, stage labels/colours, `toLeadBoardRow`)                                                                              |
| Form             | `form/LeadForm.tsx` + `LeadForm.{types,schema,utils,context}.ts`; sections `StudyInterestSection`, `AcademicBackgroundSection`, `LanguageSection`, `ContactNumbersField`                                              |
| Board            | `pages/list/LeadManagementBoard.tsx`, `leadManagement.columns.tsx`, `leadDeletion.utils.ts` (delete/restore confirm modals)                                                                                           |
| Board components | `pages/list/components/` — `LeadRowActionsMenu`, `LeadStageSwitch`, `LeadDetailDrawer/`, `DeletedLeadsModal`, `LeadProfileFilters`, `RecordFollowUpModal`, `MarkLeadLostModal`, `ReopenLeadModal`, `ConvertLeadModal` |
| Drawer           | `LeadDetailDrawer.tsx` (header + Admin delete menu, `DeletedLeadBanner`, notes tab), `LeadOverviewPanel.tsx`, `LeadHistoryPanel.tsx`, `components/{DetailField,DetailSection,LeadStudyProfile}`                       |
| Reference data   | `reference-data/` — Admin-only sources / loss reasons modal                                                                                                                                                           |

## Shared components used (do not re-implement)

- `@/components/notes-panel` → `NotesPanel` via `useLeadNotesAdapter(leadId)`.
  General/Visit tabs, `meta.counts` badges, backdated `noted_at`, edit/delete
  for author or Admin. `readOnlyReason` set for deleted and ever-converted
  leads; a 409 calls `useRefreshLead`. History key invalidated on note writes.
- `@/components/academic` → qualification/score/calendar/test-type options and
  labels, `LanguageTestsField` (`path="language_certificates"`, max 10),
  `createLanguageTestsSchema`, `toLanguageTestFormRows`/`toLanguageTestPayloads`,
  `applyApiFieldErrors`.
- `@peppermint/admin` → `openReasonConfirmModal` (delete/restore),
  `RowActionsMenu`, `useAppMutation`, `ModalTableShell`.

## Key behaviours

- **Board data**: one aggregate fetch (≤10 pages × 100) categorised client-side
  into 4 tabs. Qualification level / test status / test type are SERVER filters
  (`LeadProfileFilters` popover) — the list shape has no study interest or
  certificates, so they scope the fetch and the query key (one JSON segment
  after `lists()`; unscoped = `lists()` exactly, which the dashboard shares).
- **Form errors**: `ModalTableShell` only toasts mutation errors, so the board
  wraps `onCreateApi`/`onEditApi` in `captureSubmitError` and provides
  `LeadFormSubmitErrorContext`; `LeadForm`'s `ServerErrorsBridge` maps
  `study_interest.<field>`, `language_certificates[i].<field>` and
  `LEADS_CERTIFICATE_LIMIT` onto fields (`applyLeadServerErrors`).
- **Pairs**: score + type and pass year + calendar are revealed once a level is
  chosen (or a value exists); a blank unit is inferred on leaving the pair; a
  unit without its value is dropped from the payload; no clamping.
- **Certificates** replace wholesale: an edit always sends the full list (`[]`
  clears), a create omits an empty one.
- **Soft delete (Admin only)**: row menu + drawer dots menu → reason modal
  (≤500). Hidden for converted leads (backend 409s). Deleted leads leave the
  board; the Admin "Deleted leads" modal (`?deleted=true`) restores (optional
  reason ≤2000) or opens the drawer, which shows `DeletedLeadBanner`, a
  read-only stage badge and read-only notes. A Lead Manager's link to a
  deleted lead 404s → "Lead not found … may have been deleted".
- **History** labels/icons include `lead_note_updated`, `lead_note_deleted`,
  `lead_deleted`, `lead_restored`; `summary` stays the primary label.

## Known risks

- `?deleted=true` rows use the list shape, which the contract says carries no
  `deleted_*` fields — the modal shows "Open to see" unless the server sends
  them; the drawer always has them.
- A converted-then-reopened lead looks active in the list shape, so the row
  menu still offers Delete; the server's `LEADS_LEAD_ALREADY_CONVERTED` toast
  is the guard. The drawer (full detail) hides it correctly.
- BS pass-year upper bound is approximated client-side (new year ≈ 14 April);
  the server's field error is authoritative.
- `isLeadAdmin` compares `authorityType === "admin"` in `useLeadAccess` only —
  `config/access` has no lead-admin capability yet. Do not add new inline
  authority comparisons; use `useLeadAccess`.

## Do not do

- Do not add `deleted` to the board's aggregate fetch — deleted leads belong
  only in `DeletedLeadsModal`.
- Do not offer stage moves, edits or note writes on a deleted lead (409).
- Do not treat delete as "lost" in copy or code.
- Do not hand-roll a notes list or language-test editor — use the shared ones.
- Do not fetch in `useEffect`; do not import `@mantine/*`.
