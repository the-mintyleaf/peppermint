"use client";

import Link from "next/link";
import {
  Button,
  Center,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import type { DocumentUnavailableProps } from "./DocumentUnavailable.types";

/**
 * Terminal state for the full-screen editor when the document workspace can't be loaded.
 *
 * A 404 here is ambiguous by design — the backend returns it both for an unknown document
 * and for a staff account that may not know one exists (`overview.md` §Role model). So the
 * copy is drawn from `getApiErrorMessage` ("That document isn't available."), which never
 * says the record was deleted. Visual language matches `ModuleNotFound` so the two read as
 * the same outcome.
 */
export function DocumentUnavailable({
  message,
  onRetry,
}: DocumentUnavailableProps) {
  return (
    <Center h="100%" mih={400}>
      <Stack align="center" gap="xs" maw={360}>
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <CompassIcon size={24} weight="regular" aria-hidden />
        </ThemeIcon>
        <Title order={4} ta="center">
          Document not available
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          {message}
        </Text>
        <Group gap="xs" mt="xs">
          {onRetry && (
            <Button variant="light" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button component={Link} href="/admin/documents" variant="subtle">
            Back to documents
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
