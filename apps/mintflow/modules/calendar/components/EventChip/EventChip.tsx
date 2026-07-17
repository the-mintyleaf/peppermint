"use client";

import { Box, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";

import { isUrgent, statusStyle } from "../../module.api";
import type { EventChipProps } from "./EventChip.types";
import classes from "./EventChip.module.css";

export function EventChip({ task, onOpen, dense = true }: EventChipProps) {
  const style = statusStyle(task);
  const urgent = isUrgent(task);

  return (
    <UnstyledButton
      className={classes.chip}
      onClick={() => onOpen(task)}
      aria-label={`Open task ${task.title}`}
      style={{
        backgroundColor: style.tint,
        boxShadow: urgent ? `inset 2px 0 0 ${tokens.accent}` : undefined,
      }}
    >
      <Box
        className={classes.dot}
        style={{ backgroundColor: urgent ? tokens.accent : style.accent }}
        aria-hidden
      />
      <Text
        className={classes.title}
        fz={dense ? "11px" : "12px"}
        fw={600}
        c={style.fg}
        lh={1.25}
      >
        {task.title}
      </Text>
    </UnstyledButton>
  );
}
