# Organization Test-Tree — Offline Structure Builder Playground

Shared canvas + injected data-source seam so the test-tree and the real
Structure Builder render the exact same `StructureCanvas`.

## Phase 1 — Data-source seam (no behavior change)
- [ ] Create `_shared/structure-data/structureDataSource.types.ts` (interface + moved payload types)
- [ ] Re-export payload types from `structure/Structure.api.ts` for back-compat
- [ ] Create `_shared/structure-data/realStructureDataSource.ts` (wire existing api fns)
- [ ] Create `_shared/structure-data/StructureData.context.tsx` (context/provider/hook, default = real)
- [ ] Create `_shared/structure-data/index.ts` barrel
- [ ] Commit + dual adversarial review + fixes

## Phase 2 — Migrate call sites to the seam
- [ ] `structure/Structure.hooks.ts` → `useStructureData()` in every hook
- [ ] `structure/Structure.tsx` → extract exported `StructureCanvas`, wrap real `Structure` in provider
- [ ] `structure/components/InspectorPanel` → orgId from context
- [ ] `structure/components/AddMemberModal/AddMemberModal.hooks.ts` → dataSource
- [ ] `_shared/components/UnitPickerSelect/UnitPickerSelect.hooks.ts` → dataSource
- [ ] `structure/index.ts` → export `StructureCanvas`
- [ ] Verify real route unchanged (types/lint)
- [ ] Commit + dual adversarial review + fixes

## Phase 3 — In-memory mock data source
- [ ] `test-tree/testSeed.ts` — seeded org + unit tree + memberships + direct members
- [ ] `test-tree/mockStructureDataSource.ts` — factory, reset(), latency, projection, mutations
- [ ] Commit + dual adversarial review + fixes

## Phase 4 — test-tree module + wiring
- [ ] `test-tree/TestTree.tsx` — provider + ReactFlowProvider + banner + Reset
- [ ] `test-tree/index.ts` barrel
- [ ] `modules/admin/organization/index.ts` → add `testTree`
- [ ] `app/admin/organization/test-tree/page.tsx` re-export
- [ ] `config/nav/admin-nav.ts` → nav link
- [ ] Commit + dual adversarial review + fixes

## Phase 5 — Docs + verification
- [ ] Update `organization/docs/AI.md` (test-tree + data-source seam)
- [ ] Update `apps/mintflow/docs/AI.md` major modules table
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Final commit
