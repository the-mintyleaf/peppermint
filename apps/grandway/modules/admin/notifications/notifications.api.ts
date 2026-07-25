import { createResourceApi } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  BulkReadResult,
  FeedSummary,
  Notification,
  NotificationSummaryParams,
} from "./notifications.types";

const NOTIFICATIONS = "/api/v1/notifications";

/**
 * `GET /notifications/` has no text search and no client-choosable ordering
 * (§3, §9 — the feed's most consequential gap) — always newest-created first.
 * `search`/`sort` are never forwarded; every filter field name already matches
 * its server param name 1:1, so the default `createResourceApi` param mapping
 * (spread `filters` + `page`/`page_size`) is used as-is.
 */
function toNotificationServerParams(
  params: QueryParams,
): Record<string, unknown> {
  return {
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
  };
}

/**
 * This domain has no create and no update endpoint anywhere (§7 — all seven
 * accept no request body) — `TCreate`/`TUpdate` are `never` so `create`/
 * `update`/`remove` can never be called by accident from this resource.
 */
const notificationResource = createResourceApi<Notification, never, never>({
  client: api,
  basePath: NOTIFICATIONS,
  toServerParams: toNotificationServerParams,
});

/** `GET /api/v1/notifications/` — own feed only, paginated, newest first (§7). */
export const listNotifications = notificationResource.list;

/** `GET /api/v1/notifications/<id>/` — 404 for a made-up id AND for another user's notification, indistinguishably (§3, §8). */
export const getNotification = notificationResource.get;

/**
 * `GET /api/v1/notifications/summary/` — validates the whole filter set but
 * only `due_within_days` changes the result (§7); everything else is accepted
 * for type consistency with the list filters, not because summary reads it.
 */
export async function fetchSummary(
  params?: NotificationSummaryParams,
): Promise<FeedSummary> {
  const { data } = await api.get<FeedSummary>(`${NOTIFICATIONS}/summary/`, {
    params,
  });
  return data;
}

/**
 * `POST /<id>/read/`, `/unread/`, `/dismiss/` — no body under any method (§7).
 * `createResourceApi.action()` defaults an omitted body to `{}` rather than
 * sending none, so these three call `api.post` directly (matching
 * `markAllRead` below) to match the contract exactly.
 */

/** `POST /<id>/read/` — no body. Idempotent; a second call keeps the first `read_at`. Does not change `status` (§7). */
export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.post<Notification>(`${NOTIFICATIONS}/${id}/read/`);
  return data;
}

/** `POST /<id>/unread/` — no body. Clears `read_at`. Exists so opening a row is a safe act, not because any flow depends on it (§7). */
export async function markNotificationUnread(
  id: string,
): Promise<Notification> {
  const { data } = await api.post<Notification>(
    `${NOTIFICATIONS}/${id}/unread/`,
  );
  return data;
}

/** `POST /<id>/dismiss/` — no body, no reason. The only irreversible action in this app (§7). */
export async function dismissNotification(id: string): Promise<Notification> {
  const { data } = await api.post<Notification>(
    `${NOTIFICATIONS}/${id}/dismiss/`,
  );
  return data;
}

/**
 * `POST /read-all/` — no body, no filters. Not a per-id action (no id to hang
 * it on), so it's a standalone call rather than forced through
 * `notificationResource.action`.
 */
export async function markAllRead(): Promise<BulkReadResult> {
  const { data } = await api.post<BulkReadResult>(`${NOTIFICATIONS}/read-all/`);
  return data;
}
