# SignInPage — `variant` prop with a `modernlines` layout

## Phase 1 — Refactor (no behaviour change)

- [x] Add `SignInVariant`, `SignInController`, `SignInLayoutProps` to `SignInPage.types.ts`
- [x] Extract auth control flow into `SignInPage.hooks.ts` (`useSignInController`)
- [x] Extract the phase tree into `components/SignInPanelContent.tsx`
- [x] Extract current chrome into `components/layouts/SignInLayoutDefault.tsx`
- [x] Add `components/layouts/index.ts` barrel
- [x] Reduce `SignInPage.tsx` to the variant dispatcher
- [x] Export `SignInVariant` from `SignInPage/index.ts`
- [x] Verify: format + check-types; all three consumer apps typecheck
- [x] Commit phase 1
- [x] Adversarial review + apply fixes - [x] Hoist presentational defaults to `utils/resolveSignInPageProps.ts` (would have crashed the new variant) - [x] Add `components/index.ts` barrel - [x] Fix import ordering (third-party before `@peppermint/*`) - Codex MCP unavailable this session — substituted a second Opus reviewer with a
      standards/architecture lens. Logged in `.claude/FAILURE-LOG.md`.

## Phase 2 — Build `modernlines`

- [x] `components/layouts/SignInLayoutModernLines.module.css`
- [x] `components/layouts/SignInLayoutModernLines.tsx`
- [x] Wire the variant branch in `SignInPage.tsx`
- [x] Verify: format + check-types
- [ ] Visual review — both schemes, all breakpoints, all states
- [ ] Keyboard-only pass
- [ ] Commit phase 2
- [ ] Adversarial review + apply fixes

## Phase 3 — Docs

- [ ] `packages/admin/docs/SignInPage.md`
- [ ] `usage-doc/admin/SignInPage.md`
- [ ] Update `apps/mintflow-admin/modules/sign-in/docs/AI.md` (points at the old file layout)
- [ ] Final verify + commit + push branch
