"use client";

import { Center, Paper, Stack, Text, Title } from "@peppermint/ui";
import { HourglassIcon } from "@phosphor-icons/react/dist/csr/Hourglass";

interface ComingSoonProps {
  label: string;
}

export function ComingSoon({ label }: ComingSoonProps) {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <Center h="100%">
        <Stack align="center" gap="xs">
          <HourglassIcon size={32} aria-label="Coming soon" />
          <Title order={4}>{label}</Title>
          <Text size="sm" c="dimmed">This module is not yet implemented.</Text>
        </Stack>
      </Center>
    </Paper>
  );
}
