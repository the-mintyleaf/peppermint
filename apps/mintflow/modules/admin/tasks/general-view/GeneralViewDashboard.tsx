"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
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
  { value: "all",        label: "All Tasks"        },
  { value: "mine",       label: "My Board"         },
  { value: "team",       label: "Team Board"       },
  { value: "department", label: "Department Board" },
];

const TAB_INDEX_MAP: TaskBoardFilter[] = TABS.map((t) => t.value);
const TAB_SEGMENTS = TABS.map((tab, i) => ({ label: tab.label, value: String(i) }));

const BREADCRUMB = [
  { label: "Tasks",        href: "/admin/tasks"              },
  { label: "General View", href: "/admin/tasks/general-view" },
];

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
  const groupedTasks = useGroupedTasks(tasks, debouncedSearch, selectedMemberId);

  const totalVisible = useMemo(
    () => DISPLAY_STATUS_ORDER.reduce((sum, s) => sum + groupedTasks[s].length, 0),
    [groupedTasks]
  );

  return (
    <Paper>
      <Stack gap={0} h="100vh" style={{ overflow: "hidden" }}>
        <ModuleHeader
          breadcrumbItems={BREADCRUMB}
          right={
            <Button
              size="xs"
              leftSection={<PlusIcon size={16} aria-label="Add task" />}
              mr="sm"
              onClick={() => setCreateOpen(true)}
            >
              New Task
            </Button>
          }
        />

        {/* Filter tabs + search */}
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

        {/* Team avatar strip */}
        <TeamMembersPanel
          members={members}
          taskCountByMember={taskCountByMember}
          selectedMemberId={selectedMemberId}
          onSelect={setSelectedMemberId}
        />

        <Divider />

        {/* Column headers */}
        <Box className={`${tableClasses.table} ${tableClasses.header} ${tableClasses.grid}`}>
          <span />
          <span className={tableClasses.headerLabel}>Case ID</span>
          <span className={tableClasses.headerLabel}>Task</span>
          <span className={tableClasses.headerLabel}>Assigned By</span>
          <span className={tableClasses.headerLabel}>Status Tracking</span>
          <span className={tableClasses.headerLabel}>Date, Deadline</span>
        </Box>

        {/* Task list */}
        <ScrollArea className={tableClasses.table} style={{ flex: 1, minHeight: 0 }}>
          {isLoading ? (
            <Stack p="md" gap="xs">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={48} radius="sm" />
              ))}
            </Stack>
          ) : totalVisible === 0 ? (
            <Stack align="center" justify="center" h={300} gap="xs">
              <Text c="dimmed" size="sm">No tasks found</Text>
              {(debouncedSearch || selectedMemberId) && (
                <Text
                  size="xs"
                  c="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => { setSearchInput(""); setSelectedMemberId(null); }}
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
