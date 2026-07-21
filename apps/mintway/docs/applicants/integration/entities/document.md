# `Document` — a prepared, polymorphic applicant document

**Endpoint base:** list/create nested under
`/api/v1/applicants/<applicant_id>/documents/`; detail + actions top-level under
`/api/v1/documents/<document_id>/`. Prefill at
`/api/v1/applicants/<applicant_id>/document-prefill/`; workspaces + search under
`/api/v1/documents/`.
**Access:** **admin/superadmin only — staff receive a non-disclosing `404`, not
`403`**, on every document surface (list, detail, actions, prefill, workspaces,
revisions, print, search). Unauthenticated → 401.
**Owns:** one prepared document (CV, certificate, WODA/LOR/MOI, bank, …). Content
is **polymorphic**, validated by the `document_type`'s family. A persisted
document is an **independent snapshot** — later applicant edits never rewrite it.

## 1. Fields (rows)

| Field                     | TS type                   | In req | In res | Req | Nullable | Server-set | Enum            | Validation                                      | Notes                                            |
| ------------------------- | ------------------------- | ------ | ------ | --- | -------- | ---------- | --------------- | ----------------------------------------------- | ------------------------------------------------ |
| `id`                      | `string`                  | ✗      | ✓      | —   | No       | ✓          | —               | UUID                                            | Primary key                                      |
| `applicant`               | `string`                  | ✗      | ✓      | —   | No       | ✓          | —               | UUID                                            | Owner (from the nested create path)              |
| `application_case`        | `string \| null`          | ✗¹     | ✓      | —   | Yes      | ✓¹         | —               | UUID; same applicant                            | ¹ sent as `application_case_id` on create        |
| `document_type`           | `DocumentType`            | ✓      | ✓      | ✓   | No       | ✗          | `document_type` | one of 53 slugs                                 | Validation-family key; not editable after create |
| `label`                   | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —               | ≤255 chars                                      | `""` when unset                                  |
| `status`                  | `DocumentStatus`          | ✗      | ✓      | —   | No       | ✓          | `status`        | transition-only via actions                     | Default `draft`; **never** in PATCH              |
| `document_content`        | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —               | JSON ≤256 KB, depth ≤12, ≤2000 keys, no NaN/Inf | Shape depends on `document_type` (see notes)     |
| `schema_version`          | `number`                  | ✓      | ✓      | ✗   | No       | ✗          | —               | integer ≥ 1                                     | Default 1                                        |
| `template_key`            | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —               | —                                               | Renderer metadata; `""` when unset               |
| `template_version`        | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —               | —                                               | Renderer metadata                                |
| `current_revision_number` | `number`                  | ✗      | ✓      | —   | No       | ✓          | —               | integer                                         | Advances per content edit                        |
| `record_version`          | `number`                  | ✓²     | ✓      | —   | No       | ✓          | —               | integer ≥ 1                                     | ² required in PATCH body                         |
| `finalized_at`            | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —               | —                                               | Lifecycle stamp                                  |
| `submitted_at`            | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —               | —                                               | Lifecycle stamp                                  |
| `archived_at`             | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —               | —                                               | Lifecycle stamp                                  |
| `created_at`              | `string`                  | ✗      | ✓      | —   | No       | ✓          | —               | ISO 8601                                        |                                                  |
| `updated_at`              | `string`                  | ✗      | ✓      | —   | No       | ✓          | —               | ISO 8601                                        |                                                  |

## 2. Types

```ts
type DocumentStatus =
  | "draft"
  | "ready"
  | "finalized"
  | "submitted"
  | "superseded"
  | "archived"; // see enums.md
// One of 53 canonical slugs; narrow to the set the UI offers, or keep as string.
type DocumentType = string;

// label / template_* are Nullable=No → "" when unset; the lifecycle stamps and
// application_case are DB-nullable. See overview.md "Empty vs null".
interface ApplicantDocument {
  id: string;
  applicant: string;
  application_case: string | null; // Nullable=Yes
  document_type: DocumentType;
  label: string;
  status: DocumentStatus;
  document_content: Record<string, unknown>; // narrow per document_type in the editor
  schema_version: number;
  template_key: string;
  template_version: string;
  current_revision_number: number;
  record_version: number;
  finalized_at: string | null; // Nullable=Yes
  submitted_at: string | null; // Nullable=Yes
  archived_at: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

interface ApplicantDocumentCreate {
  document_type: DocumentType;
  label?: string;
  application_case_id?: string;
  document_content?: Record<string, unknown>;
  schema_version?: number;
  template_key?: string;
  template_version?: string;
}

// PATCH accepts only these + record_version; status moves via action endpoints
interface ApplicantDocumentUpdate {
  label?: string;
  document_content?: Record<string, unknown>;
  schema_version?: number;
  change_reason?: string; // optional; recorded on the appended revision
  record_version: number;
}

// Workspaces row
interface DocumentWorkspace {
  applicant_id: string;
  applicant_code: string;
  applicant_name: string;
  document_count: number;
  draft_count: number;
  finalized_count: number;
  submitted_count: number;
  last_updated: string | null;
}
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/documents/`

- **Returns:** `list[ApplicantDocument]` for the applicant.
- **Policy key:** `applicant.document.list`

### `POST /api/v1/applicants/<applicant_id>/documents/`

- **Request:** `ApplicantDocumentCreate`.
- **Returns:** the created `ApplicantDocument` (`status=draft`).
- **Policy key:** `applicant.document.create`

### `GET /api/v1/documents/<document_id>/`

- **Returns:** the `ApplicantDocument`.
- **Policy key:** `applicant.document.read`

### `PATCH /api/v1/documents/<document_id>/`

- **Request:** `ApplicantDocumentUpdate` — **`record_version` required**. Editable
  only while `draft` / `ready`. A content edit advances `current_revision_number`
  and appends an immutable revision (with the optional `change_reason`).
- **Policy key:** `applicant.document.update`

### `DELETE /api/v1/documents/<document_id>/`

- **Purpose:** soft-archive (never a physical delete).
- **Policy key:** `applicant.document.delete`

### `POST /api/v1/documents/<document_id>/{ready|finalize|submit|archive}/`

- **Purpose:** the **only** way to change `status`. Order: `ready`
  (draft→ready; content must be non-empty) → `finalize` (draft|ready→finalized) →
  `submit` (finalized→submitted); `archive` any time.
- **Returns:** the updated `ApplicantDocument` (new `status`).
- **Policy keys:** `applicant.document.{ready,finalize,submit,archive}`

### `GET /api/v1/applicants/<applicant_id>/document-prefill/`

- **Purpose:** compose reusable applicant data to seed a new document editor.
- **Returns:** a composed, read-only prefill object. Its **exact field shape is a
  gap** (`gaps.md`) — a convenience seed, not a typed contract; the persisted
  document is its own independent snapshot. Treat it as `Record<string, unknown>`.
- **Policy key:** `applicant.document.prefill`

### `GET /api/v1/documents/workspaces/`

- **Returns:** `list[DocumentWorkspace]` — documents grouped by applicant with
  per-status counts.
- **Policy key:** `applicant.document.workspaces`

### `GET /api/v1/documents/search/`

- **Purpose:** find documents across applicants.
- **Returns:** `list[ApplicantDocument]`, paginated.
- **Query params:** `document_type`, `status`, `label`, `applicant` (code/name),
  `template_version`, `application_case_id`, `created_from`/`created_to`,
  `updated_from`/`updated_to`.
- **Policy key:** `applicant.document.search`

### Revisions & print events — sub-resources

These two immutable sub-resources hang off `/api/v1/documents/<document_id>/` and
have their **own full entity files** (fields + TS + examples):

- **`document-revision.md`** — `GET …/revisions/`, `GET …/revisions/<n>/`,
  `POST …/revisions/<n>/restore/`.
- **`document-print-event.md`** — `GET …/print-events/`, `POST …/print-events/`,
  `GET …/print-events/<id>/`.

## 4. Validations & business rules

- `document_content` passes a JSON-safety gate (no NaN/Infinity, ≤256 KB, depth
  ≤12, ≤2000 keys) **then** a per-`document_type` family validator on every
  create/update. Unknown type → `..._TYPE_INVALID`; bad content →
  `..._CONTENT_INVALID`.
- **Derived values** (running balances, interest/tax, amount-in-words, USD) are
  computed by the frontend and **must not be stored in `document_content`** — they
  are sent only on a print event, stored verbatim there.
- Editable only in `draft` / `ready`. Status moves **only** through the action
  endpoints — a raw PATCH can never change `status`.
- Certificate documents whose content carries `instructor_id` / `director_id`
  require each to resolve to an **active** signature (see `signature.md`) —
  otherwise `APPLICANT_SIGNATURE_INVALID`.
- `application_case_id`, when supplied, must belong to the same applicant.

## 5. Errors

| Code                                  | HTTP | Trigger                                          | Suggested UI handling                                        |
| ------------------------------------- | ---- | ------------------------------------------------ | ------------------------------------------------------------ |
| `APPLICANT_DOCUMENT_NOT_FOUND`        | 404  | unknown document, **or staff** (non-disclosing)  | not-found; for staff this means "no access"                  |
| `APPLICANT_DOCUMENT_TYPE_INVALID`     | 400  | unknown `document_type`                          | validate the type against the picker list                    |
| `APPLICANT_DOCUMENT_CONTENT_INVALID`  | 400  | content failed JSON-safety / family              | surface `error.message`; block save (details shape is a gap) |
| `APPLICANT_DOCUMENT_VERSION_CONFLICT` | 409  | stale `record_version`                           | reload + retry                                               |
| `APPLICANT_DOCUMENT_NOT_EDITABLE`     | 409  | edit outside `draft`/`ready`                     | switch to read-only view                                     |
| `APPLICANT_DOCUMENT_STATUS_INVALID`   | 409  | out-of-order status action                       | re-derive available actions from `status`                    |
| `APPLICANT_DOCUMENT_ARCHIVED`         | 409  | action on an archived document                   | show archived state                                          |
| `APPLICANT_SIGNATURE_INVALID`         | 400  | certificate references inactive signature        | prompt to pick an active signatory                           |
| `APPLICANT_CASE_APPLICANT_MISMATCH`   | 409  | `application_case_id` from another applicant     | clear the case link                                          |
| `APPLICANT_REVISION_NOT_FOUND`        | 404  | unknown revision number (revisions sub-resource) | not-found; refresh the revision list                         |
| `APPLICANT_PRINT_EVENT_NOT_FOUND`     | 404  | unknown print event (print sub-resource)         | not-found; refresh the print-event list                      |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/documents/ — request (polymorphic content)
{
  "document_type": "bank-vyas-certificate",
  "label": "Bank balance — Vyas",
  "document_content": {
    "account_holder": "Ramesh Shrestha",
    "account_number": "0123456789",
    "currency": "NPR",
    "transactions": [{ "date": "2026-06-01", "credit": "500000.00" }],
  },
}

// 201 — response.data (abridged)
{
  "id": "dc42…",
  "applicant": "3f2a…",
  "application_case": null,
  "document_type": "bank-vyas-certificate",
  "label": "Bank balance — Vyas",
  "status": "draft",
  "document_content": { /* stored verbatim; no derived values */ },
  "schema_version": 1,
  "template_key": "",
  "template_version": "",
  "current_revision_number": 1,
  "record_version": 1,
  "finalized_at": null,
  "submitted_at": null,
  "archived_at": null,
  "created_at": "2026-07-19T05:30:00Z",
  "updated_at": "2026-07-19T05:30:00Z",
}

// 400 — content validation failure (full envelope shown on purpose).
// NOTE: the exact `error.details` shape for serializer failures is a documented
// gap (see gaps.md) — treat `details` as an opaque object and fall back to
// `error.message`.
{ "success": false, "error": { "code": "APPLICANT_DOCUMENT_CONTENT_INVALID", "message": "Document content failed validation.", "details": {} }, "meta": {} }
```

## 7. UI / integration notes

- **Concurrency:** `record_version` required on PATCH; content edits also bump
  `current_revision_number` (display it as "v{n}").
- **Role projection:** uniform for admin; **staff see nothing** — a 404 on any
  document route is an access signal, so don't render document nav for staff.
- **Server-computed (never send):** `status`, `current_revision_number`,
  `record_version`, lifecycle stamps, `applicant`, `application_case` (send
  `application_case_id` on create instead).
- **Polymorphic content:** switch the editor + `document_content` type on
  `document_type`; the per-type field schemas live in the backend
  `document-schemas.md`.
- **Print = evidence, not a claim:** `print_status` never asserts physical
  printing; store the frontend-derived values on the print event.
