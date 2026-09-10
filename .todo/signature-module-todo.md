# Signature module + certificate signature selection

Plan: `~/.claude/plans/we-have-signature-on-composed-pancake.md`
Branch: `dev/signature-module`

## Phase 1 — Sync the backend contract

- [x] Re-sync `apps/grandway/docs/backend/document-templates/` (CONCEPT / FLOWS / INTEGRATION) to v1.2.0
- [x] Land the upload endpoint, `file`/`notes` multipart fields, png|jpg|jpeg|webp, 10 MB cap
- [x] Land `signature_file` + `signature_source` and the branch-on-`signature_source` rule
- [x] Land the PATCH immutability rejections and the no-DELETE rule
- [x] Land Admin-only-on-every-route (superadmin + lead_manager both 403)
- [x] Carry SECURITY.md's Admin-only-ledger + past-render-rewrite notes
- [x] Commit

## Phase 2 — Signatures module, data layer

- [x] `signatures.types.ts` — Signatory, SignatorySource, SignatoryStatus, \*FormValues
- [x] `signatures.queryKeys.ts` via `createQueryKeys`
- [x] `signatures.api.ts` — list/get/create/update/uploadSignature/changeStatus (+ MULTIPART_HEADERS)
- [x] `signatures.labels.ts` — status labels/colors, source labels
- [x] `signatures.hooks.ts` — useSignatoryList, useActiveSignatories, mutations via `useAppMutation`
- [x] Add `signatories` capability (ADMIN only) to `config/access/capabilities.ts` + types
- [x] `index.ts` barrel
- [ ] Commit + adversarial review

## Phase 3 — SignatureManagerModal + editor button

- [x] `SignatureManagerModal` shell with list ↔ form sub-screen switching
- [x] List view: rows with name/title/role, status badge, thumbnail or "No image"
- [x] Form view: `FormWrapper` + zod (name/title/role/signature_image_url)
- [x] Image section (edit view only) — `FileInput` upload, png/jpg/jpeg/webp, 10 MB
- [x] Status actions: activate / deactivate via status sub-route
- [x] Modal body padding restored on an inner container (not via `styles`)
- [x] Wire `DocHeader` — drop the dead `router.push`, gate on `capabilities.signatories`
- [x] Mount the modal in `DocumentEditor`
- [ ] Commit + adversarial review

## Phase 4 — Certificate wiring

- [x] 4a Thread `signatures` + `disabled` through `DocumentCustomizations` in `HistorySidebar`
- [x] 4b Register `ConfigBar: CertificateConfigBar` in `documentTypeConfig.ts`
- [x] 4c Re-lay `CertificateConfigBar` vertically + `onUpdate` & debounced `onPersist` + unmount flush
- [x] 4d Annotate picker options with role and "(no image)"
- [x] 4e Export `useFileBlob`; add `useResolvedSignature`; resolve in `CertificateTemplate` + `createCertificateTemplateAdapter`
- [x] 4f Delete `signatureValidity.ts`, drop `validFrom`/`validTo` from `Signature`
- [ ] Commit + adversarial review

## Phase 5 — Docs and verification

- [ ] `modules/admin/signatures/docs/AI.md`
- [ ] `modules/documents/docs/AI.md`
- [ ] Update `apps/grandway/docs/AI.md` — module table, capability matrix, cross-module section
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Commit
