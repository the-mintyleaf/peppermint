"use client";

import { Modal, Stack, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";

import { EventChip } from "../EventChip";
import type { DayTasksModalProps } from "./DayTasksModal.types";

function formatDayTitle(day: Date): string {
  return day.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DayTasksModal({
  day,
  tasks,
  onClose,
  onOpenTask,
}: DayTasksModalProps) {
  return (
    <Modal
      opened={day !== null}
      onClose={onClose}
      title={day ? formatDayTitle(day) : ""}
      centered
      radius={tokens.radius.card}
      size="sm"
    >
      {tasks.length === 0 ? (
        <Text fz="13px" c={tokens.muted2} py="md">
          Nothing due this day.
        </Text>
      ) : (
        <Stack gap={6}>
          <Text fz="11px" fw={600} ff="monospace" c={tokens.muted}>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} due
          </Text>
          {tasks.map((task) => (
            <EventChip
              key={task.id}
              task={task}
              dense={false}
              onOpen={onOpenTask}
            />
          ))}
        </Stack>
      )}
    </Modal>
  );
}
