# Tactical Programming for AI Agents

This repo must be optimized for agentic coding.

The goal is not only clean code. The goal is code that an AI agent can understand, navigate, and edit with the least possible token usage and the highest possible accuracy.

Agents must not scan the whole codebase to understand simple tasks. They must read the tactical docs first, then open only the exact source files needed.

## Core principle

Docs are the agent's map. Code is the source of truth.

Agents should move from broad context to narrow implementation:

```txt
CLAUDE.md
→ apps/<app>/docs/AI.md
→ apps/<app>/modules/<group>/<module>/docs/AI.md
→ exact source files needed for the task
```

Do not start by reading source folders, full module trees, or unrelated files.

Only open source files when the tactical docs identify them as relevant, or when the docs are missing, stale, or insufficient.

---

## Required app-level AI map

Every app must have:

```txt
apps/<app>/docs/AI.md
```

This is the first app-specific file an agent reads.

It must be short, skimmable, and path-heavy.

It should include:

- app purpose
- main routes
- major modules
- shared component locations
- design docs location
- API/query locations
- state management locations
- common edit targets
- task-type reading guide
- forbidden patterns
- files or folders the agent should not touch casually

Example:

```md
# AI Map

## App purpose

Short explanation of the app.

## Read by task type

| Task               | Read first                                          | Then inspect                        |
| ------------------ | --------------------------------------------------- | ----------------------------------- |
| Edit visual design | docs/design/DESIGN.md, docs/design/design-system.md | target component only               |
| Add component      | docs/components/, @peppermint/ui exports            | target component folder             |
| Edit module        | module docs/AI.md                                   | target module files                 |
| Add query/mutation | module docs/AI.md, docs/api-contracts/              | module queries/hooks                |
| Edit state         | module docs/AI.md                                   | relevant store/context/hook         |
| Edit route         | route section below                                 | app route re-export + target module |

## Major modules

| Module       | Path                       | Route               | Module AI map                         |
| ------------ | -------------------------- | ------------------- | ------------------------------------- |
| Organization | modules/admin/organization | /admin/organization | modules/admin/organization/docs/AI.md |

## Do not do

- Do not scan the full app.
- Do not create duplicate components.
- Do not invent new folder patterns.
- Do not bypass design docs.
- Do not add new state stores without checking existing state ownership.
```

---

## Required module-level AI map

Every major module must have:

```txt
apps/<app>/modules/<group>/<module>/docs/AI.md
```

This is the first file an agent reads before changing that module.

It should include:

- module purpose
- module type
- route, if any
- entry component
- important child components
- stores
- contexts
- hooks
- queries
- utilities
- docs
- common edit targets
- known risks
- what not to touch

Example:

```md
# Organization Module AI Map

## Purpose

Manages organizations, departments, accounts, roles, permissions, and organization structure.

## Module type

MultiPageModule

## Route

/admin/organization

## Entry files

- ModuleOrganization.tsx
- index.ts

## Common edit targets

| Task                       | Files                                       |
| -------------------------- | ------------------------------------------- |
| Organization tree UI       | organization-tree/OrganizationTree.tsx      |
| Organization tree state    | organization-tree/OrganizationTree.store.ts |
| Organization tree behavior | organization-tree/OrganizationTree.hooks.ts |
| Roles UI                   | roles/                                      |
| Accounts UI                | accounts/                                   |
| Shared queries             | queries/                                    |
| Shared types               | organization.types.ts                       |

## State ownership

- Server data: React Query
- Tree interaction state: organization-tree store
- Temporary drawer/modal state: local state unless shared across module
- Shareable filters: URL search params

## Do not do

- Do not create sibling sub-modules like organization-roles.
- Do not fetch data in useEffect.
- Do not import Mantine directly.
- Do not duplicate tree state into another Zustand store.
```

---

## Source reading budget

For small tasks, the agent should usually read:

- `CLAUDE.md`
- one app AI map
- one module AI map
- 2–5 directly relevant source files

Reading more is allowed only when the task genuinely requires it.

If the agent needs to inspect many files, it must explain why in the plan or `.todo` file.

---

## Documentation update rules

Whenever code changes, tactical docs must stay accurate.

Update `apps/<app>/docs/AI.md` when:

- a new major module is added
- a route changes
- shared component locations change
- API/state/design conventions change
- a new repeated workflow appears

Update `apps/<app>/modules/<group>/<module>/docs/AI.md` when:

- module structure changes
- entry files change
- important components are added or removed
- stores, contexts, hooks, or queries change
- common edit targets change
- module-specific rules change

Also maintain `apps/<app>/CLAUDE.md` with a short, current summary of the app's purpose, routes, key modules, and any app-specific conventions — Claude reads this file automatically on every session, so keeping it accurate eliminates the need to re-derive app context from source each time.

A change is not complete if the code changes but the AI maps become stale.

---

## Map file style

AI maps must be:

- short
- practical
- skimmable
- path-heavy
- decision-focused
- continuously updated

Prefer:

- tables
- bullets
- file paths
- import paths
- ownership notes
- "use this / do not use this" rules

Avoid:

- long prose
- duplicated implementation details
- documenting every tiny internal function
- creating multiple sources of truth
- making agents read five docs when one map would do

Bad AI docs explain everything.

Good AI docs tell the agent exactly where to go.

---

## Final rule

The best frontend architecture is not only easy for humans to maintain.

It must also be easy for AI agents to navigate.

Every major frontend decision should reduce future search cost, reduce duplicate work, reduce token usage, and make the next edit faster.
