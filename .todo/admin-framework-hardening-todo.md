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
- [x] Verify (ui/api-client/utils green; 2 pre-existing admin errors scheduled Phase 2/4), commit (2958b83) + dual adversarial review (Codex + Opus) + apply fixes (5ab03a2)

**Phase 0 DONE.** Both reviewers confirmed a faithful, regression-free refactor. Fixes applied: refresh-queue rejects parked requests on failure; tightened refresh-parse; doc drift corrected.

## Phase 1 — Correctness & security ✅ DONE (commits 1fbbccc, c8e0e58, 7916a26)

- [x] C1 apply `store.filters` in client pipeline (new clientFilter util)
- [x] C2 additive cross-page selection (diff page ids vs reactive selection Set)
- [x] C3 wire `onNavigate` (AdminShellConfig → Navbar → MainNav; app passes router.push)
- [x] H2 real error state (EmptyState error variant) + single-fire effect-based onError with real error
- [x] H3 raw `fetch` → `useMutation` in SignInPage + PasswordChangePage
- [~] H4 window.location.href — DEFERRED to Phase 4 (only 1 read-only non-modal DataTableShell consumer; folds into shell-API rework)
- [x] C4 interim token hardening (single key set via src/auth/authStorage; removed dead sessionStorage/decodeJWT/token_payload/user_data/meApi; redirect only after token stored)
- [x] H9 mobile nav (useDisclosure handlers + contrasting Burger + close-on-route)
- [x] Commit + dual adversarial review (Codex + Opus) + apply fixes (empty-array filter, filter-menu 0, onError single-fire, burger contrast, authStorage relocation)

**Deferred to Phase 4:** H4; filter key≠accessor divergence; post-forceFilter selection derivation.

## Phase 2 — Core foundation hardening ✅ DONE (commits ee519b5, ee4940e)

- [x] H1 react/react-dom/react-query/zustand → peerDependencies in ui/admin (ranges pinned to majors); dropped unused next/framer-motion from ui
- [x] H7 `sideEffects` (incl. subpath entries) + subpath exports @peppermint/ui/{charts,editor,carousel,code-highlight,dropzone} with co-located CSS; migrated 1 consumer
- [x] M6 deep-merge QueryClientWrapper config; staleTime 0 → 30s
- [x] M8 SSR-safe useLocalStorage/useWindowSize (no init-time browser reads) + rAF-throttled resize; initial-ref in storage effect
- [~] M7 ColorSchemeScript/mantineHtmlProps already handled in app root LayoutApp; forceColorScheme left intentional (shell is light-only)
- [x] M4 zodResolver parses once/pass; DataTableWrapper debounce → useDebounce (client-mode gated)
- [x] BONUS: greened the last 2 pre-existing type errors (PageBreadcrumb phosphor csr imports; queryKey typeof narrow) — `turbo check-types` + `turbo build` fully GREEN
- [x] Commit + dual adversarial review (Codex + Opus, no high/med findings) + apply 4 low fixes + `pnpm build` ✓

## Phase 3 — Missing framework primitives ✅ DONE (commits fbe1475, c92f0c4)

- [x] createResourceApi (src/data) — list/get/create/update/remove/action + meta.count→total + DRF ordering; injects app HTTP client
- [x] createQueryKeys (src/data) — typed array-form keys
- [x] useAppMutation + configureAppMutations (src/data) — mutation + notify + invalidate + injected error resolver
- [x] column helpers (src/columns) — StatusBadge + statusColumn/dateColumn/booleanColumn + rowActionsColumn
- [x] RowActionsMenu + openReasonConfirmModal (src/actions)
- [x] ModuleErrorBoundary (src/feedback) — module-level boundary w/ resetKeys
- [~] bilingualColumn — SKIPPED (too app-specific; app keeps BilingualName)
- [x] usage-doc/admin/primitives.md
- [x] Commit + dual adversarial review (Codex + Opus) + apply fixes (null/invalid column values, Fragment menu items, unique modal id + catch, filters-before-reserved, resetKeys)

**Purely additive** — no app behavior change; modules adopt these in Phase 5. `configureAppMutations` wired during migration.

## Phase 4 — API-surface & type-safety

- [x] H5 re-type modal/form contract (ModalFormComponentProps<TRecord,TFormValues>; ModalTableShell<TRow,TCreate,TEdit>) — commits 51a0388, 0eb774e; dual-reviewed (backward-compat + runtime preservation confirmed)
- [x] H5 migrated 3 representative consumers (grants/denials/bindings) — forms fully de-casted; runtime byte-identical
- [ ] H5 sweep the remaining ~17 consumers' now-removable casts (incremental; they compile as-is)
- [ ] H6 remove Record<string,unknown> leak (21 forced index signatures) — DEEP/risky
- [ ] M1 collapse DataTableShellInner prop double-forward into context/config
- [ ] Extend FormShell/FormWrapper into real form contract; migrate ~15 forms — LARGE
- [ ] Commit + dual adversarial review (done for H5 core)

### ⚠️ FLAGGED — pre-existing wire bug surfaced by H5 (needs backend confirmation)

`GrantsList` POSTs `approved_by_id` but `GrantCreatePayload`/backend expects `approved_by`
→ a selected approver is silently dropped on grant creation. Predates this work; NOT
changed by the migration. Fix requires confirming the backend field name (docs/backend).

## Phase 5 — Consolidation factory

- [ ] createListModule(config)
- [ ] Migrate 2–3 representative modules; update docs/AI.md
- [ ] Remaining perf/hygiene: M5 keepPreviousData, M9 CSV, M10 nested sort/search, M11 partial-delete invalidation, M12/M13 cleanup
- [ ] Commit + dual adversarial review + /visual-review
