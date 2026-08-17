import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Reminder,
  ReminderActionPayload,
  ReminderCreatePayload,
  ReminderHistoryEntry,
  ReminderUpdatePayload,
} from "./reminders.types";

const REMINDERS = "/api/v1/reminders";

/**
 * This API has **no `search` and no `ordering`** (§3) — rows are always
 * newest-created first. Forwarding either would send a parameter the backend
 * validates and rejects (query params here are 400s, not silently ignored), so
 * both are dropped rather than passed through. Every filter field name already
 * matches its server param 1:1.
 */
function toReminderServerParams(params: QueryParams): Record<string, unknown> {
  return {
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
  };
}

/**
 * `TUpdate` is `ReminderUpdatePayload`, **not** `Partial<Reminder>` — the
 * default second-order generic would have let `status` or `applicant` through
 * the type system, and the backend rejects those with 400
 * `REMINDERS_FIELD_IMMUTABLE` rather than ignoring them (§3).
 *
 * `remove` is never re-exported below: **there is no `DELETE` on any endpoint
 * in this module** (§3). The resource still carries the method structurally, so
 * the module barrel is the boundary that keeps it unreachable.
 */
const reminderResource = createResourceApi<
  Reminder,
  ReminderCreatePayload,
  ReminderUpdatePayload
>({
  client: api,
  basePath: REMINDERS,
  toServerParams: toReminderServerParams,
});

/** `GET /api/v1/reminders/` — paginated, newest-created first. Omitting `status` returns open AND closed rows (§7). */
export const listReminders = reminderResource.list;

/** `GET /api/v1/reminders/<id>/` — the `source_api_path` target of a `custom_reminder` alert (§7). */
export const getReminder = reminderResource.get;

/** `POST /api/v1/reminders/` → **201**. Exactly one owner; `due_date` ≥ Nepal today (§7). */
export const createReminder = reminderResource.create;

/**
 * `PATCH /api/v1/reminders/<id>/` — reschedule and/or correct the note.
 *
 * **Send only the keys the user actually changed.** At least one is required
 * (an empty `PATCH` is a 400), and a body carrying `applicant`, `client`,
 * `status`, `closed_at`, or `closed_by` is rejected outright. Callers build
 * that subset with `changedUpdateFields()` in `reminders.utils.ts`.
 */
export const updateReminder = reminderResource.update;

/**
 * `POST /api/v1/reminders/<id>/complete/` → 200, terminal.
 *
 * `reason` is optional and lands on the **history event only** — it is not a
 * column and does not come back on the returned `Reminder` (§7).
 */
export function completeReminder(
  id: string,
  body: ReminderActionPayload = {},
): Promise<Reminder> {
  return reminderResource.action<Reminder>(id, "complete", body);
}

/** `POST /api/v1/reminders/<id>/dismiss/` → 200, terminal. Same `reason` semantics as complete (§7). */
export function dismissReminder(
  id: string,
  body: ReminderActionPayload = {},
): Promise<Reminder> {
  return reminderResource.action<Reminder>(id, "dismiss", body);
}

// `/history/` is nested under a reminder id rather than having its own base
// path, so it doesn't fit `createResourceApi`'s single-basePath shape — it is
// hand-rolled, reusing the primitive's `ResourceListResponse` for the
// `meta.count → total` remap (the same pattern as `fetchApplicantHistory`).

/**
 * `GET /api/v1/reminders/<id>/history/` — chronological, newest first, backed
 * by the central audit log. Requests a generous single page rather than the
 * backend's default of 20; a reminder with more lifecycle events than that is
 * an edge case the panel discloses (`meta.total`) rather than hides.
 */
export async function fetchReminderHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<ReminderHistoryEntry>> {
  const { data } = await api.get<{
    data: ReminderHistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`${REMINDERS}/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}
