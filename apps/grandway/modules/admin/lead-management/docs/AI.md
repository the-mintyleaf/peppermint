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

| Area             | Path                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Types / DTOs     | `leadManagement.types.ts` (`StudyInterest` academic fields, `LanguageCertificate`, `LeadNote` v2, `deleted_*`, `LeadListFilters`)                                                                                                          |
| API              | `leadManagement.api.ts` — `fetchAllLeads` (aggregate, server filters), `deleteLead`/`restoreLead`/`fetchDeletedLeads`, notes CRUD, history                                                                                                 |
| Query keys       | `leadManagement.queryKeys.ts` — `leadNotesKey`, `leadHistoryKey`, `deletedLeadsKey` (under `lists()`)                                                                                                                                      |
| Hooks            | `leadManagement.hooks.ts` — `useLeadBoardData(fiscalYear, filters)`, lifecycle mutations, `useDeleteLead`/`useRestoreLead`/`useDeletedLeads`, `useLeadNotesAdapter`, `useAddLeadVisitNote`, `useRefreshLead`                               |
| Errors           | `leadErrors.utils.ts` — `isStaleLeadError` (the stale-lead 409 family), `getLeadNoteErrorMessage` (note-write toast copy)                                                                                                                  |
| Permissions      | `leadAccess.hooks.ts` — `useLeadAccess()` → `isLeadAdmin` (exact `admin` tier), `currentUserId`                                                                                                                                            |
| Labels           | `studyInterest.labels.ts` (study level, test status); `leadCategory.utils.ts` (board categories, stage labels/colours, `toLeadBoardRow`)                                                                                                   |
| Form             | `form/LeadForm.tsx` + `LeadForm.{types,schema,utils,context}.ts`; sections `StudyInterestSection`, `AcademicBackgroundSection`, `LanguageSection`, `ContactNumbersField`                                                                   |
| Board            | `pages/list/LeadManagementBoard.tsx`, `leadManagement.columns.tsx`, `leadDeletion.utils.ts` (delete/restore confirm modals)                                                                                                                |
| Board components | `pages/list/components/` — `LeadRowActionsMenu`, `AddVisitNoteModal`, `LeadStageSwitch`, `LeadDetailDrawer/`, `DeletedLeadsModal`, `LeadProfileFilters`, `RecordFollowUpModal`, `MarkLeadLostModal`, `ReopenLeadModal`, `ConvertLeadModal` |
| Drawer           | `LeadDetailDrawer.tsx` (header + Admin delete menu, `DeletedLeadBanner`, notes tab), `LeadOverviewPanel.tsx`, `LeadHistoryPanel.tsx`, `components/{DetailField,DetailSection,LeadStudyProfile}`                                            |
| Reference data   | `reference-data/` — Admin-only sources / loss reasons modal                                                                                                                                                                                |

## Shared components used (do not re-implement)

- `@/components/notes-panel` → `NotesPanel` via `useLeadNotesAdapter(leadId)`.
  General/Visit tabs, `meta.counts` badges, backdated `noted_at`, edit/delete
  for author or Admin. `readOnlyReason` set for deleted and ever-converted
  leads; a 409 calls `useRefreshLead`. History key invalidated on note writes.
- `@/components/notes-panel` → `NoteForm` + `toApiNotedAt` in
  `AddVisitNoteModal` (the board's quick visit note) — same body/"When"
  form, validation and discard prompt as the drawer's composer.
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
  chosen (or a value exists). The score type is never guessed (a score with no
  type is a validation error). The calendar is filled only when the year
  allows one (`unambiguousYearCalendar`: >this AD year+1 → BS, <2000 → AD) and
  the field says "Read as …"; overlap years must be picked. A unit without its
  value is dropped from the payload; no clamping.
- **Cache freshness**: every lead write (`useRefreshOnStaleLead`) refetches the
  lead + `lists()` on a stale-lead 409 (`leadErrors.utils.ts`:
  `LEADS_LEAD_DELETED` / `_NOT_DELETED` / `_ALREADY_CONVERTED`); the board's
  create/edit wrappers refresh `lists()` + `detail(id)` on success too, since
  the shell only invalidates the current scoped key. A stale delete/restore
  closes its confirm modal (the toast says why).
- **Drawer**: content is keyed by lead id (switching `?lead=` resets tabs,
  notes state and drafts); the last id is retained while the drawer closes.
- **Certificates** replace wholesale: an edit always sends the full list (`[]`
  clears), a create omits an empty one.
- **Soft delete (Admin only)**: row menu + drawer dots menu → reason modal
  (≤500). Hidden for converted leads (backend 409s). Deleted leads leave the
  board; the Admin "Deleted leads" modal (`?deleted=true`) restores (optional
  reason ≤2000) or opens the drawer, which shows `DeletedLeadBanner`, a
  read-only stage badge and read-only notes. A Lead Manager's link to a
  deleted lead 404s → "Lead not found … may have been deleted".
- **Quick visit note**: a row icon (NotePencil, tooltip "Add visit note") and
  a row-menu item open `AddVisitNoteModal` ("Add visit note — <name>") —
  writes `category: "visit"`, "When" blank = now (server-stamped), backdatable,
  ≤ now + 5 min. Both hide per `canAddVisitNote` (converted stage, deleted,
  `converted_applicant_id`); lost leads stay writable. `useAddLeadVisitNote`
  invalidates `leadNotesKey` (lists + `meta.counts` badges) and
  `leadHistoryKey`, not `lists()` (no board field changes). A stale-lead 409
  or `LEADS_LEAD_NOT_FOUND` refreshes lead + board; a converted/deleted 409
  keeps the draft and shows "Notes are on the applicant" / "This lead was
  deleted". The modal ignores Escape/outside clicks and has no X — the form's
  Cancel asks before discarding.
- **History** labels/icons include `lead_note_updated`, `lead_note_deleted`,
  `lead_deleted`, `lead_restored`; `summary` stays the primary label.

## Known risks

- `?deleted=true` rows use the list shape, which the contract says carries no
  `deleted_*` fields — the modal shows "Open to see" unless the server sends
  them; the drawer always has them.
- A converted-then-reopened lead looks active in the list shape, so the row
  menu still offers Delete and Add visit note; the server's
  `LEADS_LEAD_ALREADY_CONVERTED` 409 is the guard. The drawer (full detail)
  hides both correctly.
- The dashboard's Recent activity feed is not invalidated by a quick visit
  note (other module's key); it catches up on its own refetch.
- BS pass-year upper bound is deliberately loose (AD year + 58, up to a year
  of slack over the real BS year + 1); the server's field error is final.
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
