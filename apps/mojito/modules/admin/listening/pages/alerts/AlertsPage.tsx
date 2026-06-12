"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Button,
  ActionIcon,
  Skeleton,
  Center,
  ThemeIcon,
} from "@zetsel/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { BellSlashIcon } from "@phosphor-icons/react/dist/csr/BellSlash";
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead } from "../../listening.hooks";
import type { Alert } from "../../../shared/entities.types";

const ALERT_COLOR: Record<Alert["type"], string> = {
  volume_spike: "blue",
  crisis: "red",
  keyword_mention: "violet",
};

const ALERT_ICON: Record<Alert["type"], typeof BellIcon> = {
  volume_spike: BellIcon,
  crisis: WarningIcon,
  keyword_mention: BellIcon,
};

export function AlertsPage() {
  const { data: alerts = [], isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const markAll = useMarkAllAlertsRead();

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={3}>Alerts</Title>
              {unread > 0 && <Badge color="red" size="sm">{unread} unread</Badge>}
            </Group>
            <Text c="dimmed" size="sm">Stay on top of volume spikes, crises, and keyword triggers</Text>
          </Stack>
          {unread > 0 && (
            <Button
              size="xs"
              variant="light"
              leftSection={<CheckIcon size={12} />}
              loading={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </Button>
          )}
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="sm">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={72} radius="md" />)}
        </Stack>
      ) : alerts.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <BellSlashIcon size={32} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed" size="sm">No alerts — everything looks calm</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON[alert.type];
            return (
              <Paper
                key={alert.id}
                withBorder
                radius="md"
                p="md"
                opacity={alert.read ? 0.6 : 1}
                style={{
                  borderLeft: `4px solid var(--mantine-color-${ALERT_COLOR[alert.type]}-4)`,
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      size="sm"
                      variant="light"
                      color={ALERT_COLOR[alert.type]}
                      radius="xl"
                    >
                      <Icon size={12} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Badge size="xs" color={ALERT_COLOR[alert.type]} variant="light">
                          {alert.type.replace(/_/g, " ")}
                        </Badge>
                        {!alert.read && <Badge size="xs" color="red" variant="filled">New</Badge>}
                      </Group>
                      <Text size="sm">{alert.text}</Text>
                      <Text size="xs" c="dimmed">{alert.triggeredAt.toLocaleString()}</Text>
                    </Stack>
                  </Group>
                  {!alert.read && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => markRead.mutate(alert.id)}
                      loading={markRead.isPending}
                      aria-label="Mark as read"
                    >
                      <CheckIcon size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
