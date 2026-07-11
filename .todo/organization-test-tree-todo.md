# Organization Test-Tree — Offline Structure Builder Playground

Shared canvas + injected data-source seam so the test-tree and the real
Structure Builder render the exact same `StructureCanvas`.

## Phase 1 — Data-source seam (no behavior change)

- [x] Create `_shared/structure-data/structureDataSource.types.ts` (interface + moved payload types)
- [x] Re-export payload types from `structure/Structure.api.ts` for back-compat
- [x] Create `_shared/structure-data/realStructureDataSource.ts` (wire existing api fns)
- [x] Create `_shared/structure-data/StructureData.context.tsx` (context/provider/hook, default = real)
- [x] Create `_shared/structure-data/index.ts` barrel
- [x] Commit (review folded into Phase 2)

## Phase 2 — Migrate call sites to the seam

- [x] `structure/Structure.hooks.ts` → `useStructureData()` in every hook
- [x] `structure/Structure.tsx` → extract exported `StructureCanvas`, wrap real `Structure` in provider
- [x] `structure/components/InspectorPanel` → orgId from context
- [x] `structure/components/AddMemberModal/AddMemberModal.hooks.ts` → dataSource
- [x] `_shared/components/UnitPickerSelect/UnitPickerSelect.hooks.ts` → dataSource
- [x] `structure/index.ts` → export `StructureCanvas`
- [x] Verify real route unchanged (types/lint)
- [x] Commit + dual adversarial review (clean) + fixes

## Phase 3 — In-memory mock data source

- [x] `test-tree/testSeed.ts` — seeded org + unit tree + memberships + direct members
- [x] `test-tree/mockStructureDataSource.ts` — factory, reset(), latency, projection, mutations
- [x] Commit
- [ ] Apply dual-review fixes (reset race, duplicate member node id, key scoping, not-found)

## Phase 4 — test-tree module + wiring

- [x] `test-tree/TestTree.tsx` — provider + ReactFlowProvider + banner + Reset
- [x] `test-tree/index.ts` barrel
- [x] `modules/admin/organization/index.ts` → add `testTree`
- [x] `app/admin/organization/test-tree/page.tsx` re-export
- [x] `config/nav/admin-nav.ts` → nav link
- [x] Commit
- [ ] Apply dual-review fixes + re-commit

## Phase 5 — Docs + verification

- [ ] Update `organization/docs/AI.md` (test-tree + data-source seam)
- [ ] Update `apps/mintflow/docs/AI.md` major modules table
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Final commit
