# Align divergent mintway modules to the app pattern

## Phase 1 — admin/home barrel

- [ ] Add `modules/admin/home/index.ts` → export ModuleHome
- [ ] Update `modules/admin/index.ts` import to `./home`

## Phase 2 — admin/documents restructure (mechanical)

- [ ] Move DocumentsList.tsx + documents.columns.tsx → pages/list/
- [ ] Move components/NewDocumentModal/ → pages/list/components/
- [ ] Fix relative imports
- [ ] index.ts re-exports DocumentsList from pages/list

## Phase 3 — admin/signatures → ModalTableShell + FormWrapper

- [ ] signatures.api.ts (thin re-export of engine signature fns)
- [ ] signatures.queryKeys.ts (createQueryKeys)
- [ ] form/SignatureForm.tsx + .types.ts + index.ts (FormWrapper, create+edit, FileInput)
- [ ] pages/list/SignaturesList.tsx (ModalTableShell)
- [ ] pages/list/signatures.columns.tsx (StatusBadge + actions col)
- [ ] pages/list/components/SignatureRowActionsMenu/ (Edit → openEditModal, Deactivate → confirm)
- [ ] Cross-key invalidation of documentQueryKeys.signatures() on create/edit/deactivate
- [ ] index.ts export SignaturesList; delete old root files
- [ ] Update app/admin/signatures/page.tsx

## Phase 4 — docs, verify, review

- [ ] Update docs/AI.md Signatures + Documents rows
- [ ] check-types + lint + format (own files)
- [ ] Per-phase commits + dual adversarial review (phase 2-3)
- [ ] Delete this todo
