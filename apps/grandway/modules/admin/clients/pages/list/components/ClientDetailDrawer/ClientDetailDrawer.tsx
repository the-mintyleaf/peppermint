"use client";

import {
  Button,
  Center,
  Drawer,
  Loader,
  Stack,
  Tabs,
  Text,
} from "@peppermint/ui";
import { getApiError } from "@/lib/authErrorMessages";
import { useClientDetail } from "../../../../clients.hooks";
import { ClientHistoryPanel } from "./ClientHistoryPanel";
import { ClientOverviewPanel } from "./ClientOverviewPanel";
import type { ClientDetailDrawerProps } from "./ClientDetailDrawer.types";

/**
 * Full client detail, always the real fetch (the list row is trimmed). Readable
 * by lead managers too — this is a shared directory (§1). A genuine 404
 * (`CLIENTS_CLIENT_NOT_FOUND`, always genuine — §3) renders as not-found; any
 * other failure gets a distinct message and a retry rather than asserting the
 * record is gone.
 */
export function ClientDetailDrawer({
  clientId,
  opened,
  onClose,
}: ClientDetailDrawerProps) {
  const {
    data: client,
    isLoading,
    isError,
    error,
    refetch,
  } = useClientDetail(clientId);
  const notFound =
    isError && getApiError(error).code === "CLIENTS_CLIENT_NOT_FOUND";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={client ? client.name : "Client"}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="sm" />
        </Center>
      ) : notFound ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Client not found.
        </Text>
      ) : isError || !client ? (
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Couldn&apos;t load this client.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <ClientOverviewPanel client={client} />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <ClientHistoryPanel clientId={client.id} />
          </Tabs.Panel>
        </Tabs>
      )}
    </Drawer>
  );
}
