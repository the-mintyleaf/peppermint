# Permission Catalog Module — AI Navigation Map

## Purpose

Staff-only, read-only browser for the `core.policy_engine` permission catalog:
search and filter available permission keys by app. Split out of the former
`access-tools/` tab module — Permission Catalog and Access Tester are now
independent sibling sub-modules, not tabs.

## Module type

Not-Contained (utility/reporting page). Gated with `RequireStaff`, wrapped in
`ModuleHeader` + `ModalPaper`.

## Route

`/admin/authenticate/permission-catalog`

## Entry files

- `PermissionCatalog.tsx` — `RequireStaff` + `ModuleHeader` + `ModalPaper` +
  `PermissionCatalogPanel`.
- `components/PermissionCatalogPanel.tsx` / `.hooks.ts` — the browse/search UI.
- `index.ts` — exports `ModulePermissionCatalog`.
- `app/admin/authenticate/permission-catalog/page.tsx` — one-line re-export.

## Data layer reuse — do not duplicate

Policy app/permission-tree data comes from the shared `_shared/policyTree.api.ts`,
`_shared/policyTree.queryKeys.ts`, and `_shared/policyTree.types.ts` — the same
layer other authenticate sub-modules use. Add new policy-tree query keys there,
not here.

## Backend endpoints

- `GET /api/v1/policy/apps/` → `PolicyApp[]` — app filter options.
- `GET /api/v1/policy/permissions/tree/?app=<key>` → `PolicyAppTree[]` — catalog
  data (server already excludes inactive/deprecated permissions).

## State ownership

- Catalog data + app list: React Query (`usePermissionCatalog`).
- Catalog search text + app filter: local `useState` in
  `PermissionCatalogPanel.hooks.ts`.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly.
- Do not duplicate the policy-tree fetch/query-key logic — reuse
  `_shared/policyTree.*`.
- Do not re-merge with Access Tester into one tabbed screen.
