"use client";

import { useCallback, useState } from "react";
import {
  AccessMenu,
  Box,
  Button,
  Group,
  ManageHeader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { KanbanBoard } from "./kanban/components/KanbanBoard";
import { TaskDetailModal } from "./kanban/components/TaskDetailModal";
import { CreateTaskModal } from "./kanban/components/CreateTaskModal";
import { TaskListView } from "./general-view/components/TaskListView";
import { TasksToolbar } from "./components/TasksToolbar";
import { useTasks, useKanbanBoard } from "./kanban/KanbanDashboard.hooks";
import { useTeamMembers } from "./general-view/GeneralViewDashboard.hooks";
import { useDerivedTasks } from "./Tasks.hooks";
import { useTasksStore } from "./Tasks.store";
import type { Task, TaskStatus } from "./kanban/module.api";

const BREADCRUMB = [{ label: "Tasks", href: "/tasks" }];
const TASKS_SUBHEADING =
  "View and filter tasks across boards, team members, and status.";

export function ModuleTasks() {
  const view = useTasksStore((s) => s.view);
  const boardFilter = useTasksStore((s) => s.boardFilter);
  const search = useTasksStore((s) => s.search);
  const selectedMemberId = useTasksStore((s) => s.selectedMemberId);
  const filters = useTasksStore((s) => s.filters);
  const resetAll = useTasksStore((s) => s.resetAll);

  // Card detail + create/edit form state stays local to the module.
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleCardClick = useCallback(
    (task: Task) => setSelectedTask(task),
    [],
  );
  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setCreateStatus(status);
    setCreateOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(null);
    setEditTask(task);
  }, []);

  const handleCloseForm = useCallback(() => {
    setCreateOpen(false);
    setCreateStatus(null);
    setEditTask(null);
  }, []);

  const { data: tasks, isLoading } = useTasks(boardFilter);
  const { moveTask, previewReorder, commitReorder } = useKanbanBoard(tasks);
  const { members, taskCountByMember } = useTeamMembers(tasks);
  const derived = useDerivedTasks(tasks);

  const hasActiveFilters =
    search.length > 0 ||
    selectedMemberId !== null ||
    filters.assignees.length > 0 ||
    filters.priorities.length > 0 ||
    filters.due !== null;

  return (
    <>
      <ModuleHeader
        breadcrumbItems={BREADCRUMB}
        right={
          <Group gap="xs" mr="sm">
            <AccessMenu data={{ accounts: [], roles: [] }} />
            <Button
              size="xs"
              leftSection={<PlusIcon size={16} aria-label="Add task" />}
              onClick={() => {
                setCreateStatus(null);
                setCreateOpen(true);
              }}
            >
              New Task
            </Button>
          </Group>
        }
      />

      <ModalPaper withBorder>
        <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
          <Box px="md">
            <ManageHeader
              title="Tasks"
              count={isLoading ? undefined : derived.total}
              description={TASKS_SUBHEADING}
            />
          </Box>

          <TasksToolbar
            members={members}
            taskCountByMember={taskCountByMember}
          />

          {view === "board" ? (
            <Box
              p="md"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isLoading ? (
                <Text c="dimmed" size="sm">
                  Loading tasks…
                </Text>
              ) : (
                <KanbanBoard
                  tasksByStatus={derived.board}
                  onMoveTask={moveTask}
                  onPreviewReorder={previewReorder}
                  onCommitReorder={commitReorder}
                  onCardClick={handleCardClick}
                  onAddTask={handleAddTask}
                />
              )}
            </Box>
          ) : (
            <TaskListView
              groups={derived.list}
              isLoading={isLoading}
              total={derived.total}
              hasActiveFilters={hasActiveFilters}
              onReset={resetAll}
            />
          )}
        </Stack>
      </ModalPaper>

      <TaskDetailModal
        task={selectedTask}
        onClose={handleCloseModal}
        onEdit={handleEditTask}
      />
      <CreateTaskModal
        opened={createOpen || !!editTask}
        editTask={editTask}
        initialStatus={createStatus ?? undefined}
        onClose={handleCloseForm}
      />
    </>
  );
}
