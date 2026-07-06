# Access Tester Module — AI Navigation Map

## Purpose

Staff-only diagnostic to check/explain a user's effective access for a given
permission key and scope, against `core.policy_engine`. Read-only — no CRUD.
Split out of the former `access-tools/` tab module — Permission Catalog and
Access Tester are now independent sibling sub-modules, not tabs.

## Module type

Not-Contained (utility/reporting page). Gated with `RequireStaff`, wrapped in
`ModuleHeader` + `ModalPaper`.

## Route

`/admin/authenticate/access-tester`

## Entry files

- `AccessTester.tsx` — `RequireStaff` + `ModuleHeader` + `ModalPaper` +
  `AccessTesterPanel`.
- `components/AccessTesterPanel.tsx` / `.hooks.ts` — the check/explain UI.
- `access-tester.api.ts` — `checkAccess` / `explainAccess` calls.
- `access-tester.types.ts` — `AccessCheckRequest`, `AccessDecision`.
- `index.ts` — exports `ModuleAccessTester`.
- `app/admin/authenticate/access-tester/page.tsx` — one-line re-export.

## Shared component reuse — do not duplicate

`UserPicker`, `PermissionKeyPicker`, and `ScopeFields` are shared `_shared/`
components — extend them there if a field needs to change, not by forking.

## Backend endpoints

- `GET /api/v1/auth/me/` → default subject user for the tester.
- `POST /api/v1/permissions/check/` and `POST /api/v1/permissions/explain/` —
  identical request body `{permission_key, subject_user_id, organization_id,
organization_unit_id}`; identical `AccessDecision` response. A `deny` decision
  is a normal 200 response, not an error.

## State ownership

- Tester form fields (subject user, permission key, scope): `@mantine/form` via
  `useForm`, seeded with the current staff user as default subject once
  `useCurrentUser` resolves (outer component shows a loader, inner form mounts
  with `key={user.id}` once data is ready).
- Check/Explain mutations and last result: `useAccessTester` in
  `components/AccessTesterPanel.hooks.ts` (local `useState` for the result
  payload + which action produced it — both endpoints share one result panel).

## Do not do

- Do not fetch data in `useEffect` — the current-user default goes through
  `useQuery`.
- Do not import from `@mantine/*` directly.
- Do not call `api` directly from a component — go through `access-tester.api.ts`.
- Do not render a `deny` decision as an error/toast — it's a valid, calm result
  state in the same panel as `allow`, just red instead of green.
- Do not re-merge with Permission Catalog into one tabbed screen.
