# Fix double ModuleHeader / duplicate add button in list modules

DONE (Approach A — shell owns the single header). Reverted user's in-progress
shell-header removal per their choice. Verified: check-types clean (both apps),
lint clean on all 14 changed files (kanban lint errors are pre-existing, not ours).

## Phase 1 — Shared primitive (both apps)

- [x] mintflow-admin `createListModule.tsx`
- [x] mintflow-admin `createListModule.types.ts` (removed `breadcrumb`)
- [x] mintway `createListModule.tsx`
- [x] mintway `createListModule.types.ts`

## Phase 2 — createListModule consumers

- [x] GrantsList (breadcrumb → basePath)
- [x] DenialsList (breadcrumb → basePath)

## Phase 3 — Hand-rolled ModalTableShell modules

- [x] UsersList
- [x] ApplicantsList
- [x] RolesList (added basePath)
- [x] BindingsList (added basePath)

## Phase 4 — Hand-rolled DataTableShell modules

- [x] SecurityEventsList (Forbidden() left as-is)
- [x] DocumentsList (New button → sustained + onNewClick)
- [x] SignaturesList (user's new ModalTableShell file)

## Phase 5 — Consistency + verify

- [x] PositionsList (added mainComponentProps + dropped unused import)
- [x] Excluded CaseDetailPage (detail page)
- [x] format own files / check-types / lint

## Commit — PENDING user decision

- DocumentsList + SignaturesList are entangled with the user's parallel
  documents/signatures restructure (renamed/untracked). The other 12 files are
  cleanly committable. Awaiting user call on how to group the commit.
