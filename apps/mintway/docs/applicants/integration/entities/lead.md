# `Lead` — the staff-owned enquiry record that precedes an applicant (Phase 7)

**Endpoint base:** `/api/v1/applicants/leads/` (detail under
`/api/v1/applicants/leads/<lead_id>/`; conversion under `.../convert/`).
**Access:** **staff and above** own the whole lead lifecycle (list / create / read
/ update). **Conversion is admin/superadmin only** (staff → 403). Not
role-projected — every field is returned to any staff+ reader.
**Owns:** a first-contact enquiry snapshot ("minimal data acceptable"). An admin
**converts** it into an `Applicant`, migrating a curated field subset and leaving
enquiry-only fields on the lead. A converted lead is **frozen** (immutable).

## 1. Fields (rows)

| Field                      | TS type                     | In req | In res | Req | Nullable | Server-set | Enum              | Validation                      | Notes                                       |
| -------------------------- | --------------------------- | ------ | ------ | --- | -------- | ---------- | ----------------- | ------------------------------- | ------------------------------------------- |
| `id`                       | `string`                    | ✗      | ✓      | —   | No       | ✓          | —                 | UUID                            | Primary key                                 |
| `lead_code`                | `string`                    | ✗      | ✓      | —   | No       | ✓          | —                 | `^LEAD-\d{4}-\d{6}$`, ≤20       | Immutable; e.g. `LEAD-2026-000042`          |
| `first_name`               | `string`                    | ✓      | ✓      | ✓   | No       | ✗          | —                 | required, non-blank, ≤150 chars | Only required capture field                 |
| `middle_name`              | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤150 chars                      | `""` when unset                             |
| `last_name`                | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤150 chars                      | `""` when unset                             |
| `full_name`                | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤300 chars                      | Explicit or composed from parts             |
| `name_native`              | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤300 chars                      | Devanagari name                             |
| `full_name_romanized`      | `string`                    | ✗      | ✓      | —   | No       | ✓          | —                 | ≤300; never user-entered        | ASCII search projection                     |
| `email`                    | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | email; lowercased               | → `Applicant.primary_email` on convert      |
| `contact_number`           | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤32 chars                       | → `Applicant.primary_phone`                 |
| `address`                  | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | text                            | → `ApplicantAddress.address_text`           |
| `passport_number`          | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤100 chars                      | Sensitive, never logged; → identity doc     |
| `guardian_name`            | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤200 chars                      | Enquiry-only (stays on lead)                |
| `guardian_contact`         | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤32 chars                       | Enquiry-only; never logged                  |
| `date_of_birth`            | `string \| null`            | ✓      | ✓      | ✗   | Yes      | ✗          | —                 | date, not future                | carries `date_of_birth_bs`                  |
| `education_qualification`  | `Record<string, unknown>[]` | ✓      | ✓      | ✗   | No       | ✗          | —                 | list of ≤50 flat objects        | Enquiry-only snapshot; `[]` when unset      |
| `work_experience`          | `Record<string, unknown>[]` | ✓      | ✓      | ✗   | No       | ✗          | —                 | list of ≤50 flat objects        | Enquiry-only snapshot; `[]` when unset      |
| `education_level`          | `EducationLevel`            | ✓      | ✓      | ✗   | No       | ✗          | `education_level` | —                               | Enquiry-only; `""` when unset               |
| `has_applied_visa_before`  | `boolean \| null`           | ✓      | ✓      | ✗   | Yes      | ✗          | —                 | —                               | Enquiry-only; `null` = unknown              |
| `payment_status`           | `PaymentStatus`             | ✓      | ✓      | ✗   | No       | ✗          | `payment_status`  | —                               | → `Applicant.payment_status`; `""` if unset |
| `lead_source`              | `LeadSource`                | ✓      | ✓      | ✗   | No       | ✗          | `lead_source`     | —                               | `""` when unset                             |
| `lead_source_detail`       | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | ≤255 chars                      |                                             |
| `notes`                    | `string`                    | ✓      | ✓      | ✗   | No       | ✗          | —                 | text                            | Enquiry-only                                |
| `record_version`           | `number`                    | ✗¹     | ✓      | —   | No       | ✓          | —                 | integer ≥ 1                     | ¹ **optional** on PATCH/convert (see §7)    |
| `is_converted`             | `boolean`                   | ✗      | ✓      | —   | No       | ✓          | —                 | —                               | Derived (`converted_applicant` set)         |
| `converted_applicant`      | `string \| null`            | ✗      | ✓      | —   | Yes      | ✓          | —                 | UUID                            | Set on conversion                           |
| `converted_applicant_code` | `string \| null`            | ✗      | ✓      | —   | Yes      | ✓          | —                 | —                               | The applicant's `applicant_code`            |
| `converted_at`             | `string \| null`            | ✗      | ✓      | —   | Yes      | ✓          | —                 | —                               | Conversion stamp                            |
| `created_at`               | `string`                    | ✗      | ✓      | —   | No       | ✓          | —                 | ISO 8601                        |                                             |
| `updated_at`               | `string`                    | ✗      | ✓      | —   | No       | ✓          | —                 | ISO 8601                        |                                             |

## 2. Types

```ts
import type { LeadSource, PaymentStatus, BsDate } from "./applicant"; // see enums.md / applicant.md
type EducationLevel =
  | "diploma"
  | "bachelor"
  | "post_graduate"
  | "masters"
  | "others"; // see enums.md

interface Lead {
  id: string;
  lead_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  name_native: string;
  full_name_romanized: string;
  email: string;
  contact_number: string;
  address: string;
  passport_number: string;
  guardian_name: string;
  guardian_contact: string;
  date_of_birth: string | null; // Nullable=Yes
  date_of_birth_bs: BsDate | null;
  education_qualification: Record<string, unknown>[];
  work_experience: Record<string, unknown>[];
  education_level: EducationLevel | ""; // "" when unset
  has_applied_visa_before: boolean | null; // Nullable=Yes (null = unknown)
  payment_status: PaymentStatus | ""; // "" when unset
  lead_source: LeadSource | ""; // "" when unset
  lead_source_detail: string;
  notes: string;
  record_version: number;
  is_converted: boolean;
  converted_applicant: string | null; // Nullable=Yes
  converted_applicant_code: string | null; // Nullable=Yes
  converted_at: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Create — server-set fields omitted; only first_name required
interface LeadCreate {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  name_native?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  passport_number?: string;
  guardian_name?: string;
  guardian_contact?: string;
  date_of_birth?: string;
  education_qualification?: Record<string, unknown>[];
  work_experience?: Record<string, unknown>[];
  education_level?: EducationLevel;
  has_applied_visa_before?: boolean;
  payment_status?: PaymentStatus;
  lead_source?: LeadSource;
  lead_source_detail?: string;
  notes?: string;
}

// Update — partial create; record_version is OPTIONAL (checked only when sent)
type LeadUpdate = Partial<LeadCreate> & { record_version?: number };

// Convert (admin only)
interface LeadConvertInput {
  target_country: string; // required, ≤100 chars, chosen fresh at conversion
  record_version?: number;
}
```

## 3. Endpoints

### `GET /api/v1/applicants/leads/`

- **Purpose:** list / search the enquiry funnel.
- **Returns:** `list[Lead]`.
- **Query params:** `search` (name / romanized / native / code / email /
  contact), `lead_source`, `payment_status`, `education_level`, `converted`
  (bool), `ordering` ∈ `{full_name, created_at, updated_at, lead_code}` (prefix
  `-` for desc).
- **Policy key:** `applicant.lead.list`

### `POST /api/v1/applicants/leads/`

- **Purpose:** capture a new enquiry. **Staff and above.**
- **Request:** `LeadCreate`.
- **Returns:** the created `Lead` (`201`).
- **Side effects:** generates `lead_code`; `record_version=1`; emits `lead.created`.
- **Policy key:** `applicant.lead.create`

### `GET /api/v1/applicants/leads/<lead_id>/`

- **Returns:** the `Lead` (includes `date_of_birth_bs`, `is_converted`,
  `converted_applicant_code`).
- **Policy key:** `applicant.lead.read`

### `PATCH /api/v1/applicants/leads/<lead_id>/`

- **Request:** `LeadUpdate` — partial; `record_version` optional (validated when
  present). A **converted** lead is frozen → `409`.
- **Returns:** the updated `Lead`.
- **Side effects:** bumps `record_version`; recomputes the romanized projection;
  emits `lead.updated`.
- **Policy key:** `applicant.lead.update`

### `POST /api/v1/applicants/leads/<lead_id>/convert/`

- **Purpose:** convert the lead into an `Applicant`. **Admin/superadmin only.**
- **Request:** `LeadConvertInput` — `target_country` required.
- **Returns:** `{ lead: Lead, applicant: ApplicantAdmin }` (`201`) + optional
  `meta.possible_duplicate` / `matches[]` (non-blocking).
- **Side effects:** creates an `interested` applicant (migrating name / contact /
  email / DOB / `payment_status` / `lead_source*`), an `ApplicantAddress` (from
  `address`), an `ApplicantIdentityDocument` (from `passport_number`), and an
  `ApplicantInterestProfile` seeded with `target_country`; stamps
  `converted_applicant` / `converted_at` / `converted_by` and **freezes** the lead.
- **Policy key:** `applicant.lead.convert`

## 4. Validations & business rules

- `first_name` is the only required field; everything else is optional (minimal-
  data rule).
- `date_of_birth` cannot be in the future.
- `education_qualification` / `work_experience` are each a list of **≤50** flat
  objects; anything else → `400` field error.
- All user-entered text is NFC-normalized; `email` is lowercased server-side.
- **Enquiry-only fields stay on the lead** on conversion: `guardian_name`,
  `guardian_contact`, `education_qualification`, `work_experience`,
  `education_level`, `has_applied_visa_before`.
- A **converted lead is frozen** — update and re-convert both return
  `APPLICANT_LEAD_ALREADY_CONVERTED` (409).

## 5. Errors

| Code                                      | HTTP | Trigger                                        | Suggested UI handling                      |
| ----------------------------------------- | ---- | ---------------------------------------------- | ------------------------------------------ |
| `APPLICANT_LEAD_NOT_FOUND`                | 404  | unknown / malformed lead id (non-disclosing)   | not-found state                            |
| `APPLICANT_LEAD_VERSION_CONFLICT`         | 409  | stale `record_version` on update/convert       | reload + retry with the fresh version      |
| `APPLICANT_LEAD_ALREADY_CONVERTED`        | 409  | update or convert on an already-converted lead | switch to read-only; link to the applicant |
| `APPLICANT_LEAD_CONVERT_COUNTRY_REQUIRED` | 400  | convert without `target_country`               | require the target-country field           |
| `APPLICANT_FIELD_FORBIDDEN`               | 403  | non-whitelist field on write; staff convert    | log; don't expose convert to staff         |

## 6. Examples

```jsonc
// POST /api/v1/applicants/leads/ — request
{
  "first_name": "Sita",
  "contact_number": "+9779811111111",
  "lead_source": "walk_in",
  "education_level": "bachelor",
  "payment_status": "postpaid",
  "education_qualification": [{ "degree": "BBA", "institution": "TU" }],
}

// 201 — response.data (abridged)
{
  "id": "ld01…",
  "lead_code": "LEAD-2026-000042",
  "first_name": "Sita",
  "full_name": "Sita",
  "full_name_romanized": "sita",
  "contact_number": "+9779811111111",
  "email": "",
  "date_of_birth": null,
  "date_of_birth_bs": null,
  "education_qualification": [{ "degree": "BBA", "institution": "TU" }],
  "work_experience": [],
  "education_level": "bachelor",
  "has_applied_visa_before": null,
  "payment_status": "postpaid",
  "lead_source": "walk_in",
  "record_version": 1,
  "is_converted": false,
  "converted_applicant": null,
  "converted_applicant_code": null,
  "converted_at": null,
  "created_at": "2026-07-19T03:00:00Z",
  "updated_at": "2026-07-19T03:00:00Z",
}

// POST /api/v1/applicants/leads/<lead_id>/convert/ — request
{ "target_country": "Australia" }

// 201 — response.data
{
  "lead": { "id": "ld01…", "is_converted": true, "converted_applicant_code": "APP-2026-000143", "converted_at": "2026-07-19T05:00:00Z" /* … */ },
  "applicant": { "id": "ap02…", "applicant_code": "APP-2026-000143", "lifecycle_stage": "interested", "payment_status": "postpaid" /* … */ },
}
```

## 7. UI / integration notes

- **Concurrency:** `record_version` is **optional** on `PATCH` / `convert` — but
  send it (from the last read) so a concurrent edit surfaces as
  `APPLICANT_LEAD_VERSION_CONFLICT` instead of silently overwriting.
- **Role projection:** uniform — leads are not projected; every field returns to
  staff+. Conversion is admin-only: hide the convert action from staff.
- **Dates:** `date_of_birth` carries a `date_of_birth_bs` sibling.
- **Server-computed (never send):** `id`, `lead_code`, `full_name_romanized`,
  `record_version`, `is_converted`, `converted_*`, timestamps.
- **JSON snapshots:** `education_qualification` / `work_experience` are free-form
  arrays of flat objects (≤50) — they are enquiry notes, **not** the authoritative
  `education` / `work-experience` profile children, and are not migrated.
- **Frozen after convert:** once `is_converted` is true, render the lead read-only
  and link through `converted_applicant` / `converted_applicant_code`.
- **Duplicate warning:** `meta.possible_duplicate` on convert is advisory (the
  applicant already exists) — show masked matches.
