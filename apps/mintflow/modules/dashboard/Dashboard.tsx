"use client";

import { Badge, Box, Group, Stack, Text, Title } from "@peppermint/ui";

/**
 * Placeholder content region for mintflow-admin. Exists so the single-sidebar
 * app shell renders around real content — swap for the true dashboard module.
 */
export function ModuleDashboard() {
  return (
    <Box p={{ base: 20, sm: 40 }} mih="100%">
      <Stack gap="lg" maw={760}>
        <Stack gap={4}>
          <Text size="sm" c="dimmed" fw={500}>
            Manage and track your work
          </Text>
          <Group gap="sm" align="center">
            <Title order={1}>Dashboard</Title>
            <Badge color="accent" variant="light" radius="sm">
              Placeholder
            </Badge>
          </Group>
        </Stack>

        <Text c="dimmed" maw={560}>
          The mintflow-admin app shell renders around this region — a single
          dark icon rail on the left with brand, search, destinations, and the
          footer cluster (AI, bookmarks, notifications, settings, and your
          account). Real modules replace this content.
        </Text>
      </Stack>
    </Box>
  );
}
