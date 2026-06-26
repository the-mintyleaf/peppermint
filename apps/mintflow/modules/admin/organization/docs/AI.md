# Organization Module — AI Navigation Map

## Purpose

Manages organizational entities and their internal structure: org list, org units, positions, memberships, sites, delegations, and event history. Entry point for the org-tree canvas builder.

## Module type

Composite — contains multiple ContainedModules (one route each) and one specialized canvas module (organization-tree).

## Routes

| Route | Module | Description |
|---|---|---|
| `/admin/organization` | `ModuleOrganizations` | Org list — create/edit/status-change |
| `/admin/organization/[id]/structure` | `ModuleOrganizationTree` | Org tree canvas builder |
| `/admin/organization/[id]/positions` | `ModulePositions` | Position list — deactivate action |
| `/admin/organization/[id]/members` | `ModulePeople` | Membership list — create/status-change/profile drawer |
| `/admin/organization/[id]/sites` | `ModuleSites` | Site list — create (no public API yet; mock only) |
| `/admin/organization/[id]/delegations` | `ModuleDelegations` | Delegation list — create/revoke |
| `/admin/organization/[id]/event-log` | `ModuleHistory` | Event log — read-only |

## Sidebar navigation

Sidebar is dynamic — driven by `useSelectedOrgStore` (at `apps/mintflow/stores/selectedOrg.store.ts`).

- No org selected: sidebar shows only "Organizations" link.
- Org selected: sidebar adds a second group labelled with the org name, containing links to all 6 sub-routes.
- "Manage" button in the org list writes to the store and navigates to `/structure`.
- Config factory: `apps/mintflow/config/nav/admin-nav.ts` → `buildAdminConfig(org)`.

## Sub-module index

| Sub-module | Path | Entry export |
|---|---|---|
| Shared primitives | `_shared/` | `StatusBadge`, `ReasonConfirmDialog`, `PositionPicker`, `UnitPicker`, `EventLogList`, `UserPicker` |
| Organizations list | `organizations/` | `ModuleOrganizations` |
| Org tree canvas | `organization-tree/` | `ModuleOrganizationTree` |
| Positions | `positions/` | `ModulePositions` |
| People / Members | `people/` | `ModulePeople` |
| Sites | `sites/` | `ModuleSites` |
| Delegations | `delegations/` | `ModuleDelegations` |
| Event log | `history/` | `ModuleHistory` |

## Common edit targets

| Task | Files |
|---|---|
| Org list UI | `organizations/pages/list/OrganizationsList.tsx` |
| Org list columns | `organizations/pages/list/organizations.columns.tsx` |
| Org form | `organizations/form/OrganizationsForm.tsx` |
| Org queries | `organizations/organizations.queryKeys.ts`, `organizations/organizations.api.ts` |
| Org tree canvas | `organization-tree/OrganizationTree.tsx` |
| Org tree state | `organization-tree/OrganizationTree.store.ts` |
| Org tree data layer | `organization-tree/OrganizationTree.hooks.ts`, `organization-tree/OrganizationTree.api.ts` |
| Positions list | `positions/pages/list/PositionsList.tsx` |
| Members list | `people/pages/list/PeopleList.tsx` |
| Member profile drawer | `people/components/PeopleProfileDrawer/` |
| Sites list | `sites/pages/list/SitesList.tsx` |
| Delegations list | `delegations/pages/list/DelegationsList.tsx` |
| Event log | `history/pages/list/HistoryList.tsx` |
| Status/type labels | `organization.constants.ts` |
| Shared status badge | `_shared/StatusBadge/StatusBadge.tsx` |
| Sidebar config | `apps/mintflow/config/nav/admin-nav.ts` |
| Selected org store | `apps/mintflow/stores/selectedOrg.store.ts` |

## State ownership

| State | Location |
|---|---|
| Org list / detail server data | React Query, keys in each sub-module's `.queryKeys.ts` |
| Currently selected org (sidebar context) | `apps/mintflow/stores/selectedOrg.store.ts` (Zustand + `persist`) |
| Org tree canvas interaction | `organization-tree/OrganizationTree.store.ts` (Zustand) |
| People profile drawer open | `useState` in `PeopleList.tsx` |
| Status-change confirm dialog | `useState` in each list component |
| Event log page + filter state | `useState` in `HistoryList.tsx` |

## Query key namespace

All keys begin with `["org-structure", ...]`:

```
["org-structure", "organizations", ...params]
["org-structure", "positions", orgId, unitId?, ...params]
["org-structure", "people", orgId, ...params]
["org-structure", "sites", orgId]
["org-structure", "delegations", orgId, ...params]
["org-structure", "history", orgId, ...params]
["org-structure", "builder", "graph", orgId]
```

## Shared primitives (`_shared/`)

Always use these — do not re-implement per sub-module.

| Primitive | Use for |
|---|---|
| `StatusBadge` | Any status field — auto-resolves label/color from internal maps; no custom props |
| `ReasonConfirmDialog` | Any destructive or status-change action requiring a reason string |
| `PositionPicker` | Position assignment selects in forms |
| `UnitPicker` | Org unit selects in forms |
| `UserPicker` | User search selects in forms (people module) |
| `EventLogList` | Read-only event feed — used by history module |

## API status

| Sub-module | API status |
|---|---|
| Organizations | Real endpoints — mock in dev |
| Positions | Real endpoints — mock in dev |
| People / Members | Real endpoints — mock in dev |
| Delegations | Real endpoints — mock in dev |
| Event log | Real endpoints — mock in dev |
| Sites | **No public API in v1.0** — mock only; endpoints planned |
| Org tree | Stubs in `OrganizationTree.api.ts`; real: `GET /organizations/<id>/unit-tree/` |

## Do not do

- Do not import Mantine directly — always use `@peppermint/ui`.
- Do not fetch in `useEffect` — use `useQuery`.
- Do not add a `labels=` or `colors=` prop to `StatusBadge` — it resolves those internally.
- Do not create a new sub-module at the org root as a sibling — nest inside `organization/`.
- Do not create route logic in `app/admin/organization/[id]/layout.tsx` — it is a passthrough (`<>{children}</>`).
- Do not write to `useSelectedOrgStore` from anywhere except `OrganizationsList.tsx` (the "Manage" button).
- Do not add a new Zustand store without checking whether `selectedOrg.store.ts` or the tree store covers the need.
