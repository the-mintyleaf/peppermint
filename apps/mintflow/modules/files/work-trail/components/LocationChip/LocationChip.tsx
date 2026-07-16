"use client";

import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { Group, Text } from "@peppermint/ui";

import type { LocationChipProps } from "../../WorkTrail.types";

/** A location chip: pin glyph + muted place label. */
export function LocationChip({ label }: LocationChipProps) {
  return (
    <Group gap={5} wrap="nowrap">
      <MapPinIcon size={14} color="rgba(0,0,0,0.42)" aria-label="Location" />
      <Text fz="12px" fw={500} c="rgba(0,0,0,0.42)">
        {label}
      </Text>
    </Group>
  );
}
