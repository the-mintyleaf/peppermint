# Peppermint Frontend Architecture

Turborepo monorepo. UI lives in `@peppermint/ui` (Mantine wrapper) and is consumed by apps. Apps will be Next.js using the App Router.

## Monorepo Structure

**Packages:**

- `@peppermint/ui` — Mantine component wrapper (shared UI)
- `@peppermint/api-client` — Axios-based API client
- `@peppermint/admin` — admin UI components
- `@peppermint/kanban` — kanban UI components
- `@peppermint/config` — shared config values
- `@peppermint/utils` — shared utility functions

Apps live in `apps/` — see [App Structure](#app-structure) below. When creating an app, use Next.js with the App Router.

**Package dependency direction — do not violate this:**

```
apps/*  →  any @peppermint/* package
@peppermint/admin   →  @peppermint/ui, @peppermint/utils
@peppermint/kanban  →  @peppermint/ui, @peppermint/utils
@peppermint/ui      →  (no internal package imports)
@peppermint/utils   →  (no internal package imports)
packages must never import from apps/
```

## Stack Rules

**`@peppermint/ui`** — always import Mantine components from here, never from `@mantine/*` directly.

**Forms** — always use `@mantine/form` via `@peppermint/ui`. Never use React Hook Form or other form libraries.

**`@peppermint/api-client`** — the shared Axios instance. Each app configures it in `src/lib/api.ts` (base URL, auth headers). Always import from the app's `src/lib/api.ts` — never import from `@peppermint/api-client` directly in components, and never instantiate Axios inline.

**React Query + Axios** — all server state goes through React Query. No fetching in `useEffect`. Query functions live in the component's `.hooks.ts` file, or in a `queries/` folder at the module root when shared across multiple components. Query keys live next to their query function. All mutations use `useMutation` — never call Axios directly in event handlers. Mutation functions follow the same co-location rule as query functions.

**State ownership:**

- Server/async data → React Query (`useQuery` / `useMutation`)
- Global client state → Zustand — colocate in `<Component>.store.ts`, or `stores/` at the app root for state shared across multiple components
- Scoped subtree state → React Context
- Local component state → `useState`

**Server vs Client Components** — default to Server Components. Add `"use client"` only when the component uses browser APIs, React hooks, or event handlers. Never add `"use client"` to `app/` layout or page files (those are re-exports only). When a module needs interactivity, the `app/` file stays a Server Component and imports from a `"use client"` module. All components in `@peppermint/*` packages require `"use client"` — Mantine depends on hooks.

**Routing** — Next.js App Router. `app/` pages and layouts are re-export files only — no logic lives there. Special files (`loading.tsx`, `error.tsx`, `not-found.tsx`) may contain minimal markup but must import their visual content from `layouts/` or `modules/`. No client-side router libraries.

**Styling** — pick in this order:
1. Mantine component props (`color`, `size`, `p`, `m`, etc.) — use these first.
2. Mantine `style` prop — for one-off values not covered by props.
3. CSS Modules (`.module.css`) — for complex selectors, pseudo-elements, or animations that can't be expressed inline.

Never use the `sx` prop (deprecated). Never apply global CSS classes to Mantine components.

**Images** — use Next.js `<Image>` (from `next/image`) for all images in `assets/img/`. Use a plain `<img>` only for externally-hosted images where the source domain can't be added to `next.config`.

**Error handling:**

- API errors and user-facing messages → Mantine notifications (via `@peppermint/ui`)
- Unexpected runtime errors → React error boundaries, placed at the module level (not the app root)
- Never swallow errors silently

**Phosphor Icons** — only icon library. Default weight `regular`. Always include `aria-label` on meaningful icons.

**Framer Motion** — for intentional animations only. Any animation with duration > 300ms or that shifts layout must check `useReducedMotion()` and skip or reduce motion when true.

**Accessibility** — semantic HTML first: use the right element before reaching for ARIA. No div-soup. Target WCAG 2.1 AA — covers contrast, keyboard navigation, and screen reader support.

## Naming Conventions

**Folders:** `kebab-case`  
**Component files:** `PascalCase` (e.g., `UserProfileCard.tsx`)  
**Non-component files:** `camelCase` (e.g., `queryKeys.ts`)  
**Layouts:** folder `kebab-case`, export `PascalCase` matching the folder (e.g., `root-layout` → `LayoutRoot`)  
**Modules:** folder `kebab-case`, export prefixed with `Module` (e.g., `dashboard` → `ModuleDashboard`)

## TypeScript

- Strict mode. No `any`, no `@ts-ignore` without a comment explaining why.
- Functional components only. Props typed as `[Name]Props` above the component.
- Shared props for components within `@peppermint/*` packages use local `.types.ts` files colocated with the component. If `@peppermint/types` is ever created under `/packages/types`, migrate shared types there — but do not create the package speculatively.

## Component Structure

This is the base structure for **any component anywhere** in the monorepo — packages, layouts, modules, or apps.

```
<ComponentName>/              # folder in kebab-case
├── <ComponentName>.tsx       # required — main component
├── <ComponentName>.types.ts  # required — props and component-specific types
├── <ComponentName>.module.css    # if not using Mantine defaults
├── <ComponentName>.context.ts    # if component owns a React context
├── <ComponentName>.store.ts      # if component needs complex Zustand state
├── <ComponentName>.hooks.ts      # reusable hooks extracted from the component
├── <ComponentName>.utils.ts      # one-off helpers
├── <ComponentName>.stories.tsx   # when Storybook is relevant
├── <ComponentName>.test.tsx      # when tests are added
└── index.ts                      # required — barrel export
```

- Props and types go in `.types.ts`, not in the main component file
- Complex state → `.store.ts`. Simple UI state → `useState`
- Reusable logic → `.hooks.ts`. One-off helpers → `.utils.ts`
- Export everything relevant in `index.ts`: `import { UserCard, type UserCardProps } from '@peppermint/ui'`

**When to extract optional files — concrete thresholds:**

| File | Extract when… |
|---|---|
| `.hooks.ts` | A hook is used in more than one place, or the hook body exceeds ~30 lines |
| `.store.ts` | State has more than 2 fields, or needs actions beyond simple setters |
| `.context.ts` | More than 2 child components need the same value without prop drilling |
| `.utils.ts` | A helper is called from more than one place in the component |
| `components/` subfolder | Parent component file exceeds ~200 lines, or a sub-component is reused elsewhere |

## Lifecycle Rules

### Packages vs Apps — key distinction

| | Packages (`/packages/*`) | Apps (`/apps/*`) |
|---|---|---|
| Barrel chain | 3 levels: component → group → `src/index.ts` | 2 levels: component → module or layout group |
| Public API | Yes — consumed by other packages and apps | No — internal to the app only |
| Breaking changes | High stakes — grep all consumers first | Low stakes — only affects the one app |
| Docs required | `packages/<pkg>/docs/<Name>.md` + `usage-doc/<pkg>/<Name>.md` | None required (optional inline README for complex modules) |
| App Router wiring | N/A | `app/` page must re-export from `modules/` or `layouts/` |

---

### Packages

#### Creating a new package

1. Create the directory under `packages/<pkg-name>/`.
2. Add `package.json` with `name: "@peppermint/<pkg-name>"`, `main`, `types`, and `exports` fields following the pattern of existing packages.
3. Add the package to the root `pnpm-workspace.yaml` if it is not auto-discovered.
4. Add `src/index.ts` as the public API barrel — nothing is public unless exported here.
5. Update the dependency direction table in this file to include the new package.
6. If the new package imports other internal packages, verify those imports respect the dependency direction rule.

#### Creating a package component

1. Create the component folder with required files (`.tsx`, `.types.ts`, `index.ts`).
2. Export from the component's own `index.ts`.
3. Add to the group barrel (e.g., `shells/index.ts`, `components/index.ts`).
4. Add to the package root `src/index.ts` if it is part of the public API.
5. Create `packages/<pkg>/docs/<Name>.md` — implementation reference (internals, key decisions).
6. Create `usage-doc/<pkg>/<Name>.md` — consumer reference (props, usage examples).

#### Editing a package component

| What changed | Files that must also change |
|---|---|
| Prop added / removed / type changed | `.types.ts` · `packages/<pkg>/docs/<Name>.md` · `usage-doc/<pkg>/<Name>.md` |
| Sub-component added | `components/index.ts` · parent `index.ts` if now publicly exported |
| Sub-component removed | Remove from `components/index.ts` · check package root barrel |
| Hook extracted to `.hooks.ts` | Add `.hooks.ts` · export from component `index.ts` |
| Context extracted to `.context.ts` | Add `.context.ts` · export from component `index.ts` |
| Component renamed | Rename folder + all files + update all 3 barrel levels + both doc files |
| Internal refactor (no API change) | No doc or barrel changes needed |

#### Deleting a package component

1. **Grep first** — `grep -r "<ComponentName>" apps/ packages/` — do not delete if consumers exist; coordinate the removal instead.
2. Remove from all barrel levels: component `index.ts` → group `index.ts` → `src/index.ts`.
3. Delete `packages/<pkg>/docs/<Name>.md`.
4. Delete `usage-doc/<pkg>/<Name>.md`.
5. If the component owned a context or Zustand store, grep for consumers of those exports too before removing.

---

### Apps

#### Creating an app module or layout

1. Create the module/layout folder under `modules/<group>/<name>/` or `layouts/<name>/`.
2. Export the component from the folder's `index.ts`.
3. Add to the group barrel (`modules/<group>/index.ts` or `layouts/index.ts`).
4. Wire `app/` page or layout file to re-export from the module/layout — no logic in `app/`.
5. No usage-doc required. Add an inline `docs/README.md` only for modules complex enough that a new contributor would be lost without it.

**Sub-modules** belong inside their parent module folder, not as siblings. If `organization` has sub-modules like `accounts` or `roles`, they live at `modules/<group>/organization/accounts/` and `modules/<group>/organization/roles/` — never at `modules/<group>/organization-accounts/`. The group barrel exports all of them, and their internal imports resolve relative to the parent module folder.

#### Editing an app module or layout

| What changed | Files that must also change |
|---|---|
| Module moved to a different group | Update `app/` re-export path + old group barrel |
| Sub-component added under a layout | Add to `layouts/<name>/components/index.ts` |
| Sub-component removed | Remove from `layouts/<name>/components/index.ts` |
| Module or layout renamed | Rename folder + files + `app/` re-export + group barrel |
| Internal refactor | No structural changes needed |

#### Deleting an app module or layout

1. Check `app/` for any page or layout file re-exporting it — delete or replace those files first.
2. Remove from the group barrel (`modules/<group>/index.ts` or `layouts/index.ts`).
3. Delete the module/layout folder.
4. If an inline `docs/README.md` exists, delete it with the folder.

---

### Documentation lifecycle

**Packages — both doc files move together:**

| Event | `packages/<pkg>/docs/<Name>.md` | `usage-doc/<pkg>/<Name>.md` |
|---|---|---|
| Component created | Create (implementation notes) | Create (props, usage examples) |
| Public API changed | Update | Update |
| Internal refactor only | No change needed | No change needed |
| Component deleted | Delete | Delete |

**Apps:**

- No usage-doc.
- Inline `docs/README.md` is optional; only create for genuinely complex modules.
- If an inline README exists and the module is deleted, delete the README with it.

---

## Development Workflow

**Before writing any code — run this checklist:**

1. Check `@peppermint/ui` exports — don't build what already exists.
2. If the task involves a module, identify its type (ContainedModule / MultiPageModule / ModalModule / RouteModule) before touching files.
3. If the task spans more than two files, write a plan first.
4. If the task doesn't fit a pattern described in this file — stop and ask. Don't invent a new pattern.

**General rules:**

- Do not work on the main branch. Always create a new branch: `dev/<work-name>` and push it at the end.
- Use pnpm, not npm.
- No testing infrastructure yet — do not generate test files unless explicitly asked.
- Do not read the full folder structure speculatively — only read what the task requires.
- For tasks that span more than 5 files or are expected to take more than one working session:
  1. Before writing any code, create `.todo/<task-name>-todo.md` at the repo root (`kebab-case` filename derived from the feature name).
  2. The file must list every planned step as a checkbox: `- [ ] step description`.
  3. After completing each step, immediately update the file: `- [x] step description`.
  4. The `.todo/<task-name>-todo.md` file is the single source of truth — do not track progress in memory or conversation context only.
  5. Delete the file once all steps are checked off and the task is complete.
- Plan before coding if the task spans more than two files.
- Refactor when it genuinely improves clarity or reduces duplication — not as a side effect of unrelated tasks.
- Split long files and components when they're doing too much, not just when they're long.
- No new dependencies that overlap the existing stack without flagging it first.
- Be concise in responses. Don't explain what you're about to do — just do it.
- Do not create extra documents beyond what is specified in the Lifecycle Rules.

## App Structure

Apps live in `/apps/<app-name>/`. The `app/` directory is thin — it only imports from `layouts/` and `modules/`. All components follow the [Component Structure](#component-structure) above.

```
apps/<app-name>/
├── app/                    # Next.js App Router — only imports from layouts/ and modules/
│   ├── layout.tsx          # re-export only: export default from layouts/
│   ├── page.tsx            # re-export only: export default from modules/
│   ├── loading.tsx         # minimal markup — import skeleton from layouts/ or modules/
│   └── error.tsx           # minimal markup — import error UI from layouts/ or modules/
├── layouts/
│   └── <layout-name>/      # Component Structure applies here
│       ├── index.ts
│       ├── <layout-name>.tsx
│       ├── <layout-name>.module.css
│       ├── <layout-name>.store.ts    # optional
│       ├── <layout-name>.context.tsx # optional
│       ├── <layout-name>.hooks.ts    # optional
│       └── components/
│           └── <component-name>/     # Component Structure applies here
├── modules/
│   └── <module-group>/
│       └── <module-name>/            # Component Structure applies here
│           └── <sub-module-name>/    # sub-modules nest inside their parent module folder
├── components/             # App-level shared components (Component Structure applies)
├── config/                 # App, framework, and env configs
│   └── <config-name>.ts
├── context/                # Global React context for this app (if needed)
│   └── <context-name>.tsx
└── assets/
    ├── img/
    ├── svg/
    ├── fonts/
    ├── vid/
    └── ...
```

**Naming rule:** layout folders use `kebab-case` and export a `PascalCase` named export matching the folder name (e.g. `root-layout` → `LayoutRoot`). Module folders follow the same pattern (e.g. `dashboard` → `ModuleDashboard`, prefixed with `Module`). Pages and layouts in `app/` only re-export from `layouts/` or `modules/` — no logic lives there.

`app/layout.tsx`

```tsx
import { LayoutRoot } from "../layouts/root-layout";
export default LayoutRoot;
```

`app/page.tsx`

```tsx
import { ModuleDashboard } from "../modules/dashboard";
export default ModuleDashboard;
```

## Module Types

Every module belongs to one of four types. Pick before writing any code.

| Type | Use when… | Lives in |
|---|---|---|
| `ContainedModule` | Single view, no nested routes, self-contained | `modules/<group>/<name>/` |
| `MultiPageModule` | Multiple sub-pages with their own routes | `modules/<group>/<name>/` with `pages/` subfolder |
| `ModalModule` | Triggered from another module, overlays the page | `modules/<group>/<name>/` — opened via state, not a route |
| `RouteModule` | Top-level route that needs its own layout shell | `modules/<group>/<name>/` + own layout wired in `app/` |

**Decision flow:**

1. Does it have its own URL segments? → No → `ContainedModule` or `ModalModule`
2. Is it triggered/opened by another module? → Yes → `ModalModule`
3. Does it need multiple nested routes? → Yes → `MultiPageModule`
4. Does it need a unique layout shell different from the app default? → Yes → `RouteModule`
5. Otherwise → `ContainedModule`

See `/usage-doc/module-patterns/` for full pattern docs.

## Anti-Patterns

Things that look right but are wrong in this codebase. Stop if you're about to do any of these.

- **Logic in `app/` pages** — `app/page.tsx` and `app/layout.tsx` are re-export files only. Even one line of logic goes in the module or layout instead.
- **Direct `@mantine/*` imports** — If `@peppermint/ui` doesn't re-export what you need, add it to the wrapper first. Never import from `@mantine/*` directly.
- **`useEffect` for data fetching** — Always use `useQuery`. No exceptions, even for "simple" one-off fetches.
- **Inline Axios calls** — Data fetching always goes through the `api.ts` instance via React Query. Never call Axios directly in a component or event handler.
- **New Zustand store per component** — Check whether an existing store already owns that state before creating a new one. Stores are shared, not per-component.
- **`components/` folder for organization** — Only create a `components/` subfolder when the parent exceeds ~200 lines or a sub-component is reused. Not for tidiness.
- **Skipping `.types.ts`** — Props typed inline in the component file are not acceptable. Types always go in `.types.ts`.
- **Unnecessary `"use client"`** — In apps, `"use client"` converts the entire subtree to client rendering. Only add it where hooks, browser APIs, or event handlers are genuinely needed. `@peppermint/*` packages always need it (Mantine uses hooks), but app modules default to Server Components.
- **Importing `@peppermint/api-client` directly in components** — Always import the Axios instance from the app's `src/lib/api.ts`. That file is where the base URL and auth headers are configured; importing the raw package bypasses all of that.
- **Importing across the wrong package boundary** — Packages never import from `apps/`. `@peppermint/ui` never imports from other internal packages. See dependency direction above.
- **Sibling sub-modules** — Never create `<module>-<sub>/` folders as siblings of `<module>/`. Sub-modules always nest inside their parent: `modules/<group>/<module>/<sub>/`, not `modules/<group>/<module>-<sub>/`.
- **Inventing a new pattern when uncertain** — If a task doesn't fit a pattern described in this file, stop and ask. Don't improvise a new pattern.

## Git Commit Format

```
[<package-name or app-name>/<component-name or file-name>] <update-type>: <description>
```

Note: Square brackets are a part of the commit message.

**Update types:** `add` · `fix` · `update` · `remove` · `docs`

Examples:

- `[@peppermint/ui/UserCard] add: new UserCard component`
- `[@peppermint/auth] fix: handle logout errors gracefully`
- `[admin-app/dashboard] update: improve layout responsiveness`

---

## Frontend Agentic Standards

> Full standards live in `.claude/STANDARDS.md`. Read that file when doing any frontend feature work — component quality, UI states, responsive, accessibility, motion, performance, state ownership, forms, API contracts, data fetching, documentation, verification, and git workflow. The sections below are a brief pointer only.

**Key rules (always apply):**

- Read `apps/<app>/docs/AI.md` and the module's `docs/AI.md` before touching any code.
- Read design docs (`design-system.md`, `motion-system.md`, `DESIGN.md`) before any visual work.
- Handle all UI states: loading, empty, error, success, disabled, pending mutation.
- No raw hex colors, arbitrary spacing, or one-off visual values — use design tokens.
- Every data-driven component must use `useQuery`. No `useEffect` fetching.
- Verify with `pnpm typecheck && pnpm lint` before committing. Use `/verify`.
- Update `docs/AI.md` whenever module structure changes. Use `/update-ai-map`.
- One PR per task/feature. Use `/pre-pr` to prepare.

---

## Tactical Programming for AI Agents

This repo must be optimized for agentic coding.

The goal is not only clean code. The goal is code that an AI agent can understand, navigate, and edit with the least possible token usage and the highest possible accuracy.

Agents must not scan the whole codebase to understand simple tasks. They must read the tactical docs first, then open only the exact source files needed.

### Core principle

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

### Required app-level AI map

Every app must have:

```txt
apps/<app>/docs/AI.md
```

This is the first app-specific file an agent reads.

It must be short, skimmable, and path-heavy.

It should include:

* app purpose
* main routes
* major modules
* shared component locations
* design docs location
* API/query locations
* state management locations
* common edit targets
* task-type reading guide
* forbidden patterns
* files or folders the agent should not touch casually

Example:

```md
# AI Map

## App purpose

Short explanation of the app.

## Read by task type

| Task | Read first | Then inspect |
|---|---|---|
| Edit visual design | docs/design/DESIGN.md, docs/design/design-system.md | target component only |
| Add component | docs/components/, @peppermint/ui exports | target component folder |
| Edit module | module docs/AI.md | target module files |
| Add query/mutation | module docs/AI.md, docs/api-contracts/ | module queries/hooks |
| Edit state | module docs/AI.md | relevant store/context/hook |
| Edit route | route section below | app route re-export + target module |

## Major modules

| Module | Path | Route | Module AI map |
|---|---|---|---|
| Organization | modules/admin/organization | /admin/organization | modules/admin/organization/docs/AI.md |

## Do not do

- Do not scan the full app.
- Do not create duplicate components.
- Do not invent new folder patterns.
- Do not bypass design docs.
- Do not add new state stores without checking existing state ownership.
```

---

### Required module-level AI map

Every major module must have:

```txt
apps/<app>/modules/<group>/<module>/docs/AI.md
```

This is the first file an agent reads before changing that module.

It should include:

* module purpose
* module type
* route, if any
* entry component
* important child components
* stores
* contexts
* hooks
* queries
* utilities
* docs
* common edit targets
* known risks
* what not to touch

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

| Task | Files |
|---|---|
| Organization tree UI | organization-tree/OrganizationTree.tsx |
| Organization tree state | organization-tree/OrganizationTree.store.ts |
| Organization tree behavior | organization-tree/OrganizationTree.hooks.ts |
| Roles UI | roles/ |
| Accounts UI | accounts/ |
| Shared queries | queries/ |
| Shared types | organization.types.ts |

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

### Source reading budget

For small tasks, the agent should usually read:

* `CLAUDE.md`
* one app AI map
* one module AI map
* 2–5 directly relevant source files

Reading more is allowed only when the task genuinely requires it.

If the agent needs to inspect many files, it must explain why in the plan or `.todo` file.

---

### Documentation update rules

Whenever code changes, tactical docs must stay accurate.

Update `apps/<app>/docs/AI.md` when:

* a new major module is added
* a route changes
* shared component locations change
* API/state/design conventions change
* a new repeated workflow appears

Update `apps/<app>/modules/<group>/<module>/docs/AI.md` when:

* module structure changes
* entry files change
* important components are added or removed
* stores, contexts, hooks, or queries change
* common edit targets change
* module-specific rules change

A change is not complete if the code changes but the AI maps become stale.

---

### Map file style

AI maps must be:

* short
* practical
* skimmable
* path-heavy
* decision-focused
* continuously updated

Prefer:

* tables
* bullets
* file paths
* import paths
* ownership notes
* "use this / do not use this" rules

Avoid:

* long prose
* duplicated implementation details
* documenting every tiny internal function
* creating multiple sources of truth
* making agents read five docs when one map would do

Bad AI docs explain everything.

Good AI docs tell the agent exactly where to go.

---

### Final rule

The best frontend architecture is not only easy for humans to maintain.

It must also be easy for AI agents to navigate.

Every major frontend decision should reduce future search cost, reduce duplicate work, reduce token usage, and make the next edit faster.
