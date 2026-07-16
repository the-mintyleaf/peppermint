"use client";

import {
  Box,
  Button,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
} from "@peppermint/ui";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import { FOCUS_LIMIT, MOSS } from "../../module.api";
import { FocusRow } from "./components/FocusRow";
import type { FocusPanelProps } from "./FocusPanel.types";
import classes from "./FocusPanel.module.css";

/** Contextual header message — changes with completion (spec §5). */
function headerMessage(done: number, total: number): string {
  if (total === 0)
    return "No focus set yet. Choose up to three commitments for today.";
  if (done === 0)
    return "Three commitments for today. Start with the one that matters most.";
  if (done < total) return "Good progress — keep the momentum steady.";
  return "All focus tasks done. A strong, honest day.";
}

export function FocusPanel({
  focus,
  onToggleDone,
  onStart,
  onChooseFocus,
}: FocusPanelProps) {
  const tasks = focus.slice(0, FOCUS_LIMIT);
  const total = tasks.length;
  const done = tasks.filter((t) => t.state === "done").length;
  const ringValue = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  return (
    <Paper
      radius={tokens.radius.tile}
      withBorder
      style={{ overflow: "hidden", boxShadow: tokens.shadow.card }}
    >
      <Box className={classes.header}>
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="lg"
        >
          <Stack gap={8} style={{ minWidth: 0 }}>
            <SectionLabel c={MOSS}>Today&rsquo;s focus</SectionLabel>
            <Text component="h2" className={classes.title}>
              What deserves your attention today
            </Text>
            <Text fz="13px" fw={500} c="rgba(0,0,0,0.55)" maw={440}>
              {headerMessage(done, total)}
            </Text>
          </Stack>

          {total > 0 ? (
            <Group gap={12} wrap="nowrap" style={{ flex: "0 0 auto" }}>
              <RingProgress
                size={72}
                thickness={7}
                roundCaps
                aria-label={`${done} of ${total} focus tasks completed today`}
                sections={[{ value: ringValue, color: "green" }]}
                label={
                  <Group justify="center">
                    {complete ? (
                      <CheckIcon size={22} weight="bold" color={MOSS} />
                    ) : (
                      <Text ta="center" fz="15px" fw={700} c={tokens.ink}>
                        {done}
                        <Text component="span" fz="10px" c="rgba(0,0,0,0.4)">
                          /{total}
                        </Text>
                      </Text>
                    )}
                  </Group>
                }
              />
              <Text fz="11px" fw={600} c="rgba(0,0,0,0.5)" maw={64}>
                {done} of {total} completed today
              </Text>
            </Group>
          ) : null}
        </Group>
      </Box>

      <Box px={24} py={total > 0 ? 8 : 24}>
        {total > 0 ? (
          <Stack gap={0}>
            {tasks.map((task, i) => (
              <Box
                key={task.id}
                style={{
                  borderTop: i === 0 ? undefined : `1px solid ${tokens.line}`,
                }}
              >
                <FocusRow
                  task={task}
                  onToggleDone={onToggleDone}
                  onStart={onStart}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack align="center" gap={14} py={16}>
            <Box
              w={54}
              h={54}
              style={{
                borderRadius: 16,
                background: tokens.greenTint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TargetIcon size={26} color={MOSS} weight="duotone" />
            </Box>
            <Stack align="center" gap={4}>
              <Text fz="15px" fw={700} c={tokens.ink}>
                No focus set for today
              </Text>
              <Text
                fz="13px"
                fw={500}
                c="rgba(0,0,0,0.5)"
                ta="center"
                maw={320}
              >
                Pick up to three tasks to commit to. Yesterday&rsquo;s
                unfinished focus will resurface as suggestions.
              </Text>
            </Stack>
            <Button
              color="accent"
              radius="xl"
              leftSection={<TargetIcon size={15} weight="bold" />}
              onClick={onChooseFocus}
            >
              Choose focus tasks
            </Button>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
