"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Button,
  SimpleGrid,
  Image,
  Skeleton,
  Select,
} from "@zetsel/ui";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useIntegrations, useConnectIntegration, useDisconnectIntegration } from "../settings.hooks";
import type { Integration } from "../settings.api";

const CATEGORY_LABELS: Record<Integration["category"], string> = {
  analytics: "Analytics",
  crm: "CRM",
  ecommerce: "E-commerce",
  messaging: "Messaging",
  productivity: "Productivity",
};

export function IntegrationsList() {
  const [category, setCategory] = useState<string | null>(null);
  const { data: integrations = [], isLoading } = useIntegrations();
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();

  const filtered = category
    ? integrations.filter((i) => i.category === category)
    : integrations;

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={3}>Integrations</Title>
              {connectedCount > 0 && <Badge size="sm" color="green">{connectedCount} connected</Badge>}
            </Group>
            <Text c="dimmed" size="sm">Connect your favorite tools and services</Text>
          </Stack>
          <Select
            size="xs"
            w={140}
            placeholder="All categories"
            clearable
            data={Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ label: l, value: v }))}
            value={category}
            onChange={setCategory}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={100} radius="md" />)}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {filtered.map((integration) => (
            <Paper key={integration.id} withBorder radius="md" p="md">
              <Group justify="space-between">
                <Group gap="md">
                  <Image
                    src={integration.logoUrl}
                    alt={integration.name}
                    w={40}
                    h={40}
                    radius="sm"
                  />
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={600} size="sm">{integration.name}</Text>
                      <Badge size="xs" variant="light">{CATEGORY_LABELS[integration.category]}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{integration.description}</Text>
                    {integration.connected && integration.connectedAt && (
                      <Text size="xs" c="dimmed">
                        Connected {integration.connectedAt.toLocaleDateString()}
                      </Text>
                    )}
                  </Stack>
                </Group>
                {integration.connected ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    loading={disconnect.isPending}
                    onClick={async () => {
                      await disconnect.mutateAsync(integration.id);
                      notifications.show({ message: `${integration.name} disconnected`, color: "orange" });
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    loading={connect.isPending}
                    onClick={async () => {
                      await connect.mutateAsync(integration.id);
                      notifications.show({ message: `${integration.name} connected`, color: "green" });
                    }}
                  >
                    Connect
                  </Button>
                )}
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
