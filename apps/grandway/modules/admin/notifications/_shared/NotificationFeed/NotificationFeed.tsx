"use client";

import { Center, Loader, Stack, Text } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useNotificationList } from "../../notifications.hooks";
import { NotificationRow } from "../NotificationRow";
import { DUE_BUCKET_LABELS } from "../../notifications.labels";
import { orderedDueBucketGroups } from "../../notifications.utils";

/**
 * The working inbox body — `GET /notifications/?status=active` (FLOWS.md "Work the
 * daily inbox"). Groups CLIENT-SIDE by `due_bucket` (one request, one clock —
 * `due_within_days` would otherwise shift per request, see `notifications.utils.ts`).
 * No ordering control anywhere — the API has none (§9), so a sort control would
 * silently do nothing.
 *
 * States: loading → `Loader`; request-failed → `QueryErrorState` + retry; empty →
 * "you're all caught up" copy; permission-denied → never reached, the caller only
 * mounts this for `admin`/`lead_manager` (Superadmin is refused all seven endpoints).
 * Read-only mode and conflicting-edit states are N/A — a 409 on dismiss surfaces via
 * the mutation's own error toast. "Archived/deleted record" is N/A by design: this
 * view only shows `status: active` rows; dismissed/resolved history belongs to
 * `RecordAlertsPanel`.
 *
 * Rendered inside the notifications drawer; it owns no chrome of its own, so any
 * surface can host it.
 */
export function NotificationFeed() {
  const { data, isLoading, isError, isRefetching, refetch } =
    useNotificationList({ status: "active", page_size: 100 });

  const notifications = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const truncated = total > notifications.length;
  const groups = orderedDueBucketGroups(notifications);

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load your notifications."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <Center h={200}>
        <Text size="sm" c="dimmed">
          You&apos;re all caught up — no active alerts.
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {groups.map(([bucket, rows]) => (
        <Stack key={bucket} gap="xs">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            {DUE_BUCKET_LABELS[bucket]} ({rows.length})
          </Text>
          {rows.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              showDueBucketBadge={false}
            />
          ))}
        </Stack>
      ))}

      {truncated ? (
        <Text size="xs" c="dimmed">
          Showing the {notifications.length} most recent active alerts of{" "}
          {total}.
        </Text>
      ) : null}
    </Stack>
  );
}
