"use client";

import Link from "next/link";
import { Button, Center, Stack, Text, ThemeIcon, Title } from "@peppermint/ui";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";

export function ModuleNotFound() {
  return (
    <Center h="100%" mih={300}>
      <Stack align="center" gap="xs" maw={360}>
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <CompassIcon size={24} weight="regular" aria-hidden />
        </ThemeIcon>
        <Title order={4} ta="center">
          Page not found
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          The page you are looking for does not exist or may have moved.
        </Text>
        <Button component={Link} href="/admin" variant="light" mt="xs">
          Back to home
        </Button>
      </Stack>
    </Center>
  );
}
