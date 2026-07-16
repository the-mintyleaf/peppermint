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
- [ ] Commit + dual adversarial review; apply fixes

## Phase 2 — Store + derivation

- [ ] `Tasks.store.ts` Zustand view-prefs store (view, boardFilter, search, member, sort, group, filters, columns)
- [ ] `useDerivedTasks` — shared filter→sort pipeline returning list + board shapes
- [ ] Commit + dual review

## Phase 3 — Toolbar

- [ ] Extract `components/TasksToolbar/`
- [ ] Sort menu (Due/Priority/Name/Created + asc/desc)
- [ ] Group by (Status/Priority/Assignee/List, list only)
- [ ] Filter by (Assignee/Priority/Due) + active count badge
- [ ] Columns (Priority/Due/Assignee toggles, list only)
- [ ] Commit + dual review

## Phase 4 — List view + create/edit/delete

- [ ] Extract `general-view/components/TaskListView/` (header + groups + states, respects group/columns)
- [ ] Migrate `CreateTaskModal` to `FormWrapper` (Zod, finalSubmitFn → mutation)
- [ ] Wire create/update end-to-end; remove PLACEHOLDER\_\*; editable subtasks
- [ ] Delete action in `TaskDetailModal` (confirm → useDeleteTask)
- [ ] Row/card Edit-Delete action menu on `TaskListRow` + `KanbanCard`
- [ ] Slim `Tasks.tsx` to orchestrator (<200 lines)
- [ ] Commit + dual review

## Phase 5 — Polish + docs

- [ ] States + tokens/spacing against `.claude/DESIGN.md` + design-system
- [ ] `/visual-review /tasks` (light + dark, both views)
- [ ] `modules/tasks/docs/AI.md` + update app `docs/AI.md` tasks section
- [ ] Verify: `pnpm format && pnpm --filter mintflow check-types && lint`
- [ ] Commit + dual review; delete this todo
