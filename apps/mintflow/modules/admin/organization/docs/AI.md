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

| Route                                                | Sub-module                    |
| ---------------------------------------------------- | ----------------------------- |
| `/admin/organization`                                | `organizations` (list, cards) |
| `/admin/organization/[orgId]`                        | `organizations` (overview)    |
| `/admin/organization/[orgId]/structure`              | `structure`                   |
| `/admin/organization/[orgId]/positions`              | `positions`                   |
| `/admin/organization/[orgId]/members`                | `members` (list)              |
| `/admin/organization/[orgId]/members/[membershipId]` | `members` (view)              |
| `/admin/organization/[orgId]/reporting-lines`        | `reporting-lines`             |
| `/admin/organization/[orgId]/delegations`            | `delegations`                 |
| `/admin/organization/[orgId]/event-log`              | `event-log`                   |
| `/admin/organization/[orgId]/actor-context`          | `actor-context`               |

## Entry files

- `index.ts` — `ModuleOrganization = { main, overview, structure, positions, members, reportingLines, delegations, eventLog, actorContext }`
- `_shared/organization.types.ts` — all 12 backend entities + enum unions (bilingual `*_np`/`*_en`/`*_romanized` name fields), the single source of truth for domain types
- `_shared/organization.api.ts` / `.queryKeys.ts` — cross-sub-module fetchers (unit tree, flat units list)

## Common edit targets

| Task                               | Files                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Add/change a domain field or enum  | `_shared/organization.types.ts` (update here first, everything else imports from it)                                     |
| Organization list/create/activate  | `organizations/`                                                                                                         |
| Unit tree canvas                   | `structure/Structure.tsx`, `.store.ts`, `.hooks.ts`, `.api.ts`, `.utils.ts`                                              |
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
- Structure canvas interaction state (selection, drawer, modals, expand/collapse, focus branch, search): `structure/Structure.store.ts`. No undo/redo — every canvas action is a real backend mutation, not a staged client edit, so there is no local "unsaved" state to revert.
- Everything else: local `useState`, no dedicated stores needed.

## Known constraints

- The Structure Builder loads the unit tree **lazily** off the flat primary endpoint `GET /organizations/<id>/unit-tree-nodes/` (NOT the nested `/unit-tree/`). Initial render fetches only top-level units (`fetchUnitRoots` → `?status=active&max_depth=0`); expanding a unit fetches one level of children **with members** (`fetchUnitChildren` → `?root_unit_id=<id>&max_depth=1&include_members=true`), one React-Query per open branch (`useQueries` in `Structure.tsx`, cache keys `unitRoots`/`unitChildren`). Members (positions + holders) render inline on a node whenever its `positions` are loaded; there is no "expand all" (it would recurse-fetch the whole org). The flat DTOs live in `_shared/organization.types.ts`: `UnitTreeNodeFlat`, `UnitPositionNode`, `PositionHolder`.
- `UnitMembership` (users placed in a unit without a position) is **not** surfaced by `include_members` — only position-based holders appear on the canvas. Documented backend gap.
- Positions have no org-wide list endpoint — only `GET /units/<unit_id>/positions/`. Every position picker (`PositionPickerSelect`, `AssignmentPickerSelect`) is a two/three-step unit → position (→ holder) picker, not a flat search.
- `fetchUserSummary` (`members/members.api.ts`) hits `GET /api/v1/auth/users/<id>/`, which is not documented in the organization API but inferred from the sibling `PATCH` endpoint already used in `authenticate/users/users.api.ts`.
- Checklist §17 "Invited User Acceptance UI" (self-service accept/decline) and all `OrganizationSite` screens are **not built** — no real backend endpoint exists for either (every organization endpoint is staff-gated; `OrganizationSite` has a service function but no public API per the recovered `API.md`).

## Do not do

- Do not create sibling sub-modules (`organization-positions/` next to `organization/`) — always nest inside the parent (`organization/positions/`).
- Do not let the Structure Builder canvas create/edit an `Organization` node as a child of anything — the org root is read-only there; editing happens on the Overview screen only.
- Do not add a hard-delete action anywhere in this module — the backend forbids it. Use deactivate/end/revoke with a reason instead.
- Do not fetch in `useEffect` or call Axios directly in a handler — `useQuery`/`useMutation` only.
- Do not import `@mantine/*` directly — always `@peppermint/ui`.
- Do not build self-service invitation-acceptance UI against invented endpoints — confirm with the real backend team first (see Known constraints above).
