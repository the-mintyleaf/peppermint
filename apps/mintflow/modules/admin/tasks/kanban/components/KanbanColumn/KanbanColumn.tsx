"use client";

import { memo, useMemo } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@peppermint/ui";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { KanbanCard } from "../KanbanCard";
import type { ColumnConfig, KanbanColumnProps } from "./KanbanColumn.types";
import type { TaskStatus } from "../../module.api";

const COLUMN_CONFIG: Record<TaskStatus, ColumnConfig> = {
  inbox: { label: "Task Inbox", dotColor: "gray" },
  ongoing: { label: "Ongoing", dotColor: "blue" },
  hold: { label: "Hold / Pending Approval", dotColor: "orange" },
  rejected: { label: "Rejected", dotColor: "red" },
};

export const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  onCardClick,
  onAddTask,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isDragging = active !== null;

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const handleAddTask = () => onAddTask?.(status);

  return (
    <Box
      ref={setNodeRef}
      style={{
        minWidth: 300,
        maxWidth: 340,
        flex: "1 0 300px",
        alignSelf: "stretch",
        borderRadius: "var(--mantine-radius-md)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        backgroundColor: "var(--mantine-color-gray-0)",
        border:
          isDragging && isOver
            ? "1px solid var(--mantine-color-gray-4)"
            : "1px solid var(--mantine-color-gray-2)",
        boxShadow:
          isDragging && isOver
            ? "inset 0 0 0 1px var(--mantine-color-gray-3)"
            : undefined,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <Box px="sm" pt="sm" pb={6}>
        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
          <Group
            gap={8}
            align="center"
            wrap="nowrap"
            style={{ minWidth: 0, flex: 1 }}
          >
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: "50%",
                backgroundColor: `var(--mantine-color-${config.dotColor}-6)`,
                flexShrink: 0,
              }}
            />
            <Text fw={600} size="sm" truncate>
              {config.label}
            </Text>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
            </Text>
          </Group>

          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="Add task"
              onClick={handleAddTask}
            >
              <PlusIcon size={14} />
            </ActionIcon>

            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label="Column options"
                >
                  <DotsThreeVerticalIcon size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item disabled>Sort by due date</Menu.Item>
                <Menu.Item disabled>Sort by priority</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <Box
        px="sm"
        pb="xs"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            <Stack gap={8}>
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onCardClick={onCardClick}
                />
              ))}
            </Stack>
          ) : (
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
              <Text size="xs" c="dimmed">
                No tasks
              </Text>
            </Box>
          )}
        </SortableContext>
      </Box>

      <Box px="sm" pb="sm" pt={4}>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          fullWidth
          leftSection={<PlusIcon size={14} />}
          onClick={handleAddTask}
          styles={{
            root: {
              fontWeight: 500,
              color: "var(--mantine-color-gray-6)",
            },
          }}
        >
          Add Task
        </Button>
      </Box>
    </Box>
  );
});
