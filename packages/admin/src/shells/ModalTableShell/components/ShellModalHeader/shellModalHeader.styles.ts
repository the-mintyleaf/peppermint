import type { CSSProperties } from "react";

export const SHELL_MODAL_HEADER = {
  paddingX: 20,
  paddingY: 8,
} as const;

export const shellModalHeaderActionStyle: CSSProperties = {
  border: "1px solid var(--mantine-color-gray-2)",
  background: "white",
};
