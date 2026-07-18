"use client";

import { Card, Group, Stack, Title } from "@peppermint/ui";

import type { SectionCardProps } from "./SectionCard.types";

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center" gap="sm">
          <Title order={5}>{title}</Title>
          {action}
        </Group>
        {children}
      </Stack>
    </Card>
  );
}
