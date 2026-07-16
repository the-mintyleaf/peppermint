"use client";

import { Group, Text } from "@peppermint/ui";

import { Avatar } from "../Avatar";
import type { PersonChipProps } from "../../WorkTrail.types";

/** A compact person chip: soft-tinted pill with an avatar and name. */
export function PersonChip({ person }: PersonChipProps) {
  return (
    <Group
      gap={7}
      wrap="nowrap"
      style={{
        background: "rgba(10,12,14,0.04)",
        borderRadius: 9,
        padding: "4px 9px 4px 4px",
      }}
    >
      <Avatar initials={person.initials} color={person.color} size={20} />
      <Text fz="12px" fw={600} style={{ letterSpacing: "-0.2px" }}>
        {person.name}
      </Text>
    </Group>
  );
}
