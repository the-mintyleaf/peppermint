"use client";

import { useMemo, useState } from "react";
import {
  AccessMenu,
  Box,
  Button,
  Divider,
  Group,
  ManageHeader,
  Menu,
  ModuleHeader,
  Paper,
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
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { ColumnsIcon } from "@phosphor-icons/react/dist/csr/Columns";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";
import { useTasks } from "../kanban/KanbanDashboard.hooks";
import { CreateTaskModal } from "../kanban/components/CreateTaskModal";
import { TeamMembersPanel } from "./components/TeamMembersPanel";
import { TaskGroupSection } from "./components/TaskGroupSection";
import {
  useTeamMembers,
  useGroupedTasks,
  DISPLAY_STATUS_ORDER,
  DISPLAY_STATUS_LABELS,
} from "./GeneralViewDashboard.hooks";
import type { Task, TaskBoardFilter } from "../kanban/module.api";
import type { GeneralViewDashboardProps } from "./GeneralViewDashboard.types";
import tableClasses from "./TaskTable.module.css";

const TABS: { value: TaskBoardFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "mine", label: "My Board" },
  { value: "team", label: "Team Board" },
  { value: "department", label: "Department Board" },
];

const TAB_INDEX_MAP: TaskBoardFilter[] = TABS.map((t) => t.value);
const TAB_SEGMENTS = TABS.map((tab, i) => ({
  label: tab.label,
  value: String(i),
}));

const BREADCRUMB = [{ label: "Tasks", href: "/admin/tasks/general-view" }];
const TASKS_SUBHEADING =
  "View and filter tasks across boards, team members, and status.";

export function GeneralViewDashboard(_props: GeneralViewDashboardProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeFilter = TAB_INDEX_MAP[activeTabIndex];

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const handleCloseForm = () => {
    setCreateOpen(false);
    setEditTask(null);
  };

  const { data: tasks, isLoading } = useTasks(activeFilter);
  const { members, taskCountByMember } = useTeamMembers(tasks);
  const groupedTasks = useGroupedTasks(
    tasks,
    debouncedSearch,
    selectedMemberId,
  );

  const totalVisible = useMemo(
    () =>
      DISPLAY_STATUS_ORDER.reduce((sum, s) => sum + groupedTasks[s].length, 0),
    [groupedTasks],
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
                leftSection={<PlusIcon size={16} aria-label="Add task" />}
                onClick={() => setCreateOpen(true)}
              >
                New Task
              </Button>
            </Group>
          }
        />

        <Box px="md">
          <ManageHeader
            title="Tasks"
            count={isLoading ? undefined : totalVisible}
            description={TASKS_SUBHEADING}
          />
        </Box>

        {/* Filter tabs + search */}
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

{/* Group by */}
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
                <Menu.Item leftSection={<RowsIcon size={12} weight="duotone" />} fw={600}>Status</Menu.Item>
                <Menu.Item leftSection={<FunnelIcon size={12} weight="duotone" />}>Priority</Menu.Item>
                <Menu.Item leftSection={<ColumnsIcon size={12} weight="duotone" />}>List</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Sort */}
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

            {/* View */}
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
                <Menu.Item>List</Menu.Item>
                <Menu.Item>Due date</Menu.Item>
                <Menu.Item>Assignee</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Filter by */}
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
                <Menu.Item>List</Menu.Item>
              </Menu.Dropdown>
            </Menu>

{/* Search */}
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
      </Stack>

      <CreateTaskModal
        opened={createOpen || !!editTask}
        editTask={editTask}
        onClose={handleCloseForm}
      />
    </Paper>
  );
}
