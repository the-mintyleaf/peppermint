"use client";

import { Group, Text, UnstyledButton } from "@peppermint/ui";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";

import {
  formatSlotRange,
  taskSlot,
  taskWeight,
  dueRelative,
  isDueToday,
} from "../../../../Calendar.utils";
import { isUrgent, statusStyle, STATUS_LABELS } from "../../../../module.api";
import type { FocusCardProps } from "./FocusCard.types";
import classes from "./FocusCard.module.css";

export function FocusCard({ task, lead = false, onOpen }: FocusCardProps) {
  const style = statusStyle(task);
  const urgent = isUrgent(task);
  const today = isDueToday(task.endDate);
  const range = formatSlotRange(taskSlot(task.id, taskWeight(task)));
  const due = dueRelative(task.endDate) ?? "No due date";

  return (
    <UnstyledButton
      className={classes.card}
      onClick={() => onOpen(task)}
      aria-label={`Open task ${task.title}`}
      style={{
        position: "relative",
        overflow: "hidden",
        background: lead ? style.tint : "#fff",
        borderColor: lead ? "transparent" : undefined,
      }}
    >
      <Group justify="space-between" gap={8} wrap="nowrap">
        <Text className={classes.title} fz="13px" fw={700} c={tokens.ink}>
          {task.title}
        </Text>
        {urgent && (
          <StatusPill fg={tokens.accent} bg={tokens.accentSoft}>
            Urgent
          </StatusPill>
        )}
      </Group>

      <Text ff="monospace" fz="11px" fw={600} c={tokens.muted}>
        {range}
      </Text>

      <div className={classes.foot}>
        {today ? (
          <StatusPill fg={tokens.green} bg={tokens.greenTint} dot>
            Due today
          </StatusPill>
        ) : (
          <StatusPill fg={style.fg} bg={style.tint} dot={style.accent}>
            {STATUS_LABELS[task.status]}
          </StatusPill>
        )}
        <Text fz="11px" fw={600} c={tokens.muted}>
          {due}
        </Text>
      </div>
    </UnstyledButton>
  );
}
