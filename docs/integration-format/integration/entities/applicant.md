# `Applicant` — the person master record and aggregate root

**Endpoint base:** `/api/v1/applicants/`
**Access:** staff and admin/superadmin. **Role-projected** — staff receive a
strict subset of fields (protected fields are absent, not null). Transition,
lock, history, and archive are **admin/superadmin only** (staff → 403).
**Owns:** the permanent person record. Lifecycle stage (funnel position) and
engagement status (relationship) are separate fields and change **only** through
the transition endpoint — never a raw `PATCH`.

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. Fields marked
**admin-only** are absent from the staff projection entirely.

| Field                    | TS type                    | In req | In res    | Req | Nullable | Server-set | Enum                 | Validation                          | Notes                                      |
| ------------------------ | -------------------------- | ------ | --------- | --- | -------- | ---------- | -------------------- | ----------------------------------- | ------------------------------------------ |
| `id`                     | `string`                   | ✗      | ✓         | —   | No       | ✓          | —                    | UUID                                | Primary key                                |
| `applicant_code`         | `string`                   | ✗      | ✓         | —   | No       | ✓          | —                    | `^APP-\d{4}-\d{6}$`, ≤20, immutable | e.g. `APP-2026-000142`                     |
| `first_name`             | `string`                   | ✓      | ✓         | ✓   | No       | ✗          | —                    | required, ≤150 chars                | Given name                                 |
| `middle_name`            | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          |                                            |
| `last_name`              | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          |                                            |
| `full_name`              | `string`                   | ✓      | ✓         | ✗   | No       | ✓ if blank | —                    | ≤300 chars                          | Composed server-side when omitted          |
| `name_native`            | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤300 chars                          | Devanagari / native script                 |
| `preferred_display_name` | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤150 chars                          | Manual display override                    |
| `nationality`            | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤100 chars                          |                                            |
| `primary_email`          | `string \| null`           | ✓      | ✓         | ✗¹  | No       | ✗          | —                    | email, ≤254; lowercased             | ¹ staff must send email **or** phone       |
| `alternate_email`        | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | email                               |                                            |
| `primary_phone`          | `string \| null`           | ✓      | ✓         | ✗¹  | No       | ✗          | —                    | ≤32 chars                           | ¹ staff must send email **or** phone       |
| `alternate_phone`        | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤32 chars                           |                                            |
| `lead_source`            | `LeadSource \| null`       | ✓      | ✓         | ✗   | No       | ✗          | `lead_source`        | —                                   |                                            |
| `lead_source_detail`     | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | ≤255 chars                          |                                            |
| `initial_interest`       | `string \| null`           | ✓      | ✓         | ✗   | No       | ✗          | —                    | text                                |                                            |
| `lifecycle_stage`        | `LifecycleStage`           | ✗      | ✓         | —   | No       | ✓          | `lifecycle_stage`    | transition-only; forward-only       | Default `interested`; **never** in PATCH   |
| `engagement_status`      | `EngagementStatus`         | ✗      | ✓         | —   | No       | ✓          | `engagement_status`  | transition-only                     | Default `active`; **never** in PATCH       |
| `is_locked`              | `boolean`                  | ✗      | ✓         | —   | No       | ✓          | —                    | lock-service only                   |                                            |
| `record_version`         | `number`                   | ✓²     | ✓         | —   | No       | ✓          | —                    | integer ≥ 1                         | ² required in PATCH/DELETE/transition body |
| `profile_image_url`      | `string \| null`           | ✗      | ✓         | —   | Yes      | ✓          | —                    | —                                   | Points at the streaming endpoint (see §7)  |
| `created_at`             | `string`                   | ✗      | ✓         | —   | No       | ✓          | —                    | ISO 8601                            |                                            |
| `updated_at`             | `string`                   | ✗      | ✓         | —   | No       | ✓          | —                    | ISO 8601                            |                                            |
| **admin-only ↓**         |                            |        |           |     |          |            |                      |                                     | absent from staff projection               |
| `date_of_birth`          | `string \| null`           | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | date, not future                    | carries `date_of_birth_bs`                 |
| `gender`                 | `Gender \| null`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | `gender`             | —                                   |                                            |
| `religion`               | `string \| null`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | ≤100 chars                          | protected                                  |
| `full_name_romanized`    | `string`                   | ✗      | ✓ (admin) | —   | No       | ✓          | —                    | ≤300; never user-entered            | ASCII search projection                    |
| `summary`                | `string \| null`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                |                                            |
| `eligibility_summary`    | `string \| null`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                |                                            |
| `counselling_notes`      | `string \| null`           | ✓      | ✓ (admin) | ✗   | No       | ✗          | —                    | text                                | protected                                  |
| `last_contacted_at`      | `string \| null`           | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | ISO 8601                            |                                            |
| `next_follow_up_at`      | `string \| null`           | ✓      | ✓ (admin) | ✗   | Yes      | ✗          | —                    | ISO 8601                            |                                            |
| `follow_up_priority`     | `FollowUpPriority \| null` | ✓      | ✓ (admin) | ✗   | No       | ✗          | `follow_up_priority` | —                                   |                                            |
| `converted_at`           | `string \| null`           | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   | Stamped when stage → `applicant`           |
| `locked_at`              | `string \| null`           | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   |                                            |
| `lock_reason`            | `string \| null`           | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   |                                            |
| `archived_at`            | `string \| null`           | ✗      | ✓ (admin) | —   | Yes      | ✓          | —                    | —                                   | Soft-delete stamp                          |

**Staff list projection** is even narrower — rows expose only: `id`,
`applicant_code`, `full_name`, `primary_email`, `primary_phone`,
`lifecycle_stage`, `engagement_status`, `is_locked`, `created_at`, `updated_at`.

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

// Bikram Sambat sibling for protected date fields (see overview.md)
interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

// Response — staff projection.
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

// Response — admin projection adds the protected fields
interface ApplicantAdmin extends ApplicantStaff {
  date_of_birth: string | null; // Nullable=Yes
  date_of_birth_bs: BsDate | null;
  gender: Gender | ""; // "" when unset
  religion: string;
  full_name_romanized: string;
  summary: string;
  eligibility_summary: string;
  counselling_notes: string;
  last_contacted_at: string | null; // Nullable=Yes
  next_follow_up_at: string | null; // Nullable=Yes
  follow_up_priority: FollowUpPriority | ""; // "" when unset
  converted_at: string | null; // Nullable=Yes
  locked_at: string | null; // Nullable=Yes
  lock_reason: string | null; // Nullable=Yes
  archived_at: string | null; // Nullable=Yes
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

// Admin list row — the source does NOT enumerate the admin list serializer's
// field set (see gaps.md), so its exact shape is unconfirmed. It is at least a
// superset of ApplicantListRowStaff; confirm the extra columns with the backend
// before typing it.
type ApplicantListRowAdmin = ApplicantListRowStaff & Record<string, unknown>;

// Create payload — staff (server-set + transition-only fields omitted)
interface ApplicantCreateStaff {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  name_native?: string;
  preferred_display_name?: string;
  nationality?: string;
  primary_email?: string;
  alternate_email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  lead_source?: LeadSource;
  lead_source_detail?: string;
  initial_interest?: string;
}

// Create payload — admin adds the protected writable fields
interface ApplicantCreateAdmin extends ApplicantCreateStaff {
  date_of_birth?: string;
  gender?: Gender;
  religion?: string;
  summary?: string;
  eligibility_summary?: string;
  counselling_notes?: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  follow_up_priority?: FollowUpPriority;
}

// Update = partial create + the required record_version
type ApplicantUpdate = Partial<ApplicantCreateAdmin> & {
  record_version: number;
};

// Transition payload (admin only)
interface ApplicantTransition {
  lifecycle_stage?: LifecycleStage;
  engagement_status?: EngagementStatus;
  reason?: string;
  notes?: string;
  qualification_assessment_id?: string;
  record_version: number;
}

// Duplicate-warning meta on create
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
- **Returns:** `list[ApplicantListRowStaff]` (staff) or admin list projection.
- **Query params:** `search`, `lifecycle_stage`, `engagement_status`,
  `nationality`, `ordering` (staff subset). Admin adds `is_locked`,
  `follow_up_priority`, `include_archived`, `created_from`/`created_to`,
  `updated_from`/`updated_to`, `next_follow_up_from`/`next_follow_up_to`.
  `ordering` ∈ `{full_name, created_at, updated_at, next_follow_up_at,
lifecycle_stage, applicant_code}`, prefix `-` for desc. Archived excluded
  unless `include_archived` (admin).
- **Policy key:** `applicant.applicant.list`

### `POST /api/v1/applicants/`

- **Request:** `ApplicantCreateStaff` (staff) or `ApplicantCreateAdmin` (admin).
  Non-whitelisted fields in a staff body are ignored.
- **Returns:** `Applicant` (role projection), `201`. On a detected exact
  email/phone match, `meta` carries `ApplicantCreateMeta` — **non-blocking**.
- **Side effects:** generates `applicant_code`; `record_version=1`; staff create
  is forced to `lifecycle_stage=interested` / `engagement_status=active`.
- **Policy key:** `applicant.applicant.create`

### `GET /api/v1/applicants/<id>/`

- **Returns:** `ApplicantStaff` or `ApplicantAdmin` by role.
- **Policy key:** `applicant.applicant.read`

### `PATCH /api/v1/applicants/<id>/`

- **Request:** `ApplicantUpdate` — partial fields **+ `record_version`**.
  `applicant_code`, `lifecycle_stage`, `engagement_status`, lock fields, and
  `record_version` itself are never writable here.
- **Returns:** the updated `Applicant`.
- **Policy key:** `applicant.applicant.update`

### `DELETE /api/v1/applicants/<id>/`

- **Purpose:** archive (soft delete). **Admin/superadmin only.**
- **Request:** `{ record_version, reason? }` (body or query).
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
- **Request:** `{ reason }` (mandatory both directions).
- **Returns:** the updated `ApplicantAdmin`.
- **Policy keys:** `applicant.applicant.lock` / `.unlock`

### `GET /api/v1/applicants/<id>/lifecycle-history/` · `.../lock-history/`

- **Purpose:** audit timelines. **Admin only.** Paginated, newest first.
- **Returns:** `list[LifecycleHistory]` / `list[LockHistory]` (append-only rows:
  `{ id, from_stage?, into_stage?, reason, notes, changed_by, created_at }` and
  `{ id, action, reason, performed_by, created_at }` respectively).
- **Policy keys:** `applicant.applicant.lifecycle_history` / `.lock_history`

## 4. Validations & business rules

- **Staff must supply `primary_email` or `primary_phone`** on create
  (`APPLICANT_CONTACT_REQUIRED`); admin may bypass.
- `lifecycle_stage` is **forward-only**: `interested → potential → applicant`.
  The single jump `interested → applicant` requires a `reason`.
- Moving **to `potential`** requires either a `qualification_assessment_id` (of
  this applicant) or a `reason` (admin override).
- Adverse engagement (`lost` / `disqualified` / `withdrawn` / `archived`)
  requires a `reason`.
- Every mutation requires the last-read `record_version`.
- Staff writes are checked **lock first (423), then version (409)** — so a locked
  record surfaces the specific lock error, not a generic conflict.

## 5. Errors

| Code                                       | HTTP | Trigger                                              | Suggested UI handling                                    |
| ------------------------------------------ | ---- | ---------------------------------------------------- | -------------------------------------------------------- |
| `APPLICANT_NOT_FOUND`                      | 404  | unknown / malformed id (non-disclosing)              | not-found state                                          |
| `APPLICANT_CONTACT_REQUIRED`               | 400  | staff create with no email/phone                     | field error on email + phone; block submit               |
| `APPLICANT_VERSION_CONFLICT`               | 409  | stale `record_version`                               | toast "record changed", reload + retry                   |
| `APPLICANT_RECORD_LOCKED`                  | 423  | staff mutation on a locked applicant                 | show lock banner; disable staff edit controls            |
| `APPLICANT_FIELD_FORBIDDEN`                | 403  | staff sent a non-whitelist field / non-admin archive | log; shouldn't happen if the form respects the whitelist |
| `APPLICANT_ARCHIVED`                       | 409  | mutation on an archived applicant                    | show archived state; offer restore path if any           |
| `APPLICANT_TRANSITION_INVALID`             | 409  | backward / illegal stage                             | refresh allowed transitions                              |
| `APPLICANT_TRANSITION_REASON_REQUIRED`     | 400  | direct `interested → applicant` w/o reason           | require a reason field                                   |
| `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` | 400  | `→ potential` w/o assessment or reason               | prompt for assessment id or override reason              |
| `APPLICANT_ASSESSMENT_NOT_FOUND`           | 404  | unknown assessment id on transition                  | clear the reference; re-pick                             |
| `APPLICANT_ENGAGEMENT_REASON_REQUIRED`     | 400  | lost/disqualified/withdrawn/archived w/o reason      | require a reason field                                   |
| `APPLICANT_ALREADY_LOCKED` / `_NOT_LOCKED` | 409  | lock/unlock state conflict                           | reconcile the lock toggle with server state              |
| `APPLICANT_LOCK_REASON_REQUIRED`           | 400  | lock/unlock without a reason                         | require a reason field                                   |

## 6. Examples

```jsonc
// POST /api/v1/applicants/  (staff) — request
{
  "first_name": "Ramesh",
  "last_name": "Shrestha",
  "primary_phone": "+9779800000000",
  "lead_source": "walk_in",
}

// 201 — response.data (staff projection)
{
  "id": "3f2a…",
  "applicant_code": "APP-2026-000142",
  "first_name": "Ramesh",
  "last_name": "Shrestha",
  "full_name": "Ramesh Shrestha",
  "primary_phone": "+9779800000000",
  "primary_email": "",
  "lifecycle_stage": "interested",
  "engagement_status": "active",
  "is_locked": false,
  "record_version": 1,
  "profile_image_url": null,
  "created_at": "2026-07-19T04:15:00Z",
  "updated_at": "2026-07-19T04:15:00Z",
}

// …when a duplicate is detected, the same 201 also carries:
// response.meta
{
  "possible_duplicate": true,
  "matches": [
    {
      "applicant_code": "APP-2026-000119",
      "display_name": "R. Shrestha",
      "phone_match": true,
      "email_match": false,
    },
  ],
}

// admin GET — the date_of_birth_bs sibling shape
{
  "date_of_birth": "2001-04-15",
  "date_of_birth_bs": {
    "year": 2058,
    "month": 1,
    "day": 2,
    "month_name_en": "Baisakh",
    "month_name_np": "बैशाख",
    "display_en": "2 Baisakh 2058",
    "display_np": "२ बैशाख २०५८",
  },
}
```

## 7. UI / integration notes

- **Concurrency:** keep the last-read `record_version` in the form/query cache;
  echo it on PATCH/DELETE/transition; on `409` refetch and merge.
- **Role projection:** use `ApplicantStaff` vs `ApplicantAdmin` by role — do
  **not** assume protected fields are `null` for staff; they are absent. Pick the
  type by the current role, not by presence checks.
- **Dates:** `date_of_birth` (and any admin date field) carries a `*_bs`
  Bikram-Sambat sibling in responses — render `display_en`/`display_np`, send
  only the AD field.
- **Server-computed (never send):** `applicant_code`, `full_name_romanized`,
  normalized email/phone, `converted_at`, lock/archive stamps, `record_version`,
  `lifecycle_stage`, `engagement_status`.
- **Profile image:** `profile_image_url` resolves to the streaming endpoint
  `GET /api/v1/applicants/<id>/profile-image/` (auth-required bytes, `inline`) —
  there is **no public URL**; load it through the authenticated client, not a
  bare `<img src>` to a CDN.
- **Duplicate warning:** `meta.possible_duplicate` on create is advisory — render
  masked matches, let the user proceed or cancel; the record already exists.
