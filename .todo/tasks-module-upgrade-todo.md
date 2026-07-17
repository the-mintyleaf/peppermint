# Tasks module upgrade — make it real

Turn `apps/mintflow/modules/tasks/` into a functional prototype: in-memory persistence,
working toolbar, FormWrapper migration, file split, polish. Plan:
`~/.claude/plans/i-want-you-to-async-storm.md`.

## Phase 1 — Data + mutations

- [x] Sortable recency — derived `createdRank(task)` parser (no per-seed edit needed)
- [x] Convert `MOCK_TASKS` into a mutable module store (`taskStore`)
- [x] Add async CRUD: `createTask`, `updateTask`, `deleteTask`, `setTaskStatus`, `reorderTasks`
- [x] Add mutation hooks (`useCreateTask/Update/Delete/Move/Reorder`); optimistic for move/reorder, invalidate for the rest
- [x] Drop the local-copy render-sync hack in `useKanbanBoard`; board reads from query data
- [x] Commit + dual adversarial review; applied fixes (drag storm, field clearing, deps)

## Phase 2 — Store + derivation

- [x] `Tasks.types.ts` shared view vocabulary (SortBy/GroupBy/TaskFilters/VisibleColumns/DerivedTasks)
- [x] `Tasks.store.ts` Zustand view-prefs store (view, boardFilter, search, member, sort, group, filters, columns)
- [x] `useDerivedTasks` — shared filter→sort→group pipeline returning list + board shapes
- [x] Wire store + derivation into `Tasks.tsx` (no-regression; toolbar menus still inert until Phase 3)
- [x] Commit + dual review (Phase 2 clean; 2 latent items to handle in Phase 3)

## Phase 3 — Toolbar (Sort / Group / Filter)

- [x] Harden group header for any group key (safe fallback); drop dead `displayStatus` row prop
- [x] Extract `components/TasksToolbar/`
- [x] Sort menu (Manual/Due/Priority/Name/Created + asc/desc toggle)
- [x] Group by (Status/Priority/Assignee/List, list only)
- [x] Filter by (Assignee/Priority/Due) + active count badge + clear
- [x] Fix `hasActiveFilters` to include the filters object; remove dead `useGroupedTasks`
- [x] Wire toolbar into `Tasks.tsx` (now ~215 lines)
- [x] Commit + dual review (Codex clean; a11y roles + filter-clear scope fixed)

## Phase 4 — Columns + inline-edit persistence + TaskListView

- [x] `patchTask` + `useUpdateTaskFields` optimistic mutation
- [x] Persist TaskListRow inline edits (priority/list/due) via the patch (dropped local-only state)
- [x] Extract `general-view/components/TaskListView/` + `taskGrid.ts`; dynamic grid respecting `visibleColumns`
- [x] Columns (Priority/Due/Assignee toggles) wired to store + render (header + rows + subtasks)
- [ ] Commit + dual review

## Phase 5 — Create / edit / delete via UI

- [ ] Migrate `CreateTaskModal` to `FormWrapper`; fix assignee slug→name; remove placeholders
- [ ] Wire create/update end-to-end (finalSubmitFn → mutation); show real subtasks/attachments on edit
- [ ] Delete action in `TaskDetailModal` (confirm → useDeleteTask)
- [ ] Row/card Edit-Delete action menu on `TaskListRow` + `KanbanCard`
- [ ] Slim `Tasks.tsx`; check module barrels
- [ ] Commit + dual review

## Phase 6 — Polish + docs

- [ ] States (incl. query error + retry) + tokens/spacing against `.claude/DESIGN.md`
- [ ] `/visual-review /tasks` (light + dark, both views)
- [ ] `modules/tasks/docs/AI.md` + update app `docs/AI.md` tasks section
- [ ] Verify: `pnpm format && pnpm --filter mintflow check-types && lint`
- [ ] Commit + dual review; delete this todo
