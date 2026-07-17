# Signatures — cropper upload + interactive status

## Phase 1 — Dependency + API/form value changes

- [x] `pnpm --filter mintway add react-easy-crop`
- [x] `signatures.api.ts`: drop isActive from toSignatureInput; add reactivateSignature(id, name)
- [x] `SignatureForm.types.ts`: drop isActive from SignatureFormValues
- [x] `SignatureForm.tsx`: drop isActive (schema/toInitial); fields reordered
- [x] `SignaturesList.tsx`: onCreateApi sends isActive: true

## Phase 2 — Image field (dropzone + cropper)

- [x] `SignatureImageField.utils.ts` — getCroppedPngFile + url helpers
- [x] `components/SignatureCropModal/` — react-easy-crop modal
- [x] `SignatureImageField.tsx/.types.ts/.module.css/index.ts`
- [x] Wire SignatureImageField as first field in SignatureForm

## Phase 3 — Lifecycle hook + status cell + row menu

- [x] `useSignatureLifecycle.ts` (deactivate + reactivate, confirms, invalidation)
- [x] `SignatureStatusCell/` (menu-driven badge)
- [x] Refactor `SignatureRowActionsMenu` to use the hook
- [x] `signatures.columns.tsx`: use SignatureStatusCell

## Wrap-up

- [x] Update module docs/AI.md (Signatures row)
- [x] pnpm check-types && lint (mintway) + prettier check
- [x] Dual adversarial review (Codex + adversarial-reviewer) — fixes applied: - shared lifecycle isPending via useIsMutating + per-signature mutationKey (double-fire guard) - reset crop area on aspect change (no stale-frame Apply) - lock crop modal (escape/click-outside/close) while processing
- [ ] /visual-review /admin/signatures (manual — needs running app + staff session)
- [ ] Verify backend: PATCH is_active=true actually reactivates
- [ ] Delete this todo file once verified
