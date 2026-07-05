# Mintflow — AI Navigation Map

## App purpose

Task and organization management admin. Handles organization structure, department/account/role management, org-tree visualization, and task tracking with analytics, kanban, and general list views.

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, Zustand, `@peppermint/admin` shells.

---

## Read by task type

| Task                  | Read first                                                                            | Then inspect                                        |
| --------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Edit visual design    | `docs/design/DESIGN.md`, `docs/design/design-system.md` (pending — create if missing) | target component only                               |
| Add UI component      | `@peppermint/ui` exports, `@peppermint/admin` exports                                 | target component folder                             |
| Edit existing module  | module `docs/AI.md`                                                                   | target module files only                            |
| Add query or mutation | module `docs/AI.md`, `docs/api-contracts/` if exists                                  | module `.api.ts` and `.queryKeys.ts`                |
| Edit state            | module `docs/AI.md`                                                                   | relevant `.store.ts`, `.context.ts`, or `.hooks.ts` |
| Edit a route          | route entry in Major Modules table below                                              | `app/admin/<route>/page.tsx` + target module        |
| Scaffold new module   | `.claude/CLAUDE.md` (module type rules), `usage-doc/module-patterns/README.md`        | run `/new-module`                                   |

---

## App structure

```
apps/mintflow/
├── app/admin/               # Next.js App Router — re-exports only
├── layouts/admin/           # Admin layout shell (Admin.tsx)
├── modules/admin/           # Feature modules
│   ├── home/                # Admin home/dashboard
│   ├── organization/        # Org management (MultiPageModule) ← most complex
│   └── tasks/
│       ├── analytics/       # Task analytics dashboard
│       ├── kanban/          # Kanban board
│       └── general-view/    # General View (team panel + task list)
│   └── authenticate/        # Identity & Access Management (ContainedModule group)
│       ├── users/           # Staff user/actor management + sessions/events/MFA/service accounts
│       ├── roles-bindings/  # Roles + Role Bindings (tabs)
│       ├── direct-access/   # Direct Grants + Denials (tabs)
│       ├── access-tools/    # Permission Catalog + Access Tester (tabs, Not-Contained)
│       ├── account-security/ # Self-service profile/password/MFA/sessions (Not-Contained)
│       └── _shared/         # UserPicker, PermissionKeyPicker, ScopeFields, OneTimeSecretModal, useCurrentUser, useLogout
├── modules/sign-in/         # Sign-in page (login + MFA challenge)
├── modules/password-change/ # Forced/voluntary password change
└── lib/                     # App-level utilities (api.ts, authErrorMessages.ts)
```

---

## Major modules

| Module             | Path                                           | Route(s)                             | Module AI map                                            |
| ------------------ | ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| Organization       | `modules/admin/organization/`                  | `/admin/organization/*`              | `modules/admin/organization/docs/AI.md`                  |
| Task Analytics     | `modules/admin/tasks/analytics/`               | `/admin/tasks/analytics`             | —                                                        |
| Kanban             | `modules/admin/tasks/kanban/`                  | `/admin/tasks`                       | —                                                        |
| General View       | `modules/admin/tasks/general-view/`            | `/admin/tasks/general-view`          | —                                                        |
| Admin Home         | `modules/admin/home/`                          | `/admin`                             | —                                                        |
| Sign In            | `modules/sign-in/`                             | `/`                                  | `modules/sign-in/docs/AI.md`                             |
| Password Change    | `modules/password-change/`                     | `/password-change`                   | `modules/password-change/docs/AI.md`                     |
| Users              | `modules/admin/authenticate/users/`            | `/admin/authenticate/users`          | `modules/admin/authenticate/users/docs/AI.md`            |
| Roles & Bindings   | `modules/admin/authenticate/roles-bindings/`   | `/admin/authenticate/roles-bindings` | `modules/admin/authenticate/roles-bindings/docs/AI.md`   |
| Direct Access      | `modules/admin/authenticate/direct-access/`    | `/admin/authenticate/direct-access`  | `modules/admin/authenticate/direct-access/docs/AI.md`    |
| Access Tools       | `modules/admin/authenticate/access-tools/`     | `/admin/authenticate/access-tools`   | `modules/admin/authenticate/access-tools/docs/AI.md`     |
| Account & Security | `modules/admin/authenticate/account-security/` | `/admin/account/security`            | `modules/admin/authenticate/account-security/docs/AI.md` |

---

## Shared resources

| Resource      | Location                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------- |
| UI components | `@peppermint/ui` (Mantine re-exports + app wrappers)                                                |
| Admin shells  | `@peppermint/admin` (`DataTableShell`, `ModalTableShell`, `FormWrapper`, `FormShell`)               |
| Admin layout  | `layouts/admin/Admin.tsx`                                                                           |
| App utilities | `lib/`                                                                                              |
| Design docs   | `docs/design/` (create `design-system.md`, `motion-system.md`, `DESIGN.md` when design work begins) |
| API contracts | `docs/api-contracts/` (create when backend DTOs are defined)                                        |

---

## State management locations

| State type                            | Location                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Server data, cache                    | React Query — query functions in module `.api.ts` or `.hooks.ts`, keys in `.queryKeys.ts` |
| Currently selected organisation       | `stores/selectedOrg.store.ts` (Zustand + `persist`; survives page reload)                 |
| Organization structure canvas         | `modules/admin/organization/structure/Structure.store.ts`                                 |
| Kanban board state                    | `modules/admin/tasks/kanban/` (check for `.store.ts`)                                     |
| Current authenticated user            | `modules/admin/authenticate/_shared/useCurrentUser.ts` (React Query, key `["auth","me"]`) |
| Shareable filters / pagination / tabs | URL search params                                                                         |
| Local UI state                        | `useState` in component                                                                   |

---

## Common edit targets

| Task                                                                                        | Files to open                                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Organization module (full map)                                                              | `modules/admin/organization/docs/AI.md` (read first — 9 sub-modules)            |
| Org structure canvas                                                                        | `modules/admin/organization/structure/Structure.tsx`                            |
| Org structure state                                                                         | `modules/admin/organization/structure/Structure.store.ts`                       |
| Org structure logic                                                                         | `modules/admin/organization/structure/Structure.utils.ts`                       |
| Org shared domain types                                                                     | `modules/admin/organization/_shared/organization.types.ts`                      |
| Org sub-module (positions, members, reporting-lines, delegations, event-log, actor-context) | `modules/admin/organization/<sub-module>/`                                      |
| Task analytics UI                                                                           | `modules/admin/tasks/analytics/TaskAnalyticsDashboard.tsx`                      |
| Task analytics queries                                                                      | `modules/admin/tasks/analytics/taskAnalytics.api.ts`                            |
| Kanban board                                                                                | `modules/admin/tasks/kanban/KanbanDashboard.tsx`                                |
| General View dashboard                                                                      | `modules/admin/tasks/general-view/GeneralViewDashboard.tsx`                     |
| General View team panel                                                                     | `modules/admin/tasks/general-view/components/TeamMembersPanel/`                 |
| General View task row                                                                       | `modules/admin/tasks/general-view/components/TaskListRow/`                      |
| Task shared types + mock data                                                               | `modules/admin/tasks/kanban/module.api.ts`                                      |
| Admin layout shell                                                                          | `layouts/admin/Admin.tsx`                                                       |
| Admin sidebar config (dynamic)                                                              | `config/nav/admin-nav.ts` → `buildAdminConfig(org, orgSwitcherWidget, isStaff)` |
| Selected org store (sidebar context)                                                        | `stores/selectedOrg.store.ts`                                                   |
| Route re-export                                                                             | `app/admin/<route>/page.tsx`                                                    |
| Identity & Access Management group                                                          | `modules/admin/authenticate/docs/AI.md` (group index — read first)              |
| Staff-only route gating                                                                     | `components/RequireStaff/RequireStaff.tsx`                                      |
| API error → message mapping                                                                 | `lib/authErrorMessages.ts`                                                      |

---

## Do not do

- Do not scan the full `modules/` tree to find something — read the module AI map first.
- Do not create sibling sub-modules (`organization-roles/` next to `organization/`) — always nest inside the parent (`organization/roles/`).
- Do not write to `useSelectedOrgStore` outside of `OrganizationsList.tsx` — it is the single writer.
- Do not add `"use client"` to `app/` files — they are re-export stubs only.
- Do not import from `@mantine/*` directly — always use `@peppermint/ui`.
- Do not add `"use client"` to `app/` pages or layouts — they are re-export files only.
- Do not fetch data in `useEffect` — use `useQuery`.
- Do not call Axios directly in event handlers — use `useMutation`.
- Do not create a new Zustand store before checking existing stores.
- Do not invent new folder patterns not described in `.claude/CLAUDE.md`.
- Do not bypass design docs when adding visual decisions.
