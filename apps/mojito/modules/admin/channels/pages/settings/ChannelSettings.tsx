"use client";

import {
  Stack,
  Text,
  Paper,
  Select,
  Textarea,
  Button,
  Skeleton,
  ScrollArea,
  Badge,
  Divider,
  Group,
} from "@zetsel/ui";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { fetchChannels, updateChannelSettings } from "../../channels.api";
import { channelQueryKeys } from "../../channels.queryKeys";
import type { Channel } from "../../channels.types";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/channels/settings";
const MODULE_INFO = { name: "channel-settings", label: "Channel Settings" };

const TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago",
  "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
];

function ChannelSettingsPanel({ channel }: { channel: Channel }) {
  const qc = useQueryClient();
  const [timezone, setTimezone] = useState<string>((channel as Channel & { timezone?: string }).timezone ?? "UTC");
  const [signature, setSignature] = useState<string>((channel as Channel & { signature?: string }).signature ?? "");
  const [firstComment, setFirstComment] = useState<string>(
    (channel as Channel & { defaultFirstComment?: string }).defaultFirstComment ?? "",
  );

  const mutation = useMutation({
    mutationFn: () =>
      updateChannelSettings(channel.id, {
        timezone,
        signature,
        defaultFirstComment: firstComment,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelQueryKeys.list() });
      notifications.show({ message: "Settings saved", color: "green" });
    },
    onError: () => notifications.show({ message: "Failed to save", color: "red" }),
  });

  return (
    <Stack gap="md">
      <Select
        label="Timezone"
        data={TIMEZONES}
        value={timezone}
        onChange={(v) => setTimezone(v ?? "UTC")}
        size="sm"
      />
      <Textarea
        label="Signature"
        placeholder="Add a signature appended to every post…"
        value={signature}
        onChange={(e) => setSignature(e.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={4}
        size="sm"
      />
      <Textarea
        label="Default First Comment"
        placeholder="Add a default first comment for posts on this channel…"
        value={firstComment}
        onChange={(e) => setFirstComment(e.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={4}
        size="sm"
      />
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
        style={{ alignSelf: "flex-start" }}
      >
        Save
      </Button>
    </Stack>
  );
}

export function ChannelSettings() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: channelQueryKeys.list(),
    queryFn: () => fetchChannels({ pageSize: 100 }),
  });

  const channels = (data?.data ?? []).filter((c) => c.status === "connected");
  const selected = channels.find((c) => c.id === selectedId) ?? channels[0] ?? null;

  return (
    <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
      <Group align="flex-start" gap="md" style={{ height: "calc(100vh - 160px)" }}>
        <Paper withBorder radius="md" p={0} style={{ width: 240, flexShrink: 0, overflow: "hidden" }}>
          <ScrollArea h="100%">
            <Stack gap={0}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={56} radius={0} />)
                : channels.map((ch) => (
                    <Paper
                      key={ch.id}
                      p="sm"
                      radius={0}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid var(--mantine-color-gray-2)",
                        background: selected?.id === ch.id ? "var(--mantine-color-blue-0)" : undefined,
                      }}
                      onClick={() => setSelectedId(ch.id)}
                    >
                      <Stack gap={2}>
                        <Text size="sm" fw={500} lineClamp={1}>{ch.displayName}</Text>
                        <Group gap={4}>
                          <Badge size="xs" variant="light">{ch.platform}</Badge>
                          <Text size="xs" c="dimmed">{ch.handle}</Text>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
            </Stack>
          </ScrollArea>
        </Paper>

        <Paper withBorder radius="md" p="lg" style={{ flex: 1, overflow: "auto" }}>
          {!selected && (
            <Text c="dimmed" size="sm">Select a channel to configure its settings.</Text>
          )}
          {selected && (
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="sm">{selected.displayName}</Text>
                <Badge size="sm" variant="light">{selected.platform}</Badge>
              </Group>
              <Divider />
              <ChannelSettingsPanel channel={selected} />
            </Stack>
          )}
        </Paper>
      </Group>
    </ModulePageShell>
  );
}
