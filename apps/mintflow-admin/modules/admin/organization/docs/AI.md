# Organization Module AI Map

## Purpose

Full organization builder: institutions (`Organization`), their internal unit
hierarchy (`OrganizationUnit`), positions, member invitations/placement,
reporting lines, delegations, event history, and actor-context resolution.
Rebuilt from scratch against the real backend contract — see
`.todo/org-data-contract.md` (v1.5.0) for the authoritative field/endpoint list.

**Model rule (do not violate):** `Organization` is not the hierarchy —
`OrganizationUnit` is. Never let a screen create/nest an `Organization` as a
child of anything. All internal structure lives in `OrganizationUnit`.

**Bilingual fields (Nepal localization, do not violate):** human-readable names
are bilingual — `name_np` (Devanagari, canonical, **required**) + `name_en`
(English, independently canonical, optional); positions use `title_np`/`title_en`.
`*_romanized` is a backend-only search key — **never display or edit it**.
Render names with `_shared/components/BilingualName` (np primary line, muted en
secondary). Code validation: Organization `code` is uppercase `^[A-Z0-9_\-]+$`;
unit/position codes are ASCII-only. `country_code` is 2-letter ISO, uppercased.

## Module type

MultiPageModule. Every screen is `RequireStaff`-gated — 100% of the real
organization API is staff/superuser-only (confirmed in the recovered `API.md`).

## Routes

| Route                                                | Sub-module                       |
| ---------------------------------------------------- | -------------------------------- |
| `/admin/organization`                                | `organizations` (list, cards)    |
| `/admin/organization/[orgId]`                        | `organizations` (overview)       |
| `/admin/organization/[orgId]/structure`              | `structure`                      |
| `/admin/organization/[orgId]/positions`              | `positions`                      |
| `/admin/organization/[orgId]/members`                | `members` (list)                 |
| `/admin/organization/[orgId]/members/[membershipId]` | `members` (view)                 |
| `/admin/organization/[orgId]/reporting-lines`        | `reporting-lines`                |
| `/admin/organization/[orgId]/delegations`            | `delegations`                    |
| `/admin/organization/[orgId]/event-log`              | `event-log`                      |
| `/admin/organization/[orgId]/actor-context`          | `actor-context`                  |
| `/admin/organization/test-tree`                      | `test-tree` (offline playground) |

## Entry files

- `index.ts` — `ModuleOrganization = { main, overview, structure, testTree, positions, members, reportingLines, delegations, eventLog, actorContext }`
- `_shared/organization.types.ts` — all 12 backend entities + enum unions (bilingual `*_np`/`*_en`/`*_romanized` name fields), the single source of truth for domain types
- `_shared/organization.api.ts` / `.queryKeys.ts` — cross-sub-module fetchers (unit tree, flat units list)

## Common edit targets

| Task                               | Files                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Add/change a domain field or enum  | `_shared/organization.types.ts` (update here first, everything else imports from it)                                     |
| Organization list/create/activate  | `organizations/`                                                                                                         |
| Unit tree canvas                   | `structure/Structure.tsx` (`StructureCanvas`), `.store.ts`, `.hooks.ts`, `.api.ts`, `.utils.ts`                          |
| Offline canvas playground          | `test-tree/` — renders the shared `StructureCanvas` off an in-memory mock (`mockStructureDataSource.ts` + `testSeed.ts`) |
| Swap/extend the canvas data layer  | `_shared/structure-data/` (`StructureDataSource` interface, `realStructureDataSource`, `StructureDataProvider`)          |
| Position CRUD                      | `positions/`                                                                                                             |
| Member invite/status/placement     | `members/` — `pages/view/components/UnitMembershipsTab`, `PositionAssignmentsTab`                                        |
| Reporting lines / chain of command | `reporting-lines/`                                                                                                       |
| Delegations                        | `delegations/`                                                                                                           |
| Event log                          | `event-log/` (read-only, no create/edit/delete UI — matches the real API)                                                |
| Actor context preview              | `actor-context/`                                                                                                         |
| Unit/position/assignment pickers   | `_shared/components/{UnitPickerSelect,PositionPickerSelect,AssignmentPickerSelect}`                                      |
| Status badges                      | `_shared/components/{OrganizationStatusBadge,MembershipStatusBadge}`                                                     |
| Bilingual name/title display       | `_shared/components/BilingualName` (`np` primary + muted `en`; never pass `*_romanized`)                                 |
| API error message copy             | `apps/mintflow/lib/authErrorMessages.ts` (shared app-wide dictionary — organization codes are prefixed `ORGANIZATION_*`) |
| Nav entries                        | `apps/mintflow/config/nav/admin-nav.ts`                                                                                  |

## State ownership

- Server data: React Query throughout. Query keys live in each sub-module's `<name>.queryKeys.ts`, or `_shared/organization.queryKeys.ts` when shared.
- Currently selected organization: `apps/mintflow/stores/selectedOrg.store.ts` (Zustand + persist). Single-writer rule — only `organizations/pages/list/OrganizationsList.tsx` calls `setOrg`.
- Structure canvas interaction state (selection, inspector panel open/close, modals, expand/collapse, focus branch, search-hit highlight): `structure/Structure.store.ts` (`panelOpen`/`closePanel`). The typed search query itself is local `useState` in `Structure.tsx` (debounced → server search), not store state. No undo/redo — every canvas action is a real backend mutation, not a staged client edit, so there is no local "unsaved" state to revert.
- Everything else: local `useState`, no dedicated stores needed.

## Structure data-source seam

The Structure Builder canvas is `StructureCanvas` (exported from `structure/`). It
never imports an axios fetcher directly — every read/write goes through
`useStructureData()` (from `_shared/structure-data/`), which returns
`{ orgId, dataSource }`. The context **defaults to the real axios source**
(`realStructureDataSource`), so any consumer with no provider — including the shared
`UnitPickerSelect` used by the positions/delegations/member forms — behaves exactly
as before.

- Real builder: `structure/Structure.tsx` wraps `StructureCanvas` in
  `StructureDataProvider` with `orgId` from `useParams` (source defaults to real).
- Offline playground: `test-tree/TestTree.tsx` wraps the SAME `StructureCanvas` in a
  provider seeded with a distinct `TEST_ORG_ID` and an in-memory `dataSource` — so
  UI/interaction work on the canvas carries over to both automatically. Query keys
  are unchanged, so the cache-patching in `Structure.hooks.ts` works for both; the
  fake `TEST_ORG_ID` keeps the playground's React Query cache isolated from real orgs.

To add a data call to the canvas: add it to the `StructureDataSource` interface,
implement it in `realStructureDataSource.ts` **and** `mockStructureDataSource.ts`,
then call it via `useStructureData().dataSource`.

## Known constraints

- The Structure Builder loads the unit tree **lazily** off the flat primary endpoint `GET /organizations/<id>/unit-tree-nodes/` (NOT the nested `/unit-tree/`). Initial render fetches only top-level units (`fetchUnitRoots` → `?max_depth=0`); expanding a unit fetches one level of children **with members** (`fetchUnitChildren` → `?root_unit_id=<id>&max_depth=1&include_members=true`), one React-Query per open branch (`useQueries` in `Structure.tsx`, cache keys `unitRoots`/`unitChildren`). Neither fetch sends `status` — the builder is an editing surface and must show `draft`/`inactive` units, not just `active` (filtering to active hides freshly-created units). **Positions and position holders are NOT rendered on the canvas.** Each direct member (`unit_members`) renders as its **own node** (`components/nodes/MemberNode`) hanging off its unit — `buildGraphFromFlatNodes` emits one member node + edge per `unit_members` entry; they become visible when the unit is expanded (expand is gated on `has_children || directMemberCount > 0`). There is no "expand all" (it would recurse-fetch the whole org). The flat DTOs live in `_shared/organization.types.ts`: `UnitTreeNodeFlat`, `UnitMember` (positions/holders still arrive in the payload but are unused by the canvas). Every unit node also carries lightweight aggregates — `child_count`, `member_count`, optional `descendant_count` — rendered as badges (and the org-wide total on the root); they ride on the cheap `max_depth=0` fetch, no extra request.
- Jump-to-node search is **server-side**: `searchUnits` → `GET /organizations/<id>/units/search/?q=&limit=` returns hits with a root→node ancestor `path`; `useUnitSearch` (debounced, `enabled` at ≥2 chars) backs the Toolbar Select, and selecting a hit lazily expands each `path` ancestor then centers on the node. The client cannot find collapsed/unloaded units any other way.
- Unit CRUD mutations return `UnitMutationResult { node, affected_parents }` and update the cache **in place** (`applyUnitMutationResult` in `Structure.hooks.ts` → `patchNodeFieldsInList`/`patchParentsInList`); create/move refetch only the touched branches + roots, not the whole tree. Falls back to broad invalidation if a mutation response lacks the shape.
- `UnitMembership` (users placed in a unit without a position) surfaces via `unit_members` on `include_members` nodes and renders as its own `MemberNode` off the unit. The canvas can **add** one: the "Add member" action (on the `UnitNode` hover bar and the `InspectorPanel`) opens `structure/components/AddMemberModal`, which picks an existing org membership and calls `createUnitMembership(membershipId, { unit_id })`, then invalidates open `unit-children` branches so the new member node appears. Position-based assignment is still done in the Members section, not the canvas.
- Positions have no org-wide list endpoint — only `GET /units/<unit_id>/positions/`. Every position picker (`PositionPickerSelect`, `AssignmentPickerSelect`) is a two/three-step unit → position (→ holder) picker, not a flat search.
- `fetchUserSummary` (`members/members.api.ts`) hits `GET /api/v1/auth/users/<id>/`, which is not documented in the organization API but inferred from the sibling `PATCH` endpoint already used in `authenticate/users/users.api.ts`.
- Checklist §17 "Invited User Acceptance UI" (self-service accept/decline) is now built as a **separate top-level module** — `apps/mintflow/modules/invitations/` (route `app/invitations/`), backed by `GET /organization/memberships/mine/` + `accept`/`decline`. It is self-service (not staff-gated), so it lives outside this admin module. All `OrganizationSite` screens remain **not built** — `OrganizationSite` has a service function but no public API per the recovered `API.md`.

## Do not do

- Do not create sibling sub-modules (`organization-positions/` next to `organization/`) — always nest inside the parent (`organization/positions/`).
- Do not let the Structure Builder canvas create/edit an `Organization` node as a child of anything — the org root is read-only there; editing happens on the Overview screen only.
- Do not add a hard-delete action anywhere in this module — the backend forbids it. Use deactivate/end/revoke with a reason instead.
- Do not fetch in `useEffect` or call Axios directly in a handler — `useQuery`/`useMutation` only.
- Do not import `@mantine/*` directly — always `@peppermint/ui`.
- Do not rebuild self-service invitation-acceptance UI here — it lives in the top-level `modules/invitations/` module (see Known constraints above).
