"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";

import { CheckRing, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  AMBER,
  AMBER_SOFT,
  MOSS,
  PRIORITY_STYLE,
} from "../../../../module.api";
import type { FocusRowProps } from "./FocusRow.types";

/** Small swatch + work-file name chip. */
function FileChip({ name, swatch }: { name: string; swatch: string }) {
  return (
    <Group gap={6} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
      <Box
        w={9}
        h={9}
        style={{ borderRadius: 3, background: swatch, flex: "0 0 auto" }}
      />
      <Text
        fz="11px"
        fw={600}
        c="rgba(0,0,0,0.55)"
        truncate
        style={{ letterSpacing: "-0.1px" }}
      >
        {name}
      </Text>
    </Group>
  );
}

export function FocusRow({ task, onToggleDone, onStart }: FocusRowProps) {
  const done = task.state === "done";
  const priority = PRIORITY_STYLE[task.priority];

  return (
    <Group
      gap={14}
      wrap="nowrap"
      align="flex-start"
      py={12}
      style={{ opacity: done ? 0.6 : 1 }}
    >
      <Box pt={1}>
        <CheckRing
          done={done}
          fill={MOSS}
          onToggle={() => onToggleDone(task.id)}
          aria-label={
            done ? "Mark focus task incomplete" : "Mark focus task complete"
          }
        />
      </Box>

      <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz="14px"
          fw={600}
          style={{
            lineHeight: 1.3,
            letterSpacing: "-0.2px",
            color: done ? "rgba(0,0,0,0.4)" : tokens.ink,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>

        <Group gap={8} wrap="wrap" align="center">
          <FileChip name={task.file.name} swatch={task.file.swatch} />

          <StatusPill fg={priority.fg} bg={priority.bg} dot>
            {priority.label}
          </StatusPill>

          {done ? (
            <StatusPill fg={MOSS} bg={tokens.greenTint}>
              {task.completedAt}
            </StatusPill>
          ) : (
            <StatusPill
              fg={task.overdue ? AMBER : "rgba(0,0,0,0.55)"}
              bg={task.overdue ? AMBER_SOFT : "rgba(0,0,0,0.05)"}
            >
              {task.overdue ? `${task.due} · Late` : task.due}
            </StatusPill>
          )}

          {/* Estimate chip is render-guarded — never populated (spec §11). */}
          {task.estimate ? (
            <StatusPill fg="rgba(0,0,0,0.5)" bg="rgba(0,0,0,0.05)">
              {task.estimate}
            </StatusPill>
          ) : null}

          {task.collaborator ? (
            <Tooltip label={task.collaborator.name} withArrow>
              <Avatar size={22} radius="xl" color={task.collaborator.color}>
                {task.collaborator.initials}
              </Avatar>
            </Tooltip>
          ) : null}
        </Group>
      </Stack>

      {!done ? (
        <Button
          size="compact-sm"
          variant={task.state === "in_progress" ? "light" : "filled"}
          color="accent"
          radius="xl"
          rightSection={<ArrowRightIcon size={13} weight="bold" />}
          onClick={() => onStart(task)}
          style={{ flex: "0 0 auto" }}
        >
          {task.state === "in_progress" ? "Continue" : "Start"}
        </Button>
      ) : null}
    </Group>
  );
}
