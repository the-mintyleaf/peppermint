"use client";

import { Box, Group, Text } from "@peppermint/ui";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";

import { tokens } from "@/config/design";

import { FocusCard } from "./components/FocusCard";
import type { FocusStripProps } from "./FocusStrip.types";
import classes from "./FocusStrip.module.css";

export function FocusStrip({ tasks, onOpenTask }: FocusStripProps) {
  if (tasks.length === 0) return null;

  return (
    <Box>
      <Group gap={7} mb={10} align="center">
        <TargetIcon size={15} weight="duotone" color={tokens.accent} />
        <Text
          fz="11px"
          fw={700}
          c={tokens.muted}
          ff="monospace"
          style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          In focus
        </Text>
      </Group>
      <div className={classes.grid}>
        {tasks.map((task, i) => (
          <FocusCard
            key={task.id}
            task={task}
            lead={i === 0}
            onOpen={onOpenTask}
          />
        ))}
      </div>
    </Box>
  );
}
