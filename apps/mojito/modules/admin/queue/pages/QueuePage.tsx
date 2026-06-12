"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  ScrollArea,
  Button,
  Select,
  Badge,
  Skeleton,
  ActionIcon,
  Divider,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useState } from "react";
import { useQueueSlots, useQueuedContent, useDeleteQueueSlot, useAddQueueSlot } from "../queue.hooks";
import { CHANNEL_LABELS } from "../queue.api";
import type { QueueSlot } from "../../shared/entities.types";

const CHANNEL_IDS = ["channel_1", "channel_2", "channel_3"];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function QueueColumn({ channelId }: { channelId: string }) {
  const { data: slots = [], isLoading } = useQueueSlots(channelId);
  const { data: content = [] } = useQueuedContent(channelId);
  const deleteSlot = useDeleteQueueSlot();
  const addSlot = useAddQueueSlot();

  const [newTime, setNewTime] = useState<string | null>(null);
  const [newDay, setNewDay] = useState<string | null>(null);

  const sortedSlots = [...slots].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.time.localeCompare(b.time);
  });

  if (isLoading) {
    return (
      <Stack gap="xs" w={260}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={60} radius="sm" />)}
      </Stack>
    );
  }

  return (
    <Paper withBorder radius="md" p="md" w={260} style={{ flexShrink: 0 }}>
      <Stack gap="sm">
        <Text fw={600} size="sm" lineClamp={1}>{CHANNEL_LABELS[channelId] ?? channelId}</Text>
        <Divider />
        {sortedSlots.map((slot) => {
          const queuedItem = content[0]; // simplified: just show first match
          return (
            <Paper key={slot.id} withBorder radius="sm" p="xs">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs">
                  <ClockIcon size={12} />
                  <Text size="xs">{DAY_LABELS[slot.dayOfWeek]} {slot.time}</Text>
                </Group>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => deleteSlot.mutate(slot.id)}
                  aria-label="Remove slot"
                >
                  <TrashIcon size={10} />
                </ActionIcon>
              </Group>
              {queuedItem && (
                <Text size="xs" c="dimmed" lineClamp={1} mt={4}>{queuedItem.title}</Text>
              )}
            </Paper>
          );
        })}

        <Divider label="Add slot" labelPosition="center" />
        <Group gap="xs">
          <Select
            size="xs"
            placeholder="Day"
            value={newDay}
            onChange={setNewDay}
            data={DAY_LABELS.map((d, i) => ({ value: String(i), label: d }))}
            style={{ flex: 1 }}
          />
          <Select
            size="xs"
            placeholder="Time"
            value={newTime}
            onChange={setNewTime}
            data={["09:00", "12:00", "15:00", "18:00", "21:00"]}
            style={{ flex: 1 }}
          />
        </Group>
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusIcon size={12} />}
          disabled={!newDay || !newTime}
          onClick={() => {
            if (!newDay || !newTime) return;
            addSlot.mutate({
              channelId,
              dayOfWeek: Number(newDay) as QueueSlot["dayOfWeek"],
              time: newTime,
              timezone: "UTC",
            });
            setNewDay(null);
            setNewTime(null);
          }}
        >
          Add Slot
        </Button>
      </Stack>
    </Paper>
  );
}

export function QueuePage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const displayChannels = selectedChannel ? [selectedChannel] : CHANNEL_IDS;

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Queue</Title>
            <Text c="dimmed" size="sm">
              Manage your posting schedule time slots per channel
            </Text>
          </Stack>
          <Select
            placeholder="All channels"
            clearable
            value={selectedChannel}
            onChange={setSelectedChannel}
            data={CHANNEL_IDS.map((id) => ({ value: id, label: CHANNEL_LABELS[id] ?? id }))}
            size="sm"
            style={{ width: 220 }}
          />
        </Group>
      </Paper>

      <ScrollArea>
        <Group gap="md" align="flex-start" wrap="nowrap" pb="md">
          {displayChannels.map((channelId) => (
            <QueueColumn key={channelId} channelId={channelId} />
          ))}
        </Group>
      </ScrollArea>
    </Stack>
  );
}
