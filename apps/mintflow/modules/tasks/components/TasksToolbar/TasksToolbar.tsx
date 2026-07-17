"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Menu,
  SegmentedControl,
  Text,
  TextInput,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { SortDescendingIcon } from "@phosphor-icons/react/dist/csr/SortDescending";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { TeamMembersPanel } from "../../general-view/components/TeamMembersPanel";
import { useTasksStore } from "../../Tasks.store";
import type {
  DueWindow,
  GroupBy,
  SortBy,
  TaskBoardFilter,
  TaskPriority,
  TaskView,
} from "../../Tasks.types";
import type { TasksToolbarProps } from "./TasksToolbar.types";

const TABS: { value: TaskBoardFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "mine", label: "My Board" },
  { value: "team", label: "Team Board" },
  { value: "department", label: "Department Board" },
];

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

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "manual", label: "Manual order" },
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "name", label: "Name" },
  { value: "created", label: "Created" },
];

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
  { value: "list", label: "List" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "important", label: "Important" },
  { value: "normal", label: "Normal" },
];

const DUE_OPTIONS: { value: DueWindow | null; label: string }[] = [
  { value: null, label: "Any time" },
  { value: "overdue", label: "Overdue" },
  { value: "week", label: "Due this week" },
  { value: "month", label: "Due this month" },
];

const secondaryButton = {
  variant: "light" as const,
  color: "gray" as const,
  size: "xs" as const,
  styles: { root: { fontWeight: 500 } },
};

export function TasksToolbar({
  members,
  taskCountByMember,
}: TasksToolbarProps) {
  const view = useTasksStore((s) => s.view);
  const setView = useTasksStore((s) => s.setView);
  const boardFilter = useTasksStore((s) => s.boardFilter);
  const setBoardFilter = useTasksStore((s) => s.setBoardFilter);
  const search = useTasksStore((s) => s.search);
  const setSearch = useTasksStore((s) => s.setSearch);
  const selectedMemberId = useTasksStore((s) => s.selectedMemberId);
  const setSelectedMember = useTasksStore((s) => s.setSelectedMember);
  const sortBy = useTasksStore((s) => s.sortBy);
  const sortDir = useTasksStore((s) => s.sortDir);
  const setSort = useTasksStore((s) => s.setSort);
  const toggleSortDir = useTasksStore((s) => s.toggleSortDir);
  const groupBy = useTasksStore((s) => s.groupBy);
  const setGroupBy = useTasksStore((s) => s.setGroupBy);
  const filters = useTasksStore((s) => s.filters);
  const setFilters = useTasksStore((s) => s.setFilters);
  const clearFilters = useTasksStore((s) => s.clearFilters);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;
  const groupLabel = GROUP_OPTIONS.find((o) => o.value === groupBy)?.label;
  const filterCount =
    filters.assignees.length +
    filters.priorities.length +
    (filters.due ? 1 : 0);

  const toggleAssignee = (name: string) =>
    setFilters({
      assignees: filters.assignees.includes(name)
        ? filters.assignees.filter((n) => n !== name)
        : [...filters.assignees, name],
    });

  const togglePriority = (priority: TaskPriority) =>
    setFilters({
      priorities: filters.priorities.includes(priority)
        ? filters.priorities.filter((p) => p !== priority)
        : [...filters.priorities, priority],
    });

  return (
    <Group justify="space-between" px="md" gap="xs" wrap="nowrap">
      <SegmentedControl
        withItemsBorders={false}
        value={boardFilter}
        onChange={(v) => setBoardFilter(v as TaskBoardFilter)}
        data={TABS.map((tab) => ({ label: tab.label, value: tab.value }))}
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

        {view === "list" && (
          <Menu shadow="sm" width={180} position="bottom-end">
            <Menu.Target>
              <Button
                {...secondaryButton}
                leftSection={<StackIcon size={13} weight="duotone" />}
              >
                Group: {groupLabel}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Group by</Menu.Label>
              {GROUP_OPTIONS.map((opt) => (
                <Menu.Item
                  key={opt.value}
                  role="menuitemradio"
                  aria-checked={groupBy === opt.value}
                  onClick={() => setGroupBy(opt.value)}
                  leftSection={<SelectedMark active={groupBy === opt.value} />}
                >
                  {opt.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}

        <Menu shadow="sm" width={190} position="bottom-end">
          <Menu.Target>
            <Button
              {...secondaryButton}
              leftSection={<SortAscendingIcon size={13} weight="duotone" />}
            >
              Sort: {sortLabel}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Sort by</Menu.Label>
            {SORT_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.value}
                role="menuitemradio"
                aria-checked={sortBy === opt.value}
                onClick={() => setSort(opt.value)}
                leftSection={<SelectedMark active={sortBy === opt.value} />}
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          aria-label={sortDir === "asc" ? "Sort ascending" : "Sort descending"}
          disabled={sortBy === "manual"}
          onClick={toggleSortDir}
        >
          {sortDir === "asc" ? (
            <SortAscendingIcon size={15} />
          ) : (
            <SortDescendingIcon size={15} />
          )}
        </ActionIcon>

        <Menu
          shadow="sm"
          width={220}
          position="bottom-end"
          closeOnItemClick={false}
        >
          <Menu.Target>
            <Button
              {...secondaryButton}
              leftSection={<FunnelIcon size={13} weight="duotone" />}
              rightSection={
                filterCount > 0 ? (
                  <Badge size="xs" circle variant="filled" color="blue">
                    {filterCount}
                  </Badge>
                ) : undefined
              }
            >
              Filter
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Assignee</Menu.Label>
            {members.map((member) => (
              <Menu.Item
                key={member.id}
                role="menuitemcheckbox"
                aria-checked={filters.assignees.includes(member.name)}
                onClick={() => toggleAssignee(member.name)}
                leftSection={
                  <Checkbox
                    size="xs"
                    checked={filters.assignees.includes(member.name)}
                    readOnly
                    tabIndex={-1}
                    aria-hidden
                  />
                }
              >
                {member.name}
              </Menu.Item>
            ))}

            <Divider my={4} />
            <Menu.Label>Priority</Menu.Label>
            {PRIORITY_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.value}
                role="menuitemcheckbox"
                aria-checked={filters.priorities.includes(opt.value)}
                onClick={() => togglePriority(opt.value)}
                leftSection={
                  <Checkbox
                    size="xs"
                    checked={filters.priorities.includes(opt.value)}
                    readOnly
                    tabIndex={-1}
                    aria-hidden
                  />
                }
              >
                {opt.label}
              </Menu.Item>
            ))}

            <Divider my={4} />
            <Menu.Label>Due</Menu.Label>
            {DUE_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.label}
                role="menuitemradio"
                aria-checked={filters.due === opt.value}
                onClick={() => setFilters({ due: opt.value })}
                leftSection={
                  <SelectedMark active={filters.due === opt.value} />
                }
              >
                {opt.label}
              </Menu.Item>
            ))}

            {filterCount > 0 && (
              <>
                <Divider my={4} />
                <Menu.Item c="red" onClick={clearFilters}>
                  Clear all filters
                </Menu.Item>
              </>
            )}
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
  );
}

// Fixed-width slot so menu labels stay aligned whether or not the check shows.
function SelectedMark({ active }: { active: boolean }) {
  return (
    <Text component="span" c="blue" style={{ width: 12, display: "flex" }}>
      {active ? <CheckIcon size={12} weight="bold" /> : null}
    </Text>
  );
}
