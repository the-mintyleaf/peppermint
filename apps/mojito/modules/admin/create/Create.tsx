"use client";

import { Button, Paper, Stack, Text, Title } from "@zetsel/ui";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";

export function ModuleCreate() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <Stack align="center" justify="center" h="100%" gap="md" p="xl">
        <PenNibIcon size={48} color="var(--mantine-color-gray-5)" />
        <Title order={3} c="gray.2">
          Create a Post
        </Title>
        <Text c="gray.5" ta="center" maw={400}>
          Compose and schedule posts for publishing. This workspace will connect to the
          external publishing API once it is available.
        </Text>
        <Button disabled leftSection={<PenNibIcon size={16} />}>
          New Post
        </Button>
      </Stack>
    </Paper>
  );
}
