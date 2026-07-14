# Quick Reference

Fast lookup for agents. Full context lives in CLAUDE.md and the relevant skills.

---

## Imports

| Need                             | Import from                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any UI component                 | `@peppermint/ui` (never `@mantine/*` directly)                                                                                                            |
| Charts/editor/etc                | `@peppermint/ui/{charts,editor,carousel,code-highlight,dropzone}` (subpath)                                                                               |
| Module forms                     | `FormWrapper` from `@peppermint/admin` (engine — `useFormInstance` / `useFormControls`) + `FormShell` for full-page/multi-step. Never hand-roll `useForm` |
| HTTP client                      | app's `src/lib/api.ts` (never `@peppermint/api-client` directly)                                                                                          |
| Resource API / keys / mutation   | `@peppermint/admin` — `createResourceApi`, `createQueryKeys`, `useAppMutation`                                                                            |
| Status/date columns, row actions | `@peppermint/admin` — `statusColumn`, `dateColumn`, `booleanColumn`, `RowActionsMenu`, `openReasonConfirmModal`                                           |
| Error boundary                   | `@peppermint/admin` — `ModuleErrorBoundary`                                                                                                               |
| Icons                            | `@phosphor-icons/react` — default weight `regular`, always `aria-label`                                                                                   |
| React Query                      | `@peppermint/ui` re-exports `@tanstack/react-query`                                                                                                       |

Before hand-rolling a fetch/query-key/mutation/column/menu, check the primitives above
(full API: `usage-doc/admin/primitives.md`). Staff CRUD list pages: use
`createListModule` from `@/components/createListModule`.

---

## State owner

| Data type                                                   | Owner                                       |
| ----------------------------------------------------------- | ------------------------------------------- |
| Server data, async, mutations                               | React Query (`useQuery` / `useMutation`)    |
| Shareable UI state (filters, tabs, pagination, selected ID) | URL search params                           |
| Global interactive client state                             | Zustand (check existing stores first)       |
| Temporary local UI state                                    | `useState`                                  |
| Derived values                                              | Compute inline — never duplicate into state |

---

## Module type

| Type              | When                               | Shell                                          |
| ----------------- | ---------------------------------- | ---------------------------------------------- |
| `ContainedModule` | Single view, no nested routes      | `ModalTableShell`                              |
| `MultiPageModule` | 2–4 routes (list/new/edit/view)    | `DataTableShell` + `FormWrapper` + `FormShell` |
| `ModalModule`     | Opened by another module, no route | —                                              |
| `RouteModule`     | Needs its own layout shell         | custom layout                                  |

Decision: route? → no → triggered by another module? → yes → ModalModule. Multiple routes? → MultiPageModule. Else → ContainedModule.

---

## Extract thresholds

| File                    | Extract when                                         |
| ----------------------- | ---------------------------------------------------- |
| `.hooks.ts`             | Used in >1 place, or hook body >30 lines             |
| `.store.ts`             | >2 state fields, or actions beyond simple setters    |
| `.context.ts`           | >2 child components need the same value              |
| `.utils.ts`             | Helper called from >1 place in the component         |
| `components/` subfolder | Parent >200 lines, or sub-component reused elsewhere |

---

## Verification commands

```bash
pnpm check-types  # run before committing (there is no "typecheck" script)
pnpm lint         # run before committing
pnpm build        # run before PR
pnpm format       # run before verification (root only)
```

Only run commands that exist in the repo. Do not invent scripts.

Parallel dispatch, phase commits, and dual-review rules: `.claude/PARALLEL.md`.

---

## Commit format

```
[<app-or-package>/<area>] <type>: <description>
```

Types: `add` · `fix` · `update` · `remove` · `docs`

Example: `[mintflow/organization] add: department drawer component`

---

## Anti-patterns (stop immediately if you are about to do any of these)

- Importing from `@mantine/*` directly — add to `@peppermint/ui` first
- Fetching in `useEffect` — always use `useQuery`
- Calling Axios in an event handler — use `useMutation`
- Creating a new Zustand store before checking if one already owns that state
- Props typed inline in the component file — always use `.types.ts`
- Adding `"use client"` to an `app/` page or layout file
- Importing `@peppermint/api-client` directly in a component
- Creating `<module>-<sub>/` sibling folders — always nest sub-modules inside their parent
- Hand-rolling a resource API / query keys / mutation-with-notification / status-date column / row-action menu when a `@peppermint/admin` primitive exists
- Hand-rolling `useForm` for a module form — build it on `FormWrapper` (+ `FormShell` for full-page/multi-step)
- `as unknown as` at the modal/form boundary — specify `ModalTableShell<TRow, TCreate, TEdit>` generics instead
- `extends Record<string, unknown>` on a domain row type — shells constrain `T extends object` (only React-Flow node data needs it)

---

## Governance

Observed governance failure? → log it in `.claude/FAILURE-LOG.md` (cause list there;
cause→justified-response table in `.claude/GOVERNANCE.md`). Only a logged entry authorizes a new rule/hook/command change.
