# Module Patterns

Pick a **shape** first, then a **CRUD strategy** within it.

## Shape — how many routes does the module own?

| Pattern                               | Route count                    | Shell used                                     | Use when                                                  |
| ------------------------------------- | ------------------------------ | ---------------------------------------------- | --------------------------------------------------------- |
| [ContainedModule](ContainedModule.md) | 1                              | `ModalTableShell`                              | Single list page; create & edit open in modals            |
| [MultiPageModule](MultiPageModule.md) | 2–4 (list / new / edit / view) | `DataTableShell` + `FormWrapper` + `FormShell` | Complex form, multi-step wizard, or dedicated detail view |

## CRUD strategy — how is create/edit handled?

| Pattern                       | Route count                  | Shell used                     | Use when                                                         |
| ----------------------------- | ---------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| [ModalModule](ModalModule.md) | 1                            | `DataTableModalShell`          | Form fits in a modal (≤ ~8 fields, no file uploads)              |
| [RouteModule](RouteModule.md) | 4 (list / new / edit / view) | `DataTableShell` + `FormShell` | Complex form, multi-step wizard, or dedicated detail view needed |

All patterns share the same internal file structure (`module.api.ts`, `form/`, `pages/`, `index.ts`). Shape determines the export style and routing; CRUD strategy determines which shell the pages mount.
