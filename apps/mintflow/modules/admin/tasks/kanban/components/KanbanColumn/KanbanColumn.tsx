"use client";

import { memo, useMemo } from "react";
import { Badge, Box, Stack, Text } from "@peppermint/ui";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "../KanbanCard";
import type { ColumnConfig, KanbanColumnProps } from "./KanbanColumn.types";
import type { Task, TaskStatus } from "../../module.api";

const COLUMN_CONFIG: Record<TaskStatus, ColumnConfig> = {
  inbox:    { label: "Task Inbox",              bg: "var(--mantine-color-gray-1)",   badgeColor: "gray"   },
  ongoing:  { label: "Ongoing",                 bg: "var(--mantine-color-blue-0)",   badgeColor: "blue"   },
  hold:     { label: "Hold / Pending Approval", bg: "var(--mantine-color-orange-0)", badgeColor: "orange" },
  rejected: { label: "Rejected",                bg: "var(--mantine-color-red-0)",    badgeColor: "red"    },
};

export const KanbanColumn = memo(function KanbanColumn({ status, tasks, onCardClick }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isDragging = active !== null;
  const backgroundOpacity = isDragging ? (isOver ? 1 : 0.6) : 1;

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const groups = useMemo(
    () =>
      tasks.reduce<Record<string, Task[]>>((acc, task) => {
        if (!acc[task.group]) acc[task.group] = [];
        acc[task.group].push(task);
        return acc;
      }, {}),
    [tasks]
  );

  return (
    <Box
      ref={setNodeRef}
      style={{
        position: "relative",
        minWidth: 300,
        maxWidth: 340,
        flex: "1 0 300px",
        alignSelf: "stretch",
        borderRadius: "var(--mantine-radius-md)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <Box
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backgroundColor: config.bg,
          opacity: backgroundOpacity,
          transition: "opacity 0.25s ease-in-out",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Box style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Box px="sm" pt="sm" pb={6}>
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text fw={700} size="sm">{config.label}</Text>
          <Badge color={config.badgeColor} variant="light" size="xs" radius="sm">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </Badge>
        </Box>
      </Box>

      <Box px="sm" pb="sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {Object.entries(groups).map(([groupLabel, groupTasks]) => (
            <Box key={groupLabel} mb={6}>
              <Text size="xs" fw={600} c="dimmed" mb={6} style={{ letterSpacing: "0.06em" }}>
                {groupLabel}
              </Text>
              <Stack gap={6}>
                {groupTasks.map((task) => (
                  <KanbanCard key={task.id} task={task} onCardClick={onCardClick} />
                ))}
              </Stack>
            </Box>
          ))}

          {tasks.length === 0 && (
            <Box
              style={{
                flex: 1,
                minHeight: 120,
                width: "100%",
                border: "2px dashed var(--mantine-color-gray-3)",
                borderRadius: "var(--mantine-radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="xs" c="dimmed">No tasks</Text>
            </Box>
          )}
        </SortableContext>
      </Box>
      </Box>
    </Box>
  );
});
