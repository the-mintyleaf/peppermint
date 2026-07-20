# `DocumentPrintEvent` — an immutable print/render evidence record

**Endpoint base:** `/api/v1/documents/<document_id>/print-events/`
**Access:** **admin/superadmin only — staff receive the parent's non-disclosing
`404`.**
**Owns:** an append-only evidentiary snapshot of a print/render. The frontend
computes the derived values (running balances, interest/tax, amount-in-words, USD)
and sends them here; the backend stores everything **verbatim** so a later
template/formula change can't retro-alter what was printed. Retained even after the
document is archived. The backend never claims physical printing — `print_status`
is limited to render/initiate/download/fail.

## 1. Fields (rows)

| Field                              | TS type                   | In req | In res | Req | Nullable | Server-set | Enum           | Validation | Notes                                         |
| ---------------------------------- | ------------------------- | ------ | ------ | --- | -------- | ---------- | -------------- | ---------- | --------------------------------------------- |
| `id`                               | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | UUID       | Primary key                                   |
| `document`                         | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | UUID       | Parent (from the path)                        |
| `document_revision`                | `string \| null`          | ✗¹     | ✓      | ✗   | Yes      | ✗          | —              | —          | ¹ sent as `revision_number` on create, not id |
| `applicant`                        | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | UUID       |                                               |
| `application_case`                 | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —              | UUID       |                                               |
| `document_type`                    | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | —          |                                               |
| `content_snapshot`                 | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          | Content printed                               |
| `resolved_applicant_data_snapshot` | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          | Applicant data as resolved at print           |
| `derived_values_snapshot`          | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          | **Frontend-computed**; stored verbatim        |
| `render_config_snapshot`           | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                               |
| `template_key`                     | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                               |
| `template_version`                 | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                               |
| `renderer_version`                 | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                               |
| `print_status`                     | `PrintStatus`             | ✓      | ✓      | ✗   | No       | ✗          | `print_status` | —          | Default `rendered`                            |
| `client_metadata`                  | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                               |
| `artifact`                         | `File`                    | ✓      | ✗      | ✗   | —        | ✗          | —              | multipart  | Optional rendered file; never echoed as data  |
| `artifact_checksum`                | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —              | sha-256    | Present when an artifact was uploaded         |
| `artifact_mime_type`               | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —              | —          |                                               |
| `printed_by`                       | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —              | UUID       | Actor user id                                 |
| `print_initiated_at`               | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601   |                                               |
| `request_id`                       | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | —          |                                               |
| `created_at`                       | `string`                  | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601   |                                               |

## 2. Types

```ts
type PrintStatus =
  | "rendered"
  | "print_initiated"
  | "artifact_downloaded"
  | "failed"; // see enums.md

interface DocumentPrintEvent {
  id: string;
  document: string;
  document_revision: string | null;
  applicant: string;
  application_case: string | null;
  document_type: string;
  content_snapshot: Record<string, unknown>;
  resolved_applicant_data_snapshot: Record<string, unknown>;
  derived_values_snapshot: Record<string, unknown>;
  render_config_snapshot: Record<string, unknown>;
  template_key: string;
  template_version: string;
  renderer_version: string;
  print_status: PrintStatus;
  client_metadata: Record<string, unknown>;
  artifact_checksum: string | null;
  artifact_mime_type: string | null;
  printed_by: string | null;
  print_initiated_at: string;
  request_id: string;
  created_at: string;
}

// Create payload. Sent as JSON, or multipart/form-data when `artifact` is present.
// Note: the revision is referenced by NUMBER on create, not by id.
interface DocumentPrintEventCreate {
  revision_number?: number;
  content_snapshot?: Record<string, unknown>;
  resolved_applicant_data_snapshot?: Record<string, unknown>;
  derived_values_snapshot?: Record<string, unknown>;
  render_config_snapshot?: Record<string, unknown>;
  template_key?: string;
  template_version?: string;
  renderer_version?: string;
  print_status?: PrintStatus;
  client_metadata?: Record<string, unknown>;
  artifact?: File;
}
```

## 3. Endpoints

### `GET /api/v1/documents/<document_id>/print-events/`

- **Returns:** `list[DocumentPrintEvent]`, paginated. Retained after archival.
- **Policy key:** `applicant.document.print_list`

### `POST /api/v1/documents/<document_id>/print-events/`

- **Request:** `DocumentPrintEventCreate` — JSON, or **multipart** when `artifact`
  is attached. `revision_number` (not a revision id) selects the revision.
- **Returns:** the created `DocumentPrintEvent`.
- **Policy key:** `applicant.document.print_create`

### `GET /api/v1/documents/<document_id>/print-events/<print_event_id>/`

- **Returns:** one `DocumentPrintEvent`.
- **Policy key:** `applicant.document.print_read`

## 4. Validations & business rules

- Append-only evidence — no update/delete; retained even when the document or
  applicant is archived.
- **Derived values are the frontend's responsibility** and are stored verbatim —
  the backend does not recompute them, so a later formula/template change does not
  alter a past print event.
- `print_status` never asserts physical printing.

## 5. Errors

| Code                              | HTTP | Trigger                                         | Suggested UI handling                     |
| --------------------------------- | ---- | ----------------------------------------------- | ----------------------------------------- |
| `APPLICANT_PRINT_EVENT_NOT_FOUND` | 404  | unknown print event id                          | refresh the print-event list              |
| `APPLICANT_DOCUMENT_NOT_FOUND`    | 404  | unknown document, **or staff** (non-disclosing) | not-found; for staff this means no access |

## 6. Examples

```jsonc
// POST /api/v1/documents/<id>/print-events/ — request (JSON, no artifact)
{
  "revision_number": 3,
  "content_snapshot": {
    /* what was rendered */
  },
  "derived_values_snapshot": {
    "closing_balance": "500000.00",
    "amount_in_words": "Five Hundred Thousand",
  },
  "print_status": "rendered",
}

// 201 — response.data (abridged)
{
  "id": "pe11…",
  "document": "dc42…",
  "document_revision": "rv03…",
  "applicant": "3f2a…",
  "application_case": null,
  "document_type": "applicant-bank-balance-certificate",
  "derived_values_snapshot": {
    "closing_balance": "500000.00",
    "amount_in_words": "Five Hundred Thousand",
  },
  "print_status": "rendered",
  "artifact_checksum": null,
  "artifact_mime_type": null,
  "printed_by": "user-9",
  "print_initiated_at": "2026-07-19T06:10:00Z",
  "created_at": "2026-07-19T06:10:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — append-only; no `record_version`.
- **Role projection:** uniform for admin; staff see nothing (404).
- **Server-computed (never send):** `id`, `document`, `applicant`,
  `application_case`, `document_type`, `printed_by`, `print_initiated_at`,
  `artifact_checksum`/`_mime_type`, `request_id`, timestamps.
- **The revision link is by number on create** (`revision_number`) but comes back
  as an id (`document_revision`) on read — don't send the id.
- **Multipart:** attach `artifact` only when uploading a rendered file; otherwise
  send JSON. Build the `FormData` at the api layer.
- **Compute-then-record:** the frontend computes derived values before POSTing;
  they are the source of truth for what was printed.
