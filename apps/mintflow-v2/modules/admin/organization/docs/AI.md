# Organization Module — AI Navigation Map

## Purpose

Manages the full organizational hierarchy: organizations, departments, accounts, users, roles, invitations, sessions, and audit logs. Includes a canvas-based org-tree visualizer for navigating and editing org structure interactively.

Full implementation details: `docs/README.md` (629 lines — read for internals, graph algorithms, and performance architecture).

---

## Module type

MultiPageModule

---

## Routes

| Route | Module file |
|---|---|
| `/admin/organization` | `pages/home/` |
| `/admin/organization/new` | `pages/new/` |
| `/admin/organization/[id]` | `pages/view/` |
| `/admin/organization/[id]/edit` | `pages/edit/` |
| `/admin/organization/archived` | `pages/archived/` |
| `/admin/organization/structure` | `organization-tree/` |
| `/admin/organization/accounts` | `accounts/pages/list/` |
| `/admin/organization/accounts/new` | `accounts/pages/new/` |
| `/admin/organization/accounts/[id]` | `accounts/pages/view/` |
| `/admin/organization/accounts/[id]/edit` | `accounts/pages/edit/` |
| `/admin/organization/roles` | `roles/pages/list/` |
| `/admin/organization/departments` | `departments/` |
| `/admin/organization/users` | `users/` |
| `/admin/organization/sessions` | `sessions/` |
| `/admin/organization/audit-logs` | `audit-logs/` |
| `/admin/organization/invitations` | `invitations/` |

---

## Entry files

- `index.tsx` — module root export
- `module.api.ts` — shared API functions for the organization module
- `organizationUnit.types.ts` — shared entity types
- `organizationUnit.constants.ts` — shared constants

---

## Sub-module structure

```
modules/admin/organization/
├── index.tsx                          # module entry
├── module.api.ts                      # shared API
├── organizationUnit.types.ts          # shared types
├── organizationUnit.constants.ts      # shared constants
├── _shared/
│   └── PermissionsMatrix/             # shared permissions UI component
├── accounts/                          # account sub-module
│   ├── form/steps/                    # multi-step account form
│   └── pages/ (list, new, view, edit)
├── audit-logs/                        # audit log viewer
├── departments/                       # department management
├── form/                              # org unit form
│   ├── steps/                         # multi-step form steps
│   ├── orgUnitForm.types.ts
│   ├── orgUnitForm.schemas.ts
│   └── orgUnitForm.initial.ts
├── invitations/                       # invitation management
├── organization-tree/                 # canvas org-tree visualizer (most complex)
│   ├── OrganizationTree.tsx           # main canvas component
│   ├── OrganizationTree.store.ts      # Zustand store — all tree interaction state
│   ├── OrganizationTree.utils.ts      # graph utilities (30+ functions)
│   ├── OrganizationTree.types.ts      # tree-specific types
│   ├── OrganizationTree.module.css    # canvas styles
│   ├── OrganizationTree.demoData.ts   # demo/mock data
│   ├── components/
│   │   ├── nodes/ (DepartmentNode, GroupNode, OrgNode, PersonNode)
│   │   ├── AnalyticsPanel/
│   │   ├── BreadcrumbNav/
│   │   ├── DepartmentDrawer/
│   │   ├── EmptyState/
│   │   ├── FiltersPanel/
│   │   ├── GroupListDrawer/
│   │   ├── ImpactPreviewModal/
│   │   ├── InspectorPanel/
│   │   ├── NodeFormModal/
│   │   ├── OrgDrawer/
│   │   ├── PersonDrawer/
│   │   └── Toolbar/
│   └── docs/
│       ├── AI.md                      # this file
│       └── README.md                  # full implementation reference
├── pages/ (home, list, new, edit, view, archived)
├── placeholder/
├── roles/ (form, pages/list)
├── sessions/
└── users/
```

---

## Common edit targets

| Task | Files |
|---|---|
| Org tree canvas rendering | `organization-tree/OrganizationTree.tsx` |
| Org tree interaction state | `organization-tree/OrganizationTree.store.ts` |
| Org tree graph logic / utilities | `organization-tree/OrganizationTree.utils.ts` |
| Org node types (Org/Dept/Person/Group) | `organization-tree/components/nodes/<NodeType>/` |
| Inspector panel (right sidebar) | `organization-tree/components/InspectorPanel/` |
| Filters panel | `organization-tree/components/FiltersPanel/` |
| Analytics panel | `organization-tree/components/AnalyticsPanel/` |
| Toolbar | `organization-tree/components/Toolbar/` |
| Node create/edit modal | `organization-tree/components/NodeFormModal/` |
| Impact preview (bulk changes) | `organization-tree/components/ImpactPreviewModal/` |
| Department drawer | `organization-tree/components/DepartmentDrawer/` |
| Person/Org/Group drawers | `organization-tree/components/PersonDrawer/`, `OrgDrawer/`, `GroupListDrawer/` |
| Breadcrumb navigation | `organization-tree/components/BreadcrumbNav/` |
| Accounts list/create/edit/view | `accounts/pages/` |
| Account form steps | `accounts/form/steps/` |
| Roles list | `roles/pages/list/` |
| Org unit form | `form/` + `form/steps/` |
| Shared entity types | `organizationUnit.types.ts` |
| Shared API functions | `module.api.ts` |
| Permissions matrix | `_shared/PermissionsMatrix/` |

---

## State ownership

| State | Owner | Location |
|---|---|---|
| Server data (orgs, depts, accounts, roles) | React Query | `module.api.ts`, sub-module `.api.ts` files |
| Tree node positions, selections, drag state | Zustand | `organization-tree/OrganizationTree.store.ts` |
| Drawer/modal open state (tree-scoped) | Local `useState` or tree store | inside relevant component |
| Filters, pagination, selected entity ID | URL search params | — |
| Org unit form state | `@mantine/form` via `FormWrapper` | `form/` |

---

## Performance notes

The org-tree uses `graphMaps` (derived index structures) for O(1) node lookups. Do not re-derive these in render. Read `docs/README.md` for the full performance architecture before adding state or traversal logic.

Canvas-heavy rendering: avoid unnecessary re-renders in node components. Check existing memoization patterns before adding new ones.

---

## Do not do

- Do not create `organization-roles/` as a sibling — roles live at `organization/roles/`.
- Do not fetch data in `useEffect` — all server data goes through React Query.
- Do not import from `@mantine/*` directly — use `@peppermint/ui`.
- Do not duplicate tree interaction state into a new Zustand store — use `OrganizationTree.store.ts`.
- Do not add graph traversal logic inline in components — add it to `OrganizationTree.utils.ts`.
- Do not add new node types without checking the existing 4 node patterns first (OrgNode, DepartmentNode, PersonNode, GroupNode).
- Do not rewrite the full AI.md when making small changes — update only the stale sections.

---

## Read next

- `docs/README.md` — full implementation reference (graph model, store shape, utility functions, data flows, performance architecture)
- `organization-tree/OrganizationTree.store.ts` — full Zustand state shape
- `organization-tree/OrganizationTree.utils.ts` — graph utility function index
