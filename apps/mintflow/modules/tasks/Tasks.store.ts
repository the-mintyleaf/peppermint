"use client";

import { create } from "zustand";
import type {
  GroupBy,
  SortBy,
  SortDir,
  TaskBoardFilter,
  TaskFilters,
  TaskView,
  VisibleColumns,
} from "./Tasks.types";

const DEFAULT_FILTERS: TaskFilters = {
  assignees: [],
  priorities: [],
  due: null,
};

const DEFAULT_COLUMNS: VisibleColumns = {
  priority: true,
  due: true,
  assignee: true,
};

interface TasksViewState {
  view: TaskView;
  boardFilter: TaskBoardFilter;
  search: string;
  selectedMemberId: string | null;
  sortBy: SortBy;
  sortDir: SortDir;
  groupBy: GroupBy;
  filters: TaskFilters;
  visibleColumns: VisibleColumns;

  setView: (view: TaskView) => void;
  setBoardFilter: (filter: TaskBoardFilter) => void;
  setSearch: (search: string) => void;
  setSelectedMember: (id: string | null) => void;
  setSort: (sortBy: SortBy) => void;
  toggleSortDir: () => void;
  setGroupBy: (groupBy: GroupBy) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  toggleColumn: (column: keyof VisibleColumns) => void;
  clearFilters: () => void;
  activeFilterCount: () => number;
}

export const useTasksStore = create<TasksViewState>((set, get) => ({
  view: "list",
  boardFilter: "all",
  search: "",
  selectedMemberId: null,
  sortBy: "manual",
  sortDir: "asc",
  groupBy: "status",
  filters: DEFAULT_FILTERS,
  visibleColumns: DEFAULT_COLUMNS,

  setView: (view) => set({ view }),
  setBoardFilter: (boardFilter) => set({ boardFilter }),
  setSearch: (search) => set({ search }),
  setSelectedMember: (selectedMemberId) => set({ selectedMemberId }),
  setSort: (sortBy) => set({ sortBy }),
  toggleSortDir: () =>
    set((s) => ({ sortDir: s.sortDir === "asc" ? "desc" : "asc" })),
  setGroupBy: (groupBy) => set({ groupBy }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  toggleColumn: (column) =>
    set((s) => ({
      visibleColumns: {
        ...s.visibleColumns,
        [column]: !s.visibleColumns[column],
      },
    })),
  clearFilters: () =>
    set({
      filters: DEFAULT_FILTERS,
      search: "",
      selectedMemberId: null,
    }),
  activeFilterCount: () => {
    const { filters } = get();
    return (
      filters.assignees.length +
      filters.priorities.length +
      (filters.due ? 1 : 0)
    );
  },
}));
