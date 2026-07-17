"use client";

import type { CSSProperties } from "react";
import { Avatar, Group, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";

import {
  formatSlotRange,
  taskSlot,
  taskWeight,
} from "../../../../Calendar.utils";
import {
  assigneeList,
  isUrgent,
  statusStyle,
  STATUS_LABELS,
} from "../../../../module.api";
import type { EventCardProps } from "./EventCard.types";
import classes from "./EventCard.module.css";

export function EventCard({
  task,
  top,
  height,
  left,
  width,
  onOpen,
}: EventCardProps) {
  const style = statusStyle(task);
  const urgent = isUrgent(task);
  const accent = urgent ? tokens.accent : style.accent;

  const showTime = height >= 40;
  const showFooter = height >= 74;
  const people = assigneeList(task);
  const range = formatSlotRange(taskSlot(task.id, taskWeight(task)));

  return (
    <UnstyledButton
      className={`${classes.card} ${height < 46 ? classes.short : ""}`}
      onClick={() => onOpen(task)}
      aria-label={`${task.title} — ${STATUS_LABELS[task.status]}, ${range}`}
      style={
        {
          top,
          height,
          left,
          width,
          background: style.tint,
          // consumed by the ::before accent bar
          "--accent": accent,
        } as CSSProperties
      }
    >
      <Text className={classes.title} fz="11px" fw={700} c={style.fg} lh={1.2}>
        {task.title}
      </Text>

      {showTime && (
        <Text ff="monospace" fz="9.5px" fw={600} c={style.fg} opacity={0.75}>
          {range}
        </Text>
      )}

      {showFooter && (
        <div className={classes.meta}>
          {people.length > 1 ? (
            <Avatar.Group spacing={6}>
              {people.slice(0, 3).map((p) => (
                <Avatar key={p.name} size={18} radius="xl" color={p.color}>
                  <Text fz="8px" fw={700}>
                    {p.initials}
                  </Text>
                </Avatar>
              ))}
              {people.length > 3 && (
                <Avatar size={18} radius="xl" color="gray">
                  <Text fz="8px" fw={700}>
                    +{people.length - 3}
                  </Text>
                </Avatar>
              )}
            </Avatar.Group>
          ) : (
            <span />
          )}
          <Group gap={4} wrap="nowrap" align="center">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: accent,
                flex: "0 0 auto",
              }}
              aria-hidden
            />
            <Text fz="9px" fw={700} c={style.fg} tt="uppercase">
              {STATUS_LABELS[task.status]}
            </Text>
          </Group>
        </div>
      )}
    </UnstyledButton>
  );
}
