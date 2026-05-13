# Module Patterns

Two standard ways to build an admin module. Pick one based on form complexity.

| Pattern | Route count | Shell used | Use when |
|---|---|---|---|
| [ModalModule](ModalModule.md) | 1 | `DataTableModalShell` | Form fits in a modal (≤ ~8 fields, no file uploads) |
| [RouteModule](RouteModule.md) | 4 (list / new / edit / view) | `DataTableShell` + `FormShell` | Complex form, multi-step wizard, or dedicated detail view needed |

Both patterns share the same internal file structure (`module.config.ts`, `module.api.ts`, `form/`, `pages/`, `index.ts`). The only difference is which shell the pages mount.