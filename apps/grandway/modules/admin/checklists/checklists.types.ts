// DTOs mirror `docs/backend/checklists/INTEGRATION.md` §4 (models), §5 (enums),
// and §7 (request bodies) field-for-field. Read entities and briefs are plain
// interfaces (the shells constrain `T extends object`); only the `*Values`
// form-value types extend `Record<string, unknown>` for `FormWrapper<T>`.

// ── Enums (§5) ────────────────────────────────────────────────────────────────

/** 3 statuses. Omitting `status` on create yields `draft` (not inheritable). */
export type TemplateStatus = "draft" | "active" | "inactive";

/** 3 values — separates "what's missing" (document) from "where in the process" (stage) from "work to do" (task). */
export type ItemType = "document" | "stage" | "task";

/** 4 statuses. Inherited/template-applied checklists arrive `active`; a blank one starts `draft`. */
export type ChecklistStatus = "draft" | "active" | "completed" | "archived";

/** `auto` = inherited when a journey's country was set; `manual` = staff-applied or blank. */
export type ChecklistOrigin = "auto" | "manual";

/**
 * 5 values. `resolved` = `completed`/`waived`/`not_applicable` — **`blocked` is
 * NOT resolved**, it is precisely the status meaning the work didn't happen.
 * `status_note` is required for `waived` and `blocked`.
 */
export type ItemStatus =
  | "pending"
  | "completed"
  | "waived"
  | "blocked"
  | "not_applicable";

/** Checklists' own Bikram Sambat sibling shape (§3) — `null` when the date is unset. Never a string, never sent. */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

// ── Brief shapes (nested on read) ────────────────────────────────────────────

export interface CountryBrief {
  id: string;
  code: string;
  name: string;
}

export interface ApplicantBrief {
  id: string;
  full_name: string;
  status: string;
}

export interface UserBrief {
  id: string;
  username: string;
  display_name: string;
}

// ── Templates (§4) ────────────────────────────────────────────────────────────

/** No delete — a retired requirement is `is_active: false`, still returned by the template read. */
export interface ChecklistTemplateItem {
  id: string;
  label: string;
  description: string;
  item_type: ItemType;
  is_required: boolean;
  display_order: number;
  /** Days after instantiation. `null` when unset. */
  default_due_offset_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Single retrieve shape for `GET /templates/`, `GET /templates/<id>/`, create,
 * and update — unlike `Checklist`, templates have no separate trimmed list row.
 */
export interface ChecklistTemplate {
  id: string;
  key: string;
  label: string;
  description: string;
  country: CountryBrief | null;
  is_default: boolean;
  /** Derived: `true` only when `active` + `is_default` + has a country. */
  is_inheritable: boolean;
  status: TemplateStatus;
  status_note: string;
  display_order: number;
  notes: string;
  /** Includes retired (`is_active: false`) definitions — active ones sorted first. Show retired greyed, never hidden. */
  items: ChecklistTemplateItem[];
  created_by: UserBrief;
  created_at: string;
  updated_at: string;
}

// ── Checklists (§4) ───────────────────────────────────────────────────────────

/** All integers. `resolved` counts `completed`/`waived`/`not_applicable` — `blocked` is NOT resolved. */
export interface ChecklistProgress {
  total: number;
  resolved: number;
  required_total: number;
  required_resolved: number;
  blocked: number;
  document_total: number;
  document_resolved: number;
}

/**
 * `GET /` row shape. `journey`/`source_template` are bare UUID strings, not
 * nested objects. `progress` is on every list row (not just retrieve), which is
 * what lets a worklist render progress bars without a request per checklist.
 */
export interface Checklist {
  id: string;
  journey: string;
  applicant: ApplicantBrief;
  source_template: string | null;
  country: CountryBrief | null;
  title: string;
  description: string;
  origin: ChecklistOrigin;
  status: ChecklistStatus;
  assigned_to: UserBrief | null;
  due_at: string | null;
  due_at_bs: BsDate | null;
  progress: ChecklistProgress;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieve shape — `GET /<id>/`, `POST /`, `PATCH /<id>/`, every lifecycle
 * action. List shape plus `notes`/`items`/lifecycle stamps. `created_by` is
 * absent (an inherited checklist has no author). `status_before_archive` is
 * empty except while `status` is `archived`, where it holds the status to
 * return to on restore.
 */
export interface ChecklistDetail extends Checklist {
  notes: string;
  /** The only shape carrying items. */
  items: ChecklistItem[];
  activated_at: string | null;
  completed_at: string | null;
  completed_at_bs: BsDate | null;
  completed_by: UserBrief | null;
  archive_reason: string;
  archived_at: string | null;
  archived_by: UserBrief | null;
  status_before_archive: ChecklistStatus | "";
}

/** No `is_active`, no delete — `not_applicable` is the only way to retire one, and it counts as resolved. */
export interface ChecklistItem {
  id: string;
  checklist: string;
  source_template_item: string | null;
  label: string;
  description: string;
  item_type: ItemType;
  is_required: boolean;
  display_order: number;
  status: ItemStatus;
  status_note: string;
  is_resolved: boolean;
  assigned_to: UserBrief | null;
  due_at: string | null;
  due_at_bs: BsDate | null;
  /** Bare UUID string, no filename/size/type — resolve via `uploaded_files` (§4). */
  evidence_file: string | null;
  evidence_note: string;
  completed_at: string | null;
  completed_at_bs: BsDate | null;
  completed_by: UserBrief | null;
  created_at: string;
  updated_at: string;
}

/**
 * Returned ONLY by `GET /?journey_missing_checklist=true` — a DISTINCT resource
 * from `Checklist`, never overloaded onto it. `id` is the JOURNEY's id, not a
 * checklist's — there is no checklist to link to for these rows.
 */
export interface JourneyAwaitingChecklist {
  id: string;
  applicant: ApplicantBrief;
  target_country_ref: CountryBrief | null;
  stage: string;
  created_at: string;
}

/** `CHECKLISTS_REQUIRED_ITEMS_PENDING`'s `details.items` shape (§8) — every outstanding required item. */
export interface RequiredItemsPendingItem {
  id: string;
  label: string;
  status: ItemStatus;
}

// ── Write payloads (§7) ───────────────────────────────────────────────────────

export interface CreateTemplatePayload {
  /** `^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$`, unique. Immutable after create. */
  key: string;
  label: string;
  description?: string;
  country?: string | null;
  is_default?: boolean;
  status?: TemplateStatus;
  status_note?: string;
  display_order?: number;
  notes?: string;
}

/** Any create field except `key` (immutable). Also how a template is retired (`status: "inactive"`). */
export type UpdateTemplatePayload = Partial<Omit<CreateTemplatePayload, "key">>;

export interface CreateTemplateItemPayload {
  label: string;
  description?: string;
  item_type?: ItemType;
  /** Defaults `true` server-side when omitted. */
  is_required?: boolean;
  display_order?: number;
  default_due_offset_days?: number;
}

/** Any create field, plus `is_active` (send `false` to retire — there is no delete). */
export type UpdateTemplateItemPayload = Partial<CreateTemplateItemPayload> & {
  is_active?: boolean;
};

/** From-template shape (§7) — every other field is ignored; the template supplies title/description/country/items. */
export interface CreateChecklistFromTemplatePayload {
  journey: string;
  template: string;
}

/** Blank shape (§7) — `title` is required in this shape only. */
export interface CreateChecklistBlankPayload {
  journey: string;
  title: string;
  description?: string;
  assigned_to?: string;
  due_at?: string;
  notes?: string;
}

/** Two create shapes — from-template OR blank. Never both at once. */
export type CreateChecklistPayload =
  | CreateChecklistFromTemplatePayload
  | CreateChecklistBlankPayload;

/** `PATCH /<id>/` — `status` is NOT accepted; status moves only through the lifecycle actions. */
export interface UpdateChecklistPayload {
  title?: string;
  description?: string;
  assigned_to?: string | null;
  due_at?: string | null;
  notes?: string;
}

/** `POST /<id>/archive/` — `reason` required, non-blank. */
export interface ArchiveChecklistPayload {
  reason: string;
}

/** `POST /<id>/reopen/` — `reason` optional (unlike archive). */
export interface ReopenChecklistPayload {
  reason?: string;
}

export interface CreateItemPayload {
  label: string;
  description?: string;
  item_type?: ItemType;
  is_required?: boolean;
  display_order?: number;
  assigned_to?: string;
  due_at?: string;
}

/** `PATCH /<id>/items/<item_id>/` — descriptive fields only. `status` is NOT accepted here. */
export interface UpdateItemPayload {
  label?: string;
  description?: string;
  item_type?: ItemType;
  is_required?: boolean;
  display_order?: number;
  assigned_to?: string;
  due_at?: string;
  evidence_note?: string;
}

/**
 * `POST /<id>/items/<item_id>/status/` — the daily act. `status_note` required
 * when `status` is `waived`/`blocked`. `evidence_file` must already exist and
 * belong to this checklist's journey or applicant. `clear_evidence` is explicit
 * because an omitted field and an explicit null are indistinguishable on a
 * partial update. Setting `completed` stamps `completed_at`/`completed_by`; any
 * other status clears both. To attach evidence without completing, send
 * `{ status: "pending", evidence_file: "<id>" }`.
 */
export interface ItemStatusPayload {
  status: ItemStatus;
  status_note?: string;
  evidence_file?: string;
  evidence_note?: string;
  clear_evidence?: boolean;
}
