# Admin Framework Hardening — Todo

Plan: `/Users/decoffee/.claude/plans/i-want-you-to-snug-cerf.md`
Branch: `dev/claude-tuning` (do NOT create a new branch)

## Phase 0 — Triage & foundation

- [x] Implement `@peppermint/api-client` as Axios-instance factory (`configureApiClient`) — owner chose instance-factory contract; promoted logic from app, parameterized token keys
- [x] Re-point `apps/mintflow/lib/api.ts` to configure the shared client; added api-client to app deps; rewrote drifted docs
- [x] Fix `FormWrapper` submit `try/finally` (C7 stuck-loading) — both handleSubmit + handleStepNext
- [x] Fix `FormShell` — render `FormShellHeader` (dirty-guard Back), drop duplicate/mislabeled "Refill fields" button + unused `Alert`/`Stack` imports; `title`/`description` now used (C6)
- [x] Remove stale `"main"` fields from ui/config/kanban (M12); empty config/kanban kept as intentional stubs (in dep-direction table)
- [x] Remove dead code: `VantaTrunk` (M13, insecure CDN injection), `getState().toggleColumn;` no-op + unused `getState` (M3)
- [~] `columnOrder` (M2) + `DataTableShellSortMenu` — SCOPE MOVED to Phase 4 (half-built features; decide render-order/multi-sort together in the DataTable API rework)
- [ ] Verify (pre-existing repo type errors noted, scheduled to later phases), commit + dual adversarial review

## Phase 1 — Correctness & security

- [ ] C1 apply `store.filters` in client pipeline
- [ ] C2 additive cross-page selection via `useTableSelection`
- [ ] C3 wire `onNavigate` through AdminShell → Navbar → MainNav (next/navigation)
- [ ] H2 real error state in `DataTableShellTable` + effect-based onError with real error
- [ ] H3/H4 replace raw `fetch`/`window.location.href` with `useMutation`/next-navigation; redirect only after token stored
- [ ] C4 interim token hardening (one key set, drop dead sessionStorage writes, stop trusting client-decoded claims)
- [ ] H9 fix mobile nav (burger + useDisclosure handlers)
- [ ] Commit + dual adversarial review

## Phase 2 — Core foundation hardening

- [ ] H1 react/react-dom/react-query/zustand → peerDependencies in ui/admin
- [ ] H7 `sideEffects` + subpath exports for heavy Mantine domains
- [ ] M6 deep-merge QueryClientWrapper config; reconsider staleTime:0
- [ ] M7/M8 ColorSchemeScript + SSR-safe hooks + throttle resize + forceColorScheme
- [ ] M4 useDebounce + mantine-form-zod-resolver
- [ ] Commit + dual adversarial review + `pnpm build`

## Phase 3 — Missing framework primitives

- [ ] createResourceApi
- [ ] createQueryKeys
- [ ] useAppMutation
- [ ] column helpers (statusColumn/dateColumn/booleanColumn/rowActionsColumn/bilingualColumn + StatusBadge)
- [ ] RowActionsMenu + ReasonConfirmModal primitives
- [ ] ModuleErrorBoundary
- [ ] Commit + dual adversarial review

## Phase 4 — API-surface & type-safety

- [ ] H5 re-type modal/form contract (TRow/TCreate/TEdit; TFormValues)
- [ ] H6 remove Record<string,unknown> leak
- [ ] M1 collapse DataTableShellInner prop double-forward into context/config
- [ ] Extend FormShell/FormWrapper into real form contract; migrate ~15 forms
- [ ] Commit + dual adversarial review

## Phase 5 — Consolidation factory

- [ ] createListModule(config)
- [ ] Migrate 2–3 representative modules; update docs/AI.md
- [ ] Remaining perf/hygiene: M5 keepPreviousData, M9 CSV, M10 nested sort/search, M11 partial-delete invalidation, M12/M13 cleanup
- [ ] Commit + dual adversarial review + /visual-review
