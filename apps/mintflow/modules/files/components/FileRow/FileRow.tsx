"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { CaseIcon, MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { BAND_STYLES } from "../../Files.data";
import type { FileRowProps } from "./FileRow.types";

/**
 * One work-file collection row: tinted case icon, name + meta, and a
 * right-aligned status badge with a done/total count.
 */
export function FileRow({ file, onOpen }: FileRowProps) {
  const badge = BAND_STYLES[file.band];

  return (
    <UnstyledButton
      onClick={() => onOpen(file.id)}
      style={{
        display: "block",
        width: "100%",
        padding: "15px 4px",
        borderBottom: `1px solid ${tokens.line}`,
        cursor: "pointer",
      }}
    >
      <Group gap={13} wrap="nowrap" align="center">
        <CaseIcon
          kind={file.type}
          color={file.color}
          tint={file.tint}
          size={46}
        />

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={600}
            fz={15}
            c={tokens.ink}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </Text>
          <Group gap={7} wrap="nowrap" align="center">
            <MonoText fz={11} fw={500} c={tokens.muted}>
              {file.created}
            </MonoText>
            <Box
              w={3}
              h={3}
              style={{ borderRadius: "50%", background: tokens.muted }}
            />
            <MonoText fz={11} fw={500} c={tokens.muted}>
              {file.tasks} tasks
            </MonoText>
          </Group>
        </Stack>

        <Stack gap={7} align="flex-end" style={{ flex: "0 0 auto" }}>
          <StatusPill fg={badge.fg} bg={badge.bg} fz="10px" radius={7} mono>
            {file.status}
          </StatusPill>
          <MonoText fz={10} fw={600} c={tokens.muted}>
            {file.done}/{file.tasks}
          </MonoText>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}
