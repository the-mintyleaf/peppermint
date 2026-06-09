"use client";

import { useContext } from "react";
import { Box, Text } from "@zetsel/ui";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import classes from "./BankPaddingSpace.module.css";

interface BankPaddingSpaceProps {
  position: "top" | "bottom";
}

export function BankPaddingSpace({ position }: BankPaddingSpaceProps) {
  const { state } = useContext(ContextEditor.Context);
  const height =
    position === "top"
      ? (state?.headerProps?.height ?? 1)
      : ((state?.headerProps as Record<string, unknown>)?.paddingBottom as number ?? 0.5);

  return (
    <Box h={height + "in"} className={classes.root}>
      <Text className={classes.label}>{height.toFixed(2)}in</Text>
    </Box>
  );
}
