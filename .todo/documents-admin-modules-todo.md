# Documents & Signatures → admin-scoped modules

## Phase 1 — Documents admin module (`modules/admin/documents`)

- [x] Create `modules/admin/documents/` folder (Component Structure)
- [x] Move list logic: `DocumentsList.tsx` + `documents.columns.tsx`
- [x] Compose admin chrome: RequireStaff → ModuleHeader → ModalPaper → DataTableShell
- [x] Keep per-row "Open in Editor" → `/documents/${applicantId}`
- [x] Build `NewDocumentModal` (applicant picker) + "New document" header button
- [x] Expose shared engine surface (documentsApi/queryKeys/types) from `modules/documents` barrel
- [x] `index.ts` barrel export
- [x] Wire `app/admin/documents/page.tsx` (re-export only)

## Phase 2 — Signatures admin module (`modules/admin/signatures`)

- [x] Create `modules/admin/signatures/` folder
- [x] Move SignaturesManager logic from `modules/documents/pages/signatures/`
- [x] Re-chrome inside admin (RequireStaff → ModuleHeader → ModalPaper); drop back/breadcrumb
- [x] Fallback path: re-chrome + split into columns + SignatureFormModal (FormWrapper conversion = follow-up)
- [x] Deactivate as row action
- [x] Signature API imported from `modules/documents` barrel
- [x] `index.ts` barrel export
- [x] Wire `app/admin/signatures/page.tsx` (re-export only)

## Phase 3 — Editor stays, cleanup, nav, deletes

- [x] Trim `modules/documents/index.ts` to editor-only + shared exports
- [x] Delete `modules/documents/pages/{list,new,signatures}/`
- [x] Editor page already `ModuleDocuments.editor` (unchanged, still valid)
- [x] Delete `app/documents/page.tsx`, `app/documents/new/`, `app/documents/signatures/`
- [x] Update `LayoutDocuments` doc comment (editor-only)
- [x] Add Documents + Signatures nav items in `config/nav/admin-nav.ts`
- [x] N/A — leaf modules imported directly (no `modules/admin/index.ts` registration, like security-events)

## Phase 4 — Docs & verification

- [ ] Update `docs/AI.md` (documents notes + module table rows)
- [ ] `/verify` (pnpm format && check-types && lint)
- [ ] Visual review `/admin/documents` + `/admin/signatures`
- [ ] Per-phase commits + dual adversarial review
