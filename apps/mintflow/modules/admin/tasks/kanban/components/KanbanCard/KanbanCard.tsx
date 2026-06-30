"use client";

import { memo, useMemo } from "react";
import { Avatar, Badge, Box, Group, Paper, Text } from "@peppermint/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { ChartPieSliceIcon } from "@phosphor-icons/react/dist/csr/ChartPieSlice";
import type { TaskAssignee } from "../../module.api";
import type { KanbanCardProps } from "./KanbanCard.types";
import classes from "./KanbanCard.module.css";

const PRIORITY_LABELS = {
  urgent: "Urgent",
  important: "Important",
  normal: "Normal",
} as const;

const PRIORITY_COLORS: Record<keyof typeof PRIORITY_LABELS, string> = {
  urgent: "red",
  important: "orange",
  normal: "blue",
};

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDisplayDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRemainingDays(endDate?: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getSubtaskProgress(subtasks?: { status: string }[]): number | null {
  if (!subtasks?.length) return null;
  const completed = subtasks.filter((s) => s.status === "completed").length;
  return Math.round((completed / subtasks.length) * 100);
}

function resolveAssignees(task: KanbanCardProps["task"]): TaskAssignee[] {
  if (task.assignees?.length) return task.assignees;
  return [
    { name: task.assignee, initials: toInitials(task.assignee), color: "gray" },
  ];
}

export const KanbanCard = memo(function KanbanCard({
  task,
  overlay = false,
  onCardClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const dragProps = overlay
    ? {}
    : { ref: setNodeRef, ...attributes, ...listeners };

  const style = overlay
    ? {
      transform: "scale(1.03) rotate(0.8deg)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
      cursor: "grabbing" as const,
    }
    : {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0 : 1,
      cursor: "grab" as const,
    };

  const assignees = useMemo(() => resolveAssignees(task), [task]);
  const displayDate = formatDisplayDate(task.endDate) ?? task.createdAt;
  const attachmentCount = task.attachments?.length ?? 0;
  const progress = getSubtaskProgress(task.subtasks);
  const remainingDays = getRemainingDays(task.endDate);
  return (
    <Paper
      {...dragProps}
      style={style}
      className={overlay ? undefined : classes.card}
      withBorder
      radius="md"
      p="sm"
      bg="white"
      onClick={
        !overlay && onCardClick && !isDragging
          ? () => onCardClick(task)
          : undefined
      }
    >
      <Text size="sm" fw={600} lh={1.4} mb={10}>
        {task.title}
      </Text>

      <Group gap={6} align="center" mb={10} wrap="nowrap">
        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
          Assignees:
        </Text>
        <Avatar.Group>
          {assignees.slice(0, 3).map((assignee) => (
            <Avatar
              key={assignee.name}
              size="sm"
              color={assignee.color}
              radius="xl"
            >
              {assignee.initials}
            </Avatar>
          ))}
          {assignees.length > 3 && (
            <Avatar size="sm" radius="xl" color="gray">
              +{assignees.length - 3}
            </Avatar>
          )}
        </Avatar.Group>
      </Group>

      <Group justify="space-between" align="center" mb={10} wrap="nowrap">
        <Group gap={6} align="center" wrap="nowrap">
          <CalendarBlankIcon size={14} weight="fill" color="var(--mantine-color-gray-5)" />
          <Text size="xs" c="dimmed">
            {displayDate}
          </Text>
        </Group>
        <Badge variant="light" color={PRIORITY_COLORS[task.priority]} size="xs" radius="sm">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </Group>

      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={12} align="center" wrap="nowrap">
          <Group gap={4} align="center" wrap="nowrap">
            <PaperclipIcon size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">
              {attachmentCount}
            </Text>
          </Group>

          {progress !== null && (
            <Group gap={4} align="center" wrap="nowrap">
              <ChartPieSliceIcon
                size={14}
                color="var(--mantine-color-gray-5)"
              />
              <Text size="xs" c="dimmed">
                {progress}%
              </Text>
            </Group>
          )}
        </Group>

        {remainingDays !== null && (
          <Group gap={4} align="center" wrap="nowrap">
            <ClockIcon size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">
              Remaining {remainingDays}d
            </Text>
          </Group>
        )}
      </Group>

      {(task.requestStatus || task.approvalStatus) && (
        <Box
          mt={8}
          pt={8}
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Group justify="space-between" wrap="nowrap">
            {task.requestStatus && (
              <Text size="xs" c="dimmed" truncate>
                {task.requestStatus}
              </Text>
            )}
            {task.approvalStatus && (
              <Text size="xs" c="dimmed" truncate>
                {task.approvalStatus}
              </Text>
            )}
          </Group>
        </Box>
      )}

    </Paper>
  );
});
