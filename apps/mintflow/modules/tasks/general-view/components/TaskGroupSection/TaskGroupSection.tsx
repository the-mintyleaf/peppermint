"use client";

import { useState } from "react";
import { ActionIcon, Box, Collapse, Group, Text } from "@peppermint/ui";
import { SpinnerGapIcon } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { TrayIcon } from "@phosphor-icons/react/dist/csr/Tray";
import { ArrowCircleUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowCircleUpRight";
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/csr/HourglassMedium";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { TaskListRow } from "../TaskListRow";
import type { TaskGroupSectionProps } from "./TaskGroupSection.types";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  headerBg: string;
  headerBorder: string;
  countBg: string;
  countColor: string;
}

const STATUS_CONFIG: Record<DisplayStatus, StatusConfig> = {
  new: {
    icon: <TrayIcon size={13} weight="fill" />,
    label: "Backlog",
    headerBg: "var(--mantine-color-gray-0)",
    headerBorder: "var(--mantine-color-gray-2)",
    countBg: "var(--mantine-color-gray-2)",
    countColor: "var(--mantine-color-gray-7)",
  },
  in_progress: {
    icon: <SpinnerGapIcon size={13} weight="fill" />,
    label: "In Progress",
    headerBg: "var(--mantine-color-orange-0)",
    headerBorder: "var(--mantine-color-orange-2)",
    countBg: "var(--mantine-color-orange-1)",
    countColor: "var(--mantine-color-orange-8)",
  },
  ready_for_review: {
    icon: <ArrowCircleUpRightIcon size={13} weight="fill" />,
    label: "Ready for Review",
    headerBg: "var(--mantine-color-teal-0)",
    headerBorder: "var(--mantine-color-teal-2)",
    countBg: "var(--mantine-color-teal-1)",
    countColor: "var(--mantine-color-teal-8)",
  },
  in_review: {
    icon: <HourglassMediumIcon size={13} weight="fill" />,
    label: "In Review",
    headerBg: "var(--mantine-color-violet-0)",
    headerBorder: "var(--mantine-color-violet-2)",
    countBg: "var(--mantine-color-violet-1)",
    countColor: "var(--mantine-color-violet-8)",
  },
  rejected: {
    icon: <XCircleIcon size={13} weight="fill" />,
    label: "Rejected",
    headerBg: "var(--mantine-color-red-0)",
    headerBorder: "var(--mantine-color-red-2)",
    countBg: "var(--mantine-color-red-1)",
    countColor: "var(--mantine-color-red-8)",
  },
};

const ICON_COLOR: Record<DisplayStatus, string> = {
  new: "var(--mantine-color-gray-5)",
  in_progress: "var(--mantine-color-orange-6)",
  ready_for_review: "var(--mantine-color-teal-6)",
  in_review: "var(--mantine-color-violet-6)",
  rejected: "var(--mantine-color-red-5)",
};

export function TaskGroupSection({
  displayStatus,
  tasks,
}: TaskGroupSectionProps) {
  const [open, setOpen] = useState(true);
  const cfg = STATUS_CONFIG[displayStatus];
  const iconColor = ICON_COLOR[displayStatus];

  if (tasks.length === 0) return null;

  return (
    <Box>
      <Group
        px="md"
        gap="xs"
        style={{
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: cfg.headerBg,
          borderBottom: `1px solid ${cfg.headerBorder}`,
          borderTop: `1px solid ${cfg.headerBorder}`,
          minHeight: 36,
          paddingTop: 6,
          paddingBottom: 6,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box
          style={{ color: iconColor, display: "flex", alignItems: "center" }}
        >
          {cfg.icon}
        </Box>

        <Text size="xs" fw={600} c="dark.6">
          {cfg.label}
        </Text>

        <Box
          px={7}
          py={1}
          style={{
            borderRadius: 999,
            backgroundColor: cfg.countBg,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <Text size="xs" fw={600} style={{ color: cfg.countColor }}>
            {tasks.length}
          </Text>
        </Box>

        <Group gap={4} ml="auto" wrap="nowrap">
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            aria-label={open ? "Collapse group" : "Expand group"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
          >
            <MinusIcon size={12} />
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            aria-label="Add task to group"
            onClick={(e) => e.stopPropagation()}
          >
            <PlusCircleIcon size={12} />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse expanded={open}>
        {tasks.map((task) => (
          <TaskListRow
            key={task.id}
            task={task}
            displayStatus={displayStatus}
          />
        ))}
      </Collapse>
    </Box>
  );
}
