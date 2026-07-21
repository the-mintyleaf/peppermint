# API Documentation — Client Directory

**App:** `clients`
**Version:** 1.5.0
**Base prefix:** `/api/v1/` (routes are `/api/v1/clients/…`)
**Auth:** Session-bound JWT; role-based permission classes (`clients/permissions.py`) — documented deviation from CLAUDE.md §9's interim inline pattern, matching the `applicant`/`authenticate` apps.
**Throttle:** DRF defaults. The bulk **export** (`GET /clients/export/`) and **import** (`POST /clients/import/`) endpoints are expensive/abuse-prone and SHOULD carry a per-user rate limit in deployment (concept §17.6); import is additionally bounded to 1000 rows per file. Configure via a DRF `ScopedRateThrottle` scope when throttle infrastructure is provisioned.
**Access level:** Staff-only (all endpoints deny unauthenticated → 401 and non-staff → 403). Lock/unlock are admin/superadmin-only.

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                              |
| ------- | ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | AI (Claude) | Initial API — Phase 1 foundation: list/create/read/update + archive/restore/lock/unlock                                                                              |
| 1.1.0   | 2026-07-20 | AI (Claude) | Phase 2 — nested contacts, addresses, aliases, tags; embedded children + broadened search/filters on client list/detail                                              |
| 1.2.0   | 2026-07-20 | AI (Claude) | Phase 2 logo — upload/replace/stream/remove + thumbnail; `logo_url`/`logo_thumbnail_url` on client list/detail; `has_logo` filter                                    |
| 1.3.0   | 2026-07-20 | AI (Claude) | Phase 3 search & integrity — ranked search + trigram acceleration; duplicate warnings on create/update + `override_reason`; `duplicate-check` and `lookup` endpoints |
| 1.4.0   | 2026-07-20 | AI (Claude) | Phase 4 integration — `document-prefill` packet (staff+) and `audit-events` read trail (admin+); domain-event outbox deferred                                        |
| 1.5.0   | 2026-07-20 | AI (Claude) | Phase 5 operational — merge + merge-history (admin+); CSV export (staff+) and import (admin+)                                                                        |

---

## Generic envelopes (referenced throughout)

**Success:**

```json
{ "success": true, "message": "...", "data": { ... }, "meta": {} }
```

**Error:**

```json
{
  "success": false,
  "error": { "code": "...", "message": "...", "details": {} },
  "meta": {}
}
```

List responses use the platform `StandardPagination` meta: `{ "count", "page", "page_size", "next", "previous" }` (concept §14.6's `{total, total_pages}` shape is deliberately replaced by the platform standard).

**AI debugging notes (app-wide):** Every read is role-scoped — staff receive a projection that omits `internal_notes` and lock actor/reason; admin/superadmin receive the full projection plus Bikram Sambat dual-output for `established_date`/`relationship_started_on`/`relationship_ended_on`. All mutations bump `record_version` and append a `ClientAuditEvent` in the same transaction. `PATCH`/archive/restore require the current `record_version` in the body; a mismatch is a `409`. A staff write against a locked record is a `423`.

---

## 1. Client

### 1.1 List — `GET /api/v1/clients/`

**Policy key(s):** `clients.client.list` (risk: medium)
**Request:** query params — `search`, `status`, `client_type`, `relationship_type`, `country` (alias `country_code`), `tag` (normalized tag name), `has_spokesperson` (bool), `has_logo` (bool), `is_locked`, `ordering` (Django-style, e.g. `-updated_at,legal_name`), `page`, `page_size`. Privileged actors additionally get `include_archived`, `created_from`/`created_to`, `updated_from`/`updated_to`.
**Response:** paginated list rows — role-scoped (`DATA_CONTRACT.md §1`). Each row embeds `primary_contact` and `spokesperson` (compact projections, or `null`) plus `logo_url`/`logo_thumbnail_url` (authenticated stream URLs, or `null`). Staff rows omit protected fields.
**Business rules:** archived rows are excluded unless a privileged actor passes `include_archived=true`. `search` matches (case-insensitive `icontains`) across legal/display name + romanized projections, `client_code`, normalized email/phone/domain, normalized registration/tax numbers, **aliases, active contact names, active address localities, and tag names** (`.distinct()`). `ordering` is whitelisted to `legal_name`, `display_name`, `client_code`, `created_at`, `updated_at`, `relationship_started_on`.
**Query access pattern:** the list queryset prefetches active contacts + current logo so the embedded fields add no per-row queries (§18.3). When `search` is present and no explicit `ordering` is given, results are **ranked** by match priority (exact code → exact registration/tax → exact name → exact alias → exact email/phone/domain → name prefix → contact-name → fuzzy; concept §10.2) via a DB `Case`/`Exists` annotation. Trigram GIN indexes accelerate the underlying `__icontains` on PostgreSQL (`DATA_CONTRACT.md` Search Indexes).
**Query access pattern:** single queryset, no N+1 (flat model, no related fan-out in Phase 1).

### 1.2 Create — `POST /api/v1/clients/`

**Policy key(s):** `clients.client.create` (risk: medium)
**Request:** `legal_name` (required), `client_type` (required), plus optional `display_name`, `relationship_type`, `status`, `website`, `primary_email`, `primary_phone`, `alternate_phone`, `registration_number`, `tax_number`, `country_code`, `established_date`, `description`, `source`, `relationship_started_on`, `relationship_ended_on`. Admin/superadmin may also set `internal_notes`.
**Response:** the created client (role-scoped detail); `201`.
**Validation rules:** see `DATA_CONTRACT.md §1`. Code, version, and search projections are server-set.
**Error codes:** `CLIENT_DATE_ORDER_INVALID` (400), `CLIENT_VALIDATION_FAILED` (400 via envelope on field errors).
**Business rules:** generates `client_code` from a per-year `select_for_update`-locked counter; normalizes text (§39.2), derives `*_romanized`/`normalized_*`/`website_domain`; records a `client_created` audit event. Runs duplicate detection (concept §11) — any matches are returned as non-blocking warnings in `meta.possible_duplicate` + `meta.duplicate_matches` (`DATA_CONTRACT.md` DuplicateMatch); the request may include an optional `override_reason`, which is recorded on the `client_duplicate_flagged` audit event.

### 1.3 Read — `GET /api/v1/clients/{id}/`

**Policy key(s):** `clients.client.read` (risk: medium)
**Response:** role-scoped detail (`DATA_CONTRACT.md §1`). Embeds `primary_contact`, `spokesperson`, the `contacts`, `addresses`, `aliases`, `tags` collections (active children; prefetched, no N+1), and `logo_url`/`logo_thumbnail_url`. Admin projection adds `internal_notes`, lock metadata, and `*_bs` dual-date fields.
**Error codes:** `CLIENT_NOT_FOUND` (404 — non-disclosing; also returned for a malformed UUID).

### 1.4 Update — `PATCH /api/v1/clients/{id}/`

**Policy key(s):** `clients.client.update` (risk: medium)
**Request:** any subset of the create fields the actor may edit, **plus the mandatory `record_version`**, an optional top-level `reason` (used when the patch changes `status`), and an optional `override_reason` (recorded if the update trips a duplicate warning).
**Response:** the updated client (role-scoped detail); `meta` carries duplicate warnings as on create.
**Error codes:** `CLIENT_ARCHIVED` (409), `CLIENT_RECORD_LOCKED` (423 — staff writing a locked record), `CLIENT_FIELD_FORBIDDEN` (403 — field outside the actor's whitelist), `CLIENT_VERSION_CONFLICT` (409 — stale `record_version`), `CLIENT_DATE_ORDER_INVALID` (400), `CLIENT_STATUS_TRANSITION_INVALID` (422), `CLIENT_STATUS_REASON_REQUIRED` (400).
**Business rules:** guard order is archived → lock (staff) → field whitelist → version → date order → status transition. Version bump + `client_updated` audit always; an extra `client_status_changed` audit (with `from`/`to` metadata) when status changes.

### 1.5 Archive — `POST /api/v1/clients/{id}/archive/`

**Policy key(s):** `clients.client.archive` (risk: high)
**Request:** `record_version` (required), optional `reason`.
**Response:** the archived client (`status` → `archived`, `archived_at` set).
**Error codes:** `CLIENT_ARCHIVED` (409 — already archived), `CLIENT_VERSION_CONFLICT` (409).
**Business rules:** soft delete only; never a physical delete. Records a `client_archived` audit event.

### 1.6 Restore — `POST /api/v1/clients/{id}/restore/`

**Policy key(s):** `clients.client.restore` (risk: medium)
**Request:** `record_version` (required), optional `status` (target non-archived status, default `active`), optional `reason`.
**Response:** the restored client.
**Error codes:** `CLIENT_NOT_ARCHIVED` (409), `CLIENT_RESTORE_STATUS_INVALID` (400 — target is `archived` or invalid), `CLIENT_VERSION_CONFLICT` (409).
**Business rules:** clears `archived_at`/`archived_by`, sets the chosen status; records a `client_restored` audit event.

### 1.7 Lock — `POST /api/v1/clients/{id}/lock/`

**Policy key(s):** `clients.client.lock` (risk: high) — **admin/superadmin only**
**Request:** `reason` (required, non-blank).
**Response:** the locked client (admin detail).
**Error codes:** `CLIENT_ARCHIVED` (409), `CLIENT_ALREADY_LOCKED` (409), `CLIENT_LOCK_REASON_REQUIRED` (400).
**Business rules:** sets lock flag/actor/timestamp/reason; records a `client_locked` audit event. While locked, staff updates are rejected with `423`.

### 1.8 Unlock — `POST /api/v1/clients/{id}/unlock/`

**Policy key(s):** `clients.client.unlock` (risk: high) — **admin/superadmin only**
**Request:** `reason` (required, non-blank).
**Response:** the unlocked client (admin detail).
**Error codes:** `CLIENT_NOT_LOCKED` (409), `CLIENT_LOCK_REASON_REQUIRED` (400).
**Business rules:** clears lock fields; records a `client_unlocked` audit event.

### 1.9 Lookup — `GET /api/v1/clients/lookup/`

**Policy key(s):** `clients.client.lookup` (risk: low). **Request:** optional `search`. **Response:** a reduced, ranked list of non-archived clients — the Lookup row shape (`DATA_CONTRACT.md` Lookup row): identity + contact essentials + embedded `primary_contact`/`spokesperson` + `logo_thumbnail_url`. Capped at 50; intended for dropdowns and document-prefill forms (FR-013). Not paginated.

### 1.10 Duplicate check — `POST /api/v1/clients/duplicate-check/`

**Policy key(s):** `clients.client.duplicate_check` (risk: low). **Request:** any of `legal_name`, `primary_email`, `primary_phone`, `website`, `registration_number`, `tax_number`, `exclude_id`. **Response:** `{ "matches": [ DuplicateMatch, … ] }` (`DATA_CONTRACT.md` DuplicateMatch) — a privacy-safe preflight so the UI can warn before submitting a create/update. Never creates a record; matches are advisory only.

### 1.11 Document prefill — `GET /api/v1/clients/{id}/document-prefill/`

**Policy key(s):** `clients.client.document_prefill` (risk: low). **Response:** the Document-prefill packet (`DATA_CONTRACT.md` Document-prefill packet) — a read-time snapshot of the client's reusable identity/contact/spokesperson/logo fields for document forms (FR-013/§15). Excludes `internal_notes`; non-archived only (404 otherwise). **Historical-safety contract:** the consumer must copy these values into the document at generation time; rendering must not depend on the live client record so later edits never mutate issued documents.

### 1.12 Audit trail — `GET /api/v1/clients/{id}/audit-events/`

**Policy key(s):** `clients.audit_event.list` (risk: medium) — **admin/superadmin only**. **Response:** paginated immutable audit events (`DATA_CONTRACT.md §2`), newest first, for the audit UI. Includes `event_type`, `actor`, `reason`, `changed_fields`, sanitized `metadata`, `request_id`, `created_at`.

### 1.13 Merge — `POST /api/v1/clients/{id}/merge/`

**Policy key(s):** `clients.client.merge` (risk: high) — **admin/superadmin only**. `{id}` is the **surviving** client. **Request:** `duplicate_id` (required), `reason` (required), optional `field_resolutions` (`{field: "duplicate"}` to take that field's value from the duplicate; only `DATA_CONTRACT.md §10` merge-resolvable fields apply). **Response:** the survivor (admin detail); `meta` carries `merge_record_id` + `transferred` counts. **Errors:** `CLIENT_MERGE_SELF` (400), `CLIENT_MERGE_REASON_REQUIRED` (400), `CLIENT_MERGE_TARGET_NOT_FOUND` (404), `CLIENT_MERGE_ALREADY_MERGED` (409), `CLIENT_MERGE_ARCHIVED` (409). **Business rules:** one transaction; children transfer to the survivor, the duplicate is retained + archived pointing at the survivor, an immutable `ClientMergeRecord` + `client_merged` audit event are written (concept §11.3).

### 1.14 Merge history — `GET /api/v1/clients/{id}/merge-history/`

**Policy key(s):** `clients.merge_record.list` (risk: low) — **admin/superadmin only**. **Response:** paginated `ClientMergeRecord` rows (`DATA_CONTRACT.md §10`) where the client is the survivor or the folded duplicate.

### 1.15 Export CSV — `GET /api/v1/clients/export/`

**Policy key(s):** `clients.client.export` (risk: medium). **Response:** streamed `text/csv` (`Content-Disposition: attachment`) of the filtered directory (`DATA_CONTRACT.md` CSV export/import) — same query params as §1.1 list. Staff omit `internal_notes`; privileged actors get it and may include archived. **Throttle:** see header note.

### 1.16 Import CSV — `POST /api/v1/clients/import/`

**Policy key(s):** `clients.client.import` (risk: high) — **admin/superadmin only**. **Request:** multipart `file` (CSV). **Response:** `{ created, failed, created_ids, errors }` (`DATA_CONTRACT.md` CSV export/import). Each row reuses the create serializer + `create_client` (identical validation/audit), `source=import`; max 1000 rows. **Errors:** `CLIENT_IMPORT_INVALID` (400), `CLIENT_IMPORT_TOO_LARGE` (400). Per-row validation failures are reported in `errors`, not fatal.

---

## 2. Contacts (Phase 2 — staff+)

All contact endpoints are nested under a client and follow the parent's lock/archive guard (a locked client rejects staff child writes with `423`; an archived client rejects all with `409`). `notes` is admin-only (staff read omits it; staff write cannot set it). Roles are auto-exclusive: at most one active `is_primary_contact` and one active `is_spokesperson` per client — setting one demotes any prior holder in the same transaction.

### 2.1 List — `GET /api/v1/clients/{client_id}/contacts/`

**Policy key(s):** `clients.contact.list` (risk: low). Privileged actors may pass `include_inactive=true`. Response: role-scoped contact list (`DATA_CONTRACT.md §4`).

### 2.2 Create — `POST /api/v1/clients/{client_id}/contacts/`

**Policy key(s):** `clients.contact.create` (risk: medium). Request: `full_name` (required) + optional contact fields; admin may send `notes`. **Errors:** `CLIENT_CONTACT_DETAIL_REQUIRED` (400), `CLIENT_CONTACT_DATE_ORDER_INVALID` (400), `CLIENT_INACTIVE_CONTACT_ROLE` (400), `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

### 2.3 Read — `GET /api/v1/clients/{client_id}/contacts/{contact_id}/`

**Policy key(s):** `clients.contact.read` (risk: low). **Errors:** `CLIENT_CONTACT_NOT_FOUND` (404).

### 2.4 Update — `PATCH /api/v1/clients/{client_id}/contacts/{contact_id}/`

**Policy key(s):** `clients.contact.update` (risk: medium). Same validation/errors as create.

### 2.5 Deactivate — `DELETE /api/v1/clients/{client_id}/contacts/{contact_id}/`

**Policy key(s):** `clients.contact.delete` (risk: medium). Soft-deactivates (`is_active=false`) and clears both roles; records `client_contact_deactivated`.

---

## 3. Addresses (Phase 2 — staff+)

### 3.1 List — `GET /api/v1/clients/{client_id}/addresses/`

**Policy key(s):** `clients.address.list` (risk: low). Privileged actors may pass `include_inactive=true`. Response: `DATA_CONTRACT.md §5`.

### 3.2 Create — `POST /api/v1/clients/{client_id}/addresses/`

**Policy key(s):** `clients.address.create` (risk: medium). Request: `address_type` + `line_1` required. At most one active `is_primary` per client — the service demotes any prior primary. **Errors:** `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

### 3.3 Update — `PATCH /api/v1/clients/{client_id}/addresses/{address_id}/`

**Policy key(s):** `clients.address.update` (risk: medium). **Errors:** `CLIENT_ADDRESS_NOT_FOUND` (404).

### 3.4 Deactivate — `DELETE /api/v1/clients/{client_id}/addresses/{address_id}/`

**Policy key(s):** `clients.address.delete` (risk: medium). Soft-deactivates and clears the primary flag; records `client_address_deactivated`.

---

## 4. Aliases (Phase 2 — staff+)

### 4.1 List — `GET /api/v1/clients/{client_id}/aliases/`

**Policy key(s):** `clients.alias.list` (risk: low). Response: `DATA_CONTRACT.md §6`.

### 4.2 Add — `POST /api/v1/clients/{client_id}/aliases/`

**Policy key(s):** `clients.alias.create` (risk: medium). Request: `alias` (required), optional `alias_type`. **Errors:** `CLIENT_ALIAS_DUPLICATE` (409 — normalized duplicate for the client), `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

### 4.3 Remove — `DELETE /api/v1/clients/{client_id}/aliases/{alias_id}/`

**Policy key(s):** `clients.alias.delete` (risk: medium). Hard-deletes; records `client_alias_removed`. **Errors:** `CLIENT_ALIAS_NOT_FOUND` (404).

---

## 5. Tags (Phase 2 — staff+)

### 5.1 Catalog — `GET /api/v1/clients/tags/`

**Policy key(s):** `clients.tag.list` (risk: low). Company-wide tag catalog for filter dropdowns; optional `search`. Response: `DATA_CONTRACT.md §7`.

### 5.2 List assignments — `GET /api/v1/clients/{client_id}/tags/`

**Policy key(s):** `clients.tag_assignment.list` (risk: low). Response: `DATA_CONTRACT.md §8` (tag nested).

### 5.3 Assign — `POST /api/v1/clients/{client_id}/tags/`

**Policy key(s):** `clients.tag_assignment.create` (risk: medium). Request: `name` (required) — resolves or creates the catalog tag (case/whitespace-normalized), then links it. **Errors:** `CLIENT_TAG_ALREADY_ASSIGNED` (409), `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

### 5.4 Unassign — `DELETE /api/v1/clients/{client_id}/tags/{assignment_id}/`

**Policy key(s):** `clients.tag_assignment.delete` (risk: medium). Removes the link (catalog tag persists); records `client_tag_removed`. **Errors:** `CLIENT_TAG_ASSIGNMENT_NOT_FOUND` (404).

---

## 6. Logo (Phase 2 — staff+)

Logos are stored in private on-prem media (`base_url=None`) — there is **no public URL**; the client reads a logo only through the authenticated stream endpoints below, and gets those URLs from `logo_url`/`logo_thumbnail_url` on the client read/list. Image only (JPEG/PNG/WebP, validated from content); SVG is disabled until sanitization exists. Logo endpoints inherit the parent lock/archive guard (locked → 423, archived → 409).

### 6.1 Upload / replace — `POST /api/v1/clients/{client_id}/logo/`

**Policy key(s):** `clients.logo.create` (risk: medium). **Request:** `multipart/form-data` with `file`. **Response:** `{ logo_id, checksum, mime_type, width, height }`; `201`. **Business rules:** content MIME-sniffed via Pillow (spoofed extension rejected), size ≤ 5 MB, dimensions ≤ 4096×4096; a PNG thumbnail (≤256×256) is generated; the prior current logo is retired (`is_current=false`, file retained); records `client_logo_uploaded`. **Errors:** `CLIENT_LOGO_INVALID` (400), `CLIENT_LOGO_TYPE_UNSUPPORTED` (415), `CLIENT_LOGO_TOO_LARGE` (413), `CLIENT_LOGO_DIMENSIONS_INVALID` (400), `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

### 6.2 Stream original — `GET /api/v1/clients/{client_id}/logo/`

**Policy key(s):** `clients.logo.read` (risk: low). Streams the current logo inline (`Content-Disposition: inline`) with its stored MIME. **Errors:** `CLIENT_LOGO_NOT_FOUND` (404).

### 6.3 Stream thumbnail — `GET /api/v1/clients/{client_id}/logo/thumbnail/`

**Policy key(s):** `clients.logo.read_thumbnail` (risk: low). Streams the PNG thumbnail. **Errors:** `CLIENT_LOGO_NOT_FOUND` (404).

### 6.4 Remove — `DELETE /api/v1/clients/{client_id}/logo/`

**Policy key(s):** `clients.logo.delete` (risk: medium). Retires the current logo (soft; file retained per §9.7); records `client_logo_removed`. **Errors:** `CLIENT_LOGO_NOT_FOUND` (404), `CLIENT_RECORD_LOCKED` (423), `CLIENT_ARCHIVED` (409).

---

## Error code reference

All codes are defined in `clients/constants.py` (`ClientErrorCode`). Envelope translation happens in `ClientAPIView.handle_exception`.

| Code                                | HTTP | Notes                                                      |
| ----------------------------------- | ---- | ---------------------------------------------------------- |
| `CLIENT_NOT_FOUND`                  | 404  | Unknown or malformed client id (non-disclosing)            |
| `CLIENT_VERSION_CONFLICT`           | 409  | Stale `record_version` on update/archive/restore           |
| `CLIENT_RECORD_LOCKED`              | 423  | Staff attempted to modify a locked client                  |
| `CLIENT_FIELD_FORBIDDEN`            | 403  | Field outside the actor's editable whitelist               |
| `CLIENT_STATUS_TRANSITION_INVALID`  | 422  | Status change not allowed from the current status          |
| `CLIENT_STATUS_REASON_REQUIRED`     | 400  | Reason missing for a reason-required status change         |
| `CLIENT_ALREADY_LOCKED`             | 409  | Lock requested on an already-locked client                 |
| `CLIENT_NOT_LOCKED`                 | 409  | Unlock requested on a client that is not locked            |
| `CLIENT_LOCK_REASON_REQUIRED`       | 400  | Lock/unlock reason missing or blank                        |
| `CLIENT_ARCHIVED`                   | 409  | Mutation attempted on an archived client                   |
| `CLIENT_NOT_ARCHIVED`               | 409  | Restore requested on a non-archived client                 |
| `CLIENT_RESTORE_STATUS_INVALID`     | 400  | Restore target status invalid (e.g. `archived`)            |
| `CLIENT_DATE_ORDER_INVALID`         | 400  | `relationship_ended_on` precedes `relationship_started_on` |
| `CLIENT_CODE_INVALID`               | 400  | Client code fails the `CL-YYYY-NNNNNN` format              |
| `CLIENT_VALIDATION_FAILED`          | 400  | Generic serializer validation failure                      |
| `CLIENT_CONTACT_NOT_FOUND`          | 404  | Unknown contact for the client                             |
| `CLIENT_CONTACT_DETAIL_REQUIRED`    | 400  | Contact lacks email/phone/designation/department           |
| `CLIENT_CONTACT_DATE_ORDER_INVALID` | 400  | `valid_until` precedes `valid_from`                        |
| `CLIENT_INACTIVE_CONTACT_ROLE`      | 400  | Inactive contact cannot be primary/spokesperson            |
| `CLIENT_ADDRESS_NOT_FOUND`          | 404  | Unknown address for the client                             |
| `CLIENT_ALIAS_NOT_FOUND`            | 404  | Unknown alias for the client                               |
| `CLIENT_ALIAS_DUPLICATE`            | 409  | Normalized alias already exists for the client             |
| `CLIENT_TAG_NOT_FOUND`              | 404  | Unknown tag                                                |
| `CLIENT_TAG_ALREADY_ASSIGNED`       | 409  | Tag already assigned to the client                         |
| `CLIENT_TAG_ASSIGNMENT_NOT_FOUND`   | 404  | Unknown tag assignment for the client                      |
| `CLIENT_LOGO_NOT_FOUND`             | 404  | No current logo/thumbnail for the client                   |
| `CLIENT_LOGO_INVALID`               | 400  | Uploaded file is not a valid image                         |
| `CLIENT_LOGO_TYPE_UNSUPPORTED`      | 415  | Logo image type not allowed (JPEG/PNG/WebP only)           |
| `CLIENT_LOGO_TOO_LARGE`             | 413  | Logo exceeds the 5 MB size limit                           |
| `CLIENT_LOGO_DIMENSIONS_INVALID`    | 400  | Logo dimensions exceed 4096×4096                           |
| `CLIENT_MERGE_SELF`                 | 400  | A client cannot be merged into itself                      |
| `CLIENT_MERGE_REASON_REQUIRED`      | 400  | Merge reason missing or blank                              |
| `CLIENT_MERGE_TARGET_NOT_FOUND`     | 404  | Duplicate or surviving client not found                    |
| `CLIENT_MERGE_ALREADY_MERGED`       | 409  | One of the clients is already merged                       |
| `CLIENT_MERGE_ARCHIVED`             | 409  | Surviving client is archived                               |
| `CLIENT_IMPORT_INVALID`             | 400  | Import file missing or not valid CSV                       |
| `CLIENT_IMPORT_TOO_LARGE`           | 400  | Import file exceeds the 1000-row limit                     |
