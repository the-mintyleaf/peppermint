# Tasks Module — AI Navigation Map

## Purpose

The `/tasks` workspace: a **List** and a **Board** (kanban) view over the same
task set, with a shared toolbar (board filter, view switch, team-member filter,
sort, group-by, filter-by, columns, search). Create / edit / delete, inline row
edits, and drag reordering are all functional against an **in-memory mock
store** — the mintflow app has no backend.

## Module type

`ContainedModule` — single route, no nested routes. `app/(app)/tasks/page.tsx`
re-exports `ModuleTasks`.

## Data & state (module root)

- `kanban/module.api.ts` — the mock backend: types (`Task`, `TaskInput`,
  `TaskStatus/Priority/Category`, `TeamMember`, …), constants, the `MOCK_TASKS`
  seed, a mutable `taskStore`, and async CRUD (`fetchTasks`, `createTask`,
  `updateTask`, `deleteTask`, `setTaskStatus`, `reorderTasks`, `patchTask`).
  `createdRank(task)` parses the human `createdAt` label for the Created sort.
- `kanban/KanbanDashboard.hooks.ts` — React Query layer. `useTasks(filter)`
  query; `useKanbanBoard` (board grouping + drag: cache-only `previewReorder`,
  persisted `commitReorder`, `moveTask`); mutation hooks `useCreateTask`,
  `useUpdateTask`, `useDeleteTask`, `useMoveTask`, `useReorderTasks`,
  `useUpdateTaskFields` (optimistic partial patch for inline edits).
- `Tasks.store.ts` — Zustand **view-prefs** store: `view`, `boardFilter`,
  `search`, `selectedMemberId`, `sortBy`, `sortDir`, `groupBy`, `filters`,
  `visibleColumns` + setters, `clearFilters` (filters only) / `resetAll`.
- `Tasks.hooks.ts` — `useDerivedTasks(tasks)`: the single filter → sort → group
  pipeline. Returns `board` (raw status columns) + `list` (grouped by `groupBy`)
  - `total`. Reads all prefs from the store.
- `Tasks.types.ts` — shared view vocabulary (`SortBy`, `GroupBy`, `TaskFilters`,
  `VisibleColumns`, `TaskGroup`, `DerivedTasks`, …).

## Components

- `Tasks.tsx` (`ModuleTasks`) — orchestrator: header (+ New Task), `ManageHeader`,
  `<TasksToolbar>`, and the board/list body. Owns loading / **error+retry** /
  empty states and the detail + create/edit modals.
- `components/TasksToolbar/` — all toolbar controls, wired to the store.
- `general-view/components/TaskListView/` — column-aware list (header + groups +
  states); reads `visibleColumns` and builds the grid via `general-view/taskGrid.ts`.
- `general-view/components/TaskGroupSection/` — one collapsible group; status keys
  get a themed header, other group keys a neutral fallback.
- `general-view/components/TaskListRow/` — a task row: inline-editable priority /
  list / due (persist via `useUpdateTaskFields`), keyboard-operable caret (subtasks)
  and name (opens detail); respects `visibleColumns`.
- `general-view/components/TeamMembersPanel/` — the member-filter popover.
- `kanban/components/KanbanBoard|KanbanColumn|KanbanCard/` — the `@dnd-kit` board.
- `kanban/components/CreateTaskModal/` — create/edit form on `@peppermint/admin`
  `FormWrapper` (Zod, `finalSubmitFn` → create/update mutation).
- `kanban/components/TaskDetailModal/` — read-only detail + edit trigger + inline
  confirm Delete (`useDeleteTask`).
- `kanban/components/TaskModalShared/` — shared modal chrome/sections reused by
  both modals.

## Common edit targets

| Task                               | Files                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| Add/adjust a toolbar control       | `components/TasksToolbar/` + `Tasks.store.ts` (+ `Tasks.types.ts`)  |
| Change filter / sort / group logic | `Tasks.hooks.ts`                                                    |
| Change what a mutation does        | `kanban/module.api.ts` + `kanban/KanbanDashboard.hooks.ts`          |
| Change list columns / row cells    | `general-view/taskGrid.ts` + `general-view/components/TaskListRow/` |
| Change the create/edit form        | `kanban/components/CreateTaskModal/`                                |
| Change the mock seed data          | `kanban/module.api.ts` (`MOCK_TASKS`)                               |

## State ownership

- Server/async (task data + mutations) → React Query (`["tasks", filter]`).
- View preferences (filters/sort/group/columns/search) → `useTasksStore` (Zustand).
- Modal + form-target state (`selectedTask`, create/edit) → local `useState` in `Tasks.tsx`.
- Form state → `FormWrapper` (`@peppermint/admin`).

## Notes / known limits

- No backend: mutations persist only to the in-memory `taskStore` for the session
  (a full reload re-seeds from `MOCK_TASKS`).
- Due-window filters use the real clock, which drifts against the fixed-2026 mock
  dates (same caveat as the calendar module) — the mechanism is what matters.
- Inline edits and drags invalidate `["tasks"]` on settle; harmless on the mock,
  but would be N refetches against a real paginated API.
