"use client";

import { Box, Group, Text } from "@peppermint/ui";

import { CheckRing } from "../CheckRing";
import type { CheckItemProps } from "./CheckItem.types";

/**
 * A check-ring row with a strike-through title — shared by the Home task list,
 * Create Task sub-tasks, and the Work Trail sub-task list.
 */
export function CheckItem({
  title,
  done,
  onToggle,
  subtitle,
  right,
  ring,
  fill,
  ringSize = 24,
  titleColor = "rgb(10,12,14)",
  fz = "14px",
  align = "flex-start",
  "aria-label": ariaLabel,
}: CheckItemProps) {
  return (
    <Group gap={14} wrap="nowrap" align={align} w="100%">
      <CheckRing
        done={done}
        onToggle={onToggle}
        ring={ring}
        fill={fill}
        size={ringSize}
        aria-label={ariaLabel}
      />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz={fz}
          fw={600}
          style={{
            lineHeight: 1.3,
            letterSpacing: "-0.2px",
            color: done ? "rgba(0,0,0,0.4)" : titleColor,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text fz="12px" fw={500} mt={2} c="rgba(0,0,0,0.42)">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {right ? <Box style={{ flex: "0 0 auto" }}>{right}</Box> : null}
    </Group>
  );
}
