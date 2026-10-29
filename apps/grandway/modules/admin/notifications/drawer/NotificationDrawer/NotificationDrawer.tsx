"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Tabs,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ChecksIcon } from "@phosphor-icons/react/dist/csr/Checks";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { NotificationFeed } from "../../_shared/NotificationFeed";
import { NotificationSettings } from "../../_shared/NotificationSettings";
import {
  useMarkAllRead,
  useNotificationSummary,
} from "../../notifications.hooks";
import { ALL_TAB_GROUP, INBOX_TAB_GROUPS } from "../../notifications.labels";
import { sumCategoryCounts } from "../../notifications.utils";
import type { NotificationDrawerProps } from "./NotificationDrawer.types";

/**
 * The inbox as a right-hand drawer opened from the sidebar bell — there is no
 * notifications route. Alerts are something you glance at and clear without losing the
 * screen you were working on, and every row already links out to the record it is
 * about, so a full page only added a navigation round-trip.
 *
 * Two views in one drawer, switched from the header: the **inbox** (category tabs +
 * feed) and **settings** (per-category switches). The header is fixed and carries the
 * view's levers — gear + "Mark all read" in the inbox, a back arrow in settings; only
 * the body scrolls (`ScrollArea.Autosize`).
 *
 * **Tabs:** eleven categories would overrun the drawer and most are empty most days, so
 * they are grouped into five (`INBOX_TAB_GROUPS`) plus All — each category in exactly
 * one. Badges come from `by_category` (same population as the bell's `unread`), and
 * "Mark all read" is scoped to the active tab: one unfiltered call for All, one call per
 * category (the API takes one at a time) for a grouped tab. The summary is polled by the
 * bell already; this reads the same cache slot, so opening the drawer adds no request.
 *
 * Access is gated by the caller, not here: the bell only renders for `admin`/
 * `lead_manager` (`superadmin` is refused every endpoint), and this drawer is
 * mounted behind the same flag. `RequireLeadAccess` is deliberately not used — it
 * renders a full-page denial, which has no meaning inside a drawer.
 */
export function NotificationDrawer({
  opened,
  onClose,
}: NotificationDrawerProps) {
  const [view, setView] = useState<"inbox" | "settings">("inbox");
  const [tab, setTab] = useState<string>(ALL_TAB_GROUP.value);
  const markAllRead = useMarkAllRead();
  const { data: summary } = useNotificationSummary();

  const activeGroup =
    INBOX_TAB_GROUPS.find((group) => group.value === tab) ?? ALL_TAB_GROUP;
  const inSettings = view === "settings";

  const handleClose = () => {
    setView("inbox");
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      size={480}
      padding={0}
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group justify="space-between" align="center" gap="sm" w="100%">
          <Group gap="xs">
            {inSettings ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Back to notifications"
                onClick={() => setView("inbox")}
              >
                <ArrowLeftIcon size={16} aria-hidden />
              </ActionIcon>
            ) : null}
            <Text fw={600} size="sm">
              {inSettings ? "Notification settings" : "Notifications"}
            </Text>
          </Group>
          {inSettings ? null : (
            <Group gap="xs">
              <Tooltip label="Notification settings">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="Notification settings"
                  onClick={() => setView("settings")}
                >
                  <GearSixIcon size={18} aria-hidden />
                </ActionIcon>
              </Tooltip>
              <Button
                size="xs"
                variant="default"
                leftSection={<ChecksIcon size={14} aria-hidden />}
                aria-label={
                  activeGroup.categories.length === 0
                    ? "Mark all notifications as read"
                    : `Mark all ${activeGroup.label} notifications as read`
                }
                onClick={() => markAllRead.mutate(activeGroup.categories)}
                loading={markAllRead.isPending}
              >
                Mark all read
              </Button>
            </Group>
          )}
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
      {inSettings ? (
        <Box p="md">
          <NotificationSettings />
        </Box>
      ) : (
        <Tabs value={tab} onChange={(value) => value && setTab(value)}>
          <Tabs.List px="md" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
            {INBOX_TAB_GROUPS.map((group) => {
              const unread = sumCategoryCounts(summary, group.categories);
              return (
                <Tabs.Tab
                  key={group.value}
                  value={group.value}
                  rightSection={
                    unread > 0 ? (
                      <Badge size="xs" variant="filled" color="blue" circle>
                        {unread}
                      </Badge>
                    ) : null
                  }
                  aria-label={
                    unread > 0 ? `${group.label}, ${unread} unread` : undefined
                  }
                >
                  {group.label}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          <Box p="md">
            <NotificationFeed
              key={activeGroup.value}
              categories={activeGroup.categories}
              scopeLabel={
                activeGroup.categories.length > 0
                  ? activeGroup.label
                  : undefined
              }
            />
          </Box>
        </Tabs>
      )}
    </Drawer>
  );
}
