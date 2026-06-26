"use client";

import {
  Stack,
  Text,
  Group,
  Badge,
  Checkbox,
  Paper,
  ScrollArea,
  Skeleton,
} from "@peppermint/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchChannels } from "@/modules/admin/channels/channels.api";
import { useComposeStore } from "../../compose.store";
import { PLATFORM_LABELS } from "../../compose.types";
import type { Platform } from "@/modules/admin/shared/domain.types";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "grape",
  facebook: "blue",
  x: "dark",
  twitter: "dark",
  linkedin: "indigo",
  tiktok: "dark",
  youtube: "red",
  threads: "gray",
  pinterest: "red",
};

export function ChannelSelector() {
  const { draft, toggleChannel } = useComposeStore();

  const { data, isLoading } = useQuery({
    queryKey: ["channels", "list"],
    queryFn: () => fetchChannels({ pageSize: 50 }),
  });

  const channels = data?.data ?? [];
  const connectedChannels = channels.filter((c) => c.status === "connected");

  if (isLoading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} h={48} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (connectedChannels.length === 0) {
    return (
      <Paper p="md" withBorder radius="sm">
        <Text size="sm" c="dimmed" ta="center">
          No connected channels. Connect accounts in Channel Settings.
        </Text>
      </Paper>
    );
  }

  return (
    <ScrollArea mah={280}>
      <Stack gap="xs">
        {connectedChannels.map((channel) => {
          const isSelected = draft.selectedChannelIds.includes(channel.id);
          return (
            <Paper
              key={channel.id}
              p="sm"
              withBorder
              radius="sm"
              style={{
                cursor: "pointer",
                borderColor: isSelected
                  ? "var(--mantine-color-blue-5)"
                  : undefined,
                background: isSelected
                  ? "var(--mantine-color-blue-0)"
                  : undefined,
              }}
              onClick={() =>
                toggleChannel(channel.id, channel.platform as Platform)
              }
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <Checkbox
                    checked={isSelected}
                    onChange={() =>
                      toggleChannel(channel.id, channel.platform as Platform)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {channel.displayName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {channel.handle}
                    </Text>
                  </Stack>
                </Group>
                <Badge
                  size="xs"
                  color={PLATFORM_COLORS[channel.platform] ?? "gray"}
                  variant="light"
                >
                  {PLATFORM_LABELS[channel.platform as Platform] ??
                    channel.platform}
                </Badge>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
