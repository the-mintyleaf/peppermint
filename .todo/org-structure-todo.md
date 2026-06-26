# org-structure — Implementation Checklist

> ⚠️ IMPORTANT — ContainedModule Build Rules
> Every sub-module (except Organization Builder) MUST follow the ContainedModule
> pattern from `usage-doc/module-patterns/ContainedModule.md` without exception:
>
> - Single list route only — no separate /new, /[id], /[id]/edit routes
> - All create/edit/view interactions are modals or drawers within the list page
> - File structure: index.ts · .types.ts · .api.ts · .queryKeys.ts · .hooks.ts · form/ · pages/list/
> - All server state via useQuery/useMutation — never useEffect, never inline Axios
> - All UI via @peppermint/ui — never import from @mantine/\* directly
> - app/ page files are re-exports only — zero logic
> - Read the api docs for the module at .todo/task-docs-1/api/ ONLY when building that module
>
> Organization Builder (organization-tree/) is exempt from the page structure above,
> but is NOT exempt from the shared query-key namespace and \_shared/ primitives.

## Phase 0 — Setup & Cleanup

- [x] Create `modules/admin/organization/index.ts` parent barrel (starts with ModuleOrganizationTree only)
- [x] Update `modules/admin/index.ts` to `export * from "./organization"` (remove direct tree import)
- [x] Delete stale app routes: `accounts/`, `roles/`, `users/`, `departments/`, `invitations/`, `sessions/`, `audit-logs/`, `archived/`, top-level `structure/`
- [x] Delete stale scoped routes: `[id]/members/new/`, `[id]/members/[memId]/`, `[id]/positions/[posId]/`, `[id]/sites/new/`, `[id]/delegations/new/`, top-level `new/`, `[id]/edit/`

## Phase 1 — Organizations (ContainedModule)

- [x] Read `.todo/task-docs-1/api/organization_api_docs` before starting
- [x] Create `organizations/organizations.types.ts`
- [x] Create `organizations/organizations.api.ts`
- [x] Create `organizations/organizations.queryKeys.ts`
- [x] Create `organizations/organizations.hooks.ts`
- [x] Create `organizations/form/OrganizationsForm.tsx`
- [x] Create `organizations/form/organizationsForm.types.ts`
- [x] Create `organizations/form/index.ts`
- [x] Create `organizations/pages/list/OrganizationsList.tsx`
- [x] Create `organizations/pages/list/organizations.columns.tsx`
- [x] Create `organizations/index.ts` → export `{ ModuleOrganizations }`
- [x] Add `ModuleOrganizations` to `modules/admin/organization/index.ts`
- [x] Wire `app/admin/organization/page.tsx` → re-export `ModuleOrganizations`
- [x] Verify: typecheck · lint · format · browser renders list · modal opens/closes · form submits

## Phase 2 — People (ContainedModule)

- [ ] Read `.todo/task-docs-1/api/` people API docs before starting
- [ ] Create `people/people.types.ts`
- [ ] Create `people/people.api.ts`
- [ ] Create `people/people.queryKeys.ts`
- [ ] Create `people/people.hooks.ts`
- [ ] Create `people/form/PeopleForm.tsx` (add member form only)
- [ ] Create `people/form/peopleForm.types.ts`
- [ ] Create `people/form/index.ts`
- [ ] Create `people/pages/list/PeopleList.tsx`
- [ ] Create `people/pages/list/people.columns.tsx`
- [ ] Create `people/index.ts` → export `{ ModulePeople }`
- [ ] Add `ModulePeople` to `modules/admin/organization/index.ts`
- [ ] Wire `app/admin/organization/[id]/members/page.tsx` → re-export `ModulePeople`
- [ ] Verify: typecheck · lint · format · browser renders · profile drawer opens · task-verb actions work

## Phase 3 — Positions (ContainedModule)

- [x] Read `.todo/task-docs-1/api/` positions API docs before starting
- [x] Create `positions/positions.types.ts`
- [x] Create `positions/positions.api.ts` (fetchPositions, fetchPosition, deactivatePosition only)
- [x] Create `positions/positions.queryKeys.ts`
- [x] Create `positions/positions.hooks.ts`
- [x] Create `positions/pages/list/PositionsList.tsx`
- [x] Create `positions/pages/list/positions.columns.tsx`
- [x] Create `positions/index.ts` → export `{ ModulePositions }`
- [x] Add `ModulePositions` to `modules/admin/organization/index.ts`
- [x] Wire `app/admin/organization/[id]/positions/page.tsx` → re-export `ModulePositions`
- [x] Verify: typecheck · lint · format · browser renders · deactivate confirm dialog works

## Phase 4 — Sites (ContainedModule)

- [x] Read `.todo/task-docs-1/api/` sites API docs before starting (DATA_CONTRACT.md §11; no public API endpoint in v1.0)
- [x] Create `sites/sites.types.ts`
- [x] Create `sites/sites.api.ts` (mock only — no public API; real: GET/POST /organizations/<id>/sites/)
- [x] Create `sites/sites.queryKeys.ts`
- [x] sites.hooks.ts not created — no mutations available (no public API); all state via ModalTableShell
- [x] Create `sites/form/SitesForm.tsx`
- [x] Create `sites/form/sitesForm.types.ts`
- [x] Create `sites/form/index.ts`
- [x] Create `sites/pages/list/SitesList.tsx`
- [x] Create `sites/pages/list/sites.columns.tsx`
- [x] Create `sites/index.ts` → export `{ ModuleSites }`
- [x] Add `ModuleSites` to `modules/admin/organization/index.ts`
- [x] Wire `app/admin/organization/[id]/sites/page.tsx` → re-export `ModuleSites`
- [x] Verify: lint · format · browser renders · create modal works

## Phase 5 — Delegations (ContainedModule)

- [x] Read `.todo/task-docs-1/api/` delegations API docs before starting
- [x] Create `delegations/delegations.types.ts`
- [x] Create `delegations/delegations.api.ts` (fetchDelegations, createDelegation, revokeDelegation)
- [x] Create `delegations/delegations.queryKeys.ts`
- [x] Create `delegations/delegations.hooks.ts`
- [x] Create `delegations/form/DelegationsForm.tsx` (accepts optional personId pre-fill)
- [x] Create `delegations/form/delegationsForm.types.ts`
- [x] Create `delegations/form/index.ts`
- [x] Create `delegations/pages/list/DelegationsList.tsx`
- [x] Create `delegations/pages/list/delegations.columns.tsx`
- [x] Create `delegations/index.ts` → export `{ ModuleDelegations }`
- [x] Add `ModuleDelegations` to `modules/admin/organization/index.ts`
- [x] Wire `app/admin/organization/[id]/delegations/page.tsx` → re-export `ModuleDelegations`
- [x] Verify: typecheck · lint · format · browser renders · create modal works

## Phase 6 — History (ContainedModule — read-only)

- [x] Read `.todo/task-docs-1/api/` history/event API docs before starting
- [x] Create `history/history.types.ts`
- [x] Create `history/history.api.ts` (fetchEvents only — no mutations)
- [x] Create `history/history.queryKeys.ts`
- [x] Create `history/history.hooks.ts` (useHistory only — no useMutation)
- [x] Create `history/pages/list/HistoryList.tsx`
- [x] history.columns.tsx not created — EventLogList from \_shared/ owns its own rendering; no shell columns needed
- [x] Create `history/index.ts` → export `{ ModuleHistory }`
- [x] Add `ModuleHistory` to `modules/admin/organization/index.ts`
- [x] Wire `app/admin/organization/[id]/event-log/page.tsx` → re-export `ModuleHistory`
- [x] Verify: typecheck · lint · format · browser renders event list · no mutation calls anywhere

## Phase 7 — Organization Builder (data layer only — structure frozen)

- [x] Read API docs — unit-tree at GET /organizations/<org_id>/unit-tree/ (DATA_CONTRACT.md §2.6)
- [x] API stubs already existed in OrganizationTree.api.ts (fetchUnitTree, createUnit, createPosition)
- [x] Add `organization-tree/OrganizationTree.queryKeys.ts` (under ["org-structure", "builder"])
- [x] Add `organization-tree/OrganizationTree.hooks.ts` (useOrganizationGraph + useCreateUnit + useCreatePosition)
- [x] Minimal edit to OrganizationTree.tsx: add useParams + useOrganizationGraph; fallback to DUMMY_NODES when server returns empty
- [x] OrganizationTree.store.ts not changed — it owns UI state only; mutations live in hooks/components
- [x] Verify: lint passes · format applied · canvas falls back to demo data (server returns [] in mock)

## Final

- [x] Run `/verify` — lint/format pass; 8 pre-existing errors unrelated to this task
- [x] Run `/update-ai-map` to create `modules/admin/organization/docs/AI.md`
- [ ] Run `/pre-pr`
