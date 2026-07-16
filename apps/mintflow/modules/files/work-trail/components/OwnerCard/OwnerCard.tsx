"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";

import { Avatar } from "../Avatar";
import type { OwnerCardProps } from "../../WorkTrail.types";

/**
 * A person card used for the Stage 2 branch owners and the Stage 4 approver:
 * avatar + name/role + a trailing status slot, over a configurable card frame.
 */
export function OwnerCard({
  name,
  role,
  initials,
  color,
  right,
  border,
  background,
  stub = false,
}: OwnerCardProps) {
  return (
    <Box style={{ position: "relative" }}>
      {stub ? (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            width: 20,
            borderTop: "2px dotted rgba(0,0,0,0.2)",
          }}
        />
      ) : null}
      <Group
        gap={11}
        wrap="nowrap"
        style={{
          border,
          background,
          borderRadius: 13,
          padding: "11px 13px",
        }}
      >
        <Avatar initials={initials} color={color} size={30} />
        <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Text fz="13px" fw={600} style={{ letterSpacing: "-0.2px" }} truncate>
            {name}
          </Text>
          <Text fz="11px" fw={500} c="rgba(0,0,0,0.42)" truncate>
            {role}
          </Text>
        </Stack>
        <Box style={{ flex: "0 0 auto" }}>{right}</Box>
      </Group>
    </Box>
  );
}
