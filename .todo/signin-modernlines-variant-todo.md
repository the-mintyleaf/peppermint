# SignInPage — `variant` prop with a `modernlines` layout

## Phase 1 — Refactor (no behaviour change)

- [ ] Add `SignInVariant`, `SignInController`, `SignInLayoutProps` to `SignInPage.types.ts`
- [ ] Extract auth control flow into `SignInPage.hooks.ts` (`useSignInController`)
- [ ] Extract the phase tree into `components/SignInPanelContent.tsx`
- [ ] Extract current chrome into `components/layouts/SignInLayoutDefault.tsx`
- [ ] Add `components/layouts/index.ts` barrel
- [ ] Reduce `SignInPage.tsx` to the variant dispatcher
- [ ] Export `SignInVariant` from `SignInPage/index.ts`
- [ ] Verify: format + check-types + lint; default look unchanged in all three apps
- [ ] Commit phase 1
- [ ] Dual adversarial review (Codex + adversarial-reviewer) + apply fixes

## Phase 2 — Build `modernlines`

- [ ] `components/layouts/SignInLayoutModernLines.module.css`
- [ ] `components/layouts/SignInLayoutModernLines.tsx`
- [ ] Wire the variant branch in `SignInPage.tsx`
- [ ] Verify: format + check-types + lint
- [ ] Visual review — both schemes, all breakpoints, all states
- [ ] Keyboard-only pass
- [ ] Commit phase 2
- [ ] Dual adversarial review + apply fixes

## Phase 3 — Docs

- [ ] `packages/admin/docs/SignInPage.md`
- [ ] `usage-doc/admin/SignInPage.md`
- [ ] Final verify + commit + push branch
