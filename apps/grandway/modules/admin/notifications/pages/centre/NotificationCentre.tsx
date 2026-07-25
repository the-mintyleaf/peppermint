"use client";

import {
  Button,
  Center,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { ChecksIcon } from "@phosphor-icons/react/dist/csr/Checks";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useMarkAllRead, useNotificationList } from "../../notifications.hooks";
import { NotificationRow } from "../../_shared/NotificationRow";
import { DUE_BUCKET_LABELS } from "../../notifications.labels";
import { orderedDueBucketGroups } from "../../notifications.utils";

/**
 * The working inbox — `GET /notifications/?status=active` (FLOWS.md "Work the
 * daily inbox"). Groups CLIENT-SIDE by `due_bucket` (one request, one clock —
 * `due_within_days` would otherwise shift per request, see
 * `notifications.utils.ts`). No ordering control anywhere — the API has none
 * (§9), so column-header sorting would silently do nothing.
 *
 * States: loading → `Loader`; request-failed → `QueryErrorState` + retry;
 * empty → "you're all caught up" copy; permission-denied → handled one layer
 * up by `RequireLeadAccess` (Superadmin never reaches this content). Read-only
 * mode and conflicting-edit states are N/A here — a 409 on dismiss surfaces
 * via the mutation's own error toast. "Archived/deleted record" is N/A by
 * design: this view only ever shows `status: active` rows; dismissed/resolved
 * history belongs to `RecordAlertsPanel`, not this screen.
 */
function NotificationCentreContent() {
  const { data, isLoading, isError, isRefetching, refetch } =
    useNotificationList({ status: "active", page_size: 100 });
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const truncated = total > notifications.length;
  const groups = orderedDueBucketGroups(notifications);

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Notifications", href: "/admin/notifications" },
        ]}
        right={
          <Button
            size="xs"
            variant="default"
            leftSection={<ChecksIcon size={14} aria-hidden />}
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        }
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          {isLoading ? (
            <Center h={200}>
              <Loader size="sm" />
            </Center>
          ) : null}

          {isError ? (
            <QueryErrorState
              message="Couldn't load your notifications."
              onRetry={() => refetch()}
              isRetrying={isRefetching}
            />
          ) : null}

          {!isLoading && !isError && notifications.length === 0 ? (
            <Center h={200}>
              <Text size="sm" c="dimmed">
                You&apos;re all caught up — no active alerts.
              </Text>
            </Center>
          ) : null}

          {!isLoading && !isError && notifications.length > 0
            ? groups.map(([bucket, rows]) => (
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
              ))
            : null}

          {truncated ? (
            <Text size="xs" c="dimmed">
              Showing the {notifications.length} most recent active alerts of{" "}
              {total}.
            </Text>
          ) : null}
        </Stack>
      </ModalPaper>
    </>
  );
}

/**
 * Access model is stricter here than anywhere else in the app: every endpoint
 * is scoped to the caller's OWN feed regardless of authority, and Superadmin
 * is refused all seven (§1). `RequireLeadAccess` already excludes Superadmin
 * (admin/lead_manager only), which matches this domain's gate exactly.
 */
export function ModuleNotificationCentre() {
  return (
    <RequireLeadAccess>
      <NotificationCentreContent />
    </RequireLeadAccess>
  );
}
