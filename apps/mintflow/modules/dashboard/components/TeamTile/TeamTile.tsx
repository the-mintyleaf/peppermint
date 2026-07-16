"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import { dark } from "../../Dashboard.utils";
import type { TeamTileProps } from "./TeamTile.types";

const AVATARS = [
  { bg: "rgba(255,255,255,0.16)", fg: dark.muted, initials: "" },
  { bg: "rgba(255,255,255,0.16)", fg: dark.muted, initials: "" },
  { bg: "rgba(238,87,41,0.22)", fg: tokens.accent, initials: "AS" },
  { bg: "rgba(106,168,255,0.22)", fg: tokens.blue, initials: "PS" },
] as const;

/** Dark tile: overlapping active-member avatar stack + a caseload caption. */
export function TeamTile({ style }: TeamTileProps) {
  return (
    <Stack
      gap={0}
      p={18}
      style={{ background: dark.tile, borderRadius: 20, minWidth: 0, ...style }}
    >
      <MonoText label fz={10} c={dark.label}>
        TEAM
      </MonoText>

      <Group gap={0} wrap="nowrap" mt={16}>
        {AVATARS.map((avatar, i) => (
          <Box
            key={i}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              marginLeft: i === 0 ? 0 : -10,
              background: avatar.bg,
              boxShadow: `0 0 0 2px ${dark.tile}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar.initials && (
              <MonoText fz={11} fw={700} c={avatar.fg}>
                {avatar.initials}
              </MonoText>
            )}
          </Box>
        ))}
      </Group>

      <Stack gap={2} mt={14}>
        <Text fz={14} fw={600} c={dark.white}>
          4 active
        </Text>
        <MonoText fz={12} fw={500} c={dark.muted}>
          2 cases each
        </MonoText>
      </Stack>
    </Stack>
  );
}
