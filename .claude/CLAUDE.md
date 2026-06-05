# Zetsel Frontend Architecture

Turborepo monorepo. UI lives in `@zetsel/ui` (Mantine wrapper) and is consumed by apps. Apps will be Next.js using the App Router.

## Monorepo Structure

**Packages:**

- `@zetsel/ui` — Mantine component wrapper (shared UI)
- `@zetsel/api-client` — Axios-based API client
- `@zetsel/admin` — admin UI components
- `@zetsel/kanban` — kanban UI components
- `@zetsel/config` — shared config values
- `@zetsel/utils` — shared utility functions

Apps live in `apps/` — see [App Structure](#app-structure) below. When creating an app, use Next.js with the App Router.

## Stack Rules

**`@zetsel/ui`** — always import Mantine components from here, never from `@mantine/*` directly.

**Forms** — always use `@mantine/form` via `@zetsel/ui`. Never use React Hook Form or other form libraries.

**React Query + Axios** — all server state goes through React Query. No fetching in `useEffect`. All mutations use `useMutation` — never call Axios directly in event handlers. Axios instance is in `src/lib/api.ts` — never instantiate it inline. Query keys live next to their query function.

**State ownership:**

- Server/async data → React Query (`useQuery` / `useMutation`)
- Global client state → Zustand — colocate in `<Component>.store.ts`, or `stores/` at the app root for state shared across multiple components
- Scoped subtree state → React Context
- Local component state → `useState`

**Routing** — Next.js App Router. Use `app/` directory conventions: layouts, pages, loading, error files. No client-side router libraries.

**Error handling:**

- API errors and user-facing messages → Mantine notifications (via `@zetsel/ui`)
- Unexpected runtime errors → React error boundaries
- Never swallow errors silently

**Phosphor Icons** — only icon library. Default weight `regular`. Always include `aria-label` on meaningful icons.

**Framer Motion** — for intentional animations only. Any animation with duration > 300ms or that shifts layout must check `useReducedMotion()` and skip or reduce motion when true.

**Accessibility** — semantic HTML first: use the right element before reaching for ARIA. No div-soup. Target WCAG 2.1 AA — covers contrast, keyboard navigation, and screen reader support.

## Naming Conventions

**Folders:** `kebab-case`  
**Component files:** `PascalCase` (e.g., `UserProfileCard.tsx`)  
**Non-component files:** `camelCase` (e.g., `queryKeys.ts`)

## TypeScript

- Strict mode. No `any`, no `@ts-ignore` without a comment explaining why.
- Functional components only. Props typed as `[Name]Props` above the component.
- Shared props for components within `@zetsel/*` packages go in `@zetsel/types` under `/packages/types`.

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
├── docs/
│   └── README.md                 # always include for new modules/packages
└── index.ts                      # required — barrel export
```

- Props and types go in `.types.ts`, not in the main component file
- Complex state → `.store.ts`. Simple UI state → `useState`
- Reusable logic → `.hooks.ts`. One-off helpers → `.utils.ts`
- Export everything relevant in `index.ts`: `import { UserCard, type UserCardProps } from '@zetsel/ui'`

## Development Workflow

- For major tasks, always create and maintain a ./todo folder with task files named after the related feature or functionality. Track progress continuously and mark tasks as completed as work is finished.
- Do not work on the main branch. Always create a new branch: `/dev/<work-name>`
- Use pnpm, not npm
- No testing infrastructure yet — do not generate test files unless explicitly asked
- Do not go randomly reading all the folder structure all the time, unless required or requested
- Check `@zetsel/ui` exports before building a new component
- Plan before coding if the task spans more than two files
- Refactor when it genuinely improves clarity or reduces duplication — not as a side effect of unrelated tasks
- Split long files and components when they're doing too much, not just when they're long
- No new dependencies that overlap the existing stack without flagging it first
- Be concise in responses. Don't explain what you're about to do — just do it
- When adding anything to a package, include a doc in `packages/<pkg>/docs/<Name>.md` and a usage doc in `usage-doc/<pkg>/<Name>.md`
- When working on anything do not make extra documents for completion.

## App Structure

Apps live in `/apps/<app-name>/`. The `app/` directory is thin — it only imports from `layouts/` and `modules/`. All components follow the [Component Structure](#component-structure) above.

```
apps/<app-name>/
├── app/                    # Next.js App Router — only imports from layouts/ and modules/
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

## Git Commit Format

```
[<package-name or app-name>/<component-name or file-name>] <update-type>: <description>
```

Note: Square brackets are a part of the commit message.

**Update types:** `add` · `fix` · `update` · `remove` · `docs`

Examples:

- `[@zetsel/ui/UserCard] add: new UserCard component`
- `[@zetsel/auth] fix: handle logout errors gracefully`
- `[admin-app/dashboard] update: improve layout responsiveness`
