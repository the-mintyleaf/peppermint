# PasswordChangePage — SignInPage-style page in @peppermint/admin

Turn the app-level password-change screen into a first-class `@peppermint/admin` page
with `default` and `modernlines` variants, mirroring `SignInPage`'s architecture
(controller hook + resolved props + swappable layouts).

## Phase 1 — Types, utils, controller

- [ ] Rewrite `PasswordChangePage.types.ts` (variant, phase, controller, layout props, resolved props)
- [ ] Add `utils/resolvePasswordChangePageProps.ts`
- [ ] Add `utils/passwordStrength.ts` (requirements, score, strength meta)
- [ ] Add `PasswordChangePage.hooks.ts` (`usePasswordChangeController`)

## Phase 2 — Shared components

- [ ] `components/PasswordStrengthMeter.tsx`
- [ ] `components/PasswordChangeForm.tsx`
- [ ] `components/PasswordChangePanelContent.tsx` (form / success switch)
- [ ] `components/index.ts`

## Phase 3 — Layout variants

- [ ] `_shared/modernLines.module.css` (shared modern-lines chrome)
- [ ] `components/layouts/PasswordChangeLayoutDefault.tsx`
- [ ] `components/layouts/PasswordChangeLayoutModernLines.tsx`
- [ ] `components/layouts/index.ts`

## Phase 4 — Page + barrels

- [ ] Rewrite `PasswordChangePage.tsx` (variant dispatch + colour-scheme toggle)
- [ ] Update `index.ts` barrel exports

## Phase 5 — App wiring

- [ ] Repoint `apps/mintplayground/modules/auth/password-change/PasswordChange.tsx` at the page

## Phase 6 — Docs + verification

- [ ] `packages/admin/docs/PasswordChangePage.md`
- [ ] `usage-doc/admin/PasswordChangePage.md`
- [ ] `pnpm format` (own files) + `pnpm check-types` + `pnpm lint`
- [ ] Commit
