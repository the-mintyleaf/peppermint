"use client";

import { Box, Group, Text } from "@peppermint/ui";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, PRIORITY_STYLE } from "../../../../module.api";
import { FocusActions } from "../FocusActions";
import { SquareCheck } from "../SquareCheck";
import type { FocusPillProps } from "./FocusPill.types";

/**
 * A secondary focus task — the compact row beneath the FocusSpotlight card.
 * Quiet by design (translucent surface over the hero's warm wash) so the
 * spotlighted "next up" task keeps the eye (spec §5).
 */
export function FocusPill({
  task,
  onToggleDone,
  onContinue,
  onSetState,
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
        padding: "14px 16px",
        borderRadius: 12,
        background: done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)",
        border: `1px solid ${tokens.line}`,
      }}
    >
      <SquareCheck done={done} onToggle={() => onToggleDone(task.id)} />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz="xs"
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

      <FocusActions
        state={task.state}
        size={26}
        onContinue={() => onContinue(task)}
        onSetState={(state) => onSetState(task.id, state)}
      />
    </Group>
  );
}
