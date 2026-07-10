"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AccessMenu,
  Box,
  Button,
  Group,
  ManageHeader,
  Menu,
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
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { ColumnsIcon } from "@phosphor-icons/react/dist/csr/Columns";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { TeamMembersPanel } from "../general-view/components/TeamMembersPanel";
import { useTasks, useKanbanBoard } from "./KanbanDashboard.hooks";
import { useTeamMembers } from "../general-view/GeneralViewDashboard.hooks";
import type { Task, TaskBoardFilter, TaskStatus } from "./module.api";

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

const BREADCRUMB = [{ label: "Tasks", href: "/admin/tasks" }];
const KANBAN_SUBHEADING =
  "Move tasks between stages by dragging cards — keep your team's work flowing in real time.";

export function KanbanDashboard() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = TAB_INDEX_MAP[activeTabIndex];

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const handleCardClick = useCallback(
    (task: Task) => setSelectedTask(task),
    [],
  );
  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

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

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: tasks, isLoading } = useTasks(activeTab);
  const { tasksByStatus, moveTask, reorderTask } = useKanbanBoard(
    tasks,
    activeTab,
  );
  const { members, taskCountByMember } = useTeamMembers(tasks);

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

  const totalVisible = useMemo(
    () =>
      Object.values(filteredByStatus).reduce(
        (sum, list) => sum + list.length,
        0,
      ),
    [filteredByStatus],
  );

  return (
    <Paper>
      <Stack gap={0} h="100vh" style={{ overflow: "hidden" }}>
        <ModuleHeader
          breadcrumbItems={BREADCRUMB}
          right={
            <Group gap="xs" mr="sm">
              <AccessMenu data={{ accounts: [], roles: [] }} />
              <Button
                size="xs"
                leftSection={<PlusIcon size={16} aria-label="Add" />}
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

        <Box px="md">
          <ManageHeader
            title="Task Board"
            count={isLoading ? undefined : totalVisible}
            description={KANBAN_SUBHEADING}
          />
        </Box>

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
            <TeamMembersPanel
              members={members}
              taskCountByMember={taskCountByMember}
              selectedMemberId={selectedMemberId}
              onSelect={setSelectedMemberId}
            />

            <Menu shadow="sm" width={180} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="light"
                  color="gray"
                  size="xs"
                  leftSection={<SortAscendingIcon size={13} weight="duotone" />}
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

        <Box
          p="md"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "auto",
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
      </Stack>

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
    </Paper>
  );
}
