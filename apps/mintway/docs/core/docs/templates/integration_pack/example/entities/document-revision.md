# `DocumentRevision` — an immutable per-edit content snapshot

**Endpoint base:** `/api/v1/documents/<document_id>/revisions/`
**Access:** **admin/superadmin only — staff receive the parent's non-disclosing
`404`.**
**Owns:** an append-only snapshot of a document's content, auto-created on **every
persisted content edit**. Immutable: you can read revisions and _restore_ one, but
restoring appends a **new** revision — it never rewrites an old one. Read-only from
the client's side (there is no create/update/delete payload).

## 1. Fields (rows)

All fields are response-only (`Server-set`); the client never authors a revision.

| Field                    | TS type                   | In req | In res | Req | Nullable | Server-set | Enum     | Validation | Notes                              |
| ------------------------ | ------------------------- | ------ | ------ | --- | -------- | ---------- | -------- | ---------- | ---------------------------------- |
| `id`                     | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | UUID       | Primary key                        |
| `document`               | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | UUID       | Parent document                    |
| `revision_number`        | `number`                  | ✗      | ✓      | —   | No       | ✓          | —        | integer    | Unique per document; 1-based       |
| `content_snapshot`       | `Record<string, unknown>` | ✗      | ✓      | —   | No       | ✓          | —        | —          | The document content at this point |
| `label_snapshot`         | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          |                                    |
| `status_snapshot`        | `DocumentStatus`          | ✗      | ✓      | —   | No       | ✓          | `status` | —          | Status at snapshot time            |
| `document_type_snapshot` | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          |                                    |
| `schema_version`         | `number`                  | ✗      | ✓      | —   | No       | ✓          | —        | integer    |                                    |
| `template_key`           | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          |                                    |
| `template_version`       | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          |                                    |
| `change_reason`          | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          |                                    |
| `changed_fields`         | `string[]`                | ✗      | ✓      | —   | No       | ✓          | —        | —          | Field _names_ only                 |
| `previous_revision`      | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —        | UUID       | Null on the first revision         |
| `changed_by`             | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —        | UUID       | Actor user id                      |
| `request_id`             | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | —          | Correlation id                     |
| `content_checksum`       | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | sha-256    | Fixes this snapshot                |
| `created_at`             | `string`                  | ✗      | ✓      | —   | No       | ✓          | —        | ISO 8601   |                                    |

## 2. Types

```ts
import type { DocumentStatus } from "./document"; // see document.md / enums.md

interface DocumentRevision {
  id: string;
  document: string;
  revision_number: number;
  content_snapshot: Record<string, unknown>;
  label_snapshot: string;
  status_snapshot: DocumentStatus;
  document_type_snapshot: string;
  schema_version: number;
  template_key: string;
  template_version: string;
  change_reason: string;
  changed_fields: string[];
  previous_revision: string | null;
  changed_by: string | null;
  request_id: string;
  content_checksum: string;
  created_at: string;
}
// No Create/Update type — revisions are server-authored. Restore takes no body
// (an optional `{ change_reason?: string }` may be accepted — confirm; see gaps.md).
```

## 3. Endpoints

### `GET /api/v1/documents/<document_id>/revisions/`

- **Returns:** `list[DocumentRevision]`, paginated, newest first.
- **Policy key:** `applicant.document.revision_list`

### `GET /api/v1/documents/<document_id>/revisions/<revision_number>/`

- **Returns:** one `DocumentRevision`.
- **Policy key:** `applicant.document.revision_read`

### `POST /api/v1/documents/<document_id>/revisions/<revision_number>/restore/`

- **Purpose:** restore a prior revision **as a new revision** (the document's
  current content becomes a copy of the target; a fresh revision is appended).
- **Request:** none required (optional `change_reason` — confirm, see `gaps.md`).
- **Returns:** the newly created `DocumentRevision` (the restore result).
- **Side effects:** advances the document's `current_revision_number`; the old
  revision is untouched.
- **Policy key:** `applicant.document.revision_restore`

## 4. Validations & business rules

- Immutable: no create/update/delete from the client — a revision only appears as
  a side effect of a document content edit.
- Restore never mutates history; it appends.

## 5. Errors

| Code                           | HTTP | Trigger                                         | Suggested UI handling                     |
| ------------------------------ | ---- | ----------------------------------------------- | ----------------------------------------- |
| `APPLICANT_REVISION_NOT_FOUND` | 404  | unknown `revision_number`                       | refresh the revision list                 |
| `APPLICANT_DOCUMENT_NOT_FOUND` | 404  | unknown document, **or staff** (non-disclosing) | not-found; for staff this means no access |

## 6. Examples

```jsonc
// GET /api/v1/documents/<id>/revisions/2/ — response.data
{
  "id": "rv02…",
  "document": "dc42…",
  "revision_number": 2,
  "content_snapshot": {
    /* the document content at revision 2 */
  },
  "label_snapshot": "Bank balance — ANZ",
  "status_snapshot": "draft",
  "document_type_snapshot": "applicant-bank-balance-certificate",
  "schema_version": 1,
  "template_key": "",
  "template_version": "",
  "change_reason": "Corrected account holder",
  "changed_fields": ["account_holder"],
  "previous_revision": "rv01…",
  "changed_by": "user-9",
  "request_id": "req-abc",
  "content_checksum": "e3b0c442…",
  "created_at": "2026-07-19T05:40:00Z",
}

// POST /api/v1/documents/<id>/revisions/1/restore/ → 201, returns the NEW revision
{ "id": "rv03…", "revision_number": 3, "previous_revision": "rv02…" }
```

## 7. UI / integration notes

- **Concurrency:** N/A — read-only + restore; no `record_version`.
- **Role projection:** uniform for admin; staff see nothing (404).
- **Server-computed:** everything — the client authors none of it.
- **Modeling:** render as an immutable history list; "restore" is an action that
  appends, so re-fetch the document + revisions after it. Show
  `revision_number` and `change_reason`; diff via `changed_fields`.
- **Media/streaming:** none.
