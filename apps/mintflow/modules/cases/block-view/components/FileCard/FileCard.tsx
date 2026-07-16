"use client";

import { Avatar, Box, Group, Paper, Text } from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";

import { MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { FILE_STYLE } from "../../../module.api";
import type { FileCardProps } from "./FileCard.types";

export function FileCard({ file, onOpen }: FileCardProps) {
  const style = FILE_STYLE[file.kind];

  return (
    <Paper
      withBorder
      radius={tokens.radius.card}
      p="sm"
      bg={tokens.paper}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(file)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(file);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <Group gap={10} wrap="nowrap" align="center">
        <Box
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 11,
            background: style.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileTextIcon size={20} color={style.fg} />
        </Box>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text fw={600} fz="xs" lineClamp={1}>
            {file.name}
          </Text>
          <MonoText fz="10px" c={tokens.muted} mt={2}>
            {file.caseNumber}
          </MonoText>
        </Box>
      </Group>

      <Group justify="space-between" align="center" mt="sm" wrap="nowrap">
        <StatusPill fg={style.fg} bg={style.bg}>
          {style.type}
        </StatusPill>
        <Group gap={7} wrap="nowrap" align="center">
          <MonoText fz="10px" c={tokens.muted}>
            {file.size}
          </MonoText>
          <Avatar size={20} radius="xl" color={file.owner.color}>
            {file.owner.initials}
          </Avatar>
        </Group>
      </Group>
    </Paper>
  );
}
