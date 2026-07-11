"use client";

import { memo, useMemo } from "react";
import {
  ActionIcon,
  Badge,
  Box,
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
import { TrayIcon } from "@phosphor-icons/react/dist/csr/Tray";
import { SpinnerGapIcon } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/csr/HourglassMedium";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { KanbanCard } from "../KanbanCard";
import type { ColumnConfig, KanbanColumnProps } from "./KanbanColumn.types";
import type { TaskStatus } from "../../module.api";

const COLUMN_CONFIG: Record<TaskStatus, ColumnConfig> = {
  inbox: {
    label: "Task Inbox",
    sublabel: "Unassigned & waiting",
    dotColor: "blue",
    headerBg: "var(--mantine-color-blue-0)",
    headerBorder: "var(--mantine-color-blue-3)",
    icon: (
      <TrayIcon
        size={14}
        weight="fill"
        style={{ color: "var(--mantine-color-blue-5)" }}
      />
    ),
  },
  ongoing: {
    label: "In Progress",
    sublabel: "Actively being worked on",
    dotColor: "orange",
    headerBg: "var(--mantine-color-orange-0)",
    headerBorder: "var(--mantine-color-orange-3)",
    icon: (
      <SpinnerGapIcon
        size={14}
        weight="fill"
        style={{ color: "var(--mantine-color-orange-6)" }}
      />
    ),
  },
  hold: {
    label: "In Review",
    sublabel: "Pending approval or feedback",
    dotColor: "violet",
    headerBg: "var(--mantine-color-violet-0)",
    headerBorder: "var(--mantine-color-violet-3)",
    icon: (
      <HourglassMediumIcon
        size={14}
        weight="fill"
        style={{ color: "var(--mantine-color-violet-6)" }}
      />
    ),
  },
  rejected: {
    label: "Rejected",
    sublabel: "Declined or returned",
    dotColor: "red",
    headerBg: "var(--mantine-color-red-0)",
    headerBorder: "var(--mantine-color-red-3)",
    icon: (
      <XCircleIcon
        size={14}
        weight="fill"
        style={{ color: "var(--mantine-color-red-5)" }}
      />
    ),
  },
};

const COLUMN_GRADIENT_COLOR: Record<TaskStatus, string> = {
  inbox: "var(--mantine-color-blue-1)",
  ongoing: "var(--mantine-color-orange-1)",
  hold: "var(--mantine-color-violet-1)",
  rejected: "var(--mantine-color-red-1)",
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
        minHeight: 0,
        background: `linear-gradient(to top, ${COLUMN_GRADIENT_COLOR[status]} 0%, var(--mantine-color-gray-0) 90%)`,
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
      <Box
        px="sm"
        pt="sm"
        pb="sm"
        style={{
          borderRadius: "var(--mantine-radius-md) var(--mantine-radius-md) 0 0",
        }}
      >
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="xs"
        >
          <Group
            gap={8}
            align="center"
            wrap="nowrap"
            style={{ minWidth: 0, flex: 1 }}
          >
            {config.icon}
            <Box style={{ minWidth: 0 }}>
              <Group gap={6} align="center" wrap="nowrap">
                <Text fw={600} size="xs" truncate c="dark.6">
                  {config.label}
                </Text>
                <Badge variant="light" color={config.dotColor} size="xs">
                  {tasks.length}
                </Badge>
              </Group>
            </Box>
          </Group>

          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            <ActionIcon
              radius="xs"
              variant="subtle"
              color="gray"
              size="xs"
              aria-label="Add task"
              onClick={handleAddTask}
            >
              <PlusIcon weight="bold" size={14} />
            </ActionIcon>

            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  radius="xs"
                  variant="subtle"
                  color="gray"
                  size="xs"
                  aria-label="Column options"
                >
                  <DotsThreeVerticalIcon weight="bold" size={14} />
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
        {tasks.length > 0 ? (
          // Cards scroll inside the column so a tall column never grows the board.
          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap={4}>
                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onCardClick={onCardClick}
                  />
                ))}
              </Stack>
            </SortableContext>
          </Box>
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
      </Box>
    </Box>
  );
});
