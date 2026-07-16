"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";

import { categoryStyles, statusDot, tokens } from "@/config/design";
import { MonoText, StatusPill } from "@/components";

import type { TaskCardProps } from "./TaskCard.types";
import classes from "./TaskCard.module.css";

/** A single task row: category badge + status, title, and mono meta line. */
export function TaskCard({ task, onClick }: TaskCardProps) {
  const category = categoryStyles[task.category];

  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.card}
      style={{
        display: "block",
        width: "auto",
        textAlign: "left",
        padding: "18px 12px",
        marginInline: -12,
        borderRadius: 10,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Stack gap={10}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <StatusPill
            fg={category?.fg}
            bg={category?.bg}
            fz="10px"
            radius={6}
            px={10}
            py={5}
          >
            {task.category}
          </StatusPill>
          <Group gap={7} align="center" wrap="nowrap">
            <Box
              w={7}
              h={7}
              style={{
                borderRadius: "50%",
                background: statusDot[task.status],
                flex: "0 0 auto",
              }}
            />
            <Text fz={11} fw={600} c="rgba(0,0,0,0.55)">
              {task.status}
            </Text>
          </Group>
        </Group>

        <Text
          fz={15}
          fw={600}
          style={{ lineHeight: 1.3, letterSpacing: "-0.25px" }}
        >
          {task.title}
        </Text>

        <Group justify="space-between" align="center" wrap="nowrap">
          <MonoText
            fz={11}
            fw={500}
            c={task.urgent ? tokens.accent : "rgba(0,0,0,0.5)"}
          >
            {task.meta}
          </MonoText>
          <ArrowUpRightIcon
            size={14}
            color="rgba(0,0,0,0.3)"
            aria-hidden="true"
          />
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
