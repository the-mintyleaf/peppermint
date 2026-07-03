"use client";

import { Paper } from "@mantine/core";
import { MODULE_HEADER_HEIGHT } from "../ModuleHeader";
import type { ModalPaperProps } from "./ModalPaper.types";

export function ModalPaper({ style, ...rest }: ModalPaperProps) {
  return (
    <Paper
      h={`calc(100% - ${MODULE_HEADER_HEIGHT}px)`}
      {...rest}
      style={{
        borderRadius: "var(--mantine-radius-default) 0 0 0",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
