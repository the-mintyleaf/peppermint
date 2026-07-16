"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Box, Button, Group, Stack, Text } from "@peppermint/ui";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";

import type { FocusCardProps } from "./FocusCard.types";

/**
 * The "Focus now" card — the single highest-priority task, with an accent bar,
 * assignee/case meta and an ink "Open task" call to action.
 */
export function FocusCard({ task, onOpen }: FocusCardProps) {
  return (
    <Box
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#fff",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: tokens.shadow.card,
        padding: "22px 20px",
      }}
    >
      <Box
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 22,
          bottom: 22,
          width: 4,
          background: tokens.accent,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />

      <Group gap={10} align="center" wrap="wrap">
        <Text fz="10px" fw={600} c={tokens.blueInk}>
          {task.category}
        </Text>
        <MonoText fz="11px" fw={500} c={tokens.muted}>
          {task.time}
        </MonoText>
        <MonoText
          fz="11px"
          fw={600}
          c={tokens.accent}
          style={{ marginLeft: "auto" }}
        >
          {task.timeLeft}
        </MonoText>
      </Group>

      <Text
        mt={14}
        fz="20px"
        fw={600}
        style={{ lineHeight: 1.24, letterSpacing: "-0.5px" }}
      >
        {task.title}
      </Text>

      <Group mt={18} gap={11} align="center" wrap="nowrap">
        <Box
          aria-hidden
          style={{
            width: 30,
            height: 30,
            flex: "0 0 auto",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.1)",
          }}
        />
        <Stack gap={2}>
          <MonoText label fz="9px" c={tokens.muted}>
            ASSIGNED
          </MonoText>
          <Text fz="12px" fw={600}>
            {task.assignee}
          </Text>
        </Stack>
      </Group>

      <Box mt={16} pt={14} style={{ borderTop: `1px solid ${tokens.line}` }}>
        <MonoText label fz="9px" c={tokens.muted}>
          CASE
        </MonoText>
        <Text fz="12px" fw={600} mt={2}>
          {task.caseLabel}
        </Text>
      </Box>

      <Button
        onClick={onOpen}
        fullWidth
        mt={18}
        radius={12}
        rightSection={<ArrowUpRightIcon size={16} weight="bold" />}
        styles={{
          root: { height: 44, background: tokens.ink },
          label: { fontSize: 13, fontWeight: 600, color: "#fff" },
        }}
      >
        Open task
      </Button>
    </Box>
  );
}
