# `InterestProfile` — an applicant's migration preferences (OneToOne)

**Endpoint base:** `/api/v1/applicants/<applicant_id>/interest-profile/` (a single
URL serves `GET` / `POST` / `PATCH` / `DELETE`).
**Access:** **admin/superadmin only** (staff → 403). Parent archive/lock guarded.
**Owns:** exactly **one** preference profile per applicant. Seeded automatically on
lead conversion (with `target_country` → `preferred_countries`).

## 1. Fields (rows)

| Field                          | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes              |
| ------------------------------ | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ------------------ |
| `id`                           | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Primary key        |
| `preferred_countries`          | `string[]`       | ✓      | ✓      | ✗   | No       | ✗          | —    | JSON list  | `[]` when unset    |
| `preferred_study_levels`       | `string[]`       | ✓      | ✓      | ✗   | No       | ✗          | —    | JSON list  |                    |
| `preferred_fields`             | `string[]`       | ✓      | ✓      | ✗   | No       | ✗          | —    | JSON list  |                    |
| `preferred_programs`           | `string[]`       | ✓      | ✓      | ✗   | No       | ✗          | —    | JSON list  |                    |
| `preferred_cities`             | `string[]`       | ✓      | ✓      | ✗   | No       | ✗          | —    | JSON list  |                    |
| `preferred_intake`             | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `preferred_year`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤20 chars  |                    |
| `estimated_budget`             | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | decimal    | **decimal string** |
| `budget_currency`              | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤8 chars   |                    |
| `funding_method`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |                    |
| `study_gap_summary`            | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `travel_history_summary`       | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `visa_refusal_history_summary` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `interests`                    | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `qualification_summary`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `target_program`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                    |
| `notes`                        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                    |
| `created_at`                   | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                    |
| `updated_at`                   | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                    |

## 2. Types

```ts
interface InterestProfile {
  id: string;
  preferred_countries: string[];
  preferred_study_levels: string[];
  preferred_fields: string[];
  preferred_programs: string[];
  preferred_cities: string[];
  preferred_intake: string;
  preferred_year: string;
  estimated_budget: string | null; // decimal string, Nullable=Yes
  budget_currency: string;
  funding_method: string;
  study_gap_summary: string;
  travel_history_summary: string;
  visa_refusal_history_summary: string;
  interests: string;
  qualification_summary: string;
  target_program: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface InterestProfileCreate {
  preferred_countries?: string[];
  preferred_study_levels?: string[];
  preferred_fields?: string[];
  preferred_programs?: string[];
  preferred_cities?: string[];
  preferred_intake?: string;
  preferred_year?: string;
  estimated_budget?: string; // decimal string
  budget_currency?: string;
  funding_method?: string;
  study_gap_summary?: string;
  travel_history_summary?: string;
  visa_refusal_history_summary?: string;
  interests?: string;
  qualification_summary?: string;
  target_program?: string;
  notes?: string;
}
type InterestProfileUpdate = Partial<InterestProfileCreate>; // no record_version
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/interest-profile/`

- **Returns:** the `InterestProfile`. `404 APPLICANT_CHILD_NOT_FOUND` when unset.
- **Policy key:** `applicant.interest_profile.read`

### `POST /api/v1/applicants/<applicant_id>/interest-profile/`

- **Request:** `InterestProfileCreate`.
- **Returns:** the created `InterestProfile`. `409` if one already exists.
- **Policy key:** `applicant.interest_profile.create`

### `PATCH /api/v1/applicants/<applicant_id>/interest-profile/`

- **Request:** `InterestProfileUpdate`. `404` when unset.
- **Returns:** the updated `InterestProfile`.
- **Policy key:** `applicant.interest_profile.update`

### `DELETE /api/v1/applicants/<applicant_id>/interest-profile/`

- **Purpose:** remove the profile.
- **Policy key:** `applicant.interest_profile.delete`

## 4. Validations & business rules

- **One profile per applicant** — a second `POST` returns
  `APPLICANT_INTEREST_PROFILE_EXISTS`.
- Multi-value preferences are JSON arrays of strings.
- `estimated_budget` is a decimal money value (string on the wire).
- No optimistic-concurrency `record_version`.

## 5. Errors

| Code                                | HTTP | Trigger                                | Suggested UI handling                |
| ----------------------------------- | ---- | -------------------------------------- | ------------------------------------ |
| `APPLICANT_CHILD_NOT_FOUND`         | 404  | `GET`/`PATCH`/`DELETE` before creation | show an empty "create profile" state |
| `APPLICANT_INTEREST_PROFILE_EXISTS` | 409  | second `POST`                          | switch to edit mode (PATCH)          |
| `APPLICANT_ARCHIVED`                | 409  | mutation on an archived applicant      | show archived state                  |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/interest-profile/ — request
{
  "preferred_countries": ["Australia", "Canada"],
  "preferred_study_levels": ["masters"],
  "estimated_budget": "5000000.00",
  "budget_currency": "NPR",
  "target_program": "Data Science",
}

// 201 — response.data (abridged)
{
  "id": "ip01…",
  "preferred_countries": ["Australia", "Canada"],
  "preferred_study_levels": ["masters"],
  "preferred_fields": [],
  "preferred_programs": [],
  "preferred_cities": [],
  "preferred_intake": "",
  "preferred_year": "",
  "estimated_budget": "5000000.00",
  "budget_currency": "NPR",
  "target_program": "Data Science",
  "notes": "",
  "created_at": "2026-07-19T04:45:00Z",
  "updated_at": "2026-07-19T04:45:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Role projection:** uniform (admin-only surface).
- **Dates:** none carry a `*_bs` sibling.
- **Money:** `estimated_budget` is a **decimal string** — keep it a string.
- **Server-computed (never send):** `id`, timestamps.
- **Modeling:** treat as a singleton — `GET` first; on `404` show a create form,
  otherwise an edit form (PATCH). Seeded on lead conversion with the chosen
  `target_country` in `preferred_countries`.
