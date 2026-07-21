# `Applicant` — the person master record and aggregate root

**Endpoint base:** `/api/v1/applicants/` (detail + actions under
`/api/v1/applicants/<applicant_id>/`).
**Access:** **create is admin/superadmin only** (Phase 7 — staff → 403; staff
capture enquiries as **leads**). List / read / update are open to staff and
admin, but **role-projected** — staff receive a strict subset of fields
(protected fields are absent, not null). Transition, lock, history, archive, and
merge are **admin/superadmin only** (staff → 403).
**Owns:** the permanent person record. Lifecycle stage (funnel position) and
engagement status (relationship) are separate fields and change **only** through
the transition endpoint — never a raw `PATCH`.

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. Fields marked
**admin-only** are absent from the staff projection entirely.

| Field                    | TS type            | In req | In res    | Req | Nullable | Server-set | Enum                 | Validation                          | Notes                                      |
| ------------------------ | ------------------ | ------ | --------- | --- | -------- | ---------- | -------------------- | ----------------------------------- | ------------------------------------------ |
| `id`                     | `string`           | ✗      | ✓         | —   | No       | ✓          | —                    | UUID                                | Primary key                                |
| `applicant_code`         | `string`           | ✗      | ✓         | —   | No       | ✓          | —                    | `^APP-\d{4}-\d{6}$`, ≤20, immutable | e.g. `APP-2026-000142`                     |
| `first_name`             | `string`           | ✓      | ✓         | ✓   | No       | ✗          | —                    | required, ≤150 chars                | Given name                                 |
| `middle_name`            | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          | `""` when unset                            |
| `last_name`              | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          | `""` when unset                            |
| `full_name`              | `string`           | ✓      | ✓         | ✗   | No       | ✓ if blank | —                    | ≤300 chars                          | Composed server-side when omitted          |
| `name_native`            | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤300 chars                          | Devanagari / native script                 |
| `preferred_display_name` | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          | Manual display override                    |
| `nationality`            | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤100 chars                          |                                            |
| `primary_email`          | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | email; lowercased                   |                                            |
| `alternate_email`        | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | email; lowercased                   |                                            |
| `primary_phone`          | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤32 chars                           |                                            |
| `alternate_phone`        | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤32 chars                           |                                            |
| `lead_source`            | `LeadSource`       | ✓      | ✓         | ✗   | No       | ✗          | `lead_source`        | —                                   | `""` when unset                            |
| `lead_source_detail`     | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤255 chars                          |                                            |
| `initial_interest`       | `string`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | text                                |                                            |
| `lifecycle_stage`        | `LifecycleStage`   | ✗      | ✓         | —   | No       | ✓          | `lifecycle_stage`    | transition-only; forward-only       | Default `interested`; **never** in PATCH   |
| `engagement_status`      | `EngagementStatus` | ✗      | ✓         | —   | No       | ✓          | `engagement_status`  | transition-only                     | Default `active`; **never** in PATCH       |
| `is_locked`              | `boolean`          | ✗      | ✓         | —   | No       | ✓          | —                    | lock-service only                   |                                            |
| `record_version`         | `number`           | ✓¹     | ✓         | —   | No       | ✓          | —                    | integer ≥ 1                         | ¹ required in PATCH/DELETE/transition body |
| `profile_image_url`      | `string \| null`   | ✗      | ✓         | —   | Yes      | ✓          | —                    | —                                   | Points at the streaming endpoint (see §7)  |
| `created_at`             | `string`           | ✗      | ✓         | —   | No       | ✓          | —                    | ISO 8601                            |                                            |
| `updated_at`             | `string`           | ✗      | ✓         | —   | No       | ✓          | —                    | ISO 8601                            |                                            |
| **admin-only ↓**         |                    |        |           |     |          |            |                      |                                     | absent from staff projection               |
| `full_name_romanized`    | `string`           | ✗      | ✓ (admin) | —   | No       | ✓          | —                    | ≤300; never user-entered            | ASCII search projection                    |
| `date_of_birth`          | `string \| null`   | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | date, not future                    | carries `date_of_birth_bs`                 |
| `gender`                 | `Gender`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | `gender`             | —                                   | `""` when unset                            |
| `religion`               | `string`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | ≤100 chars                          | protected                                  |
| `payment_status`         | `PaymentStatus`    | ✓      | ✓ (admin) | ✗   | No       | ✗          | `payment_status`     | —                                   | `""` when unset; admin-editable only       |
| `summary`                | `string`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                |                                            |
| `eligibility_summary`    | `string`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                |                                            |
| `counselling_notes`      | `string`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                | protected                                  |
| `last_contacted_at`      | `string \| null`   | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | ISO 8601                            |                                            |
| `next_follow_up_at`      | `string \| null`   | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | ISO 8601                            |                                            |
| `follow_up_priority`     | `FollowUpPriority` | ✓      | ✓ (admin) | ✗   | No       | ✗          | `follow_up_priority` | —                                   | `""` when unset                            |
| `converted_at`           | `string \| null`   | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   | Stamped when stage → `applicant`           |
| `locked_at`              | `string \| null`   | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   |                                            |
| `lock_reason`            | `string`           | ✗      | ✓ (admin) | —   | No       | ✓          | —                    | —                                   | `""` when not locked                       |
| `archived_at`            | `string \| null`   | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   | Soft-delete stamp                          |
| `merged_into`            | `string \| null`   | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | UUID                                | Survivor id if this record was merged away |
| `merged_at`              | `string \| null`   | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   | Merge stamp                                |

**Staff list projection** is even narrower — rows expose only: `id`,
`applicant_code`, `full_name`, `primary_email`, `primary_phone`,
`lifecycle_stage`, `engagement_status`, `is_locked`, `created_at`, `updated_at`.
**Admin list projection** adds `nationality`, `follow_up_priority`,
`next_follow_up_at`, `converted_at`, `archived_at` (and drops the emails? no — it
keeps them; see §2 for the exact set).

## 2. Types

```ts
type LifecycleStage = "interested" | "potential" | "applicant";
type EngagementStatus =
  | "active"
  | "on_hold"
  | "lost"
  | "disqualified"
  | "withdrawn"
  | "archived";
type Gender = "male" | "female" | "other" | "undisclosed";
type LeadSource =
  | "walk_in"
  | "referral"
  | "online"
  | "phone"
  | "social_media"
  | "event"
  | "agent"
  | "other";
type FollowUpPriority = "low" | "normal" | "high" | "urgent";
type PaymentStatus = "prepaid" | "postpaid";

// Bikram Sambat sibling for date fields (see overview.md)
interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

// Response — staff detail projection.
// Optional text/enum fields are Nullable=No → unset serializes as "" (never null);
// only genuinely DB-nullable fields are `| null`. See overview.md "Empty vs null".
interface ApplicantStaff {
  id: string;
  applicant_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  name_native: string;
  preferred_display_name: string;
  nationality: string;
  primary_email: string;
  alternate_email: string;
  primary_phone: string;
  alternate_phone: string;
  lead_source: LeadSource | ""; // "" when unset
  lead_source_detail: string;
  initial_interest: string;
  lifecycle_stage: LifecycleStage;
  engagement_status: EngagementStatus;
  is_locked: boolean;
  record_version: number;
  profile_image_url: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Response — admin detail projection adds the protected fields
interface ApplicantAdmin extends ApplicantStaff {
  full_name_romanized: string;
  date_of_birth: string | null; // Nullable=Yes
  date_of_birth_bs: BsDate | null;
  gender: Gender | ""; // "" when unset
  religion: string;
  payment_status: PaymentStatus | ""; // "" when unset
  summary: string;
  eligibility_summary: string;
  counselling_notes: string;
  last_contacted_at: string | null; // Nullable=Yes
  next_follow_up_at: string | null; // Nullable=Yes
  follow_up_priority: FollowUpPriority | ""; // "" when unset
  converted_at: string | null; // Nullable=Yes
  locked_at: string | null; // Nullable=Yes
  lock_reason: string;
  archived_at: string | null; // Nullable=Yes
  merged_into: string | null; // Nullable=Yes
  merged_at: string | null; // Nullable=Yes
}

// Staff list row — narrower than ApplicantStaff
interface ApplicantListRowStaff {
  id: string;
  applicant_code: string;
  full_name: string;
  primary_email: string;
  primary_phone: string;
  lifecycle_stage: LifecycleStage;
  engagement_status: EngagementStatus;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

// Admin list row — the exact enumerated set
interface ApplicantListRowAdmin {
  id: string;
  applicant_code: string;
  full_name: string;
  nationality: string;
  primary_email: string;
  primary_phone: string;
  lifecycle_stage: LifecycleStage;
  engagement_status: EngagementStatus;
  follow_up_priority: FollowUpPriority | ""; // "" when unset
  next_follow_up_at: string | null; // Nullable=Yes
  is_locked: boolean;
  converted_at: string | null; // Nullable=Yes
  archived_at: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Create payload — admin only (staff cannot create; server-set + transition-only
// fields omitted). lifecycle_stage/engagement_status are forced server-side.
interface ApplicantCreate {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  preferred_display_name?: string;
  name_native?: string;
  date_of_birth?: string;
  gender?: Gender;
  nationality?: string;
  religion?: string;
  primary_email?: string;
  alternate_email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  lead_source?: LeadSource;
  lead_source_detail?: string;
  payment_status?: PaymentStatus;
  initial_interest?: string;
  summary?: string;
  eligibility_summary?: string;
  counselling_notes?: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  follow_up_priority?: FollowUpPriority;
}

// Update — staff may only send the whitelisted subset (mass-assignment safe);
// admin may send the full ApplicantCreate set. Both carry record_version.
interface ApplicantUpdateStaffFields {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  preferred_display_name?: string;
  name_native?: string;
  primary_email?: string;
  alternate_email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  nationality?: string;
  lead_source?: LeadSource;
  lead_source_detail?: string;
  initial_interest?: string;
}
type ApplicantUpdateStaff = ApplicantUpdateStaffFields & {
  record_version: number;
};
type ApplicantUpdateAdmin = Partial<ApplicantCreate> & {
  record_version: number;
};

// Archive payload (admin only)
interface ApplicantArchive {
  record_version: number;
  reason?: string;
}

// Transition payload (admin only)
interface ApplicantTransition {
  lifecycle_stage?: LifecycleStage;
  engagement_status?: EngagementStatus;
  reason?: string;
  notes?: string;
  qualification_assessment_id?: string;
  record_version: number;
}

// Lock / unlock payload (admin only)
interface ApplicantLockInput {
  reason: string;
}

// Append-only history rows (read-only)
interface LifecycleHistory {
  id: string;
  from_stage: LifecycleStage | "";
  into_stage: LifecycleStage | "";
  from_engagement_status: EngagementStatus | "";
  into_engagement_status: EngagementStatus | "";
  reason: string;
  notes: string;
  changed_by: string | null;
  request_id: string;
  created_at: string;
}
interface LockHistory {
  id: string;
  action: "locked" | "unlocked";
  reason: string;
  performed_by: string | null;
  previous_lock_actor: string | null;
  request_id: string;
  created_at: string;
}

// Merge (admin only) — see §3
interface ApplicantMergeInput {
  surviving_applicant_id: string;
  reason: string;
  field_resolutions?: Record<string, "duplicate">;
}
interface ApplicantMergeRecord {
  id: string;
  source_applicant: string;
  surviving_applicant: string;
  field_resolutions: Record<string, string>;
  transferred_counts: Record<string, number>;
  reason: string;
  performed_by: string | null;
  request_id: string;
  created_at: string;
}

// Duplicate-warning meta on create / convert
interface DuplicateMatch {
  applicant_code: string;
  display_name: string;
  phone_match: boolean;
  email_match: boolean;
}
interface ApplicantCreateMeta {
  possible_duplicate?: boolean;
  matches?: DuplicateMatch[];
}
```

## 3. Endpoints

### `GET /api/v1/applicants/`

- **Purpose:** list / search applicants for the table.
- **Returns:** `list[ApplicantListRowStaff]` (staff) or `list[ApplicantListRowAdmin]`
  (admin).
- **Query params:** `search`, `lifecycle_stage`, `engagement_status`,
  `nationality`, `ordering` (staff subset). Admin adds `is_locked`,
  `follow_up_priority`, `include_archived`, `created_from`/`created_to`,
  `updated_from`/`updated_to`, `next_follow_up_from`/`next_follow_up_to`.
  `ordering` ∈ `{full_name, created_at, updated_at, next_follow_up_at,
lifecycle_stage, applicant_code}`, prefix `-` for desc. Archived excluded unless
  `include_archived` (admin).
- **Policy key:** `applicant.applicant.list`

### `POST /api/v1/applicants/`

- **Purpose:** create an applicant. **Admin/superadmin only** — staff → 403.
- **Request:** `ApplicantCreate`.
- **Returns:** `ApplicantAdmin`, `201`. On a detected exact email/phone match,
  `meta` carries `ApplicantCreateMeta` — **non-blocking**.
- **Side effects:** generates `applicant_code`; `record_version=1`; forces
  `lifecycle_stage=interested` / `engagement_status=active`.
- **Policy key:** `applicant.applicant.create`

### `GET /api/v1/applicants/<id>/`

- **Returns:** `ApplicantStaff` or `ApplicantAdmin` by role.
- **Policy key:** `applicant.applicant.read`

### `PATCH /api/v1/applicants/<id>/`

- **Request:** `ApplicantUpdateStaff` (staff — whitelist only) or
  `ApplicantUpdateAdmin` (admin) — partial fields **+ `record_version`**.
  `applicant_code`, `lifecycle_stage`, `engagement_status`, lock fields, and
  `record_version` itself are never writable here.
- **Returns:** the updated `Applicant` (role projection).
- **Policy key:** `applicant.applicant.update`

### `DELETE /api/v1/applicants/<id>/`

- **Purpose:** archive (soft delete). **Admin/superadmin only.**
- **Request:** `ApplicantArchive` — `record_version` (+ optional `reason`) in body
  or query.
- **Side effects:** sets `archived_at`, `engagement_status=archived`. Never a
  physical delete.
- **Policy key:** `applicant.applicant.archive`

### `POST /api/v1/applicants/<id>/transition/`

- **Purpose:** move through the funnel or change engagement. **Admin only.**
- **Request:** `ApplicantTransition` — at least one of `lifecycle_stage` /
  `engagement_status`.
- **Returns:** the updated `ApplicantAdmin`.
- **Side effects:** stage → `applicant` stamps `converted_at`; appends lifecycle
  history.
- **Policy key:** `applicant.applicant.transition`

### `POST /api/v1/applicants/<id>/lock/` · `.../unlock/`

- **Purpose:** freeze / release the record against staff edits. **Admin only.**
- **Request:** `ApplicantLockInput` — `reason` mandatory both directions.
- **Returns:** the updated `ApplicantAdmin`.
- **Policy keys:** `applicant.applicant.lock` / `.unlock`

### `GET /api/v1/applicants/<id>/lifecycle-history/` · `.../lock-history/`

- **Purpose:** audit timelines. **Admin only.** Paginated, newest first.
- **Returns:** `list[LifecycleHistory]` / `list[LockHistory]`.
- **Policy keys:** `applicant.applicant.lifecycle_history` / `.lock_history`

### `POST /api/v1/applicants/<duplicate_id>/merge/`

- **Purpose:** fold a confirmed duplicate into a surviving applicant. **Admin
  only.** (risk: critical)
- **Request:** `ApplicantMergeInput`. `field_resolutions` is a `{ field:
"duplicate" }` map naming which whitelisted scalar fields (names, contact, DOB,
  gender, nationality, religion, summaries, `lead_source*`, `initial_interest`) to
  pull from the duplicate onto the survivor.
- **Returns:** `{ surviving_applicant: ApplicantAdmin, merge: ApplicantMergeRecord }`.
- **Side effects:** transfers every related record to the survivor; marks the
  duplicate merged (retained, code preserved, archived); writes an immutable merge
  record.
- **Policy key:** `applicant.applicant.merge`

### `GET /api/v1/applicants/<id>/merge-history/`

- **Purpose:** merge records where this applicant is the survivor or the merged
  source. **Admin only.** Paginated.
- **Returns:** `list[ApplicantMergeRecord]`.
- **Policy key:** `applicant.applicant.merge_history`

## 4. Validations & business rules

- **Staff cannot create** an applicant (Phase 7 → `APPLICANT_FIELD_FORBIDDEN`
  403). Admin may create; admin may bypass the contact requirement.
- `lifecycle_stage` is **forward-only**: `interested → potential → applicant`. The
  single jump `interested → applicant` requires a `reason`.
- Moving **to `potential`** requires either a `qualification_assessment_id` (of
  this applicant) or a `reason` (admin override).
- Adverse engagement (`lost` / `disqualified` / `withdrawn` / `archived`) requires
  a `reason`.
- Every mutation requires the last-read `record_version`.
- Staff writes are checked **lock first (423), then version (409)** — a locked
  record surfaces the specific lock error, not a generic conflict.
- Merge cannot target itself (`APPLICANT_MERGE_SELF`) and refuses when either party
  is already merged (`APPLICANT_MERGE_ALREADY_MERGED`); `reason` is mandatory.

## 5. Errors

| Code                                       | HTTP | Trigger                                                      | Suggested UI handling                                                |
| ------------------------------------------ | ---- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `APPLICANT_NOT_FOUND`                      | 404  | unknown / malformed id (non-disclosing)                      | not-found state                                                      |
| `APPLICANT_FIELD_FORBIDDEN`                | 403  | staff create; staff non-whitelist field; non-admin archive   | staff shouldn't reach create; log if the form respects the whitelist |
| `APPLICANT_CONTACT_REQUIRED`               | 400  | create with no email/phone (staff path — now blocked at 403) | field error on email + phone                                         |
| `APPLICANT_VERSION_CONFLICT`               | 409  | stale `record_version`                                       | toast "record changed", reload + retry                               |
| `APPLICANT_RECORD_LOCKED`                  | 423  | staff mutation on a locked applicant                         | show lock banner; disable staff edit controls                        |
| `APPLICANT_ARCHIVED`                       | 409  | mutation on an archived applicant                            | show archived state; offer restore path if any                       |
| `APPLICANT_TRANSITION_INVALID`             | 409  | backward / illegal stage                                     | refresh allowed transitions                                          |
| `APPLICANT_TRANSITION_REASON_REQUIRED`     | 400  | direct `interested → applicant` w/o reason                   | require a reason field                                               |
| `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` | 400  | `→ potential` w/o assessment or reason                       | prompt for assessment id or override reason                          |
| `APPLICANT_ASSESSMENT_NOT_FOUND`           | 404  | unknown assessment id on transition                          | clear the reference; re-pick                                         |
| `APPLICANT_ENGAGEMENT_REASON_REQUIRED`     | 400  | lost/disqualified/withdrawn/archived w/o reason              | require a reason field                                               |
| `APPLICANT_ALREADY_LOCKED` / `_NOT_LOCKED` | 409  | lock/unlock state conflict                                   | reconcile the lock toggle with server state                          |
| `APPLICANT_LOCK_REASON_REQUIRED`           | 400  | lock/unlock without a reason                                 | require a reason field                                               |
| `APPLICANT_MERGE_SELF`                     | 400  | merge target equals the duplicate                            | block; disallow self-select                                          |
| `APPLICANT_MERGE_REASON_REQUIRED`          | 400  | merge without a reason                                       | require a reason field                                               |
| `APPLICANT_MERGE_SURVIVING_NOT_FOUND`      | 404  | unknown surviving applicant                                  | re-pick the survivor                                                 |
| `APPLICANT_MERGE_ALREADY_MERGED`           | 409  | either applicant already merged                              | refresh; a merged record can't be re-merged                          |

## 6. Examples

```jsonc
// POST /api/v1/applicants/  (admin) — request
{
  "first_name": "Ramesh",
  "last_name": "Shrestha",
  "primary_phone": "+9779800000000",
  "lead_source": "walk_in",
  "payment_status": "prepaid",
}

// 201 — response.data (admin projection, abridged)
{
  "id": "3f2a…",
  "applicant_code": "APP-2026-000142",
  "first_name": "Ramesh",
  "last_name": "Shrestha",
  "full_name": "Ramesh Shrestha",
  "full_name_romanized": "ramesh shrestha",
  "primary_phone": "+9779800000000",
  "primary_email": "",
  "date_of_birth": null,
  "date_of_birth_bs": null,
  "gender": "",
  "payment_status": "prepaid",
  "lifecycle_stage": "interested",
  "engagement_status": "active",
  "is_locked": false,
  "lock_reason": "",
  "record_version": 1,
  "profile_image_url": null,
  "archived_at": null,
  "merged_into": null,
  "merged_at": null,
  "created_at": "2026-07-19T04:15:00Z",
  "updated_at": "2026-07-19T04:15:00Z",
}

// …when a duplicate is detected, the same 201 also carries response.meta
{
  "possible_duplicate": true,
  "matches": [
    { "applicant_code": "APP-2026-000119", "display_name": "R. Shrestha", "phone_match": true, "email_match": false },
  ],
}

// POST /api/v1/applicants/<duplicate_id>/merge/ — request
{ "surviving_applicant_id": "3f2a…", "reason": "Same person, duplicate walk-in", "field_resolutions": { "primary_email": "duplicate" } }

// 200 — response.data.merge (abridged)
{ "id": "mr01…", "source_applicant": "9c1d…", "surviving_applicant": "3f2a…", "transferred_counts": { "addresses": 2, "documents": 1 }, "reason": "Same person, duplicate walk-in", "created_at": "2026-07-19T07:00:00Z" }
```

## 7. UI / integration notes

- **Concurrency:** keep the last-read `record_version` in the form/query cache;
  echo it on PATCH/DELETE/transition/merge; on `409` refetch and merge.
- **Role projection:** use `ApplicantStaff` vs `ApplicantAdmin` by role — do
  **not** assume protected fields are `null` for staff; they are **absent**. Pick
  the type by the current role, not by presence checks. `payment_status`,
  `full_name_romanized`, `merged_into`/`merged_at` are admin-only.
- **Dates:** `date_of_birth` carries a `date_of_birth_bs` sibling in the admin
  projection — render `display_en`/`display_np`, send only the AD field.
- **Server-computed (never send):** `applicant_code`, `full_name_romanized`,
  normalized email/phone, `converted_at`, lock/archive/merge stamps,
  `record_version`, `lifecycle_stage`, `engagement_status`.
- **Profile image:** `profile_image_url` resolves to the streaming endpoint
  `GET /api/v1/applicants/<id>/profile-image/` (auth-required bytes, `inline`) —
  there is **no public URL**; load it through the authenticated client, not a bare
  `<img src>` (see `media.md`).
- **Staff create is gone:** render the "new applicant" action for admins only;
  route staff to the **lead** intake (`lead.md`).
- **Duplicate warning:** `meta.possible_duplicate` on create is advisory — render
  masked matches, let the user proceed or cancel; the record already exists.
