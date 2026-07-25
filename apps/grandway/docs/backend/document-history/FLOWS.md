# FLOWS — Document History

**Owner app:** `document_history`
**Synced:** 2026-07-25, adapted from `.backend/concepts/document_history_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> Screen names are quoted from the backend's own `concepts/document_history.txt` →
> "UI screens & wireframe notes." Every route here is document- or
> snapshot-scoped: there is no route callable before a `documents` document
> exists, and create/edit of the document itself is the `documents` module's job.

> **Five things govern every flow below.**
>
> 1. **Admin only** — a Lead Manager (and a superadmin) cannot open any of these
>    screens. Not read-only, not empty: **hidden**. Same rule as `documents`,
>    because a snapshot holds the same bank statement the working document does.
> 2. **You never send a document body.** The capture request has no `content`
>    field — the backend reads the committed document row itself. **Save the
>    workspace before printing**; an unsaved edit is not what gets frozen.
> 3. **Send computed values in `render_context`, not in `content`.** Running
>    balances, totals, closing balance, and amount-in-words go under
>    `render_context.computed`. This is the one place in Grandway a derived value
>    is stored on purpose.
> 4. **Nothing here can be edited or deleted** — no `PUT`, `PATCH`, or `DELETE` on
>    any route. A mistaken snapshot is corrected by capturing a new one.
> 5. **A reprint does not grow the version chain.** If the timeline grows while
>    the chain stays still, that is correct — do not treat it as a bug.

---

## Flow: Capture a print snapshot

**Actor:** Admin · **Entry point:** Document Workspace (from `documents`) → Print

1. **Document Workspace** loads the body → `GET /api/v1/documents/<document_id>/` (`documents.document.read`, **cross-app: `documents`**) — gives `content`, `label`, `family`, `template_key`.
2. **Document Workspace** saves any pending edits → `PATCH /api/v1/documents/<document_id>/` (`documents.document.update`, **cross-app: `documents`**) — **not optional in practice.** Capture reads the _committed_ row under a lock; a workspace with unsaved changes freezes the old body and the user is not told.
3. **Print Preview** renders locally, computing every derived value. No endpoint — the frontend is the rendering engine; the backend has never computed a balance.
4. **Print Preview** prints or saves to history → `POST /api/v1/document-history/documents/<document_id>/snapshots/` (`document_history.snapshot.capture`) with `render_context` carrying the computed values, template version, and resolved signatories → **201** with the `Snapshot` detail shape, `version_number` = _n_.
   - **No status precondition** — an archived document may be captured; a freeze changes nothing. **Nothing in `documents` changes** — not `status`, not `updated_at`. Creates the snapshot _and_ its `capture` event in one transaction, plus a `snapshot_captured` audit event.
   - **Do not compute `version_number` client-side** — the server allocates it under a row lock; two people printing at once get _n_ and _n+1_.
   - `DOCUMENT_HISTORY_RENDER_CONTEXT_TOO_LARGE` → context over 256 KiB (realistically a very long bank statement); trim per-row derived values rather than failing the print.
   - `DOCUMENT_HISTORY_RENDER_CONTEXT_INVALID` → an array or scalar was sent; a client bug.
   - `DOCUMENT_HISTORY_DOCUMENT_NOT_FOUND` → the document id is wrong.
   - `403` → the user is not an Admin; the whole feature must be hidden from them, not merely error out.
5. The print button does **not** disable afterwards — printing twice is legitimate and produces two versions.

## Flow: Review a document's history

**Actor:** Admin · **Entry point:** Document History Timeline

1. **Document History Timeline** loads the chronological list → `GET /api/v1/document-history/documents/<document_id>/timeline/` (`document_history.print_event.list`). **Show `event_type` on every row** — distinguishing an original capture from a reprint or recovery is the screen's stated purpose. Rows carry `version_number` and `label` inline; no per-row fetch is needed.
   - A document never printed returns an **empty list**, not a 404 — render an empty state.
   - `DOCUMENT_HISTORY_DOCUMENT_NOT_FOUND` → the document itself does not exist; a genuine 404, distinct from the empty list.
2. **Document History Timeline** filters to originals only → `GET .../timeline/?event_type=capture`.
   - `VALIDATION_ERROR` on `event_type` → only `capture`, `reprint`, `recovery` exist; an unrecognised value is **rejected, not ignored**. No comma list.
3. **Document History Timeline** — the version list beside the timeline → `GET /api/v1/document-history/documents/<document_id>/snapshots/` (`document_history.snapshot.list`). Rows omit `content` and `render_context` — do not try to render a preview from a list row.
4. **Snapshot Detail** opens one frozen record → `GET /api/v1/document-history/snapshots/<snapshot_id>/` (`document_history.snapshot.read`). **Render the snapshot's own `label` and `render_context.computed`, never the document's current values** — reaching back to the live document defeats the module. **Read-only, permanently** — there is no edit endpoint.

## Flow: Compare two versions

**Actor:** Admin · **Entry point:** Compare Snapshots

1. **Document History Timeline** picks two versions → `GET /api/v1/document-history/documents/<document_id>/snapshots/` (`document_history.snapshot.list`).
2. **Compare Snapshots** fetches both, **as two separate calls** → `GET /api/v1/document-history/snapshots/<id_a>/` and `GET .../snapshots/<id_b>/` (`document_history.snapshot.read`). **There is no compare endpoint** — diff `content` and `render_context.computed` client-side. Two snapshots may legitimately carry different `label` values — a rename between prints is exactly what this screen exists to surface.

## Flow: Recover a prior version into the workspace

**Actor:** Admin · **Entry point:** Snapshot Detail → Recover

1. **Snapshot Detail** shows what is about to be restored → `GET /api/v1/document-history/snapshots/<snapshot_id>/` (`document_history.snapshot.read`).
2. **Recover Snapshot Dialog** confirms → `POST /api/v1/document-history/snapshots/<snapshot_id>/recover/` (`document_history.snapshot.recover`) → **200** with the updated **`Document`** (the `documents` detail shape, **not** a snapshot). Re-render the workspace from it directly — no follow-up fetch.
   - Writes `label` and `content` into the working document (**cross-app write into `documents`**); creates a `recovery` print event; appends **two** audit events, one per app. **The snapshot is not altered and no new snapshot is created.**
   - **Warn the user what is _not_ restored:** `notes` and `status` stay as they are. A note written after the print survives; a document marked `ready` stays `ready`.
   - `DOCUMENT_HISTORY_DOCUMENT_NOT_EDITABLE` (409) → **the document is archived, not the snapshot** (snapshots have no lifecycle). Use `is_editable` on the document to grey the Recover button _before_ calling, rather than discovering the 409 after.
   - **A no-op recovery is not an error** — if the body already matches, nothing changes in `documents` and `updated_at` does not move, but the recovery _is_ recorded. Do not report failure. There is no concurrency control — two Admins recovering into one document is last-write-wins; treat the returned document as authoritative.
3. **Document Workspace** — if step 2 returned 409, restore the document first → `POST /api/v1/documents/<document_id>/restore/` (`documents.document.restore`, **cross-app: `documents`**) → returns it to `draft` and clears archive fields. Then retry step 2.
4. **Document Workspace** — capture again to freeze the recovered state → `POST /api/v1/document-history/documents/<document_id>/snapshots/`. Optional, but this is how the recovered body enters the chain as version _n+1_. A recovery on its own leaves the chain untouched.

## Flow: Reprint an earlier issue

**Actor:** Admin · **Entry point:** Snapshot Detail → Reprint

1. **Snapshot Detail** loads the frozen record → `GET /api/v1/document-history/snapshots/<snapshot_id>/` (`document_history.snapshot.read`).
2. **Print Preview** renders from **the snapshot's own** `content` and `render_context` — never re-render from the live document. The point of a reprint is to reproduce what was issued.
3. **Snapshot Detail** records the reprint → `POST /api/v1/document-history/snapshots/<snapshot_id>/reprint/` (`document_history.print_event.reprint`) → **201** with a `PrintEvent`.
   - **No status precondition** — a snapshot of an archived document may be reprinted; reprinting writes nothing to the document. Creates one `reprint` event and **no new snapshot**, plus a `snapshot_reprinted` audit event.
   - `DOCUMENT_HISTORY_SNAPSHOT_NOT_FOUND` → the snapshot id is wrong.

---

## Endpoint coverage

| Policy key                             | Method / path                                                      | Used by flow(s)                            | Notes                                             |
| -------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------- |
| `document_history.snapshot.capture`    | `POST /api/v1/document-history/documents/<document_id>/snapshots/` | Capture a print snapshot; Recover (step 4) | Send `render_context`, never `content`. → 201     |
| `document_history.snapshot.list`       | `GET /api/v1/document-history/documents/<document_id>/snapshots/`  | Review history; Compare                    | Omits both JSON columns. `?fiscal_year=`          |
| `document_history.snapshot.read`       | `GET /api/v1/document-history/snapshots/<snapshot_id>/`            | Review history; Compare; Recover; Reprint  | **The only endpoint returning a frozen body**     |
| `document_history.print_event.list`    | `GET /api/v1/document-history/documents/<document_id>/timeline/`   | Review history                             | `?event_type=`, `?fiscal_year=`. Empty list ≠ 404 |
| `document_history.print_event.reprint` | `POST /api/v1/document-history/snapshots/<snapshot_id>/reprint/`   | Reprint                                    | Writes an event, never a snapshot. → 201          |
| `document_history.snapshot.recover`    | `POST /api/v1/document-history/snapshots/<snapshot_id>/recover/`   | Recover                                    | **Writes into `documents`.** Returns a `Document` |

**Screens from `concepts/document_history.txt`, and whether they are backed:**

- **Document History Timeline** — backed by `print_event.list` (event rows) and `snapshot.list` (version list). Both per-document.
- **Snapshot Detail** — backed by `snapshot.read`. Read-only, with no edit endpoint to hide.
- **Compare Snapshots** — backed by **two** `snapshot.read` calls. No compare endpoint exists.
- **Recover Snapshot Dialog** — backed by `snapshot.recover`, which performs the restore rather than returning a payload for the client to apply.

**Not backed, and deliberately so:**

- **Any generated-file link _in a snapshot payload_.** A snapshot has no file field. `uploaded_files` (shipped 2026-07-24) accepts a snapshot as an owner — a client that generates a PDF may store it (`POST /api/v1/files/` with `snapshot=<id>`, `category=generated_document`, `upload_source=system_generated`; found via `GET /api/v1/files/?snapshot=<id>`) — but **nothing in this module knows the file exists.** A "download the saved PDF" control is shippable only if your own client uploaded that PDF.
- **Any cross-document view** — "everything printed this month", "all snapshots of family `bank_statement`". Both list endpoints require a document id.
- **A signatory picker** is not this app's to provide, but one exists — `GET /api/v1/document-templates/signatories/?status=active` (`document_templates.signatory.list`, **cross-app**). Ids you freeze into `render_context.signatories` resolve against it; a retired signatory stays retrievable forever so old snapshots keep working. **Keep freezing the name and role alongside the id** — this app validates nothing inside `render_context`.

## Cross-app dependencies

- **This app references (outbound):** `documents.document.read`/`.update` (the workspace load and save preceding a capture) and `documents.document.restore` (the recovery-409 path). The backend additionally holds `PROTECT` FKs to `documents.Document` and performs the recovery write through that app's own update service — see `INTEGRATION.md` §2.
- **Referenced by other apps (inbound):** `concepts/documents_flows.md` — its "Review and print" flow delegates here rather than restating these steps.

**Note the asymmetry with `documents`.** That app depends on this one for nothing and works with no snapshot in the system. This one is useless without it: every route is document- or snapshot-scoped, and there is no route callable before a document exists.

## Open questions

- Should the timeline gain a document-family or date-range view for Admin review? Deferred; both list endpoints are per-document. `audit`'s event list (`?app=document_history`) is the nearest substitute and returns audit events, not snapshots.
- Should generated PDFs be retained? Now answerable and still unanswered — `uploaded_files` accepts a snapshot owner and a `generated_document` category, so retention is a product decision. Still absent: any _automatic_ retention and any reverse pointer from a snapshot to an uploaded file.
- **Nothing enforces the `content` / `render_context` split.** A client that puts a computed closing balance in the body will have it frozen there, and no endpoint flags it. The convention is load-bearing for the frontend and invisible to the backend.
- **`render_context` has no schema and no version gate.** If the client's shape changes, older snapshots keep the old one and nothing migrates or warns. `template_version` is the conventional place to record which shape a snapshot uses; the backend does not read it.
