"use client";

import { memo } from "react";
import { Badge, Box, Group, Paper, Text } from "@peppermint/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../../module.api";
import type { KanbanCardProps } from "./KanbanCard.types";

const PRIORITY_CONFIG = {
  urgent: { color: "#e03131", label: "URGENT", textColor: "red.7" },
  important: { color: "#f08c00", label: "IMPORTANT", textColor: "orange.6" },
  normal: null,
} as const;

export const KanbanCard = memo(function KanbanCard({ task, overlay = false, onCardClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const dragProps = overlay ? {} : { ref: setNodeRef, ...attributes, ...listeners };

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

  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <Paper
      {...dragProps}
      style={style}
      withBorder
      radius="md"
      p="md"
      bg="white"
      onClick={!overlay && onCardClick && !isDragging ? () => onCardClick(task) : undefined}
    >
      <Group justify="space-between" align="flex-start" mb={8} wrap="nowrap">
        <Badge
          color={CATEGORY_COLORS[task.category]}
          variant="filled"
          size="sm"
          radius="xl"
          tt="uppercase"
          fw={700}
          style={{ flexShrink: 0 }}
        >
          {CATEGORY_LABELS[task.category]}
        </Badge>
        <Text size="xs" c="orange.6" fw={600} style={{ whiteSpace: "nowrap" }}>
          {task.taskNumber}
        </Text>
      </Group>

      <Text size="sm" fw={600} lh={1.4} mb={10}>
        {task.title}
      </Text>

      {priority && (
        <Group gap={6} mb={8}>
          <Box
            w={10}
            h={10}
            style={{ borderRadius: "50%", backgroundColor: priority.color, flexShrink: 0 }}
          />
          <Text size="xs" fw={700} c={priority.textColor}>
            {priority.label}
          </Text>
        </Group>
      )}

      <Group justify="space-between" align="center" mt={priority ? 0 : 4}>
        <Text size="xs" c="dimmed">{task.createdAt}</Text>
        <Text size="xs" fw={500}>Assignee : {task.assignee}</Text>
      </Group>

      {(task.requestStatus || task.approvalStatus) && (
        <Group
          justify="space-between"
          mt={8}
          pt={8}
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          {task.requestStatus && (
            <Text size="xs" c="blue.6" fw={500} style={{ cursor: "pointer" }}>
              {task.requestStatus}
            </Text>
          )}
          {task.approvalStatus && (
            <Text size="xs" c="dimmed">{task.approvalStatus}</Text>
          )}
        </Group>
      )}
    </Paper>
  );
});
