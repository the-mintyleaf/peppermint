# `QualificationAssessment` — an eligibility assessment (append-only)

**Endpoint base:** `/api/v1/applicants/<applicant_id>/qualification-assessments/`
(detail under `.../<assessment_id>/`).
**Access:** **admin/superadmin only** (staff → 403).
**Owns:** a point-in-time eligibility judgement for an applicant. **Append-only /
supersede:** a new assessment retires the prior current one; there is **no update
or delete** (`PATCH`/`DELETE` → 405). It backs the applicant's move to
`potential`.

## 1. Fields (rows)

| Field                        | TS type             | In req | In res | Req | Nullable | Server-set | Enum                 | Validation | Notes                                      |
| ---------------------------- | ------------------- | ------ | ------ | --- | -------- | ---------- | -------------------- | ---------- | ------------------------------------------ |
| `id`                         | `string`            | ✗      | ✓      | —   | No       | ✓          | —                    | UUID       | Use as `qualification_assessment_id`       |
| `assessment_date`            | `string \| null`    | ✓      | ✓      | ✗   | Yes      | ✗          | —                    | date       | carries `assessment_date_bs`               |
| `preferred_destination`      | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | ≤100 chars | `""` when unset                            |
| `preferred_program_or_field` | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | ≤150 chars |                                            |
| `education_summary`          | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `study_gap_summary`          | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `language_readiness`         | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `financial_readiness`        | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `funding_summary`            | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `visa_risk_summary`          | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `eligibility_result`         | `EligibilityResult` | ✓      | ✓      | ✗   | No       | ✗          | `eligibility_result` | —          | Default `pending`                          |
| `conditions`                 | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `recommendation`             | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `notes`                      | `string`            | ✓      | ✓      | ✗   | No       | ✗          | —                    | text       |                                            |
| `valid_until`                | `string \| null`    | ✓      | ✓      | ✗   | Yes      | ✗          | —                    | date       | carries `valid_until_bs`                   |
| `is_current`                 | `boolean`           | ✗      | ✓      | —   | No       | ✓          | —                    | —          | Server-managed; a new create retires prior |
| `created_at`                 | `string`            | ✗      | ✓      | —   | No       | ✓          | —                    | ISO 8601   |                                            |
| `updated_at`                 | `string`            | ✗      | ✓      | —   | No       | ✓          | —                    | ISO 8601   |                                            |

## 2. Types

```ts
type EligibilityResult =
  | "suitable"
  | "conditionally_suitable"
  | "unsuitable"
  | "pending"; // see enums.md
import type { BsDate } from "./applicant";

interface QualificationAssessment {
  id: string;
  assessment_date: string | null; // Nullable=Yes
  assessment_date_bs: BsDate | null;
  preferred_destination: string;
  preferred_program_or_field: string;
  education_summary: string;
  study_gap_summary: string;
  language_readiness: string;
  financial_readiness: string;
  funding_summary: string;
  visa_risk_summary: string;
  eligibility_result: EligibilityResult;
  conditions: string;
  recommendation: string;
  notes: string;
  valid_until: string | null; // Nullable=Yes
  valid_until_bs: BsDate | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// Create only — there is no update/delete
interface QualificationAssessmentCreate {
  assessment_date?: string;
  preferred_destination?: string;
  preferred_program_or_field?: string;
  education_summary?: string;
  study_gap_summary?: string;
  language_readiness?: string;
  financial_readiness?: string;
  funding_summary?: string;
  visa_risk_summary?: string;
  eligibility_result?: EligibilityResult;
  conditions?: string;
  recommendation?: string;
  notes?: string;
  valid_until?: string;
}
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/qualification-assessments/`

- **Returns:** `list[QualificationAssessment]` — full history, newest first.
- **Policy key:** `applicant.qualification_assessment.list`

### `POST /api/v1/applicants/<applicant_id>/qualification-assessments/`

- **Request:** `QualificationAssessmentCreate`.
- **Returns:** the created assessment (`is_current=true`).
- **Side effects:** **retires the prior current** assessment (`is_current=false`);
  emits `applicant.qualification_assessed`.
- **Policy key:** `applicant.qualification_assessment.create`

### `GET /api/v1/applicants/<applicant_id>/qualification-assessments/<assessment_id>/`

- **Returns:** one assessment.
- **Policy key:** `applicant.qualification_assessment.read`

> **No `PATCH` / `DELETE`** — both return **405**. To "change" an assessment,
> create a new one; history is preserved.

## 4. Validations & business rules

- Append-only: never mutate or delete an existing assessment.
- Creating one supersedes the prior `is_current` automatically.
- The returned `id` is what you pass as `qualification_assessment_id` on the
  applicant's transition to `potential` (see `applicant.md` §3 / `flows.md`).

## 5. Errors

| Code                             | HTTP | Trigger                      | Suggested UI handling             |
| -------------------------------- | ---- | ---------------------------- | --------------------------------- |
| `APPLICANT_ASSESSMENT_NOT_FOUND` | 404  | unknown assessment id        | refresh the history list          |
| —                                | 405  | attempted `PATCH` / `DELETE` | don't render edit/delete controls |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/qualification-assessments/ — request
{
  "eligibility_result": "suitable",
  "assessment_date": "2026-07-19",
  "preferred_destination": "Australia",
  "financial_readiness": "Sufficient bank balance evidenced.",
  "recommendation": "Proceed to application.",
}

// 201 — response.data
{
  "id": "qa77…",
  "assessment_date": "2026-07-19",
  "assessment_date_bs": { "year": 2083, "month": 4, "day": 4, "month_name_en": "Shrawan", "month_name_np": "श्रावण", "display_en": "4 Shrawan 2083", "display_np": "४ श्रावण २०८३" },
  "preferred_destination": "Australia",
  "preferred_program_or_field": "",
  "education_summary": "",
  "study_gap_summary": "",
  "language_readiness": "",
  "financial_readiness": "Sufficient bank balance evidenced.",
  "funding_summary": "",
  "visa_risk_summary": "",
  "eligibility_result": "suitable",
  "conditions": "",
  "recommendation": "Proceed to application.",
  "notes": "",
  "valid_until": null,
  "valid_until_bs": null,
  "is_current": true,
  "created_at": "2026-07-19T05:00:00Z",
  "updated_at": "2026-07-19T05:00:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — append-only, so no `record_version`.
- **Role projection:** uniform (admin-only surface).
- **Dates:** `assessment_date` and `valid_until` carry `*_bs` siblings.
- **Server-computed (never send):** `is_current`, `id`, timestamps.
- **Modeling:** render as an immutable timeline; the "edit" affordance creates a
  new record rather than mutating. Surface `is_current` to mark the active one.
