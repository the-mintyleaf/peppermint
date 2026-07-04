# Access Tools Module — AI Navigation Map

## Purpose

Staff-only diagnostic page for `core.policy_engine`: browse the permission
catalog and check/explain a user's effective access. Read-only — no CRUD.

## Module type

Not-Contained (utility/reporting page — two tabs of composed panels, no
admin shell). Gated with `RequireStaff`.

## Route

`/admin/authenticate/access-tools`

## Entry files

- `AccessToolsView.tsx` — `RequireStaff` + `ModuleHeader` + `ModalPaper` with
  a two-tab `Tabs`.
- `index.ts` — exports `ModuleAccessTools`.
- `app/admin/authenticate/access-tools/page.tsx` — one-line re-export.

## Common edit targets

| Task                                   | Files                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Permission Catalog tab (browse/search) | `components/PermissionCatalogPanel.tsx`, `components/PermissionCatalogPanel.hooks.ts` |
| Access Tester tab (check/explain)      | `components/AccessTesterPanel.tsx`, `components/AccessTesterPanel.hooks.ts`           |
| Check/Explain API calls                | `access-tools.api.ts`                                                                 |
| Types                                  | `access-tools.types.ts`                                                               |

## Data layer reuse — do not duplicate

- Policy app/permission tree data comes from the shared
  `_shared/policyTree.api.ts`, `_shared/policyTree.queryKeys.ts`, and
  `_shared/policyTree.types.ts` — the same layer other authenticate
  sub-modules use. Add new policy-tree query keys there, not here.
- `UserPicker`, `PermissionKeyPicker`, and `ScopeFields` are shared
  `_shared/` components — extend them there if a field needs to change, not
  by forking a local copy.

## Backend endpoints

- `GET /api/v1/policy/apps/` → `PolicyApp[]` — app filter options.
- `GET /api/v1/policy/permissions/tree/?app=<key>` → `PolicyAppTree[]` —
  catalog data (server already excludes inactive/deprecated permissions).
- `GET /api/v1/auth/me/` → default subject user for the tester.
- `POST /api/v1/permissions/check/` and `POST /api/v1/permissions/explain/`
  — identical request body `{permission_key, subject_user_id,
organization_id, organization_unit_id}`; identical `AccessDecision`
  response. A `deny` decision is a normal 200 response, not an error.

## State ownership

- Catalog data + app list: React Query (`usePermissionCatalog`).
- Catalog search text + app filter: local `useState` inside
  `PermissionCatalogPanel.hooks.ts`.
- Tester form fields (subject user, permission key, scope): `@mantine/form`
  via `useForm`, seeded with the current staff user as the default subject
  once `useCurrentUser` resolves (mirrors `account-security`'s
  `ProfileCard`/`ProfileForm` pattern — outer component shows a loader,
  inner form mounts with `key={user.id}` once data is ready).
- Check/Explain mutations and last result: `useAccessTester` in
  `components/AccessTesterPanel.hooks.ts` (local `useState` for the result
  payload + which action produced it, since both endpoints share one result
  panel).

## Do not do

- Do not fetch data in `useEffect` — table/catalog data and the current-user
  default both go through `useQuery`.
- Do not import from `@mantine/*` directly.
- Do not call `api` directly from a component — go through
  `access-tools.api.ts`.
- Do not render a `deny` decision as an error/toast — it's a valid, calm
  result state in the same panel as `allow`, just red instead of green.
- Do not duplicate the policy-tree fetch/query-key logic — reuse
  `_shared/policyTree.*`.
