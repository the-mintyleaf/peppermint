"use client";

import { useQuery } from "@peppermint/ui";
import type { QueryKey } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  completeReminder,
  createReminder,
  dismissReminder,
  fetchReminderHistory,
  listReminders,
  updateReminder,
} from "./reminders.api";
import {
  dueRemindersKey,
  reminderHistoryKey,
  reminderQueryKeys,
} from "./reminders.queryKeys";
import type {
  Reminder,
  ReminderActionPayload,
  ReminderCreatePayload,
  ReminderListFilters,
  ReminderUpdatePayload,
} from "./reminders.types";

/**
 * `filters` → the shell's `QueryParams` shape. `search` and `sort` are always
 * empty: this API has neither parameter (§3), and `toReminderServerParams`
 * drops them anyway — they are passed as empties to satisfy the type, not
 * because anything reads them.
 *
 * The cast on `filters` is a safe widen (every remaining field is a string or
 * number), not a narrowing escape — a plain interface has no index signature,
 * so it is not directly assignable to `FilterState`.
 */
function toListQueryParams(filters: ReminderListFilters): QueryParams {
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
 * Callers always pass explicit filters — there is no sane default.
 *
 * In particular, **omitting `status` returns open AND closed rows** (§7), which
 * is right for a record panel showing operational memory and wrong for a
 * worklist. Each consumer decides, and the filters are part of the cache key so
 * two consumers with different filters never share a result.
 */
export function useReminderList(filters: ReminderListFilters) {
  return useQuery({
    queryKey: reminderQueryKeys.list(filters),
    queryFn: () => listReminders(toListQueryParams(filters)),
  });
}

/**
 * A reminder's lifecycle trail — the concept's "operational memory": why the
 * follow-up existed, and what happened to it, readable long after the date
 * passed. `enabled` lets a collapsed history section cost nothing until opened.
 */
export function useReminderHistory(id: string, enabled = true) {
  return useQuery({
    queryKey: reminderHistoryKey(id),
    queryFn: () => fetchReminderHistory(id),
    enabled: enabled && Boolean(id),
  });
}

/**
 * Every mutation invalidates all three surfaces a reminder appears on.
 *
 * `lists()` is a strict prefix of every `.list(params)` key, so one entry
 * refreshes every mounted list regardless of its filters — the applicant panel,
 * a client drawer, anything else. `dueRemindersKey()` is a **separate top-level
 * slot** and is therefore NOT covered by that prefix: completing a follow-up
 * from a record screen has to move the dashboard's count too, and forgetting
 * this line is exactly how the card goes stale.
 */
function invalidateReminderKeys(id?: string): QueryKey[] {
  // Annotated rather than inferred: the two key factories return different
  // readonly tuples, so an inferred array would be a union type the `push`
  // below cannot widen.
  const keys: QueryKey[] = [reminderQueryKeys.lists(), dueRemindersKey()];
  // The detail key is a prefix of the history key, so one entry covers both.
  if (id) keys.push(reminderQueryKeys.detail(id));
  return keys;
}

/** `POST /api/v1/reminders/` → 201. Exactly one owner, `due_date` ≥ Nepal today (§7). */
export function useCreateReminder() {
  return useAppMutation<Reminder, ReminderCreatePayload>({
    mutationFn: createReminder,
    successMessage: "Reminder set.",
    errorTitle: "Couldn't set reminder",
    invalidateKeys: invalidateReminderKeys(),
  });
}

/**
 * `PATCH /api/v1/reminders/<id>/` — reschedule and/or correct the note.
 *
 * The payload must already be the **changed subset** of `{due_date, note}`;
 * build it with `changedUpdateFields()`, which also answers "nothing changed"
 * so the caller can skip the request entirely (an empty `PATCH` is a 400).
 */
export function useUpdateReminder(id: string) {
  return useAppMutation<Reminder, ReminderUpdatePayload>({
    mutationFn: (payload) => updateReminder(id, payload),
    successMessage: "Reminder updated.",
    errorTitle: "Couldn't update reminder",
    invalidateKeys: invalidateReminderKeys(id),
  });
}

/**
 * `POST /<id>/complete/` → 200, terminal.
 *
 * **Do not also dismiss the `custom_reminder` notification.** Closing the
 * reminder is what clears the alert — the next nightly sweep resolves it as
 * `source_cleared` (§7). A client-side dismissal is a redundant second write
 * against a feed the acting user may not even be a recipient of.
 */
export function useCompleteReminder(id: string) {
  return useAppMutation<Reminder, ReminderActionPayload | void>({
    mutationFn: (payload) => completeReminder(id, payload ?? {}),
    successMessage: "Reminder completed.",
    errorTitle: "Couldn't complete reminder",
    invalidateKeys: invalidateReminderKeys(id),
  });
}

/**
 * `POST /<id>/dismiss/` → 200, terminal. Irreversible: there is no un-dismiss
 * and no reopen anywhere in this module (§3), so callers confirm first.
 */
export function useDismissReminder(id: string) {
  return useAppMutation<Reminder, ReminderActionPayload | void>({
    mutationFn: (payload) => dismissReminder(id, payload ?? {}),
    successMessage: "Reminder dismissed.",
    errorTitle: "Couldn't dismiss reminder",
    invalidateKeys: invalidateReminderKeys(id),
  });
}
