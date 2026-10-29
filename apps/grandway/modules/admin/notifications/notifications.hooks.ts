"use client";

import { useQueries, useQuery, useQueryClient } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  dismissNotification,
  fetchPreferences,
  fetchSummary,
  listNotifications,
  markAllRead,
  markNotificationRead,
  markNotificationUnread,
  updatePreferences,
} from "./notifications.api";
import {
  notificationQueryKeys,
  preferencesKey,
  summaryKey,
} from "./notifications.queryKeys";
import type {
  BulkReadResult,
  Notification,
  NotificationCategory,
  NotificationListFilters,
  NotificationPreferences,
  NotificationPreferencesUpdate,
  NotificationSummaryParams,
} from "./notifications.types";

/**
 * No push channel exists (§9) — this is the only sanctioned poll in this
 * module. Pauses when the tab is hidden, refreshes on refocus. `enabled`
 * defaults to `true`; the sidebar bell passes `false` for a Superadmin
 * session, which gets `NOTIFICATIONS_ACTOR_FORBIDDEN` on every endpoint (§1)
 * — polling anyway would just be a 403 every 30 seconds.
 */
export function useNotificationSummary(
  params?: NotificationSummaryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: summaryKey(params),
    queryFn: () => fetchSummary(params),
    enabled,
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
 * "Your alerts" for MULTIPLE source entity ids, merged into one newest-first,
 * deduplicated list. The backend's `source_entity_id` filter is a single
 * exact match — no multi-value syntax (§3) — but one record on screen can
 * have alerts keyed to more than one entity id: a checklist's own
 * `missing_documents`/`assignment_received` alerts key to the checklist id,
 * while `checklist_item_due`/`checklist_item_overdue` key to the *item's* id
 * (§4 source-triple table). `RecordAlertsPanel` fires one query per id in
 * the caller-supplied set and combines the results client-side.
 */
export function useNotificationsForEntities(entityIds: string[]) {
  const results = useQueries({
    queries: entityIds.map((id) => ({
      queryKey: notificationQueryKeys.list({ source_entity_id: id }),
      queryFn: () =>
        listNotifications(toListQueryParams({ source_entity_id: id })),
    })),
  });

  const byId = new Map<string, Notification>();
  for (const result of results) {
    for (const notification of result.data?.data ?? []) {
      byId.set(notification.id, notification);
    }
  }

  return {
    notifications: Array.from(byId.values()).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    ),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    isRefetching: results.some((r) => r.isRefetching),
    refetch: () => results.forEach((r) => r.refetch()),
  };
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
 * Every alert about one applicant's record — `?applicant_id=`, no `status`
 * (the full history, active + dismissed + resolved). Misses alerts raised
 * before 2026-10-29 (their `applicant_id` is null) and anything past the
 * 90-day retention window. Newest first, one generous page.
 */
export function useApplicantNotifications(applicantId: string) {
  return useNotificationList({ applicant_id: applicantId, page_size: 50 });
}

/** The caller's own preferences. Not polled — only changes when this user changes it. */
export function useNotificationPreferences(enabled = true) {
  return useQuery({
    queryKey: preferencesKey(),
    queryFn: fetchPreferences,
    enabled,
  });
}

/**
 * `PATCH /preferences/` — partial. The response is the FULL set after the
 * change, written straight into the cache so the switches re-render from what
 * the server says, not from what was sent. No list/summary invalidation: a
 * change only affects alerts created from now on (§7), so no existing count or
 * row moves.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useAppMutation<NotificationPreferences, NotificationPreferencesUpdate>(
    {
      mutationFn: updatePreferences,
      errorTitle: "Couldn't save notification settings",
      onSuccess: (data) => {
        queryClient.setQueryData(preferencesKey(), data);
      },
    },
  );
}

/**
 * `POST /read-all/` — clears unread rows on the caller's feed, including
 * dismissed/resolved ones; `active` does not change (§4, §7).
 *
 * Variable is the tab's categories: empty/omitted → one unfiltered call
 * ("All"); otherwise ONE call per category (a comma list is a 400), run in
 * parallel and summed. Callers pass the tab's whole group (not just categories
 * the 30s-old summary says are unread), so a stale count can't skip a clear.
 *
 * Invalidates the whole `notifications.notifications` prefix (not just
 * `lists()`) since a mounted detail/history read of a specific row's
 * `is_read`/`read_at` should refresh too.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useAppMutation<BulkReadResult, NotificationCategory[] | undefined>({
    mutationFn: async (categories) => {
      if (!categories || categories.length === 0) return markAllRead();
      const results = await Promise.all(categories.map((c) => markAllRead(c)));
      return {
        marked_read: results.reduce((sum, r) => sum + r.marked_read, 0),
      };
    },
    successMessage: (data) =>
      data.marked_read === 0
        ? "Nothing to mark as read."
        : `Marked ${data.marked_read} notification${data.marked_read === 1 ? "" : "s"} as read.`,
    errorTitle: "Couldn't mark all as read",
    invalidateKeys: [notificationQueryKeys.all, summaryKey()],
    // A grouped tab sends one call per category; if one fails the others have
    // still cleared on the server, so the badges must refresh either way.
    onError: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: summaryKey() });
    },
  });
}
