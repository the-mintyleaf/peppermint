# Integration — Uploaded Files

**Owner app:** `uploaded_files`
**Version:** 1.0.1
**Status:** Active
**Synced:** 2026-07-26 (from `.backend/backend/uploaded_files/docs/{API,DATA_CONTRACT,SECURITY}.md`)

> Re-sync with `/sync-api grandway uploaded_files` when the backend's
> Change History moves past version 1.0.1.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 10 endpoints, one resource, the project's first file storage                                                                                                                                                       |
| 1.0.1   | 2026-07-24 | Closed an authorization leak: a Lead Manager could list/download files owned by a `document` or a print snapshot. Split `UPLOADED_FILES_FILE_EMPTY` out of `..._FILE_TOO_LARGE`, added `superseded_by_username`, corrected a nullable-field count |

---

## 1. Module

- **Name:** Uploaded Files — the platform's file ledger. Every stored file in
  Grandway lives here: what it is, which record it belongs to, whether a
  reviewer accepted it, what it replaced, and whether it is still in active
  use. **The only module in the system where bytes are stored at all.**
- **Base path:** `/api/v1/files/`
- **Auth:** Bearer access JWT on every endpoint. `admin` and `lead_manager`
  may list, read, edit, upload, replace, download, and read version chains.
  **Only `admin`** may verify, archive, or restore. `superadmin` is refused on
  every route.
- **The rule that's easy to miss:** a file whose owner is a `document` or a
  `snapshot` is **Admin-only in every respect** — a Lead Manager cannot see it
  in a list, cannot read it, cannot download it, cannot create one. A file
  inherits the visibility of the record it belongs to.

## 2. Requires

| Depends on                      | Kind              | Why                                                                                                                                           | What breaks without it                                                                            |
| ------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `authenticate`                  | framework + FK    | Issues the JWT and supplies `authority_type`, the whole access check here; `uploaded_by`/reviewer/archiver/superseder reference user accounts | Every endpoint 401s; no file could record who acted                                               |
| `applicants`                    | FK + service call | Applicant-owned files resolve through `applicants.selectors.get_applicant_by_id`                                                              | `POST` with `applicant=` returns `UPLOADED_FILES_OWNER_NOT_FOUND` for any id that doesn't resolve |
| `applicant_journeys`            | FK + service call | Same, journey-owned files                                                                                                                     | No journey could hold a file                                                                      |
| `offers`                        | FK + service call | Same, offer-owned files                                                                                                                       | No offer could hold its letter                                                                    |
| `documents`                     | FK + service call | Same, document-owned files                                                                                                                    | No document could hold an attachment                                                              |
| `document_history`              | FK + service call | Same, snapshot-owned files                                                                                                                    | No print snapshot could hold a generated PDF                                                      |
| `audit`                         | service call      | Every write **and every download** appends one immutable event                                                                                | Writes still succeed, but nothing records who uploaded/reviewed/archived/downloaded               |
| Local filesystem (`MEDIA_ROOT`) | infrastructure    | The byte store. **No URL maps to it in any environment**                                                                                      | Uploads fail; existing rows 404 `UPLOADED_FILES_FILE_BYTES_MISSING` on download                   |

**Note for consumers:** nothing outside this module references it by foreign
key. There is no "attach" action on any other module's endpoints —
`applicants`/`offers`/`documents`/`document_history` have no file field. To
attach a file you `POST /api/v1/files/` with the owner id; to show an owner's
files you `GET /api/v1/files/?<owner>=<id>`. The relationship is strictly
one-way.

## 3. Conventions

- **Response/Error envelopes:** the project standard — `{ success, message, data, meta }` /
  `{ success: false, error: { code, message, details }, meta }`. See `CORE_INTEGRATION.md` §3.
  **The one exception is download**, which returns raw bytes on success (still the
  standard envelope on failure).
- **Auth failures:** `UPLOADED_FILES_ACTOR_FORBIDDEN` (403) replaces the
  project-wide `PERMISSION_DENIED` for this module — a handler keyed only on
  the global code will never fire here. All three refusal reasons
  (superadmin/lead-manager-on-admin-route/owner-visibility) share this one
  code and differ only in `message` — **do not branch on `message`**, decide
  what to render from the authority you already hold.
- **Authority is checked before existence** on every per-file route — a caller
  who may not act cannot use 404-vs-403 to probe for valid ids. **Owner
  visibility is checked after existence and reported as 404**, for the
  opposite reason — a 403 there would confirm a `document`/`snapshot`-owned
  file exists, which those modules hide from a Lead Manager.
- **Success statuses:** `201` for upload and replace (both create a resource);
  `200` for everything else including the three lifecycle actions. **No `204`
  anywhere** — every response carries a body. **No `409` anywhere in this
  module** — domain-rule violations are `400`.
- **`error.details` rule, stated once:** every `UPLOADED_FILES_FILE_*` upload
  rejection keys under `file`; `UPLOADED_FILES_OWNER_NOT_FOUND` keys under the
  owner field that failed; `UPLOADED_FILES_FIELD_IMMUTABLE` keys under **each**
  refused field; `UPLOADED_FILES_REJECTION_REASON_REQUIRED` and
  `UPLOADED_FILES_ARCHIVE_REASON_REQUIRED` key under `reason`. **Every other
  code returns `details: {}`** — including all 403s, all 404s,
  `UPLOADED_FILES_ALREADY_SUPERSEDED`, `UPLOADED_FILES_FILE_ARCHIVED`,
  `UPLOADED_FILES_ALREADY_ARCHIVED`, `UPLOADED_FILES_NOT_ARCHIVED`.
- **Pagination:** `page`/`page_size` (default 20, max 100, clamped not
  rejected). `data` is a **bare array**, not nested under `results`. `meta`
  carries `count` (total across all pages), `page`, `page_size`, `next`,
  `previous` (absolute URLs or `null`). **Applies to the list endpoint only —
  the version-chain endpoint is unpaginated** and returns `meta: { count }`
  (the chain length).
- **Ordering is fixed, not client-controllable.** No `sort`/`ordering` param
  anywhere. The list is newest-created first; the version chain is **oldest
  first**, deliberately the opposite direction, because a chain reads as a
  history.
- **IDs:** UUID strings everywhere. **Times:** ISO 8601 UTC. Three fields
  carry a `_bs` (Bikram Sambat) sibling — `created_at_bs`, `reviewed_at_bs`,
  `archived_at_bs` — each an object or `null` while its Gregorian field is
  null. `updated_at` and `superseded_at` have **no** sibling. `_bs` objects are
  read-only — never send one.
- **Empty text fields are `""`, never `null`.** The nullable fields are
  exactly nine: `replaces`, `superseded_at`, `superseded_by_username`,
  `reviewed_at`, `reviewed_at_bs`, `reviewed_by_username`, `archived_at`,
  `archived_at_bs`, `archived_by_username`.
- **Filter params — `GET /files/`:** `applicant`/`journey`/`offer`/`document`/`snapshot`
  (UUID, narrows to that owner), `category`/`verification_status`/`upload_source`
  (enum), `is_archived` (bool — **omitting it returns archived files too**,
  pass `false` for active-only), `is_current` (bool — `false` = only
  superseded versions), `checksum` (exact match, duplicate discovery),
  `search` (substring of `original_filename` **only**, not `notes`). A
  recognised parameter with an invalid value is `400`; an **unrecognised**
  parameter is silently ignored. No multi-value syntax — `?category=a,b` is one
  invalid value.
- **Request encoding:** `application/json` except `POST /files/` and
  `POST /files/<id>/replace/`, which are `multipart/form-data`.
- **The bytes are never in a JSON response.** No `file` field, no URL, no
  storage path in any payload, ever. `GET /files/<id>/download/` is the only
  way to obtain contents. **Never build `<img src>` or `<a href>` against
  anything in a file payload** — there is no address to point at; it requires
  the bearer token, so fetch as a blob and hand the browser an object URL.

## 4. Models

**UploadedFile — the one shape** (list, detail, upload, replace, every
lifecycle action): `{ id, owner_type: enum, owner_id, category: enum,
upload_source: enum, original_filename, content_type, size_bytes: int,
checksum_sha256, version_number: int, replaces?, is_current: bool,
superseded_at?, superseded_by_username?, verification_status: enum,
is_verified: bool, rejection_reason, reviewed_at?, reviewed_at_bs?: json,
reviewed_by_username?, is_archived: bool, archive_reason, archived_at?,
archived_at_bs?: json, archived_by_username?, notes, uploaded_by_username,
created_at, created_at_bs: json, updated_at }`.

- **There is no `file` field and there never will be.** No path, no URL. Use
  the download endpoint.
- `owner_type`/`owner_id` are **derived**, read off whichever of the five
  owner FKs is set. **Exactly one owner always** — a database constraint, not
  only validation.
- `is_current` (nothing has replaced this) and `is_archived` (out of active
  use) are **independent axes** — a file can be archived and current, or
  superseded and not archived. A UI that collapses them will misreport version
  chains.
- `replaces` is the predecessor's id, or `null` for a v1.
- **Actors are usernames, not ids** — `uploaded_by_username`,
  `reviewed_by_username`, `archived_by_username`, `superseded_by_username` have
  no user UUID beside them; you cannot link to a profile or join on them.
- **A brand-new upload:** `version_number: 1`, `replaces: null`,
  `is_current: true`, `verification_status: "pending"`, `is_verified: false`,
  every review/archive field null-or-empty.
- **`upload_source` is caller-asserted, not verified.** Treat it as a label,
  not provenance.

## 5. Enums

- **`owner_type`** (derived, 5): `applicant` \| `journey` \| `offer` \|
  `document` \| `snapshot`.
- **`category`** (11): `passport` \| `photograph` \| `academic_transcript` \|
  `academic_certificate` \| `test_score_report` \| `offer_letter` \|
  `financial` \| `sponsorship` \| `signature_image` \| `generated_document` \|
  `other`.
- **`upload_source`** (2): `staff_upload` \| `system_generated` (defaults to
  `staff_upload`).
- **`verification_status`** (3): `pending` \| `verified` \| `rejected` — but
  the verify action **accepts only `verified`/`rejected`**; `pending` is a
  starting state, not a settable verdict.
- **Accepted upload extensions** (not a response enum): `pdf` \| `jpg` \|
  `jpeg` \| `png` \| `webp` \| `docx` \| `xlsx`, ≤ 10 MB (10,485,760 bytes),
  checked by extension **and** leading-byte signature.

## 6. Dependency order

1. The owning record (`Applicant`, `ApplicantJourney`, `Offer`, `Document`, or
   `DocumentSnapshot` — all external modules) must already exist. **Nothing in
   this module can be created first.**
2. `POST /api/v1/files/` against that owner → `UploadedFile` v1.
3. A replace needs the v1 (or latest) file it supersedes.
4. A verdict/archive/restore each need an existing file, in the appropriate
   lifecycle state.

## 7. Endpoints

All 10. Global auth failures (`UPLOADED_FILES_ACTOR_FORBIDDEN` 403, 401 from
`authenticate`) apply to every row and are not repeated below.

| Endpoint                       | Method | Policy key                     | Auth                    | Notes                                                                               |
| ------------------------------ | ------ | ------------------------------ | ----------------------- | ----------------------------------------------------------------------------------- |
| `/api/v1/files/`               | GET    | `uploaded_files.file.list`     | Admin or Lead Manager   | Every files panel in the product is this endpoint with a filter                     |
| `/api/v1/files/`               | POST   | `uploaded_files.file.upload`   | Admin or Lead Manager\* | `multipart/form-data`. \*Lead Manager forbidden when owner is `document`/`snapshot` |
| `/api/v1/files/<id>/`          | GET    | `uploaded_files.file.read`     | Admin or Lead Manager   | Metadata only, never bytes                                                          |
| `/api/v1/files/<id>/`          | PATCH  | `uploaded_files.file.update`   | Admin or Lead Manager   | `category`/`notes` only                                                             |
| `/api/v1/files/<id>/download/` | GET    | `uploaded_files.file.download` | Admin or Lead Manager   | Raw bytes, not JSON. **Audited** — the only audited read in the API                 |
| `/api/v1/files/<id>/versions/` | GET    | `uploaded_files.file.versions` | Admin or Lead Manager   | Oldest first, unpaginated                                                           |
| `/api/v1/files/<id>/replace/`  | POST   | `uploaded_files.file.replace`  | Admin or Lead Manager   | `multipart/form-data`. Returns a **new** file id, 201                               |
| `/api/v1/files/<id>/verify/`   | POST   | `uploaded_files.file.verify`   | **Admin only**          | `status`: `verified`\|`rejected`                                                    |
| `/api/v1/files/<id>/archive/`  | POST   | `uploaded_files.file.archive`  | **Admin only**          | `reason` required                                                                   |
| `/api/v1/files/<id>/restore/`  | POST   | `uploaded_files.file.restore`  | **Admin only**          | `note` optional                                                                     |

### Request bodies

- **Upload:** exactly one of `applicant`/`journey`/`offer`/`document`/`snapshot`
  (UUID); `category` (required, one of 11); `file` (required, ≤ 10 MB);
  `upload_source?` (defaults `staff_upload`); `notes?`.
- **Edit:** `category` and/or `notes` only — anything else is refused by name
  (`UPLOADED_FILES_FIELD_IMMUTABLE`).
- **Replace:** `file` (required, same rules as upload); `notes?` (for the new
  file). **No owner and no category** — both inherited from the predecessor.
- **Verify:** `status` (required, `verified`\|`rejected`); `reason` (required
  only when rejecting).
- **Archive:** `reason` (required, non-blank).
- **Restore:** `note?` (optional — written to the audit event, **not stored on
  the record and not in the response**).

**Validation order on upload/replace:** owner-count → owner-visibility →
owner-existence → size/empty → extension → content-signature. A rejection at
any step leaves **no row and no bytes**.

## 8. Error codes

| Code                                       | HTTP | Notes                                                                                                                                  |
| ------------------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `UPLOADED_FILES_ACTOR_FORBIDDEN`           | 403  | Superadmin on any route; Lead Manager on verify/archive/restore or uploading against document/snapshot. **Do not branch on `message`** |
| `UPLOADED_FILES_FILE_NOT_FOUND`            | 404  | No file with that id, **or** a Lead Manager addressing a document/snapshot-owned file (reported as absent, not forbidden)              |
| `UPLOADED_FILES_OWNER_NOT_FOUND`           | 400  | Named owner record doesn't exist; `details` names the field                                                                            |
| `UPLOADED_FILES_FILE_TOO_LARGE`            | 400  | Over 10 MB (10,485,760 bytes exactly)                                                                                                  |
| `UPLOADED_FILES_FILE_EMPTY`                | 400  | Zero bytes — **separate code** from too-large                                                                                          |
| `UPLOADED_FILES_FILE_TYPE_NOT_ALLOWED`     | 400  | Extension outside the seven accepted                                                                                                   |
| `UPLOADED_FILES_FILE_CONTENT_MISMATCH`     | 400  | Leading bytes disagree with the extension                                                                                              |
| `UPLOADED_FILES_FILE_BYTES_MISSING`        | 404  | Row exists, bytes gone from storage — **platform fault, do not retry**                                                                 |
| `UPLOADED_FILES_ALREADY_SUPERSEDED`        | 400  | Replacing an already-replaced file                                                                                                     |
| `UPLOADED_FILES_FILE_ARCHIVED`             | 400  | A write action against an archived file — restore first                                                                                |
| `UPLOADED_FILES_ALREADY_ARCHIVED`          | 400  | Archiving an archived file                                                                                                             |
| `UPLOADED_FILES_NOT_ARCHIVED`              | 400  | Restoring a non-archived file                                                                                                          |
| `UPLOADED_FILES_REJECTION_REASON_REQUIRED` | 400  | Rejecting with no reason                                                                                                               |
| `UPLOADED_FILES_ARCHIVE_REASON_REQUIRED`   | 400  | Archiving with no/blank reason                                                                                                         |
| `UPLOADED_FILES_FIELD_IMMUTABLE`           | 400  | `PATCH` carried anything but `category`/`notes`; each refused field named                                                              |
| `VALIDATION_ERROR`                         | 400  | Missing `file`, unknown `category`, malformed UUID, bad query param, zero/two owner fields (keyed under `details.owner`)               |

**Three registered codes have no reachable HTTP path** — request validation
catches each case first as `VALIDATION_ERROR`. Do not write handling for:
`UPLOADED_FILES_FILE_MISSING`, `UPLOADED_FILES_VERIFICATION_STATUS_INVALID`,
`UPLOADED_FILES_OWNER_REQUIRED`.

## 9. Gaps

Ordered by how much they cost a real integration.

- **No owner rollup.** "Everything on file for this applicant" is not one
  call — files hang off the applicant, each of their journeys, each offer on
  each journey, and each document/snapshot. No `owner_type` filter, no
  multi-value filter, no rollup endpoint. Fan out one request per owner id and
  merge client-side, or (for most screens) just use the per-record panel.
- **Nothing marks a primary file.** No "the photograph" or "the passport" —
  filtering by category can return several; "newest current one" is a
  client-side convention, not a backend rule.
- **Auth-blob download is mandatory, not optional.** The endpoint requires the
  bearer token and returns bytes as an attachment — there is no way to point
  an `<img src>` or `<a href>` at it. Every embed (thumbnail or download link)
  must fetch with the auth header and build an object URL client-side. CORS
  and browser-transport specifics for this are **not documented anywhere**.
- **Verification gates nothing.** No endpoint in Grandway refuses an operation
  because a file is `pending`/`rejected`. Do not build a flow (e.g. "offer
  cannot be accepted until passport verified") that assumes this rule exists.
- **No bulk upload, no idempotency key.** One file per request; a timed-out
  upload that actually succeeded produces a second row on retry, discoverable
  only via `?checksum=`.
- **No preview, thumbnail, page count, or text extraction.** The API knows
  size/type/checksum and nothing about contents.
- **The audit trail is not readable through this module** — every write and
  download writes an event, but there's no endpoint here to read them; that's
  the `audit` module, not cross-referenced by file id in this contract.
- **`education`/`test_scores` are not owner types** — those apps don't exist
  yet; a transcript attaches to the applicant and won't be re-pointed
  automatically later.
- **No range requests / resumable download documented.** Assume a whole-file
  transfer with no resume and no reliable progress bar.
- **Auth failure bodies for 401 are not enumerated here** — see the
  `authenticate` module's `INTEGRATION.md`.
- **Max lengths for `notes`/`reason`/`original_filename` are unpublished.** Do
  not build a character counter against a guess.
