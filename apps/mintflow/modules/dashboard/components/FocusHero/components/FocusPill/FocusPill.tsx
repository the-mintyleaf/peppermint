"use client";

import { Box, Button, Group, Text, UnstyledButton } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, PRIORITY_STYLE } from "../../../../module.api";
import type { FocusPillProps } from "./FocusPill.types";

/** 24px rounded-square completion checkbox (spec §5 honest states). */
function SquareCheck({
  done,
  onToggle,
}: {
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <UnstyledButton
      onClick={onToggle}
      aria-pressed={done}
      aria-label={done ? "Mark focus incomplete" : "Mark focus complete"}
      style={{
        width: 24,
        height: 24,
        flex: "0 0 auto",
        borderRadius: 8,
        background: done ? tokens.accent : tokens.paper,
        border: done
          ? `1px solid ${tokens.accent}`
          : "2px solid rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .14s ease",
      }}
    >
      {done ? <CheckIcon size={14} weight="bold" color="#fff" /> : null}
    </UnstyledButton>
  );
}

export function FocusPill({
  task,
  highlighted,
  onToggleDone,
  onContinue,
}: FocusPillProps) {
  const done = task.state === "done";
  const prio = PRIORITY_STYLE[task.priority];
  const dueValue = task.due.replace(/^Due\s+/i, "");

  return (
    <Group
      gap={14}
      wrap="nowrap"
      align="center"
      style={{
        padding: highlighted ? "15px 16px" : "14px 16px",
        borderRadius: 12,
        background: done || !highlighted ? "rgba(0,0,0,0.02)" : tokens.paper,
        border: highlighted
          ? `1.5px solid ${tokens.accent}`
          : `1px solid ${tokens.line}`,
        boxShadow: highlighted ? `0 6px 18px ${tokens.accentSoft}` : undefined,
      }}
    >
      <SquareCheck done={done} onToggle={() => onToggleDone(task.id)} />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz="14px"
          fw={600}
          mb={6}
          style={{
            color: done ? tokens.muted2 : tokens.ink,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>

        <Group gap={8} wrap="wrap" align="center">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: 3,
                background: task.file.swatch,
                flex: "0 0 auto",
              }}
            />
            <Text fz="11.5px" fw={600} c={tokens.muted2} truncate>
              {task.file.name}
            </Text>
          </Group>

          {done ? (
            <Text ff="monospace" fz="11.5px" c={tokens.muted}>
              · {task.completedAt}
            </Text>
          ) : (
            <>
              {task.overdue ? (
                <StatusPill fg={AMBER} bg={AMBER_SOFT}>
                  <ClockIcon
                    size={12}
                    weight="bold"
                    style={{ marginRight: 4 }}
                  />
                  Overdue · {dueValue}
                </StatusPill>
              ) : (
                <StatusPill fg={prio.fg} bg={prio.bg}>
                  {prio.label}
                </StatusPill>
              )}
              {task.overdue && task.priority === "high" ? (
                <Text fz="11px" fw={700} c={AMBER}>
                  ▲ High
                </Text>
              ) : null}
              {!task.overdue ? (
                <Text ff="monospace" fz="11.5px" c={tokens.muted}>
                  · {task.due}
                </Text>
              ) : null}
            </>
          )}
        </Group>
      </Box>

      {!done ? (
        <Button
          size="xs"
          radius="md"
          variant={highlighted ? "filled" : "default"}
          color={highlighted ? "accent" : "gray"}
          onClick={() => onContinue(task)}
          style={{ flex: "0 0 auto" }}
        >
          {task.state === "in_progress" ? "Continue" : "Start"}
        </Button>
      ) : null}
    </Group>
  );
}
