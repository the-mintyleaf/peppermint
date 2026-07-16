"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { Box, Button, Group, Stack, Text } from "@peppermint/ui";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";

import { AiAvatar } from "../AiAvatar";
import type { ChatHeaderProps } from "./ChatHeader.types";

/**
 * Sticky top bar of the Ask-AI screen: the AI avatar, the title + minister-view
 * meta line, and a "New" button that resets the thread.
 */
export function ChatHeader({ onNew }: ChatHeaderProps) {
  return (
    <Box
      style={{
        flex: "0 0 auto",
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: tokens.paper,
        borderBottom: `1px solid ${tokens.line}`,
        padding: "20px 20px 14px",
      }}
    >
      <Group gap={11} align="center" wrap="nowrap">
        <AiAvatar size={36} radius={11} />

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fz="16px" fw={700} style={{ letterSpacing: "-0.3px" }}>
            Kamban AI
          </Text>
          <MonoText label fz="10px" fw={600} c={tokens.blueInk}>
            ● MINISTER VIEW · FULL ACCESS
          </MonoText>
        </Stack>

        <Button
          variant="outline"
          color="dark"
          onClick={onNew}
          h={34}
          px={13}
          radius={11}
          leftSection={<PlusIcon size={13} weight="bold" />}
          styles={{
            root: { borderColor: tokens.lineStrong },
            label: { fontSize: 12, fontWeight: 600 },
          }}
        >
          New
        </Button>
      </Group>
    </Box>
  );
}
