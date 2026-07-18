"use client";

import { Box, Group, ScrollArea, UnstyledButton } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { TASK_STATE_STYLE } from "../../caseView";
import type { TaskStripProps } from "./TaskStrip.types";

/**
 * The one question this answers: "what are the steps on this case and where
 * are we?" Each chip is a checklist task (state-colored dot, done = check);
 * selecting one filters the activity feed to that task.
 */
export function TaskStrip({ tasks, selectedId, onToggle }: TaskStripProps) {
  return (
    <Group gap={9} wrap="nowrap" align="center">
      <MonoText
        label
        fz="11px"
        fw={700}
        c={tokens.muted}
        style={{ flexShrink: 0 }}
      >
        Tasks · {tasks.length}
      </MonoText>

      <ScrollArea
        scrollbarSize={6}
        type="hover"
        style={{ flex: 1, minWidth: 0 }}
      >
        <Group gap={8} wrap="nowrap" py={4}>
          {tasks.map((task) => {
            const active = task.id === selectedId;
            const state = TASK_STATE_STYLE[task.state];
            const done = task.state === "done";
            return (
              <UnstyledButton
                key={task.id}
                onClick={() => onToggle(task.id)}
                aria-pressed={active}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: active ? tokens.tile : tokens.paper,
                  border: `1px solid ${active ? tokens.tile : tokens.line}`,
                  boxShadow: active ? tokens.shadow.card : undefined,
                }}
              >
                {done ? (
                  <Box
                    w={14}
                    h={14}
                    style={{
                      borderRadius: "50%",
                      background: state.color,
                      color: tokens.paper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <CheckIcon size={9} weight="bold" />
                  </Box>
                ) : (
                  <Box
                    w={7}
                    h={7}
                    style={{
                      borderRadius: "50%",
                      background: state.color,
                      flex: "0 0 auto",
                    }}
                  />
                )}
                <Box
                  component="span"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? tokens.paper : tokens.ink,
                    whiteSpace: "nowrap",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textDecoration: done ? "line-through" : undefined,
                    opacity: done && !active ? 0.7 : 1,
                  }}
                >
                  {task.title}
                </Box>
              </UnstyledButton>
            );
          })}
        </Group>
      </ScrollArea>
    </Group>
  );
}
