"use client";

import { Group, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import type { Period } from "../../Dashboard.types";
import { dark } from "../../Dashboard.utils";
import type { PeriodToggleProps } from "./PeriodToggle.types";

const OPTIONS: Period[] = ["Week", "Month"];

/** Week / Month segmented control used in both dashboard headers. */
export function PeriodToggle({ period, onChange }: PeriodToggleProps) {
  return (
    <Group
      gap={0}
      wrap="nowrap"
      p={3}
      style={{ background: dark.toggleBg, borderRadius: 11 }}
    >
      {OPTIONS.map((option) => {
        const isActive = option === period;
        return (
          <UnstyledButton
            key={option}
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: isActive ? dark.white : "transparent",
            }}
          >
            <MonoText
              fz={12}
              fw={600}
              c={isActive ? tokens.ink : dark.muted}
              style={{ letterSpacing: "-0.2px" }}
            >
              {option}
            </MonoText>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
