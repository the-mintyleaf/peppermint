"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Avatar,
  Badge,
  Box,
  Collapse,
  DatePicker,
  Menu,
  Popover,
  Text,
} from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/csr/CaretUpDown";
import type {
  Task,
  TaskAssignee,
  TaskPriority,
} from "../../../kanban/module.api";
import { useUpdateTaskFields } from "../../../kanban/KanbanDashboard.hooks";
import { useTasksStore } from "../../../Tasks.store";
import { taskGridStyle } from "../../taskGrid";
import type { VisibleColumns } from "../../../Tasks.types";
import type { TaskListRowProps } from "./TaskListRow.types";
import tableClasses from "../../TaskTable.module.css";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: "Urgent",
  important: "High",
  normal: "Normal",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  urgent: "red",
  important: "orange",
  normal: "green",
};

const ALL_PRIORITIES: TaskPriority[] = ["urgent", "important", "normal"];

const ALL_LISTS = [
  "Client Projects",
  "General Tasks",
  "Finance",
  "Operations",
  "HR",
  "Compliance",
  "Marketing",
];

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveAssignees(task: Task): TaskAssignee[] {
  if (task.assignees?.length) return task.assignees;
  return [
    { name: task.assignee, initials: toInitials(task.assignee), color: "gray" },
  ];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseDateStr(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// Mantine 9 date components use "YYYY-MM-DD" strings, but this component's logic
// is Date-based — convert at the DatePicker boundary (local time, no UTC shift).
function toDateValue(date: Date | null): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateValue(value: string | null): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function PriorityCell({
  priority,
  onChange,
}: {
  priority: TaskPriority;
  onChange: (p: TaskPriority) => void;
}) {
  return (
    <Menu shadow="sm" width={140} position="bottom-start" withinPortal>
      <Menu.Target>
        <div
          className={tableClasses.inlineCell}
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="filled"
            color={PRIORITY_COLOR[priority]}
            size="xs"
            radius="sm"
            rightSection={<CaretUpDownIcon size={9} />}
          >
            {PRIORITY_LABEL[priority]}
          </Badge>
        </div>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        {ALL_PRIORITIES.map((p) => (
          <Menu.Item
            key={p}
            onClick={() => onChange(p)}
            leftSection={
              <Badge
                variant="filled"
                color={PRIORITY_COLOR[p]}
                size="xs"
                radius="sm"
              >
                {PRIORITY_LABEL[p]}
              </Badge>
            }
          />
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

function ListCell({
  group,
  onChange,
}: {
  group: string;
  onChange: (g: string) => void;
}) {
  return (
    <Menu shadow="sm" width={160} position="bottom-start" withinPortal>
      <Menu.Target>
        <div
          className={`${tableClasses.listCell} ${tableClasses.inlineCell}`}
          style={{ margin: "-2px -4px", padding: "2px 4px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <SquaresFourIcon
            size={11}
            weight="fill"
            color="var(--mantine-color-gray-5)"
            aria-label="List"
          />
          <span className={tableClasses.listText}>{group}</span>
          <CaretUpDownIcon
            size={9}
            color="var(--mantine-color-gray-4)"
            style={{ flexShrink: 0 }}
          />
        </div>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        {ALL_LISTS.map((g) => (
          <Menu.Item
            key={g}
            onClick={() => onChange(g)}
            leftSection={
              <SquaresFourIcon
                size={12}
                weight="fill"
                color="var(--mantine-color-gray-5)"
              />
            }
            fw={g === group ? 600 : 400}
          >
            <Text size="xs">{g}</Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

function DueDateCell({
  date,
  onChange,
}: {
  date: Date | null;
  onChange: (d: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      opened={open}
      onChange={setOpen}
      position="bottom-start"
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <div
          className={tableClasses.inlineCell}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          {date ? (
            <span className={tableClasses.dueText}>
              {formatDisplayDate(date)}
            </span>
          ) : (
            <span className={tableClasses.duePlaceholder}>
              <CalendarBlankIcon size={11} weight="fill" />
              Add date
            </span>
          )}
        </div>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()} p="xs">
        <DatePicker
          value={toDateValue(date)}
          onChange={(d) => {
            onChange(fromDateValue(d));
            setOpen(false);
          }}
          size="xs"
        />
      </Popover.Dropdown>
    </Popover>
  );
}

function SubtaskRow({
  subtask,
  index,
  columns,
  gridStyle,
}: {
  subtask: NonNullable<Task["subtasks"]>[number];
  index: number;
  columns: VisibleColumns;
  gridStyle: CSSProperties;
}) {
  const dueDate = parseDateStr(subtask.dueDate);

  return (
    <div
      className={`${tableClasses.grid} ${tableClasses.row} ${tableClasses.subtaskRow}`}
      style={gridStyle}
    >
      <div className={tableClasses.leftCell}>
        <span className={tableClasses.expandIcon} />
        <span className={tableClasses.subtaskIdText}>S-{index + 1}</span>
      </div>
      <div className={tableClasses.nameCell}>
        <span className={tableClasses.subtaskNameText}>{subtask.title}</span>
      </div>
      {columns.priority && (
        <div>
          <Badge
            variant="light"
            color={
              subtask.status === "completed"
                ? "green"
                : subtask.status === "in_progress"
                  ? "blue"
                  : "gray"
            }
            size="xs"
            radius="sm"
          >
            {subtask.status === "completed"
              ? "Done"
              : subtask.status === "in_progress"
                ? "In progress"
                : "Pending"}
          </Badge>
        </div>
      )}
      <div className={tableClasses.listCell}>
        <Text size="xs" c="dimmed">
          {subtask.category}
        </Text>
      </div>
      {columns.due && (
        <div>
          {dueDate ? (
            <span className={tableClasses.dueText}>
              {formatDisplayDate(dueDate)}
            </span>
          ) : (
            <span className={tableClasses.duePlaceholder}>
              <CalendarBlankIcon size={10} weight="fill" />
              Add date
            </span>
          )}
        </div>
      )}
      {columns.assignee && <div />}
    </div>
  );
}

export function TaskListRow({ task, onOpenTask }: TaskListRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;

  const columns = useTasksStore((s) => s.visibleColumns);
  const gridStyle = taskGridStyle(columns);
  const { mutate: patchTask } = useUpdateTaskFields();

  const assignees = resolveAssignees(task);

  return (
    <>
      <div
        className={`${tableClasses.grid} ${tableClasses.row}`}
        style={gridStyle}
        onClick={() => onOpenTask(task)}
      >
        {/* Col 1: caret (toggles subtasks) + task number */}
        <div className={tableClasses.leftCell}>
          <span
            className={tableClasses.expandIcon}
            onClick={(e) => {
              if (!hasSubtasks) return;
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            style={{ cursor: hasSubtasks ? "pointer" : "default" }}
          >
            {hasSubtasks &&
              (expanded ? (
                <CaretDownIcon size={11} aria-label="Collapse subtasks" />
              ) : (
                <CaretRightIcon size={11} aria-label="Expand subtasks" />
              ))}
          </span>
          <span className={tableClasses.idText}>{task.taskNumber}</span>
        </div>

        {/* Col 2: name + subtask count chip */}
        <div className={tableClasses.nameCell}>
          <span className={tableClasses.nameText}>{task.title}</span>
          {hasSubtasks && (
            <span className={tableClasses.subtaskChip}>
              <TreeStructureIcon size={9} weight="fill" />
              {task.subtasks!.length}
            </span>
          )}
        </div>

        {/* Col 3: priority — inline editable */}
        {columns.priority && (
          <PriorityCell
            priority={task.priority}
            onChange={(p) => patchTask({ id: task.id, patch: { priority: p } })}
          />
        )}

        {/* Col 4: list — inline editable */}
        <ListCell
          group={task.group}
          onChange={(g) => patchTask({ id: task.id, patch: { group: g } })}
        />

        {/* Col 5: due date — inline editable */}
        {columns.due && (
          <DueDateCell
            date={parseDateStr(task.endDate)}
            onChange={(d) =>
              patchTask({
                id: task.id,
                patch: { endDate: toDateValue(d) ?? undefined },
              })
            }
          />
        )}

        {/* Col 6: assignee avatars */}
        {columns.assignee && (
          <div className={tableClasses.assigneeCell}>
            <Avatar.Group spacing="xs">
              {assignees.slice(0, 4).map((a) => (
                <Avatar key={a.name} size="xs" color={a.color} radius="xl">
                  {a.initials}
                </Avatar>
              ))}
              {assignees.length > 4 && (
                <Avatar size="xs" radius="xl" color="gray">
                  +{assignees.length - 4}
                </Avatar>
              )}
            </Avatar.Group>
          </div>
        )}
      </div>

      {hasSubtasks && (
        <Collapse expanded={expanded}>
          <Box className={tableClasses.subtaskBlock}>
            {task.subtasks!.map((sub, i) => (
              <SubtaskRow
                key={sub.id}
                subtask={sub}
                index={i}
                columns={columns}
                gridStyle={gridStyle}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
}
