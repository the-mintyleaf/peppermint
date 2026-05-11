# Zetsel Frontend

Turborepo monorepo. UI lives in `@zetsel/ui` (Mantine wrapper) and is consumed by apps. Apps will be Next.js using the App Router.

## Monorepo Structure

**Packages:**
- `@zetsel/ui` — Mantine component wrapper (shared UI)
- `@zetsel/api-client` — Axios-based API client
- `@zetsel/admin` — admin UI components
- `@zetsel/kanban` — kanban UI components
- `@zetsel/config` — shared config values
- `@zetsel/utils` — shared utility functions

No `apps/` directory exists yet. When creating an app, use Next.js with the App Router.

## Stack Rules

**`@zetsel/ui`** — always import Mantine components from here, never from `@mantine/*` directly.

**Forms** — always use `@mantine/form` via `@zetsel/ui`. Never use React Hook Form or other form libraries.

**React Query + Axios** — all server state goes through React Query. No fetching in `useEffect`. Axios instance is in `src/lib/api.ts` — never instantiate it inline. Query keys live next to their query function.

**State ownership:**
- Server/async data → React Query
- Global client state → Zustand (`src/stores/`)
- Scoped subtree state → React Context
- Local component state → `useState`

**Routing** — Next.js App Router. Use `app/` directory conventions: layouts, pages, loading, error files. No client-side router libraries.

**Error handling:**
- API errors and user-facing messages → Mantine notifications (via `@zetsel/ui`)
- Unexpected runtime errors → React error boundaries
- Never swallow errors silently

**Phosphor Icons** — only icon library. Default weight `regular`. Always include `aria-label` on meaningful icons.

**Framer Motion** — for intentional animations only. Check `useReducedMotion()` for non-trivial motion.

## Naming Conventions

**Folders:** `kebab-case`  
**Component files:** `PascalCase` (e.g., `UserProfileCard.tsx`)  
**Non-component files:** `camelCase` (e.g., `queryKeys.ts`)

## TypeScript

- Strict mode. No `any`, no `@ts-ignore` without a comment explaining why.
- Functional components only. Props typed as `[Name]Props` above the component.
- Shared props for components within `@zetsel/*` packages go in `@zetsel/types` under `/packages/types`.

## Component Structure

When building components, create a folder with the component name in `kebab-case`. Use this structure:

**Always include:**
- `<ComponentName>.tsx` — Main component file
- `<ComponentName>.types.ts` — Props interfaces and component-specific types
- `index.ts` — Barrel export for the component and types

**Include as needed:**
- `<ComponentName>.module.css` — Styles (if not using Mantine defaults)
- `<ComponentName>.store.ts` — Zustand store (only if component manages complex state)
- `<ComponentName>.hooks.ts` — Custom hooks used by this component
- `<ComponentName>.utils.ts` — Component-specific helper functions
- `<ComponentName>.stories.tsx` — Storybook stories (when added)
- `<ComponentName>.test.tsx` — Tests (when added)

**Minimal example:**
```
UserCard/
├── UserCard.tsx
├── UserCard.types.ts
└── index.ts
```

**Full-featured example:**
```
DataTable/
├── DataTable.tsx
├── DataTable.types.ts
├── DataTable.module.css
├── DataTable.store.ts
├── DataTable.hooks.ts
├── DataTable.utils.ts
├── DataTable.test.tsx
├── DataTable.stories.tsx
├── docs/
│   └── README.md
└── index.ts
```

**Guidelines:**
- Props and types go in `.types.ts`, not in the main component file
- Complex state → `.store.ts` (Zustand). Simple UI state → `useState`
- Reusable logic → `.hooks.ts`. One-off helpers → `.utils.ts`
- Always include `docs/README.md` when building new modules, components, or packages
- Export everything relevant in `index.ts` for clean imports: `import { UserCard, type UserCardProps } from '@zetsel/ui'`

## Development Workflow

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

## Git Commit Format

```
[<package-name or app-name>/<component-name or file-name>] <update-type>: <description>
```

Note: Square brackets are a part of the commit message.

Examples:
- `[@zetsel/ui/UserCard] add: new UserCard component`
- `[@zetsel/auth] fix: handle logout errors gracefully`
- `[admin-app/dashboard] update: improve layout responsiveness`
