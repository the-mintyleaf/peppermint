# `Assignment` — counsellor assignment history

**Endpoint base:** `/api/v1/applicants/<applicant_id>/assignments/` (end action
under `.../assignments/<assignment_id>/end/`).
**Access:** **admin/superadmin only** (staff → 403).
**Owns:** the assignment history of an applicant (or a specific case). A new
assignment at a scope **ends the prior current one**; a case-scoped assignment
also sets the case's `assigned_counsellor`. It is history — assignments are ended,
never deleted.

## 1. Fields (rows)

All fields are response-only; create/end use their own small input shapes.

| Field                 | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                                     |
| --------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ----------------------------------------- |
| `id`                  | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Primary key                               |
| `application_case`    | `string \| null` | ✗¹     | ✓      | —   | Yes      | ✓          | —    | UUID       | ¹ sent as `application_case_id` on assign |
| `assigned_to`         | `string`         | ✗²     | ✓      | —   | No       | ✓          | —    | UUID       | ² sent in the assign body; a `User` id    |
| `assigned_by`         | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —    | UUID       | The actor                                 |
| `assigned_at`         | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                                           |
| `ended_at`            | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —    | ISO 8601   | Set when ended / superseded               |
| `assignment_reason`   | `string`         | ✗³     | ✓      | —   | No       | ✓          | —    | text       | ³ sent as `reason` on assign              |
| `unassignment_reason` | `string`         | ✗³     | ✓      | —   | No       | ✓          | —    | text       | ³ sent as `reason` on end                 |
| `is_current`          | `boolean`        | ✗      | ✓      | —   | No       | ✓          | —    | —          | New assign ends the prior current         |
| `created_at`          | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                                           |

## 2. Types

```ts
interface Assignment {
  id: string;
  application_case: string | null;
  assigned_to: string;
  assigned_by: string | null;
  assigned_at: string;
  ended_at: string | null;
  assignment_reason: string;
  unassignment_reason: string;
  is_current: boolean;
  created_at: string;
}

// Assign — the create input (note: case is passed as application_case_id)
interface AssignInput {
  assigned_to: string; // active User id
  application_case_id?: string; // optional; must be the same applicant's case
  reason?: string;
}

// End — the end input
interface EndAssignmentInput {
  reason?: string;
}
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/assignments/`

- **Returns:** `list[Assignment]` — assignment history.
- **Policy key:** `applicant.assignment.list`

### `POST /api/v1/applicants/<applicant_id>/assignments/`

- **Request:** `AssignInput`.
- **Returns:** the created `Assignment` (`is_current=true`).
- **Side effects:** ends the prior current assignment at that scope; a case-scoped
  assign sets `ApplicationCase.assigned_counsellor`; emits `applicant.assigned`.
- **Policy key:** `applicant.assignment.create`

### `POST /api/v1/applicants/<applicant_id>/assignments/<assignment_id>/end/`

- **Request:** `EndAssignmentInput`.
- **Returns:** the updated `Assignment` (`is_current=false`, `ended_at` set).
- **Side effects:** emits `applicant.unassigned`.
- **Policy key:** `applicant.assignment.end`

## 4. Validations & business rules

- `assigned_to` must be an existing **active** `User` — else
  `APPLICANT_ASSIGNEE_INVALID`.
- A case referenced by `application_case_id` must belong to the same applicant —
  else `APPLICANT_CASE_APPLICANT_MISMATCH`.
- Assignment is history: a new assign at a scope ends the prior current one; there
  is no delete and no `record_version`.

## 5. Errors

| Code                                | HTTP | Trigger                             | Suggested UI handling       |
| ----------------------------------- | ---- | ----------------------------------- | --------------------------- |
| `APPLICANT_ASSIGNEE_INVALID`        | 400  | assignee not a valid active account | re-pick the counsellor      |
| `APPLICANT_CASE_APPLICANT_MISMATCH` | 409  | case from another applicant         | clear the case link         |
| `APPLICANT_ASSIGNMENT_NOT_FOUND`    | 404  | unknown assignment id (on end)      | refresh the assignment list |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/assignments/ — request
{ "assigned_to": "user-7", "application_case_id": "cs01…", "reason": "Specialist for Australia cases" }

// 201 — response.data
{
  "id": "as01…",
  "application_case": "cs01…",
  "assigned_to": "user-7",
  "assigned_by": "user-1",
  "assigned_at": "2026-07-19T05:20:00Z",
  "ended_at": null,
  "assignment_reason": "Specialist for Australia cases",
  "unassignment_reason": "",
  "is_current": true,
  "created_at": "2026-07-19T05:20:00Z",
}

// POST /api/v1/applicants/<id>/assignments/<assignment_id>/end/ — request
{ "reason": "Case reassigned" }
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`; assignment is append-and-end
  history.
- **Role projection:** uniform (admin-only surface).
- **Dates:** plain ISO timestamps; no `*_bs` siblings.
- **Server-computed (never send):** everything on the response; the client sends
  only `assigned_to` + optional `application_case_id` / `reason` on assign, and
  `reason` on end.
- **Field-name asymmetry:** the case is sent as `application_case_id` and the
  reason as `reason`, but come back as `application_case` and
  `assignment_reason` / `unassignment_reason`.
- **Modeling:** render as a timeline; the "current" assignment is the one with
  `is_current=true`. Re-fetch the case after a case-scoped assign to pick up
  `assigned_counsellor`.
