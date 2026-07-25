# FLOWS — Documents

**Owner app:** `documents`
**Synced:** 2026-07-25, adapted from `.backend/concepts/documents_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Five rules govern every flow below.**
>
> 1. **Admin only — a Lead Manager cannot open any of these screens.** Not
>    read-only, not empty: **hidden**. This is the only module in Grandway a Lead
>    Manager cannot see at all. An empty documents panel would assert "this
>    applicant has no documents", which is false. Any non-Admin receives 403
>    `DOCUMENTS_ACTOR_FORBIDDEN` on every route, reads included.
> 2. **The frontend computes; the backend stores.** Send input fields only. Never
>    send a running balance, debit/credit total, closing balance, interest/tax
>    row, or amount-in-words — the backend stores it and hands the stale value
>    back forever.
> 3. **`content` replaces, it does not merge.** Every save sends the complete
>    body; a partial `content` silently discards every key it omits. The single
>    most likely integration mistake in this module.
> 4. **There is no delete.** The delete button becomes "Archive" (mandatory
>    reason). Printing lives in a different module (`document_history`, a
>    different base path) — there is no print endpoint here.
> 5. **An archived document is frozen.** The workspace must go read-only; any save
>    returns 409.

---

## Flow: Create and work on an applicant's document

**Actor:** Admin · **Entry point:** Applicant Detail → Documents panel

1. **Documents panel** loads what exists → `GET /api/v1/documents/?applicant=<applicant_id>` (`documents.document.list`, **cross-app: `applicants`**).
   - **Hide this entire panel for a Lead Manager** — they receive 403 `DOCUMENTS_ACTOR_FORBIDDEN`.
   - Rows carry `label`, `family`, `template_key`, `status`, `updated_at` — but **not `content`**.
   - **Pass `status=draft` or `status=ready` for a live panel** — omitting `status` includes archived documents by design.
2. **New Document Form** — choose a template and open the record → `POST /api/v1/documents/` (`documents.document.create`). Only `applicant` and `family`/`template_key`/`label` are required; created at `status: draft`, `content: {}`.
   - **Send `family` and `template_key` together from one picker** — they are cross-validated. Populate that picker from `GET /api/v1/document-templates/templates/?status=active` (**cross-app: `document_templates`**); deriving the family from the slug client-side keeps them in step.
   - **This app does not check the catalogue** — a slug absent or retired is still accepted. The picker is the only guard.
   - `DOCUMENTS_TEMPLATE_KEY_INVALID` → the two came from different pickers (a UI bug, not user error).
   - `VALIDATION_ERROR` on `template_key` → the slug is malformed (uppercase, spaces, underscores). Slugs are lowercase ASCII with single hyphens.
   - `DOCUMENTS_APPLICANT_NOT_FOUND` → the applicant id is wrong; re-select the person.
3. **Document Workspace** loads the body → `GET /api/v1/documents/<document_id>/` (`documents.document.read`).
   - This is the **only** endpoint that returns `content`. Render the live preview from it.
   - **Render `label`, never `template_key`,** to the user — the slug is a machine key.
4. **Document Workspace** save → `PATCH /api/v1/documents/<document_id>/` (`documents.document.update`).
   - **Send the complete `content`** — it is replaced wholesale. Send only the top-level fields the user changed (`label`, `content`, `standalone_purpose`, `notes`).
   - Do **not** send `status`, `applicant`, `family`, or `template_key` — this module **rejects** immutable fields rather than dropping them. Do not reuse a read-modify-write-the-whole-object form from the catalogue screens.
   - `DOCUMENTS_OWNERSHIP_IMMUTABLE` / `DOCUMENTS_STATUS_IMMUTABLE` → strip those keys before submitting; `details` names each offending field.
   - `DOCUMENTS_CONTENT_TOO_LARGE` → body exceeds 256 KiB; show it against the transactions table, not as a form-level error.
   - `DOCUMENTS_DOCUMENT_NOT_EDITABLE` (409) → the document was archived, probably by someone else. Refetch and switch to read-only.
   - **A no-op save writes no history event** — a UI showing "saved, history updated" after an unchanged submit is lying.
5. **Document Workspace** mark it finished → `POST /api/v1/documents/<document_id>/status/` (`documents.document.change_status`) with `ready`. Accepts `draft`/`ready` only; sending `archived` fails serializer validation.
6. **Print** — save first, then `POST /api/v1/document-history/documents/<document_id>/snapshots/` (**cross-app: `document_history`**). Capture reads the _committed_ row, so step 4 must have completed. Full sequence in that app's flows.

## Flow: Create a standalone document

**Actor:** Admin · **Entry point:** Standalone Documents list

1. **Standalone Documents list** → `GET /api/v1/documents/?standalone=true` (`documents.document.list`). The only way to reach standalone documents as a set — they are **absent from the workspaces landing table**, which groups by applicant.
2. **New Document Form** — create with a purpose instead of an owner → `POST /api/v1/documents/` (`documents.document.create`). **Send `standalone_purpose` and omit `applicant`** — the API enforces exactly one of the two. No prerequisite record at all.
   - `DOCUMENTS_OWNER_REQUIRED` → neither was given. Make the purpose field mandatory on the standalone branch of the form.
3. **Work it forward** — identical to steps 3–5 above.
   - **One extra rule:** `standalone_purpose` cannot be cleared later — the ownership check re-runs on every save, so blanking it returns `DOCUMENTS_OWNER_REQUIRED`.

## Flow: Retire a document and bring it back

**Actor:** Admin · **Entry point:** Document Workspace → Archive

1. **Archive dialog** → `POST /api/v1/documents/<document_id>/archive/` (`documents.document.archive`) with a reason. Sets `status: archived`, `archive_reason`, `archived_at`, `archived_by`; appends `document_archived`. **The document stays in the list.**
   - **The reason input is mandatory** — enforce it before submit. **Label the button "Archive", not "Delete"**, and say the record is kept.
   - `DOCUMENTS_ARCHIVE_REASON_REQUIRED` → a whitespace-only reason reached the server.
   - `DOCUMENTS_DOCUMENT_ALREADY_ARCHIVED` (409) → refetch; someone else archived it.
2. **Workspace goes read-only.** `is_editable` is now `false`; every `PATCH` and status change returns 409 until step 3. A UI that leaves the form live will produce nothing but failed saves.
3. **Restore** → `POST /api/v1/documents/<document_id>/restore/` (`documents.document.restore`). Appends `document_restored`; clears the three archive fields. **It returns to `draft`, never to `ready`** — even if it was `ready` when archived.
   - `DOCUMENTS_DOCUMENT_NOT_ARCHIVED` (409) → it was already active; refresh and hide the button.
4. **History panel** → `GET /api/v1/documents/<document_id>/history/` (`documents.document.list_history`, **cross-app: `audit`**). `document_archived` and its reason survive the restore — but a **body change shows only a `<changed>` marker**; you cannot show a diff or offer "revert to previous version".

## Flow: The documents landing table

**Actor:** Admin · **Entry point:** Documents (top-level nav)

1. **Documents landing** → `GET /api/v1/documents/workspaces/` (`documents.document.list_workspaces`). One row per applicant with live documents: `applicant_id`, `applicant_name`, `document_count`, `last_updated`. Returns an empty array when nobody has live work.
   - **Archived documents are excluded from the count**, and an applicant whose documents are _all_ archived does not appear — the table answers "who has live work".
   - **Standalone documents are absent entirely** — they need their own tab, fed by `?standalone=true`.
   - Note the **trailing slash** — `workspaces/` is a literal segment, not a document id.
2. **Row click** → `GET /api/v1/documents/?applicant=<applicant_id>` — continues into the applicant flow above.

## Flow: Review and print — delegated to `document_history`

Not one step of this lives here. What a client of _this_ module needs to know:

- **The print button posts to a different base path** — `/api/v1/document-history/`, not `/api/v1/documents/`. There is no print endpoint here and there will not be one.
- **Save before printing.** Capture reads the _committed_ row, so sequence step 4 of the applicant flow before the capture, always.
- **Printing changes nothing here** — no status moves, `updated_at` does not shift, and no field reports that a snapshot exists. "Has this been printed?" is a question for `document_history.snapshot.list`.
- **A recovery can rewrite a document behind your back.** `document_history.snapshot.recover` writes `label` and `content` into the working record and surfaces here as an ordinary `document_updated` event. Refetch the workspace after one.
- **Signatory selection is backed** — `GET /api/v1/document-templates/signatories/?status=active` (**cross-app: `document_templates`**). Put the chosen record's `id` into `content.instructorId` / `content.directorId`. **The ids are still unvalidated on save — your dropdown is the only guard.**
- **Supporting files are backed, but not from here** — `POST /api/v1/files/` with `document=<id>` and `GET /api/v1/files/?document=<id>&is_archived=false` (**cross-app: `uploaded_files`**). A document payload carries no file reference of any kind; the attachments panel is a second call the screen joins itself. A "download the saved PDF" link is not shippable — nothing generates or stores that PDF automatically.

---

## Endpoint coverage

| Policy key                           | Method / path                          | Used by flow(s)                                     | Notes                                                                                                                 |
| ------------------------------------ | -------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `documents.document.list`            | `GET /api/v1/documents/`               | Applicant panel; Standalone list; Landing row click | Omits `content`. `?applicant=`, `?standalone=`, `?status=`, `?family=`, `?template_key=`, `?search=`, `?fiscal_year=` |
| `documents.document.create`          | `POST /api/v1/documents/`              | Create applicant document; Create standalone        | `family` + `template_key` cross-validated                                                                             |
| `documents.document.list_workspaces` | `GET /api/v1/documents/workspaces/`    | Documents landing table                             | Excludes standalone and archived                                                                                      |
| `documents.document.read`            | `GET /api/v1/documents/<id>/`          | Document Workspace                                  | **The only endpoint returning `content`**                                                                             |
| `documents.document.update`          | `PATCH /api/v1/documents/<id>/`        | Document Workspace save                             | `content` replaces wholesale; immutable fields rejected                                                               |
| `documents.document.change_status`   | `POST /api/v1/documents/<id>/status/`  | Mark ready                                          | `draft` / `ready` only                                                                                                |
| `documents.document.archive`         | `POST /api/v1/documents/<id>/archive/` | Retire                                              | Reason mandatory. **This is the delete button**                                                                       |
| `documents.document.restore`         | `POST /api/v1/documents/<id>/restore/` | Retire → restore                                    | Always returns to `draft`                                                                                             |
| `documents.document.list_history`    | `GET /api/v1/documents/<id>/history/`  | Retire (step 4); Workspace history panel            | Body changes shown as a marker only                                                                                   |

**Screens from `concepts/documents.txt`, and whether they are backed:**

- **Documents landing table** — backed by `workspaces/`; excludes standalone and archived.
- **Document List** — backed. Filters for owner, status, type, and template family all exist (`?family=` for family, `?template_key=` per-slug).
- **Applicant Detail → Documents panel** — backed via `?applicant=`. **Admin-only; hide for Lead Managers.**
- **Standalone Documents list** — backed via `?standalone=true`.
- **Document Workspace** — backed for header, source-data form, and save. **Its supporting-files section has no endpoint here** (use `uploaded_files`); its live preview is entirely client-side by design.
- **Print Preview / History handoff** — **backed by `document_history`**, not by any endpoint in this app.

## Cross-app dependencies

- **References (outbound):** `applicants.applicant.read` to resolve/label the person before creating a document; `document_templates.template.list` for the New Document type picker and `document_templates.signatory.list` for the instructor/director dropdowns (both **advisory** — this app validates neither the `template_key` nor the signatory ids); `uploaded_files.file.upload`/`.file.list` for the attachments panel (one-way — this app returns no file references). History reads from `audit`. All flows require an `authenticate` session.
- **Referenced by other apps (inbound):** `document_history` — its capture flow calls `documents.document.read`/`.update`, and its recovery flow writes a frozen `label`/`content` into a document through this app's update service (surfacing here as `document_updated`).

**Note the access asymmetry with `applicants`.** An applicant is readable by any Admin or Lead Manager, but their documents are Admin-only. A Lead Manager's applicant file view is legitimately incomplete — that is the intent, not a bug to route around.

## Open questions

- Should standalone documents have their own lifecycle, or live in the workspace only? V1: a `?standalone=true` filter but no separate lifecycle; excluded from the landing table.
- Should generated PDFs be retained alongside document data and snapshots? Unanswerable until `document_history`/`uploaded_files` mature.
- Can one document reference multiple supporting files, or only a primary one? V1 references none directly.
- Nothing validates a `template_key` against a real template — a typo matching the family prefix is accepted until `document_templates` provides an enforced registry.
- A document's previous body is not recoverable unless a print snapshot captured it — no field history, no versioning, body redacted from the audit log.
- Should `content` be searchable? V1 searches `label` only.
