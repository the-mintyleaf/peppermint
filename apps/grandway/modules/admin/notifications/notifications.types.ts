// DTOs mirror `docs/backend/notifications/INTEGRATION.md` §4 (model) and §5
// (enums), field-for-field. Read/act-only domain — there is no create/update
// payload anywhere (§7: all seven endpoints accept no request body).

/**
 * 15 declared values; only 12 are ever produced (§5). `missing_information`,
 * `test_score_expiring`, and `appointment_reminder` have no generator today —
 * typed anyway because the contract says render them if they ever arrive,
 * never design a screen around them.
 *
 * `custom_reminder` (added in backend v1.1.0) is the odd one out: it is the
 * only type a **user** ultimately causes, by setting a dated follow-up in the
 * `reminders` module. It is routed to Admins only — a Lead Manager who sets a
 * reminder never receives its alert here.
 */
export type NotificationType =
  | "checklist_item_due"
  | "checklist_item_overdue"
  | "missing_documents"
  | "missing_information"
  | "offer_response_due"
  | "offer_expired"
  | "passport_expiring"
  | "test_score_expiring"
  | "appointment_reminder"
  | "custom_reminder"
  | "assignment_received"
  | "file_rejected"
  | "journey_stage_changed"
  | "journey_closed"
  | "offer_decided";

/** Fixed per type at creation, stored not derived — read from the payload (§5). */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/** Three states, two one-way transitions out of `active` — see INTEGRATION.md §4 lifecycle table. */
export type NotificationStatus = "active" | "dismissed" | "resolved";

/** `""` while active — not a fourth enum member. */
export type NotificationResolution =
  | ""
  | "source_cleared"
  | "dismissed_by_user";

/** Derived at read time from `due_at` against the request's own clock (§3) — never stored. */
export type DueBucket = "overdue" | "due_soon" | "later" | "none";

/** Only `in_app` is ever produced in this version (§5). */
export type DeliveryChannel = "in_app";

/** 3 declared, only `delivered` is produced (in-app delivery completes the moment the row exists). */
export type DeliveryState = "pending" | "delivered" | "failed";

export type GeneratedBy = "sweep" | "signal";

/**
 * Bikram Sambat sibling for a UTC timestamp — shape not spelled out field-by-field
 * in `INTEGRATION.md` (just "`due_at_bs?: json`"), so this mirrors the flatter
 * core-rendering shape already used by `offers`/`documents` (`year/month/day/
 * month_name/display`) rather than `applicant_journeys`' fuller one, since §2 lists
 * `core` (not `applicant_journeys`) as the dependency supplying "BS rendering."
 * Flag to the orchestrator if the real payload disagrees.
 */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

/**
 * The feed row — identical on list and retrieve (§4, "the feed row *is* the
 * whole resource"). `source_app`/`source_entity_type`/`source_entity_id` are
 * bare strings/UUID, never a nested object; follow `source_api_path` (or the
 * frontend route resolved from the source triple — see `notifications.utils.ts`)
 * to see details. `is_read` = `read_at != null`, derived, never stored directly.
 */
export interface Notification {
  id: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  source_app: string;
  source_entity_type: string;
  source_entity_id?: string | null;
  source_api_path: string;
  due_at?: string | null;
  due_at_bs?: BsDate | null;
  due_bucket: DueBucket;
  is_read: boolean;
  read_at?: string | null;
  status: NotificationStatus;
  resolution: NotificationResolution;
  resolved_at?: string | null;
  delivery_channel: DeliveryChannel;
  delivery_state: DeliveryState;
  generated_by: GeneratedBy;
  created_at: string;
}

/**
 * `GET /notifications/summary/` (§4). All integers; both breakdown maps are
 * always fully zero-filled — a key is never absent. `unread` counts unread rows
 * in ANY status; `active`/both breakdowns count only `status: "active"` —
 * `unread` can legitimately exceed `active`. Drive the bell badge from `unread`.
 */
export interface FeedSummary {
  unread: number;
  active: number;
  by_priority: Record<NotificationPriority, number>;
  by_due_bucket: Record<DueBucket, number>;
}

/** `POST /notifications/read-all/` result — how many rows changed, not which ones (§4). */
export interface BulkReadResult {
  marked_read: number;
}

/**
 * `GET /notifications/` query params (§3) — every name is exactly its payload
 * field name, no aliasing. `status` absent returns every status including
 * dismissed/resolved; always pass it explicitly for a working inbox.
 */
export interface NotificationListFilters {
  status?: NotificationStatus;
  is_read?: boolean;
  notification_type?: NotificationType;
  priority?: NotificationPriority;
  source_app?: string;
  source_entity_id?: string;
  due_bucket?: DueBucket;
  /** 1–365, default 7 on the server. Shifts the `due_soon`/`later` boundary for both the filter and every row's rendered `due_bucket` (§3). */
  due_within_days?: number;
  /** `YYYY-MM-DD`, windows on `created_at`, Kathmandu-midnight boundaries. */
  date_from?: string;
  date_to?: string;
  /** `YYYY/YY`. An explicit date range beats this when both are given. */
  fiscal_year?: string;
  page?: number;
  page_size?: number;
}

/**
 * `GET /notifications/summary/` validates this whole shape but only
 * `due_within_days` changes the result (§7) — kept as an alias of the list
 * filters for type consistency, not because summary reads the rest.
 */
export type NotificationSummaryParams = NotificationListFilters;
