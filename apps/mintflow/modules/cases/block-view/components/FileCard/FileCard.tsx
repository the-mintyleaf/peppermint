"use client";

import { Avatar, Box, Group, Stack, Text } from "@peppermint/ui";

import { MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { FILE_STYLE } from "../../../module.api";
import type { FileCardProps } from "./FileCard.types";

export function FileCard({ file, onOpen }: FileCardProps) {
  const style = FILE_STYLE[file.kind];

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpen(file)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(file);
        }
      }}
      p="sm"
      style={{
        background: tokens.paper,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius.card,
        cursor: "pointer",
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = tokens.shadow.card;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Thumbnail: ext badge over a tinted preview */}
      <Stack
        justify="space-between"
        gap={0}
        p="sm"
        style={{
          height: 96,
          borderRadius: tokens.radius.card - 6,
          background: style.thumb,
          overflow: "hidden",
        }}
      >
        <StatusPill fg={style.fg} bg={style.bg} mono>
          {file.ext}
        </StatusPill>
        <Stack gap={5}>
          <Box
            style={{
              height: 5,
              width: "70%",
              borderRadius: 3,
              background: style.line,
            }}
          />
          <Box
            style={{
              height: 5,
              width: "45%",
              borderRadius: 3,
              background: style.line,
            }}
          />
        </Stack>
      </Stack>

      <Text fw={600} size="xs" mt="sm" lineClamp={1}>
        {file.name}
      </Text>
      <Group gap={6} align="center" wrap="nowrap" mt={6}>
        <Avatar size={20} radius="xl" color={file.owner.color}>
          {file.owner.initials}
        </Avatar>
        <MonoText fz="10px" c={tokens.muted}>
          {file.size}
        </MonoText>
        <Box style={{ flex: 1 }} />
        <MonoText fz="10px" c={tokens.muted}>
          {file.modified}
        </MonoText>
      </Group>
    </Box>
  );
}
