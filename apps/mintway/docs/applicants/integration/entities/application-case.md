# `ApplicationCase` — one destination/institution/program pathway

**Endpoint base:** list/create nested under
`/api/v1/applicants/<applicant_id>/cases/`; detail + transition + status history
top-level under `/api/v1/application-cases/<case_id>/`.
**Access:** **admin/superadmin only** (staff → 403).
**Owns:** one application pathway for an applicant, distinct from the person
record. Carries its **own** `record_version`. Status is **transition-only** — a
raw `PATCH` can never change `case_status`.

## 1. Fields (rows)

| Field                   | TS type          | In req | In res | Req | Nullable | Server-set | Enum          | Validation                           | Notes                                      |
| ----------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ------------- | ------------------------------------ | ------------------------------------------ |
| `id`                    | `string`         | ✗      | ✓      | —   | No       | ✓          | —             | UUID                                 | Primary key                                |
| `applicant`             | `string`         | ✗      | ✓      | —   | No       | ✓          | —             | UUID                                 | Owner (from the nested create path)        |
| `case_code`             | `string`         | ✗      | ✓      | —   | No       | ✓          | —             | `^CASE-\d{4}-\d{6}$`, ≤20, immutable | e.g. `CASE-2026-000031`                    |
| `destination_country`   | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤100 chars                           | `""` when unset                            |
| `institution`           | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤255 chars                           |                                            |
| `institution_campus`    | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤255 chars                           |                                            |
| `program`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤200 chars                           |                                            |
| `program_full_name`     | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤255 chars                           |                                            |
| `study_level`           | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤100 chars                           |                                            |
| `study_field`           | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤150 chars                           |                                            |
| `subject`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤150 chars                           |                                            |
| `intake`                | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤50 chars                            |                                            |
| `application_year`      | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤20 chars                            |                                            |
| `case_status`           | `CaseStatus`     | ✗      | ✓      | —   | No       | ✓          | `case_status` | transition-only                      | Default `planning`; **never** in PATCH     |
| `assigned_counsellor`   | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —             | UUID                                 | Set by the assignment service              |
| `opened_at`             | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —             | —                                    | Stamped on create; carries `opened_at_bs`  |
| `closed_at`             | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —             | —                                    | Stamped on a closed status; `closed_at_bs` |
| `outcome`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤100 chars                           |                                            |
| `outcome_reason`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | text                                 |                                            |
| `qualification`         | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤150 chars                           |                                            |
| `qualification_year`    | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤20 chars                            |                                            |
| `grade`                 | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤50 chars                            |                                            |
| `application_reference` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | ≤150 chars                           |                                            |
| `notes`                 | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —             | text                                 |                                            |
| `record_version`        | `number`         | ✓¹     | ✓      | —   | No       | ✓          | —             | integer ≥ 1                          | ¹ required in PATCH/transition body        |
| `archived_at`           | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —             | —                                    | Soft-delete stamp                          |
| `created_at`            | `string`         | ✗      | ✓      | —   | No       | ✓          | —             | ISO 8601                             |                                            |
| `updated_at`            | `string`         | ✗      | ✓      | —   | No       | ✓          | —             | ISO 8601                             |                                            |

Status history rows (`GET .../status-history/`) are append-only:
`{ id, from_status, into_status, reason, notes, changed_by, request_id, created_at }`.

## 2. Types

```ts
type CaseStatus =
  | "planning"
  | "document_collection"
  | "application_preparation"
  | "submitted"
  | "offer_received"
  | "visa_preparation"
  | "visa_submitted"
  | "visa_approved"
  | "visa_refused"
  | "travel_preparation"
  | "completed"
  | "withdrawn"
  | "archived"; // see enums.md
import type { BsDate } from "./applicant";

interface ApplicationCase {
  id: string;
  applicant: string;
  case_code: string;
  destination_country: string;
  institution: string;
  institution_campus: string;
  program: string;
  program_full_name: string;
  study_level: string;
  study_field: string;
  subject: string;
  intake: string;
  application_year: string;
  case_status: CaseStatus;
  assigned_counsellor: string | null; // Nullable=Yes
  opened_at: string | null; // Nullable=Yes
  opened_at_bs: BsDate | null;
  closed_at: string | null; // Nullable=Yes
  closed_at_bs: BsDate | null;
  outcome: string;
  outcome_reason: string;
  qualification: string;
  qualification_year: string;
  grade: string;
  application_reference: string;
  notes: string;
  record_version: number;
  archived_at: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Create — pathway fields only (status/code/version/timestamps are managed)
interface ApplicationCaseCreate {
  destination_country?: string;
  institution?: string;
  institution_campus?: string;
  program?: string;
  program_full_name?: string;
  study_level?: string;
  study_field?: string;
  subject?: string;
  intake?: string;
  application_year?: string;
  outcome?: string;
  outcome_reason?: string;
  qualification?: string;
  qualification_year?: string;
  grade?: string;
  application_reference?: string;
  notes?: string;
}
type ApplicationCaseUpdate = ApplicationCaseCreate & { record_version: number };

interface ApplicationCaseTransition {
  into_status: CaseStatus;
  reason?: string;
  notes?: string;
  record_version: number;
}

interface CaseStatusHistory {
  id: string;
  from_status: CaseStatus | "";
  into_status: CaseStatus;
  reason: string;
  notes: string;
  changed_by: string | null;
  request_id: string;
  created_at: string;
}
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/cases/`

- **Returns:** `list[ApplicationCase]` for the applicant.
- **Policy key:** `applicant.application_case.list`

### `POST /api/v1/applicants/<applicant_id>/cases/`

- **Request:** `ApplicationCaseCreate`.
- **Returns:** the created `ApplicationCase` (`case_status=planning`, `opened_at`
  set, `record_version=1`).
- **Policy key:** `applicant.application_case.create`

### `GET /api/v1/application-cases/<case_id>/`

- **Returns:** the `ApplicationCase`.
- **Policy key:** `applicant.application_case.read`

### `PATCH /api/v1/application-cases/<case_id>/`

- **Request:** `ApplicationCaseUpdate` — pathway fields **+ `record_version`**.
  `case_status` / `case_code` / `record_version` are not patchable.
- **Policy key:** `applicant.application_case.update`

### `POST /api/v1/application-cases/<case_id>/transition/`

- **Request:** `ApplicationCaseTransition`. A reason is required into
  `visa_refused` / `withdrawn` / `archived`.
- **Returns:** the updated `ApplicationCase`.
- **Side effects:** reaching `completed` / `withdrawn` / `archived` stamps
  `closed_at`; appends status history; emits `application_case.status_changed`.
- **Policy key:** `applicant.application_case.transition`

### `GET /api/v1/application-cases/<case_id>/status-history/`

- **Returns:** `list[CaseStatusHistory]`, paginated, newest first.
- **Policy key:** `applicant.application_case.status_history`

## 4. Validations & business rules

- Status changes **only** through the transition endpoint (forward moves are not
  a rigid graph — the server rejects invalid moves; see `gaps.md`).
- A reason is required into `visa_refused` / `withdrawn` / `archived`.
- Same-status transition → `APPLICANT_CASE_TRANSITION_INVALID`.
- Archived cases reject further transitions/updates.
- Every mutation requires the last-read `record_version` (independent of the
  applicant's version).

## 5. Errors

| Code                                | HTTP | Trigger                                        | Suggested UI handling                 |
| ----------------------------------- | ---- | ---------------------------------------------- | ------------------------------------- |
| `APPLICANT_CASE_NOT_FOUND`          | 404  | unknown case id                                | not-found / refresh                   |
| `APPLICANT_CASE_VERSION_CONFLICT`   | 409  | stale case `record_version`                    | reload + retry with the fresh version |
| `APPLICANT_CASE_TRANSITION_INVALID` | 409  | same-status / invalid transition               | re-derive available actions           |
| `APPLICANT_CASE_REASON_REQUIRED`    | 400  | `→ visa_refused/withdrawn/archived` w/o reason | require a reason field                |
| `APPLICANT_CASE_ARCHIVED`           | 409  | mutation on an archived case                   | show archived state                   |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/cases/ — request
{ "destination_country": "Australia", "institution": "University of Melbourne", "program": "MSc Data Science", "intake": "2027 Feb" }

// 201 — response.data (abridged)
{
  "id": "cs01…",
  "applicant": "3f2a…",
  "case_code": "CASE-2026-000031",
  "destination_country": "Australia",
  "institution": "University of Melbourne",
  "program": "MSc Data Science",
  "case_status": "planning",
  "assigned_counsellor": null,
  "opened_at": "2026-07-19T05:10:00Z",
  "opened_at_bs": { "year": 2083, "month": 4, "day": 4, "month_name_en": "Shrawan", "month_name_np": "श्रावण", "display_en": "4 Shrawan 2083", "display_np": "४ श्रावण २०८३" },
  "closed_at": null,
  "closed_at_bs": null,
  "record_version": 1,
  "archived_at": null,
  "created_at": "2026-07-19T05:10:00Z",
  "updated_at": "2026-07-19T05:10:00Z",
}

// POST /api/v1/application-cases/<id>/transition/ — request
{ "into_status": "visa_refused", "reason": "Insufficient funds shown", "record_version": 3 }
```

## 7. UI / integration notes

- **Concurrency:** `record_version` on PATCH/transition — independent of the
  applicant's version; on `409` reload the case.
- **Role projection:** uniform (admin-only surface).
- **Dates:** `opened_at` / `closed_at` carry `*_bs` siblings.
- **Server-computed (never send):** `id`, `applicant`, `case_code`, `case_status`,
  `assigned_counsellor`, `opened_at`/`closed_at`, `record_version`, `archived_at`,
  timestamps.
- **Status control:** offer all statuses in the transition control and let the
  server reject invalid moves (there is no fixed client-side graph — see
  `gaps.md`); require a reason field for the adverse/terminal statuses.
- **Assignment:** `assigned_counsellor` is set through the assignment endpoints
  (see `assignment.md`), not editable here.
