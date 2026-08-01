"use client";

import { Box, Button, Drawer, Group, ScrollArea, Text } from "@peppermint/ui";
import { ChecksIcon } from "@phosphor-icons/react/dist/csr/Checks";
import { NotificationFeed } from "../../_shared/NotificationFeed";
import { useMarkAllRead } from "../../notifications.hooks";
import type { NotificationDrawerProps } from "./NotificationDrawer.types";

/**
 * The inbox as a right-hand drawer opened from the sidebar bell — there is no
 * notifications route. Alerts are something you glance at and clear without losing the
 * screen you were working on, and every row already links out to the record it is
 * about, so a full page only added a navigation round-trip.
 *
 * The header is fixed and carries "Mark all as read"; only the feed scrolls
 * (`ScrollArea.Autosize`), so the lever stays reachable however long the list runs.
 *
 * Access is gated by the caller, not here: the bell only renders for `admin`/
 * `lead_manager` (`superadmin` is refused all seven endpoints), and this drawer is
 * mounted behind the same flag. `RequireLeadAccess` is deliberately not used — it
 * renders a full-page denial, which has no meaning inside a drawer.
 */
export function NotificationDrawer({
  opened,
  onClose,
}: NotificationDrawerProps) {
  const markAllRead = useMarkAllRead();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={440}
      padding={0}
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group justify="space-between" align="center" gap="sm" w="100%">
          <Text fw={600} size="sm">
            Notifications
          </Text>
          <Button
            size="xs"
            variant="default"
            leftSection={<ChecksIcon size={14} aria-hidden />}
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        </Group>
      }
      styles={{
        // `padding={0}` would leave the fixed header flush against the drawer edges,
        // so it carries its own — matched to the body's, plus the same underline the
        // app's Modal header uses.
        header: {
          padding: "var(--mantine-spacing-md)",
          borderBottom: "1px solid var(--mantine-color-gray-light)",
        },
        title: { flex: 1, marginRight: "var(--mantine-spacing-sm)" },
      }}
    >
      <Box p="md">
        <NotificationFeed />
      </Box>
    </Drawer>
  );
}
