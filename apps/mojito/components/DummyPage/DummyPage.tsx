"use client";

import { Paper, Group, Stack, Title, Text } from "@peppermint/ui";

interface DummyPageProps {
  title: string;
  description?: string;
}

export function DummyPage({ title, description }: DummyPageProps) {
  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between">
        <Stack gap={4}>
          <Title order={3}>{title}</Title>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
