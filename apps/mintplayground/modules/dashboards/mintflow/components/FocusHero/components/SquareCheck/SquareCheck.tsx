"use client";

import { UnstyledButton } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { tokens } from "@/config/design";
import type { SquareCheckProps } from "./SquareCheck.types";

/** Rounded-square completion checkbox (spec §5 honest states). */
export function SquareCheck({ done, onToggle, size = 24 }: SquareCheckProps) {
  return (
    <UnstyledButton
      onClick={onToggle}
      aria-pressed={done}
      aria-label={done ? "Mark focus incomplete" : "Mark focus complete"}
      style={{
        width: size,
        height: size,
        flex: "0 0 auto",
        borderRadius: Math.round(size / 3),
        background: done ? tokens.accent : tokens.paper,
        border: done
          ? `1px solid ${tokens.accent}`
          : "2px solid rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .14s ease",
      }}
    >
      {done ? (
        <CheckIcon size={Math.round(size * 0.58)} weight="bold" color="#fff" />
      ) : null}
    </UnstyledButton>
  );
}
