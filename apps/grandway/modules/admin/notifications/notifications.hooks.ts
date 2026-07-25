"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  dismissNotification,
  fetchSummary,
  listNotifications,
  markAllRead,
  markNotificationRead,
  markNotificationUnread,
} from "./notifications.api";
import { notificationQueryKeys, summaryKey } from "./notifications.queryKeys";
import type {
  BulkReadResult,
  Notification,
  NotificationListFilters,
  NotificationSummaryParams,
} from "./notifications.types";

/** No push channel exists (§9) — this is the only sanctioned poll in this module. Pauses when the tab is hidden, refreshes on refocus. */
export function useNotificationSummary(params?: NotificationSummaryParams) {
  return useQuery({
    queryKey: summaryKey(params),
    queryFn: () => fetchSummary(params),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * `filters` → the shell's `QueryParams` shape (`page`/`page_size` split out,
 * the rest forwarded as `filters`). The cast is a safe widen — every
 * remaining field is a string/boolean/number, all assignable to `unknown` —
 * not a narrowing `any` escape; a plain interface has no index signature of
 * its own, so it isn't directly assignable to `FilterState` without it.
 */
function toListQueryParams(filters: NotificationListFilters): QueryParams {
  const { page, page_size, ...rest } = filters;
  return {
    page: page ?? 1,
    pageSize: page_size ?? 20,
    search: "",
    sort: [],
    filters: rest as Record<string, unknown>,
  };
}

/**
 * Callers must always pass explicit filters — there is no sane default here.
 * Omitting `status` returns dismissed/resolved history too (§3), which is
 * right for `RecordAlertsPanel` and wrong for the working inbox; each
 * consumer decides its own filter.
 */
export function useNotificationList(filters: NotificationListFilters) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters),
    queryFn: () => listNotifications(toListQueryParams(filters)),
  });
}

/**
 * `lists()` is a strict prefix of every `.list(params)` key, so invalidating
 * it refreshes every mounted list query regardless of its filters (the active
 * inbox, a `RecordAlertsPanel`, anything else) — plus the badge.
 */
function invalidateFeedKeys() {
  return [notificationQueryKeys.lists(), summaryKey()];
}

/** `POST /<id>/read/` — idempotent, keeps the first `read_at` on a second call. Does not change `status` (§7). */
export function useMarkRead(id: string) {
  return useAppMutation<Notification, void>({
    mutationFn: () => markNotificationRead(id),
    invalidateKeys: invalidateFeedKeys(),
  });
}

/** `POST /<id>/unread/` — the "put it back" affordance; exists so opening a row is a safe act (§7). */
export function useMarkUnread(id: string) {
  return useAppMutation<Notification, void>({
    mutationFn: () => markNotificationUnread(id),
    invalidateKeys: invalidateFeedKeys(),
  });
}

/**
 * `POST /<id>/dismiss/` — permanent, no reason field, no un-dismiss (§7, §9).
 * `NOTIFICATIONS_ALREADY_TERMINAL` (409) is not in this app's error-message
 * map, so `useAppMutation`'s default resolver falls through to the server's
 * own `error.message` — the toast still shows something meaningful rather
 * than a generic failure.
 */
export function useDismiss(id: string) {
  return useAppMutation<Notification, void>({
    mutationFn: () => dismissNotification(id),
    successMessage: "Alert dismissed.",
    errorTitle: "Couldn't dismiss alert",
    invalidateKeys: invalidateFeedKeys(),
  });
}

/**
 * `POST /read-all/` — clears every unread row on the caller's feed, including
 * dismissed/resolved ones; `active` does not change (§4, §7). Invalidates the
 * whole `notifications.notifications` prefix (not just `lists()`) since a
 * mounted detail/history read of a specific row's `is_read`/`read_at` should
 * refresh too.
 */
export function useMarkAllRead() {
  return useAppMutation<BulkReadResult, void>({
    mutationFn: markAllRead,
    successMessage: (data) =>
      data.marked_read === 0
        ? "Nothing to mark as read."
        : `Marked ${data.marked_read} notification${data.marked_read === 1 ? "" : "s"} as read.`,
    errorTitle: "Couldn't mark all as read",
    invalidateKeys: [notificationQueryKeys.all, summaryKey()],
  });
}
