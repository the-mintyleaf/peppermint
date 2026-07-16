"use client";

import { useCallback, useState } from "react";
import {
  AccessMenu,
  Box,
  Button,
  Group,
  ManageHeader,
  Menu,
  ModalPaper,
  ModuleHeader,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { ColumnsIcon } from "@phosphor-icons/react/dist/csr/Columns";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";

import { KanbanBoard } from "./kanban/components/KanbanBoard";
import { TaskDetailModal } from "./kanban/components/TaskDetailModal";
import { CreateTaskModal } from "./kanban/components/CreateTaskModal";
import { TeamMembersPanel } from "./general-view/components/TeamMembersPanel";
import { TaskGroupSection } from "./general-view/components/TaskGroupSection";
import { useTasks, useKanbanBoard } from "./kanban/KanbanDashboard.hooks";
import { useTeamMembers } from "./general-view/GeneralViewDashboard.hooks";
import { useDerivedTasks } from "./Tasks.hooks";
import { useTasksStore } from "./Tasks.store";
import type { Task, TaskStatus } from "./kanban/module.api";
import type { DisplayStatus, TaskBoardFilter, TaskView } from "./Tasks.types";
import tableClasses from "./general-view/TaskTable.module.css";

const TABS: { value: TaskBoardFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "mine", label: "My Board" },
  { value: "team", label: "Team Board" },
  { value: "department", label: "Department Board" },
];

const TAB_SEGMENTS = TABS.map((tab) => ({
  label: tab.label,
  value: tab.value,
}));

const VIEW_SEGMENTS = [
  {
    value: "list" satisfies TaskView,
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <RowsIcon size={13} weight="duotone" />
        <span>List</span>
      </Group>
    ),
  },
  {
    value: "board" satisfies TaskView,
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <KanbanIcon size={13} weight="duotone" />
        <span>Board</span>
      </Group>
    ),
  },
];

const BREADCRUMB = [{ label: "Tasks", href: "/tasks" }];
const TASKS_SUBHEADING =
  "View and filter tasks across boards, team members, and status.";

export function ModuleTasks() {
  const view = useTasksStore((s) => s.view);
  const setView = useTasksStore((s) => s.setView);
  const boardFilter = useTasksStore((s) => s.boardFilter);
  const setBoardFilter = useTasksStore((s) => s.setBoardFilter);
  const search = useTasksStore((s) => s.search);
  const setSearch = useTasksStore((s) => s.setSearch);
  const selectedMemberId = useTasksStore((s) => s.selectedMemberId);
  const setSelectedMember = useTasksStore((s) => s.setSelectedMember);
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

  const hasActiveFilters = search.length > 0 || selectedMemberId !== null;

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

          {/* Board filter tabs + view toggle + tools */}
          <Group justify="space-between" px="md" gap="xs" wrap="nowrap">
            <SegmentedControl
              withItemsBorders={false}
              value={boardFilter}
              onChange={(v) => setBoardFilter(v as TaskBoardFilter)}
              data={TAB_SEGMENTS}
              size="sm"
              color="white"
              autoContrast
              styles={{
                label: {
                  paddingInline: 10,
                  fontSize: "var(--mantine-font-size-xs)",
                },
              }}
            />

            <Group gap={6} wrap="nowrap">
              {/* List / Board switch */}
              <SegmentedControl
                value={view}
                onChange={(v) => setView(v as TaskView)}
                data={VIEW_SEGMENTS}
                size="xs"
                styles={{ label: { paddingInline: 10 } }}
              />

              <TeamMembersPanel
                members={members}
                taskCountByMember={taskCountByMember}
                selectedMemberId={selectedMemberId}
                onSelect={setSelectedMember}
              />

              {/* NOTE: Sort / Group / View / Filter menus are wired to the store
                  in Phase 3 (TasksToolbar). They remain inert for this commit. */}
              {view === "list" && (
                <Menu shadow="sm" width={180} position="bottom-end">
                  <Menu.Target>
                    <Button
                      variant="light"
                      color="gray"
                      size="xs"
                      leftSection={<RowsIcon size={13} weight="duotone" />}
                      styles={{ root: { fontWeight: 500 } }}
                    >
                      Group by Status
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Group by</Menu.Label>
                    <Menu.Item
                      leftSection={<RowsIcon size={12} weight="duotone" />}
                      fw={600}
                    >
                      Status
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<FunnelIcon size={12} weight="duotone" />}
                    >
                      Priority
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<ColumnsIcon size={12} weight="duotone" />}
                    >
                      List
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}

              <Menu shadow="sm" width={180} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={
                      <SortAscendingIcon size={13} weight="duotone" />
                    }
                    styles={{ root: { fontWeight: 500 } }}
                  >
                    Sort
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Sort by</Menu.Label>
                  <Menu.Item>Due date</Menu.Item>
                  <Menu.Item>Priority</Menu.Item>
                  <Menu.Item>Name</Menu.Item>
                  <Menu.Item>Created</Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Menu shadow="sm" width={180} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={<ColumnsIcon size={13} weight="duotone" />}
                    styles={{ root: { fontWeight: 500 } }}
                  >
                    View
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Columns</Menu.Label>
                  <Menu.Item>Priority</Menu.Item>
                  <Menu.Item>Due date</Menu.Item>
                  <Menu.Item>Assignee</Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Menu shadow="sm" width={200} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={<FunnelIcon size={13} weight="duotone" />}
                    styles={{ root: { fontWeight: 500 } }}
                  >
                    Filter by
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Filter by</Menu.Label>
                  <Menu.Item>Assignee</Menu.Item>
                  <Menu.Item>Priority</Menu.Item>
                  <Menu.Item>Due date</Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <TextInput
                miw={200}
                leftSection={<MagnifyingGlassIcon size={13} />}
                size="xs"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </Group>
          </Group>

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
                        displayStatus={group.key as DisplayStatus}
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
