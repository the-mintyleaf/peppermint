"use client";

import { Box, Group, Text } from "@peppermint/ui";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, PRIORITY_STYLE } from "../../../../module.api";
import { FocusActions } from "../FocusActions";
import { SquareCheck } from "../SquareCheck";
import type { FocusSpotlightProps } from "./FocusSpotlight.types";

/**
 * The single "next up" focus task, promoted to a large accent-bordered card so
 * the eye lands on the one thing to do now (spec §5). The remaining focus tasks
 * render as compact FocusPill rows beneath it.
 */
export function FocusSpotlight({
  task,
  onToggleDone,
  onContinue,
  onSetState,
}: FocusSpotlightProps) {
  const done = task.state === "done";
  const prio = PRIORITY_STYLE[task.priority];
  const dueValue = task.due.replace(/^Due\s+/i, "");

  return (
    <Group
      gap={16}
      wrap="nowrap"
      align="center"
      style={{
        padding: "16px 18px",
        borderRadius: 16,
        background: tokens.paper,
        border: `1.5px solid ${tokens.accent}`,
      }}
    >
      <SquareCheck
        done={done}
        onToggle={() => onToggleDone(task.id)}
        size={30}
      />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz="10px"
          fw={700}
          c={tokens.accent}
          mb={6}
          style={{ letterSpacing: "0.8px", textTransform: "uppercase" }}
        >
          Next up
        </Text>

        <Text
          fz="xs"
          fw={700}
          c={tokens.ink}
          mb={8}
          style={{
            lineHeight: 1.3,
            letterSpacing: "-0.1px",
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
            <Text fz="12px" fw={600} c={tokens.muted2} truncate>
              {task.file.name}
            </Text>
          </Group>

          {task.overdue ? (
            <StatusPill fg={AMBER} bg={AMBER_SOFT}>
              <ClockIcon size={12} weight="bold" style={{ marginRight: 4 }} />
              Overdue · {dueValue}
            </StatusPill>
          ) : (
            <StatusPill fg={prio.fg} bg={prio.bg}>
              {prio.label}
            </StatusPill>
          )}

          {!task.overdue ? (
            <Text ff="monospace" fz="11.5px" c={tokens.muted}>
              · {task.due}
            </Text>
          ) : null}
        </Group>
      </Box>

      <FocusActions
        state={task.state}
        size={30}
        onContinue={() => onContinue(task)}
        onSetState={(state) => onSetState(task.id, state)}
      />
    </Group>
  );
}
