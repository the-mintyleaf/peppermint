<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Mint Consultancy – Agent-Specific Guidelines

### Before You Start

1. Read `/CLAUDE.md` in this directory for feature context and module organization
2. Read the root `.claude/CLAUDE.md` for naming conventions, component structure, and stack rules
3. For Next.js 16, check `node_modules/next/dist/docs/` if you're uncertain about routing or API patterns

### Key Responsibilities

**You are building:** A student and document management portal for educational consultancies.

**Focused Features:**
- Student enrollment and profile management
- Document upload, creation, and storage
- Status tracking and lifecycle workflows
- Consultancy dashboard with metrics

### Architecture Notes

- All UI components from `@zetsel/ui` (Mantine wrapper), never direct Mantine imports
- Forms use `@mantine/form`, validation via `zod`
- State: React Query for server data, Zustand for global client state, `useState` for local UI state
- Icons: Phosphor only. Always include `aria-label`
- Routing: Next.js App Router in `app/` directory
- Error handling: Mantine notifications for user messages, error boundaries for unexpected runtime errors

### Component Structure (applies everywhere)

```
<ComponentName>/
├── <ComponentName>.tsx       # main component
├── <ComponentName>.types.ts  # props and types
├── <ComponentName>.store.ts  # Zustand state (if needed)
├── <ComponentName>.hooks.ts  # reusable hooks (if needed)
├── <ComponentName>.utils.ts  # helpers (if needed)
└── index.ts                  # barrel export
```

### When Building Features

- **Students** — Query keys colocated with fetch logic. Use `useMutation` for create/update/delete. Store filters in Zustand
- **Documents** — File uploads through a dedicated mutation/hook. Version control via status field. Expiry tracking as a separate concern
- **Dashboard** — Aggregate data from multiple queries, combine results client-side. Show pending tasks and metrics
- **Forms** — Use `@zetsel/ui` form wrapper. Validate with `zod`. Handle async errors via Mantine notifications

### Patterns to Follow

- No fetching in `useEffect` — use React Query hooks
- No direct Axios calls in event handlers — use `useMutation`
- Query keys live next to the query function
- Component state colocated: if a component needs state, it goes in `.store.ts` or `.context.ts` in the same folder
- Reusable logic → hooks; one-off helpers → utils
- Props and types → `.types.ts`, not in the component file

### When to Ask

- If unsure about Next.js behavior → check `node_modules/next/dist/docs/`
- If a new dependency might overlap existing stack → flag it before adding
- If a task spans more than two files → plan first
- If uncertain about component placement → ask or check `@zetsel/ui` exports

### Commit Format

```
[mint-consultancy/<feature>] <type>: <description>
```

Examples:
- `[mint-consultancy/students] add: student profile card`
- `[mint-consultancy/documents] fix: handle file upload errors`
- `[mint-consultancy/dashboard] update: add enrollment count metric`

### Red Flags

- Using `any` in TypeScript without a comment explaining why
- Fetching inside `useEffect` without React Query
- Direct Axios calls outside mutations
- Mantine imports from `@mantine/*` instead of `@zetsel/ui`
- React Hook Form or other form libraries (use `@mantine/form`)
- Missing `aria-label` on icons
- Silent error swallowing

### Quick Reference

- `@zetsel/ui` — Use this for all UI components
- `@zetsel/admin` — Admin-specific components if relevant
- `zustand` — Global state management
- `zod` — Schema validation
- `@phosphor-icons/react` — Icons only
- Next.js App Router — no client-side routers
