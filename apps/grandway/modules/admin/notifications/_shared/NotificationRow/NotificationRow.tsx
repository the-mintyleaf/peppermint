"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  modals,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import {
  DUE_BUCKET_COLORS,
  DUE_BUCKET_LABELS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "../../notifications.labels";
import { useDismiss, useMarkRead } from "../../notifications.hooks";
import {
  formatDateTime,
  formatDueAt,
  resolveNotificationLink,
} from "../../notifications.utils";
import type { NotificationRowProps } from "./NotificationRow.types";

/**
 * One feed row, reused by both the Notification Centre inbox and
 * `RecordAlertsPanel`. Each instance calls its own `useMarkRead`/`useDismiss`
 * hooks (a valid, established pattern in this app — each rendered row is its
 * own component instance), so the parent list only needs to pass the row data.
 */
export function NotificationRow({
  notification,
  showDueBucketBadge = true,
}: NotificationRowProps) {
  const markRead = useMarkRead(notification.id);
  const dismiss = useDismiss(notification.id);

  const Icon = NOTIFICATION_TYPE_ICONS[notification.notification_type];
  const link = resolveNotificationLink(notification);
  const canDismiss = notification.status === "active";

  const handleOpen = () => {
    if (!notification.is_read) markRead.mutate();
  };

  const handleDismiss = () => {
    if (
      notification.priority === "high" ||
      notification.priority === "urgent"
    ) {
      modals.openConfirmModal({
        title: "Dismiss this alert?",
        children:
          "This is permanent — there is no un-dismiss. If the underlying work still needs doing, dismissing it here does not do that work.",
        labels: { confirm: "Dismiss", cancel: "Keep it" },
        confirmProps: { color: "red" },
        styles: { inner: { padding: "var(--mantine-spacing-md)" } },
        onConfirm: () => dismiss.mutate(),
      });
      return;
    }
    dismiss.mutate();
  };

  return (
    <Paper
      withBorder
      p="sm"
      radius="sm"
      bg={notification.is_read ? undefined : "var(--mantine-color-blue-0)"}
    >
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            {/* Decorative — the adjacent Text carries the same label, so this is aria-hidden to avoid double announcement. */}
            <Icon size={16} aria-hidden />
            <Text size="xs" fw={500}>
              {NOTIFICATION_TYPE_LABELS[notification.notification_type]}
            </Text>
            <StatusBadge
              value={notification.priority}
              colorMap={PRIORITY_COLORS}
              labelMap={PRIORITY_LABELS}
            />
            {showDueBucketBadge ? (
              <Badge
                size="xs"
                variant="light"
                color={DUE_BUCKET_COLORS[notification.due_bucket]}
              >
                {DUE_BUCKET_LABELS[notification.due_bucket]}
              </Badge>
            ) : null}
            {!notification.is_read ? (
              <Badge size="xs" variant="filled" color="blue">
                Unread
              </Badge>
            ) : null}
          </Group>
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {formatDateTime(notification.created_at)}
          </Text>
        </Group>

        <Text size="sm" fw={500}>
          {notification.title}
        </Text>
        {/* Plain English text, never HTML — rendered as a text node, never dangerouslySetInnerHTML. */}
        <Text size="xs" c="dimmed">
          {notification.body}
        </Text>
        {notification.due_at ? (
          <Text size="xs" c="dimmed">
            Due {formatDueAt(notification.due_at, notification.due_at_bs)}
          </Text>
        ) : null}

        {/* Destructive action spatially separated (far left) from the safe actions (right) — never adjacent. */}
        <Group justify="space-between" gap="xs">
          <Box>
            {canDismiss ? (
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                leftSection={<XCircleIcon size={12} aria-hidden />}
                onClick={handleDismiss}
                loading={dismiss.isPending}
              >
                Dismiss
              </Button>
            ) : null}
          </Box>
          <Group gap="xs">
            {!notification.is_read ? (
              <Button
                size="compact-xs"
                variant="subtle"
                color="gray"
                leftSection={<CheckIcon size={12} aria-hidden />}
                onClick={() => markRead.mutate()}
                loading={markRead.isPending}
              >
                Mark as read
              </Button>
            ) : null}
            {link ? (
              <Button
                size="compact-xs"
                variant="light"
                component={Link}
                href={link}
                rightSection={<ArrowSquareOutIcon size={12} aria-hidden />}
                onClick={handleOpen}
              >
                View record
              </Button>
            ) : null}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
