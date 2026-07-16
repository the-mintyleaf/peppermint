"use client";

import { useCallback, useMemo, useState } from "react";
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
  useDebouncedValue,
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
import {
  useTeamMembers,
  useGroupedTasks,
  DISPLAY_STATUS_ORDER,
  DISPLAY_STATUS_LABELS,
} from "./general-view/GeneralViewDashboard.hooks";
import type { Task, TaskBoardFilter, TaskStatus } from "./kanban/module.api";
import tableClasses from "./general-view/TaskTable.module.css";

type TaskView = "list" | "board";

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
  const [view, setView] = useState<TaskView>("list");

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeFilter = TAB_INDEX_MAP[activeTabIndex];

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Board-only: card detail + create/edit form state.
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

  const { data: tasks, isLoading } = useTasks(activeFilter);
  const { tasksByStatus, moveTask, reorderTask } = useKanbanBoard(
    tasks,
    activeFilter,
  );
  const { members, taskCountByMember } = useTeamMembers(tasks);
  const groupedTasks = useGroupedTasks(
    tasks,
    debouncedSearch,
    selectedMemberId,
  );

  // Board body applies search + member filters over the drag-ordered columns.
  const filteredByStatus = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return Object.fromEntries(
      Object.entries(tasksByStatus).map(([status, list]) => [
        status,
        list.filter((t) => {
          const matchesSearch =
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.taskNumber.toLowerCase().includes(q);
          const matchesMember =
            !selectedMemberId ||
            t.assignees?.some((a) => a.name === selectedMemberId) ||
            t.assignee === selectedMemberId;
          return matchesSearch && matchesMember;
        }),
      ]),
    ) as typeof tasksByStatus;
  }, [tasksByStatus, debouncedSearch, selectedMemberId]);

  const totalVisible = useMemo(() => {
    if (view === "board") {
      return Object.values(filteredByStatus).reduce(
        (sum, list) => sum + list.length,
        0,
      );
    }
    return DISPLAY_STATUS_ORDER.reduce(
      (sum, s) => sum + groupedTasks[s].length,
      0,
    );
  }, [view, filteredByStatus, groupedTasks]);

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
              count={isLoading ? undefined : totalVisible}
              description={TASKS_SUBHEADING}
            />
          </Box>

          {/* Board filter tabs + view toggle + tools */}
          <Group justify="space-between" px="md" gap="xs" wrap="nowrap">
            <SegmentedControl
              withItemsBorders={false}
              value={String(activeTabIndex)}
              onChange={(v) => setActiveTabIndex(Number(v))}
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
                styles={{
                  label: { paddingInline: 10 },
                }}
              />

              <TeamMembersPanel
                members={members}
                taskCountByMember={taskCountByMember}
                selectedMemberId={selectedMemberId}
                onSelect={setSelectedMemberId}
              />

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
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
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
                  tasksByStatus={filteredByStatus}
                  onMoveTask={moveTask}
                  onReorderTask={reorderTask}
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
                ) : totalVisible === 0 ? (
                  <Stack align="center" justify="center" h={300} gap="xs">
                    <Text c="dimmed" size="sm">
                      No tasks found
                    </Text>
                    {(debouncedSearch || selectedMemberId) && (
                      <Text
                        size="xs"
                        c="blue"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSearchInput("");
                          setSelectedMemberId(null);
                        }}
                      >
                        Clear filters
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Box>
                    {DISPLAY_STATUS_ORDER.map((status) => (
                      <TaskGroupSection
                        key={status}
                        displayStatus={status}
                        label={DISPLAY_STATUS_LABELS[status]}
                        tasks={groupedTasks[status]}
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
