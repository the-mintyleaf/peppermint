# Organization Structure Builder — Lazy Tree + Members Fix

## Phase 1 — Data layer (flat endpoint + member types)

- [x] Replace nested `UnitTreeNode` with flat `UnitTreeNodeFlat` + add `UnitPositionNode` / `PositionHolder` in `_shared/organization.types.ts`
- [x] Replace `fetchUnitTree` with `fetchUnitRoots` + `fetchUnitChildren` in `_shared/organization.api.ts`
- [x] Add `unitRoots` / `unitChildren` query keys in `_shared/organization.queryKeys.ts`
- [x] Repoint Overview setup-progress (`OrganizationOverview.hooks.ts`) to `fetchUnitRoots`

## Phase 2 — Canvas graph build + lazy data flow

- [x] `Structure.utils.ts`: replace `buildGraphFromTree` → `buildGraphFromFlatNodes`; make `autoArrangeNodes` height-aware
- [x] `Structure.types.ts`: add `positions` + `_childrenLoading` to `UnitNodeData`
- [x] `Structure.hooks.ts`: add `useUnitRoots`, remove `useUnitTree`, repoint invalidations to `["organizations", orgId]` prefix
- [x] `Structure.tsx`: `useUnitRoots` + `useQueries` per expanded unit; aggregate flat node map; inject positions/loading; init org expanded

## Phase 3 — Node rendering (members inline + expand)

- [x] `UnitNode.tsx`: expand caret with loading spinner; inline members section (positions + holder chips / "No members")
- [x] `Structure.module.css`: member section styles
- [x] `Toolbar`: drop the "Expand all" control (keep collapse-all/refresh)

## Phase 4 — Docs + verification

- [x] Update module `docs/AI.md`
- [x] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Commit per repo format + dual adversarial review on diff
