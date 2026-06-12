"use client";

import {
  Stack,
  Text,
  Paper,
  SimpleGrid,
  Button,
  Badge,
  Skeleton,
  Group,
} from "@zetsel/ui";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { fetchChannels, connectChannel, disconnectChannel } from "../../channels.api";
import { channelQueryKeys } from "../../channels.queryKeys";
import type { Channel } from "../../channels.types";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/channels/connect";
const MODULE_INFO = { name: "connect", label: "Connect" };

const PLATFORM_INFO: Record<string, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "grape" },
  facebook: { label: "Facebook", color: "blue" },
  x: { label: "X (Twitter)", color: "dark" },
  twitter: { label: "X (Twitter)", color: "dark" },
  linkedin: { label: "LinkedIn", color: "indigo" },
  tiktok: { label: "TikTok", color: "dark" },
  youtube: { label: "YouTube", color: "red" },
  threads: { label: "Threads", color: "gray" },
  pinterest: { label: "Pinterest", color: "red" },
};

const ALL_PLATFORMS = ["instagram", "facebook", "x", "linkedin", "tiktok", "youtube", "threads", "pinterest"];

function PlatformCard({
  platform,
  channels,
}: {
  platform: string;
  channels: Channel[];
}) {
  const info = PLATFORM_INFO[platform] ?? { label: platform, color: "gray" };
  const connected = channels.filter((c) => c.platform === platform && c.status === "connected");
  const hasAny = channels.some((c) => c.platform === platform);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      await connectChannel(platform as Channel["platform"]);
      qc.invalidateQueries({ queryKey: channelQueryKeys.list() });
      notifications.show({ message: `Connected to ${info.label}`, color: "green" });
    } catch {
      notifications.show({ message: "Connection failed", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect(id: string) {
    setLoading(true);
    try {
      await disconnectChannel(id);
      qc.invalidateQueries({ queryKey: channelQueryKeys.list() });
      notifications.show({ message: "Disconnected", color: "orange" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="sm">{info.label}</Text>
          <Badge
            size="xs"
            color={connected.length > 0 ? "green" : "gray"}
            variant="light"
          >
            {connected.length > 0 ? `${connected.length} connected` : "Not connected"}
          </Badge>
        </Group>

        {connected.map((ch) => (
          <Group
            key={ch.id}
            justify="space-between"
            p="xs"
            style={{ background: "var(--mantine-color-green-0)", borderRadius: 6 }}
          >
            <Text size="xs">{ch.handle}</Text>
            <Button
              size="xs"
              variant="subtle"
              color="red"
              loading={loading}
              onClick={() => handleDisconnect(ch.id)}
            >
              Disconnect
            </Button>
          </Group>
        ))}

        <Button
          size="xs"
          variant="light"
          color={info.color}
          loading={loading}
          onClick={handleConnect}
          fullWidth
        >
          {hasAny ? "Add Account" : "Connect"}
        </Button>
      </Stack>
    </Paper>
  );
}

export function ChannelsConnect() {
  const { data, isLoading } = useQuery({
    queryKey: channelQueryKeys.list(),
    queryFn: () => fetchChannels({ pageSize: 100 }),
  });

  const channels = data?.data ?? [];

  return (
    <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
      {isLoading ? (
        <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={140} radius="md" />)}
        </SimpleGrid>
      ) : (
        <SimpleGrid
          cols={{ base: 2, md: 3, lg: 4 }}
          spacing="md"
          style={{ overflow: "auto", maxHeight: "calc(100vh - 160px)" }}
        >
          {ALL_PLATFORMS.map((platform) => (
            <PlatformCard key={platform} platform={platform} channels={channels} />
          ))}
        </SimpleGrid>
      )}
    </ModulePageShell>
  );
}
