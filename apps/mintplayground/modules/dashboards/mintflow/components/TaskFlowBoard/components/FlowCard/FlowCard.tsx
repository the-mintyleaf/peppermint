"use client";

import {
  Avatar,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";

import { CheckRing, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, LAVENDER, MOSS } from "../../../../module.api";
import type { FlowCardProps } from "./FlowCard.types";
import classes from "./FlowCard.module.css";

export function FlowCard({
  task,
  overlay = false,
  onOpen,
  onQuickComplete,
}: FlowCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const done = task.column === "done";
  const dragProps = overlay
    ? {}
    : { ref: setNodeRef, ...attributes, ...listeners };

  const style = overlay
    ? {
        transform: "scale(1.02) rotate(0.6deg)",
        boxShadow: "0 16px 40px rgba(20,30,40,0.2)",
        cursor: "grabbing" as const,
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        // Overdue: left amber accent (spec §6).
        borderLeft: task.overdue ? `3px solid ${AMBER}` : undefined,
      };

  const showSubtasks =
    !done && task.subtasks !== undefined && task.subtasks.total > 0;
  const subtaskPct = task.subtasks
    ? Math.round((task.subtasks.done / task.subtasks.total) * 100)
    : 0;

  return (
    <Paper
      {...dragProps}
      className={overlay ? undefined : classes.card}
      style={style}
      withBorder
      radius={14}
      p={12}
      bg="white"
      role={overlay ? undefined : "button"}
      tabIndex={overlay ? undefined : 0}
      onClick={overlay ? undefined : () => onOpen(task)}
      onKeyDown={
        overlay
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(task);
              }
            }
      }
    >
      <Stack gap={9} style={{ opacity: done ? 0.62 : 1 }}>
        {/* work-file label + swatch */}
        <Group justify="space-between" wrap="nowrap" align="center" gap={8}>
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <Box
              w={9}
              h={9}
              style={{
                borderRadius: 3,
                background: task.file.swatch,
                flex: "0 0 auto",
              }}
            />
            <Text fz="10.5px" fw={600} c="rgba(0,0,0,0.5)" truncate>
              {task.file.name}
            </Text>
          </Group>

          {!done && !overlay ? (
            <Box
              className={classes.complete}
              onClick={(e) => {
                e.stopPropagation();
                onQuickComplete(task.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <CheckRing
                done={false}
                size={20}
                fill={MOSS}
                onToggle={() => onQuickComplete(task.id)}
                aria-label="Quick-complete task"
              />
            </Box>
          ) : null}
        </Group>

        {/* title */}
        <Text
          fz="13px"
          fw={600}
          style={{
            lineHeight: 1.3,
            letterSpacing: "-0.2px",
            color: done ? "rgba(0,0,0,0.45)" : tokens.ink,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>

        {/* on-hold flag — lavender badge, kept in its real column (spec §6) */}
        {task.onHold ? (
          <Group gap={6} wrap="nowrap" align="center">
            <PauseCircleIcon size={14} weight="fill" color={LAVENDER} />
            <Text fz="11px" fw={600} c={LAVENDER}>
              On hold
            </Text>
            <Text fz="11px" fw={500} c="rgba(0,0,0,0.5)" truncate>
              {task.onHold.reason} · {task.onHold.duration}
            </Text>
          </Group>
        ) : null}

        {showSubtasks ? (
          <Stack gap={4}>
            <Progress
              value={subtaskPct}
              size="xs"
              radius="xl"
              color="green"
              aria-label={`${task.subtasks?.done} of ${task.subtasks?.total} subtasks done`}
            />
            <Text fz="10px" fw={600} c="rgba(0,0,0,0.42)">
              {task.subtasks?.done}/{task.subtasks?.total} subtasks
            </Text>
          </Stack>
        ) : null}

        {/* due + optional avatar */}
        <Group justify="space-between" wrap="nowrap" align="center" gap={8}>
          <StatusPill
            fg={task.overdue ? AMBER : "rgba(0,0,0,0.55)"}
            bg={task.overdue ? AMBER_SOFT : "rgba(0,0,0,0.05)"}
            dot={task.overdue ? AMBER : false}
          >
            {task.overdue ? `${task.dueRelative} · Late` : task.dueRelative}
          </StatusPill>

          {task.avatar ? (
            <Tooltip label={task.avatar.name} withArrow>
              <Avatar size={22} radius="xl" color={task.avatar.color}>
                {task.avatar.initials}
              </Avatar>
            </Tooltip>
          ) : null}
        </Group>
      </Stack>
    </Paper>
  );
}
