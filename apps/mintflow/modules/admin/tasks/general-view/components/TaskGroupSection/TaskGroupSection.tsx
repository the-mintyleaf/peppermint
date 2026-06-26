"use client";

import { useState } from "react";
import { ActionIcon, Badge, Box, Collapse, Group, Text } from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { SpinnerGapIcon } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArrowCircleUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowCircleUpRight";
import { TrayIcon } from "@phosphor-icons/react/dist/csr/Tray";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { TaskListRow } from "../TaskListRow";
import type { TaskGroupSectionProps } from "./TaskGroupSection.types";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";

const STATUS_ICON: Record<DisplayStatus, React.ReactNode> = {
  new: <TrayIcon size={14} style={{ color: "var(--mantine-color-gray-5)" }} />,
  in_progress: (
    <SpinnerGapIcon
      size={14}
      style={{ color: "var(--mantine-color-gray-6)" }}
    />
  ),
  ready_for_review: (
    <ArrowCircleUpRightIcon
      size={14}
      style={{ color: "var(--mantine-color-teal-6)" }}
    />
  ),
  in_review: (
    <CheckCircleIcon
      size={14}
      style={{ color: "var(--mantine-color-green-6)" }}
    />
  ),
  rejected: (
    <XCircleIcon size={14} style={{ color: "var(--mantine-color-red-5)" }} />
  ),
};

export function TaskGroupSection({
  displayStatus,
  label,
  tasks,
}: TaskGroupSectionProps) {
  const [open, setOpen] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <Box>
      {/* Section header — matches reference: icon · label · count */}
      <Group
        px="md"
        py="xs"
        gap="xs"
        style={{
          cursor: "pointer",
          userSelect: "none",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        {STATUS_ICON[displayStatus]}
        <Text size="sm" fw={500} c="dark.4">
          {label}
        </Text>
        <Badge variant="filled" color="gray" size="xs" radius="xl">
          {tasks.length}
        </Badge>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          ml="auto"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? <CaretDownIcon size={12} /> : <CaretRightIcon size={12} />}
        </ActionIcon>
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
