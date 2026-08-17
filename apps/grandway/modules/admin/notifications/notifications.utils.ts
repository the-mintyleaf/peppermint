import { dayjs } from "@peppermint/ui";
import { DUE_BUCKET_ORDER } from "./notifications.labels";
import type { BsDate, DueBucket, Notification } from "./notifications.types";

/** ISO datetime → readable local string, `—` when null (created_at has no BS sibling — §3). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

/** Reads the Gregorian `due_at` and appends the BS sibling's `display` when present. Never recomputes BS locally. */
export function formatDueAt(
  dueAt: string | null | undefined,
  dueAtBs?: BsDate | null,
): string {
  if (!dueAt) return "—";
  const formatted = dayjs(dueAt).format("MMM D, YYYY");
  return dueAtBs?.display ? `${formatted} (${dueAtBs.display})` : formatted;
}

/**
 * Group ONE fetched list client-side by `due_bucket` — never issue separate
 * filtered requests per bucket. `due_within_days` shifts the bucket boundary
 * per request (§3), so three requests would compute three different clocks;
 * every row here already carries the bucket the single request computed.
 */
export function groupByDueBucket(
  notifications: Notification[],
): Record<DueBucket, Notification[]> {
  const groups: Record<DueBucket, Notification[]> = {
    overdue: [],
    due_soon: [],
    later: [],
    none: [],
  };
  for (const notification of notifications) {
    groups[notification.due_bucket].push(notification);
  }
  return groups;
}

/** Ordered `[bucket, rows]` pairs, most-urgent first, skipping empty buckets. */
export function orderedDueBucketGroups(
  notifications: Notification[],
): Array<[DueBucket, Notification[]]> {
  const groups = groupByDueBucket(notifications);
  return DUE_BUCKET_ORDER.map(
    (bucket) => [bucket, groups[bucket]] as [DueBucket, Notification[]],
  ).filter(([, rows]) => rows.length > 0);
}

/**
 * Route on `notification_type` (never parse `source_api_path` — §4). Only
 * returns a route when `source_entity_id` genuinely resolves to that route's
 * id per the source-triple table (`INTEGRATION.md` §4):
 *
 * - `offer_*` → the offer id itself → `/admin/offers/<id>`.
 * - `passport_expiring` → `source_entity_id` is the APPLICANT id (the contract
 *   is explicit the passport has no endpoint of its own) → `/admin/applicants/<id>`.
 * - `file_rejected` → the uploaded file id → `/admin/files/<id>`.
 * - `journey_*` → the journey id → `/admin/applicant-journeys/<id>`.
 * - `missing_documents` and `assignment_received` (checklist case only) →
 *   the checklist id → `/admin/checklists/<id>`.
 *
 * Degrades to `null` (no link, render title/body only) for:
 * - `checklist_item_due`/`checklist_item_overdue` — `source_entity_id` is the
 *   checklist ITEM id, not the parent checklist id the frontend route needs,
 *   and no endpoint here supplies the parent id.
 * - `assignment_received` when `source_entity_type` is `checklist_item` (same
 *   reason — the table allows either shape for this one type).
 * - The three never-produced declared types (no source record to link to).
 * - **`custom_reminder`** — deliberately, and this one is worth reading twice.
 *   Its `source_entity_id` is the **reminder's** id, and no route
 *   `/admin/reminders/<id>` exists (reminders live on the record they belong
 *   to, not on a route of their own). The payload carries nothing identifying
 *   the applicant or client the follow-up concerns, so there is no route to
 *   derive here without guessing — which this function never does. Resolving
 *   it requires fetching the reminder, so `NotificationRow` renders
 *   `<ReminderAlertLink>` for this type instead of the generic link.
 *
 * NOTE for the orchestrator: the `/admin/checklists/<id>` path assumes the
 * checklists module (built concurrently) exposes a detail route at that
 * pattern, matching every other MultiPageModule in this app
 * (`/admin/offers/[id]`, `/admin/applicant-journeys/[id]`) — verify once that
 * module lands.
 */
export function resolveNotificationLink(
  notification: Notification,
): string | null {
  const id = notification.source_entity_id;
  if (!id) return null;

  switch (notification.notification_type) {
    case "offer_response_due":
    case "offer_expired":
    case "offer_decided":
      return `/admin/offers/${id}`;
    case "passport_expiring":
      return `/admin/applicants/${id}`;
    case "file_rejected":
      return `/admin/files/${id}`;
    case "journey_stage_changed":
    case "journey_closed":
      return `/admin/applicant-journeys/${id}`;
    case "missing_documents":
      return `/admin/checklists/${id}`;
    case "assignment_received":
      return notification.source_entity_type === "checklist"
        ? `/admin/checklists/${id}`
        : null;
    // `custom_reminder` falls through to `null` on purpose — see the note
    // above. `ReminderAlertLink` resolves it by asking, not by guessing.
    default:
      return null;
  }
}
