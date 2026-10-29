import { dayjs } from "@peppermint/ui";
import { DUE_BUCKET_ORDER } from "./notifications.labels";
import type {
  BsDate,
  DueBucket,
  FeedSummary,
  Notification,
  NotificationCategory,
} from "./notifications.types";

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

/** `["lead","notes"]` → `"lead,notes"` — the feed's only multi-value filter. `undefined` for an empty list (no narrowing). */
export function joinCategories(
  categories: NotificationCategory[],
): string | undefined {
  return categories.length > 0 ? categories.join(",") : undefined;
}

/** Sum of the given categories' counts out of `by_category`; the whole `unread` total when the list is empty ("All"). */
export function sumCategoryCounts(
  summary: FeedSummary | undefined,
  categories: NotificationCategory[],
): number {
  if (!summary) return 0;
  if (categories.length === 0) return summary.unread;
  return categories.reduce((sum, c) => sum + (summary.by_category[c] ?? 0), 0);
}

/** `snake_case` / `kebab-case` vocabulary value → `Sentence case`. Vocabularies are owned by other modules, so this humanizes rather than maps. */
function humanize(value: string | undefined): string | null {
  if (!value) return null;
  const spaced = value.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * One plain line built from `payload`, or `null` when the type has nothing
 * beyond what `title`/`body` already say. Never invents a fact — every
 * fragment is dropped if its payload key is missing (older rows carry `{}`).
 */
export function describeNotification(
  notification: Notification,
): string | null {
  const { payload, notification_type: type } = notification;
  switch (type) {
    case "applicant_status_changed": {
      const from = humanize(payload.from);
      const to = humanize(payload.to);
      return from && to ? `Status: ${from} → ${to}` : null;
    }
    case "applicant_restored": {
      const to = humanize(payload.to);
      return to ? `Restored from archive as ${to}` : "Restored from archive";
    }
    case "journey_stage_changed": {
      const stage = humanize(payload.stage);
      return stage ? `Moved to stage: ${stage}` : null;
    }
    case "journey_closed": {
      const stage = humanize(payload.stage);
      return stage ? `Journey ended as: ${stage}` : null;
    }
    case "test_score_expiring": {
      const test = payload.test_type?.toUpperCase();
      return test ? `${test} result expiring` : null;
    }
    case "document_ready": {
      const family = humanize(payload.family);
      return family ? `${family} is ready` : null;
    }
    case "lead_converted":
      return "Now an applicant";
    case "visit_note_added":
      return notification.source_entity_type === "lead"
        ? "Office visit noted on a lead"
        : "Office visit noted on an applicant";
    default:
      return null;
  }
}

/** Text for the row's "go there" button — names the destination instead of a generic "View record". */
export function resolveNotificationLinkLabel(
  notification: Notification,
): string {
  switch (notification.notification_type) {
    case "lead_created":
    case "lead_restored":
      return "View lead";
    case "lead_deleted":
      return "Open lead board";
    case "document_ready":
      return "Open document";
    case "lead_converted":
    case "applicant_status_changed":
    case "applicant_restored":
    case "applicant_assigned":
    case "applicant_unassigned":
    case "passport_expiring":
    case "test_score_expiring":
    case "custom_reminder":
      return "View applicant";
    case "visit_note_added":
      return notification.source_entity_type === "lead"
        ? "View lead"
        : "View applicant";
    default:
      return "View record";
  }
}

/**
 * Route on `notification_type` (never parse `source_api_path` — §4). Only
 * returns a route when `source_entity_id` genuinely resolves to that route's
 * id per the source-triple table (`INTEGRATION.md` §4):
 *
 * Added 2026-10-29:
 * - `lead_created`/`lead_restored` → the lead board with that lead's drawer
 *   open, `/admin/lead-management?lead=<id>` (leads have no detail route; the
 *   board opens the drawer from `?lead=`). `lead_deleted`
 *   cannot open the lead (it is gone from the board) → the board itself.
 * - `lead_converted` → the NEW applicant (`applicant_id`), not the lead.
 * - `applicant_status_changed`/`applicant_restored`/`applicant_assigned`/
 *   `applicant_unassigned` → `source_entity_id` is the applicant → its file.
 * - `visit_note_added` → the record the note is on (lead or applicant, per
 *   `source_entity_type`); neither has a per-note route, so the host record.
 * - `test_score_expiring` → the applicant file via `applicant_id` (the source
 *   id is the test, which has no route).
 * - `document_ready` → the document editor: the applicant's workspace
 *   `/documents/workspace/<applicant_id>` when the document has an applicant,
 *   else `/documents/standalone/<document id>`.
 * - `custom_reminder` → the applicant file via `applicant_id` when set (an
 *   applicant reminder). A client reminder has `applicant_id: null` and still
 *   resolves by asking — `ReminderAlertLink`, see below.
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
 * - **`custom_reminder` with `applicant_id: null`** (a client reminder, or any
 *   row raised before 2026-10-29) — deliberately, and this one is worth
 *   reading twice. Its `source_entity_id` is the **reminder's** id, and no
 *   route `/admin/reminders/<id>` exists (reminders live on the record they
 *   belong to). Nothing in the payload names the client, so there is no route
 *   to derive here without guessing — which this function never does.
 *   Resolving it requires fetching the reminder, so `NotificationRow` renders
 *   `<ReminderAlertLink>` for this case instead of the generic link.
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
  const applicantId = notification.applicant_id;

  // Types whose destination does not hang on `source_entity_id` come first.
  switch (notification.notification_type) {
    case "lead_deleted":
      return "/admin/lead-management";
    case "lead_converted": {
      const converted = applicantId ?? notification.payload.applicant_id;
      return converted ? `/admin/applicants/${converted}` : null;
    }
    case "test_score_expiring":
      return applicantId ? `/admin/applicants/${applicantId}` : null;
    case "custom_reminder":
      return applicantId ? `/admin/applicants/${applicantId}` : null;
    case "document_ready":
      if (applicantId) return `/documents/workspace/${applicantId}`;
      return id ? `/documents/standalone/${id}` : null;
    default:
      break;
  }

  if (!id) return null;

  switch (notification.notification_type) {
    case "lead_created":
    case "lead_restored":
      return `/admin/lead-management?lead=${id}`;
    case "applicant_status_changed":
    case "applicant_restored":
    case "applicant_assigned":
    case "applicant_unassigned":
      return `/admin/applicants/${id}`;
    case "visit_note_added":
      return notification.source_entity_type === "lead"
        ? `/admin/lead-management?lead=${id}`
        : `/admin/applicants/${id}`;
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
    // A client `custom_reminder` returns `null` above on purpose — see the
    // note. `ReminderAlertLink` resolves it by asking, not by guessing.
    default:
      return null;
  }
}
