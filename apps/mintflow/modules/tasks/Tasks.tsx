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
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { KanbanBoard } from "./kanban/components/KanbanBoard";
import { TaskDetailModal } from "./kanban/components/TaskDetailModal";
import { CreateTaskModal } from "./kanban/components/CreateTaskModal";
import { TaskGroupSection } from "./general-view/components/TaskGroupSection";
import { TasksToolbar } from "./components/TasksToolbar";
import { useTasks, useKanbanBoard } from "./kanban/KanbanDashboard.hooks";
import { useTeamMembers } from "./general-view/GeneralViewDashboard.hooks";
import { useDerivedTasks } from "./Tasks.hooks";
import { useTasksStore } from "./Tasks.store";
import type { Task, TaskStatus } from "./kanban/module.api";
import tableClasses from "./general-view/TaskTable.module.css";

const BREADCRUMB = [{ label: "Tasks", href: "/tasks" }];
const TASKS_SUBHEADING =
  "View and filter tasks across boards, team members, and status.";

export function ModuleTasks() {
  const view = useTasksStore((s) => s.view);
  const boardFilter = useTasksStore((s) => s.boardFilter);
  const search = useTasksStore((s) => s.search);
  const selectedMemberId = useTasksStore((s) => s.selectedMemberId);
  const filters = useTasksStore((s) => s.filters);
  const clearFilters = useTasksStore((s) => s.clearFilters);

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
            <>
              {/* Column headers */}
              <Box
                className={`${tableClasses.table} ${tableClasses.header} ${tableClasses.grid}`}
              >
                <span className={tableClasses.headerLabel}>Name</span>
                <span />
                <span className={tableClasses.headerLabel}>Priority</span>
                <span className={tableClasses.headerLabel}>List</span>
                <span className={tableClasses.headerLabel}>Due date</span>
                <span className={tableClasses.headerLabel}>Assignee</span>
              </Box>

              {/* Task list */}
              <ScrollArea
                className={tableClasses.table}
                style={{ flex: 1, minHeight: 0 }}
              >
                {isLoading ? (
                  <Stack p="md" gap="xs">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} height={48} radius="sm" />
                    ))}
                  </Stack>
                ) : derived.total === 0 ? (
                  <Stack align="center" justify="center" h={300} gap="xs">
                    <Text c="dimmed" size="sm">
                      No tasks found
                    </Text>
                    {hasActiveFilters && (
                      <Text
                        size="xs"
                        c="blue"
                        style={{ cursor: "pointer" }}
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Box>
                    {derived.list.map((group) => (
                      <TaskGroupSection
                        key={group.key}
                        groupKey={group.key}
                        label={group.label}
                        tasks={group.tasks}
                      />
                    ))}
                  </Box>
                )}
              </ScrollArea>
            </>
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
