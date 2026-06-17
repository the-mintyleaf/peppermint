"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  ModuleHeader,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useDebouncedValue,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { useTasks, useKanbanBoard } from "./KanbanDashboard.hooks";
import type { Task, TaskBoardFilter } from "./module.api";

const TABS: { value: TaskBoardFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "mine", label: "My Board" },
  { value: "team", label: "Team Board" },
  { value: "department", label: "Department Board" },
];

const TAB_INDEX_MAP: TaskBoardFilter[] = TABS.map((t) => t.value);

const TAB_SEGMENTS = TABS.map((tab, index) => ({
  label: tab.label,
  value: String(index),
}));

const BREADCRUMB = [{ label: "Tasks", href: "/admin/tasks" }, { label: "Kanban Home", href: "/admin/tasks" }];

export function KanbanDashboard() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = TAB_INDEX_MAP[activeTabIndex];

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const handleCardClick = useCallback((task: Task) => setSelectedTask(task), []);
  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const { data: tasks, isLoading } = useTasks(activeTab);
  const { tasksByStatus, moveTask, reorderTask } = useKanbanBoard(tasks, activeTab);

  const filteredByStatus = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return tasksByStatus;
    return Object.fromEntries(
      Object.entries(tasksByStatus).map(([status, list]) => [
        status,
        list.filter((t) => t.title.toLowerCase().includes(q) || t.taskNumber.toLowerCase().includes(q)),
      ])
    ) as typeof tasksByStatus;
  }, [tasksByStatus, debouncedSearch]);

  return (
    <Paper>
      <Stack gap={0} h="100vh" style={{ overflow: "hidden" }}>
        <ModuleHeader
          breadcrumbItems={BREADCRUMB}
          right={
            <Button size="xs" leftSection={<PlusIcon size={16} aria-label="Add" />} mr="sm">
              New Task
            </Button>
          }
        />

        <Group justify="space-between" px="md" py="xs">
          <SegmentedControl
            withItemsBorders={false}
            value={String(activeTabIndex)}
            onChange={(v) => setActiveTabIndex(Number(v))}
            data={TAB_SEGMENTS}
            size="sm"
            color="white"
            autoContrast
            styles={{ label: { paddingInline: 10, fontSize: "var(--mantine-font-size-xs)" } }}
          />
          <TextInput
            miw={240}
            leftSection={<MagnifyingGlassIcon size={14} />}
            size="xs"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
          />
        </Group>



        <Box p="md" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto", display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <Text c="dimmed" size="sm">Loading tasks…</Text>
          ) : (
            <KanbanBoard
              tasksByStatus={filteredByStatus}
              onMoveTask={moveTask}
              onReorderTask={reorderTask}
              onCardClick={handleCardClick}
            />
          )}
        </Box>
      </Stack>

      <TaskDetailModal task={selectedTask} onClose={handleCloseModal} />
    </Paper>
  );
}
