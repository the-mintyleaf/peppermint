"use client";

import {
  Badge,
  Drawer,
  Group,
  List,
  Progress,
  Stack,
  Text,
  Title,
  useQuery,
} from "@peppermint/ui";

import { fetchPositionHolders } from "../../../../positions.api";
import { positionsQueryKeys } from "../../../../positions.queryKeys";
import type { PositionDetailDrawerProps } from "./PositionDetailDrawer.types";

export function PositionDetailDrawer({
  position,
  opened,
  onClose,
}: PositionDetailDrawerProps) {
  const { data: holders } = useQuery({
    queryKey: positionsQueryKeys.holders(position?.id ?? ""),
    queryFn: () => fetchPositionHolders(position?.id ?? ""),
    enabled: Boolean(position),
  });

  if (!position) return null;

  const activeHolders = (holders ?? []).filter((h) => h.status === "active");

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title="Position Details"
      size="sm"
    >
      <Stack gap="md">
        <div>
          <Group gap="xs" align="center" mb={4}>
            <Title order={4}>{position.title}</Title>
            <Badge size="xs">{position.status}</Badge>
          </Group>
          <Text size="xs" c="dimmed">
            {position.code} · {position.position_type}
          </Text>
        </div>

        {position.description && <Text size="sm">{position.description}</Text>}

        <Group gap="xs">
          {position.is_leadership && (
            <Badge size="xs" color="violet">
              Leadership
            </Badge>
          )}
          {position.is_supervisory && (
            <Badge size="xs" color="cyan">
              Supervisory
            </Badge>
          )}
          {position.is_single_occupant && (
            <Badge size="xs" color="gray">
              Single Occupant
            </Badge>
          )}
        </Group>

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              Capacity
            </Text>
            <Text size="xs" fw={600}>
              {activeHolders.length} / {position.max_occupants}
            </Text>
          </Group>
          <Progress
            value={
              (activeHolders.length / Math.max(position.max_occupants, 1)) * 100
            }
            color={
              activeHolders.length >= position.max_occupants ? "red" : "blue"
            }
          />
        </div>

        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Current Holders
          </Text>
          {activeHolders.length === 0 ? (
            <Text size="sm" c="dimmed">
              No active holders.
            </Text>
          ) : (
            <List size="sm">
              {activeHolders.map((holder) => (
                <List.Item key={holder.id}>
                  {holder.assignment_type} · since{" "}
                  {holder.starts_at
                    ? new Date(holder.starts_at).toLocaleDateString()
                    : "—"}
                </List.Item>
              ))}
            </List>
          )}
        </div>
      </Stack>
    </Drawer>
  );
}
