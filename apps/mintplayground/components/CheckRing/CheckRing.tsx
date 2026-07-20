"use client";

import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { UnstyledButton, Box } from "@peppermint/ui";

import type { CheckRingProps } from "./CheckRing.types";

/**
 * The circular check-ring used for task completion across Home, Create Task and
 * Work Trail. Renders as a real toggle button when `onToggle` is provided,
 * otherwise as a static status indicator.
 */
export function CheckRing({
  done,
  ring = "rgba(0,0,0,0.22)",
  fill = "rgb(238,87,41)",
  size = 24,
  onToggle,
  "aria-label": ariaLabel,
}: CheckRingProps) {
  const inner = (
    <Box
      style={{
        width: size,
        height: size,
        flex: "0 0 auto",
        borderRadius: "50%",
        border: `2px solid ${done ? fill : ring}`,
        background: done ? fill : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .16s ease",
      }}
    >
      {done ? <CheckIcon size={size * 0.5} weight="bold" color="#fff" /> : null}
    </Box>
  );

  if (!onToggle) return inner;

  return (
    <UnstyledButton
      onClick={onToggle}
      aria-pressed={done}
      aria-label={ariaLabel ?? (done ? "Mark incomplete" : "Mark complete")}
      style={{ display: "flex", flex: "0 0 auto", borderRadius: "50%" }}
    >
      {inner}
    </UnstyledButton>
  );
}
