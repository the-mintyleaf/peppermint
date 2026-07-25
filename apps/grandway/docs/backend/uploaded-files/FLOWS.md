# FLOWS — Uploaded Files

**Owner app:** `uploaded_files`
**Synced:** 2026-07-26, adapted from `.backend/concepts/uploaded_files_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **One access rule shapes every screen below.** Admin and Lead Manager share the read,
> upload, replace, and download routes; **only an Admin** may verify, archive, or restore.
> And a file **inherits the visibility of the record it belongs to** — files owned by a
> `document` or a print snapshot are Admin-only in every respect, because `documents` and
> `document_history` are. For a Lead Manager those files do not appear in any list and every
> per-file route returns **404**, so a document attachments panel is an Admin-only screen.
>
> **Read this before wireframing anything file-related.** This app is not reached through
> the record it belongs to. There is no "attach" button backed by an `applicants` or
> `offers` endpoint, and no file field on any other module's payload. **Every file screen in
> Grandway — on an applicant, a journey, an offer, a document, or a snapshot — is this app's
> list endpoint with a filter.** The panels are embedded in other screens; the state behind
> them is one ledger.

---

## Flow: Attach a document to an applicant and get it approved

**Actor:** Lead Manager (steps 1–3), Admin (steps 4–5) · **Entry point:** Applicant Detail → Files panel

1. **Applicant Detail — Files panel** — the panel loads on open →
   `GET /api/v1/files/?applicant=<applicant_id>&is_archived=false` (`uploaded_files.file.list`).
   An applicant with no files returns an empty array — a normal empty state, not an error.
   - `VALIDATION_ERROR` → the applicant id in the URL is malformed. A routing bug in the
     client, not a user-facing state; log it rather than showing it.
2. **Files panel → Upload dialog** — pick a category, choose a file, submit →
   `POST /api/v1/files/` (`uploaded_files.file.upload`), `multipart/form-data`. The file is
   ≤ 10 MB and one of pdf/jpg/jpeg/png/webp/docx/xlsx. The new file is **pending** — render
   the pending badge immediately, never optimistically show it as accepted. An audit event
   is recorded; refetch the panel.
   - `UPLOADED_FILES_FILE_TOO_LARGE` → inline error naming the 10 MB limit. Check size
     client-side first.
   - `UPLOADED_FILES_FILE_TYPE_NOT_ALLOWED` → inline error listing the seven accepted
     extensions.
   - `UPLOADED_FILES_FILE_CONTENT_MISMATCH` → word it as "the file appears to be damaged or
     renamed", not "this is not really a PDF".
   - `UPLOADED_FILES_OWNER_NOT_FOUND` → the applicant was deleted or the id is stale.
     Blocking dialog, then reload the applicant.
3. **Files panel** — the file appears with a `pending` badge. **No further Lead Manager
   action exists.** Do not render a verify control for this actor; it returns 403.
4. **File Review queue** _(Admin only)_ — the queue loads →
   `GET /api/v1/files/?verification_status=pending` (`uploaded_files.file.list`). Hide the
   screen from a Lead Manager entirely rather than rendering it empty (they get 403 on
   every row).
5. **File Review queue → row action** — accept or refuse →
   `POST /api/v1/files/<file_id>/verify/` (`uploaded_files.file.verify`). Both the queue and
   any open Files panel go stale.
   - `UPLOADED_FILES_REJECTION_REASON_REQUIRED` → make the reason a required field in the
     reject dialog rather than discovering this at submit.
   - `UPLOADED_FILES_FILE_ARCHIVED` → the file was archived by someone else while the queue
     was open. Blocking dialog, then refetch.

## Flow: Replace a rejected document with a better copy

**Actor:** Lead Manager · **Entry point:** Applicant Detail → Files panel → File Detail

1. **File Detail** — open a file showing a `rejected` badge and its reason →
   `GET /api/v1/files/<file_id>/` (`uploaded_files.file.read`).
2. **File Detail → Replace dialog** — choose the new file, submit →
   `POST /api/v1/files/<file_id>/replace/` (`uploaded_files.file.replace`),
   `multipart/form-data`. A **new file record with a new id** is created — navigate to it,
   do not stay on the old one. The predecessor becomes `is_current: false` and keeps its
   bytes, its rejection, and its reason. The successor is **pending** even though this flow
   started from a rejection.
   - `UPLOADED_FILES_ALREADY_SUPERSEDED` → someone else already replaced it. Fetch the
     version chain and offer the current version instead.
   - The three upload failures (too large / wrong type / content mismatch) apply identically.
3. **File Detail (successor)** — shows `pending` and a "replaces" link to the old one.
4. **File Review queue** _(Admin)_ — the successor is reviewed exactly as above. Only the
   successor changes — the predecessor keeps its rejection permanently.

## Flow: Read a file's replacement history

**Actor:** Admin or Lead Manager · **Entry point:** File Detail → Version history

1. **File Detail → Version history** loads →
   `GET /api/v1/files/<file_id>/versions/` (`uploaded_files.file.versions`). Works from any
   member of the chain, including a superseded one.
   - `UPLOADED_FILES_FILE_NOT_FOUND` → the id is stale. Return to the Files panel.
2. Render **oldest first** — the opposite order to the file list, deliberately, because a
   chain is read as a history. `meta.count` is the chain length; there is no pagination. A
   chain of one is normal, not an empty state.
3. **Version history → any row** — every version, current or not, offers download →
   `GET /api/v1/files/<file_id>/download/` (`uploaded_files.file.download`).

## Flow: Retrieve a file's contents

**Actor:** Admin or Lead Manager · **Entry point:** any Files panel row, File Detail, or Version history row

1. **Any file row — "Download"** — the user clicks →
   `GET /api/v1/files/<file_id>/download/` (`uploaded_files.file.download`). Archived and
   superseded files are both still downloadable. **An audit event is recorded for every
   download**, before the transfer begins — the only audited read in the API.
   - `UPLOADED_FILES_FILE_BYTES_MISSING` → a platform fault, not a user error. Show "this
     file could not be retrieved" and offer a report path. **Do not retry** — nothing about
     it is transient.
2. The response is the raw file as an **attachment**, not JSON.
   - **This endpoint needs the bearer token, so the URL cannot go in an `<img src>` or a
     plain `<a href>`.** Fetch it with the auth header and hand the browser a blob.
   - There is **no inline preview and no thumbnail anywhere in this app.** A photograph or a
     signature image renders only if the client fetches the bytes and builds an object URL.

## Flow: Retire a file without losing it

**Actor:** Admin · **Entry point:** File Detail → Archive

1. **File Detail → Archive dialog** — enter the reason, confirm →
   `POST /api/v1/files/<file_id>/archive/` (`uploaded_files.file.archive`). The file drops
   out of every `?is_archived=false` panel. It stays downloadable and stays in its version
   chain. An audit event is recorded.
   - `UPLOADED_FILES_ARCHIVE_REASON_REQUIRED` → make the reason a required field. Archiving
     is the closest thing to deletion the API offers, and the reason is the record.
   - `UPLOADED_FILES_ALREADY_ARCHIVED` → stale state; refetch.
2. **Files panel** — the archived file is hidden by the default filter. Offer a
   "show archived" toggle that **drops** `is_archived` from the query — omitting the
   parameter returns archived files too; there is no `is_archived=true`-only convention.
3. **File Detail (archived)** — `PATCH`, replace, and verify all now return
   `UPLOADED_FILES_FILE_ARCHIVED`. **Disable those controls** rather than letting the user
   discover it.
4. **File Detail → Restore** — reverse it →
   `POST /api/v1/files/<file_id>/restore/` (`uploaded_files.file.restore`). All three
   archive fields are cleared — **the payload keeps no trace that it was ever archived.** If
   a screen needs "was this archived before", it must come from the `audit` module.
   - `UPLOADED_FILES_NOT_ARCHIVED` → stale state; refetch.

## Flow: Correct a misfiled document

**Actor:** Admin or Lead Manager · **Entry point:** File Detail → Edit

1. **File Detail → Edit** — change the category, or add a note →
   `PATCH /api/v1/files/<file_id>/` (`uploaded_files.file.update`). An audit event is
   recorded **unless nothing actually changed**, in which case the call still returns 200
   and writes nothing.
   - `UPLOADED_FILES_FIELD_IMMUTABLE` → the form sent something other than `category` or
     `notes`. **Only build those two inputs.** A file cannot be moved to another record,
     renamed, or have its verification set through this endpoint; the response names each
     refused field.
   - `UPLOADED_FILES_FILE_ARCHIVED` → restore it first.

---

## Endpoint coverage

| Policy key                     | Method / path                           | Used by flow(s)                                          | Notes                                                               |
| ------------------------------ | --------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `uploaded_files.file.list`     | `GET /api/v1/files/`                    | Attach a document; Retire a file                         | **Every** files panel in the product is this endpoint with a filter |
| `uploaded_files.file.upload`   | `POST /api/v1/files/`                   | Attach a document                                        | `multipart/form-data`                                               |
| `uploaded_files.file.read`     | `GET /api/v1/files/<file_id>/`          | Replace a rejected document; Correct a misfiled document |                                                                     |
| `uploaded_files.file.update`   | `PATCH /api/v1/files/<file_id>/`        | Correct a misfiled document                              | `category` and `notes` only                                         |
| `uploaded_files.file.download` | `GET /api/v1/files/<file_id>/download/` | Retrieve a file's contents; Read a file's history        | Returns bytes, not JSON. Audited                                    |
| `uploaded_files.file.versions` | `GET /api/v1/files/<file_id>/versions/` | Read a file's replacement history                        | Oldest first, unpaginated                                           |
| `uploaded_files.file.replace`  | `POST /api/v1/files/<file_id>/replace/` | Replace a rejected document                              | Returns a **new** file id                                           |
| `uploaded_files.file.verify`   | `POST /api/v1/files/<file_id>/verify/`  | Attach a document; Replace a rejected document           | Admin only                                                          |
| `uploaded_files.file.archive`  | `POST /api/v1/files/<file_id>/archive/` | Retire a file                                            | Admin only                                                          |
| `uploaded_files.file.restore`  | `POST /api/v1/files/<file_id>/restore/` | Retire a file                                            | Admin only                                                          |

Every registered endpoint is used by at least one flow. There is no admin-only maintenance
endpoint here without a screen behind it.

## Cross-app dependencies

- **References (outbound):** none. No flow above calls another app's endpoint. Every flow
  begins from a record that already exists — an applicant, journey, offer, document, or
  snapshot — but reads and writes only this app's endpoints. The owning record is a
  precondition, not a step.
- **Referenced by other apps (inbound):** `checklists.item.status` cites a file id as
  `evidence_file` (validated against the citing checklist's applicant/journey) and reads it
  back via `GET /api/v1/files/<evidence_file>/` (metadata) and
  `GET /api/v1/files/<evidence_file>/download/` (bytes) — no nested file brief exists on the
  checklist item. The applicant, offer, journey, and document panels described as _missing_
  in their own flow files are now buildable — each records the gap and points here.

## Open questions

- **Which screen owns the review queue?** `?verification_status=pending` is a global
  cross-applicant list; `concepts/uploaded_files.txt` names a "review queue" but not where
  it lives in the navigation.
- **How does a screen pick _the_ photograph or _the_ passport?** No primary-file concept.
  Filtering by category can return several files; "the newest current one" is a client-side
  convention, not a backend rule.
- **Should a Lead Manager see files on applicants not assigned to them?** Today yes — reads
  are not owner-scoped. An unscoped read here exposes a passport, not a name.
- **Is there a size or count limit per record?** No — an applicant may accumulate unlimited
  files and nothing warns anyone.
- **Who sees a document's attachments?** Only an Admin, today — inherits `documents`'
  Admin-only rule. If Lead Managers ever gain document access, `ADMIN_ONLY_OWNER_TYPES` in
  the backend must change in the same session.
- **Where do generated PDFs come from?** The `generated_document` category and
  `system_generated` source exist, but `document_history` has no field pointing at a file
  and does not call this app.
- **No education or test-score owner type** yet — transcripts attach to the applicant for
  now and will not be re-pointed automatically later.
