# Flows

End-to-end sequences that span more than one step. Each step names the endpoint,
the key inputs, and the branches the UI must handle. Field/error detail lives in
`entities/client.md` — this is the choreography.

## Create a client

1. `POST /api/v1/clients/` with at least `{ legal_name, client_type }` → returns
   the client `id` (`status=prospective`, `record_version=1`, server-set
   `client_code`).
   - `CLIENT_DATE_ORDER_INVALID` → `relationship_ended_on` precedes
     `relationship_started_on`; block submit until the dates are consistent.
   - `CLIENT_VALIDATION_FAILED` → map `error.details` to the offending fields (fall
     back to `error.message`; the exact `details` shape is a gap — see `gaps.md`).
   - Admin may also send `internal_notes`; a staff form must not (it would 403 with
     `CLIENT_FIELD_FORBIDDEN`).

## Create with a duplicate warning (preflight → create → override)

Duplicate detection is **advisory, never blocking** — the create always succeeds;
matches ride in `meta` as masked warnings. The recommended flow surfaces them
_before_ the write.

1. (optional, recommended) `POST /api/v1/clients/duplicate-check/` with the key
   identity fields the user has typed so far
   (`{ legal_name?, primary_email?, primary_phone?, website?, registration_number?,
tax_number? }`) → `data.matches` (a masked `DuplicateMatch[]`, `[]` when clear).
   Debounce this on the identity fields; render any matches inline (public
   `client_code` + masked name + the boolean signal flags) with a "create anyway"
   / "open the existing one" choice.
2. `POST /api/v1/clients/` with the full body → the client is created (`201`).
   - `meta.possible_duplicate === true` → render `meta.duplicate_matches` (same
     masked shape). **Non-blocking** — the record already exists.
3. To keep the record deliberately despite the warning, **resubmit** (a `PATCH` of
   the just-created record, or re-run the create flow) with a top-level
   `override_reason` → recorded on the `client_duplicate_flagged` audit event.

> On an **update** check, pass `exclude_id` (the client being edited) to
> `duplicate-check/` so the record doesn't flag itself.

## Lookup for prefill / typeahead

Use the reduced lookup endpoint (not the paginated directory list) when the user
needs to _pick_ a client — a dropdown, a typeahead, or seeding a document with a
client's details.

1. `GET /api/v1/clients/lookup/?search=<q>` → `data` is a **ranked**, **capped-50**,
   **not-paginated** `ClientLookupRow[]` (identity + contact essentials +
   `primary_contact` / `spokesperson` + `logo_thumbnail_url`).
2. On selection, either navigate to the full `GET /api/v1/clients/<id>/` for detail,
   or fetch the richer prefill packet (next flow) to seed a document.

## Generate a document from a client (prefill → snapshot)

Seed a document form from a client's reusable fields — then **store the copied
values**, because a document must not depend on the live client after it is issued.

1. (pick) `GET /api/v1/clients/lookup/?search=<q>` → choose a client (or come from
   the client detail page). Staff+.
2. `GET /api/v1/clients/<id>/document-prefill/` → `data` is a `DocumentPrefillPacket`
   — `generated_at` (read time), `institution_name` / `institution_display_name`,
   contact essentials, the active `primary_address` / `primary_contact` /
   `spokesperson`, and `logo_url` / `logo_thumbnail_url`. Excludes `internal_notes`.
   - `CLIENT_NOT_FOUND` (404) → the client is archived or unknown; it is not
     prefillable. Fall back to manual entry or pick another client.
3. **Copy the packet's values into the document and persist them** (optionally with
   `source_client_id` for traceability). The rendered/issued document must read from
   _its own stored copy_, never re-fetch the live client — so a later client edit
   can **never** mutate an already-issued document. This historical-safety contract
   is on the consumer; `clients` only serves live values and owns the packet shape.

> There is **no document module** in this standalone app — `clients` provides the
> packet and the contract; the snapshot lives wherever the document is generated.

## Audit trail (admin)

Build a per-client "activity / history" panel from the immutable audit log.

1. `GET /api/v1/clients/<id>/audit-events/?page=1` (**admin/superadmin only** —
   staff get `403`, so hide the panel for them) → a **paginated** (`meta`
   `{ count, page, page_size, next, previous }`), **newest-first** `AuditEvent[]`.
2. Render each row via the `Audit` `event_type` labels (`enums.md`); show `reason` /
   `changed_fields` / `metadata` for context and resolve `actor` (user UUID, or
   `null` for a system action) against your user directory. Rows are immutable —
   read-only, no create/edit/delete.

## Merge two clients (dedup → merge → survivor)

Fold a duplicate client into a survivor. **Admin/superadmin only** (staff get
`403`) and **destructive** — always confirm first. The duplicate is retained but
archived pointing at the survivor; children transfer.

1. (find the pair) Spot the duplicate from the directory / ranked search, or from a
   `meta.possible_duplicate` warning on a create/update. Decide which record is the
   **survivor** (its `id` goes in the path) and which is the **duplicate**.
2. (confirm) Show a confirm dialog collecting the mandatory `reason` and any
   `field_resolutions` — a `{field: "duplicate"}` map choosing which scalar fields
   to take from the duplicate (only merge-resolvable fields; the survivor's values
   win otherwise).
3. `POST /api/v1/clients/<survivor_id>/merge/`
   `{ duplicate_id, reason, field_resolutions? }` (**no `record_version`**) → the
   survivor (admin projection); `meta = { merge_record_id, transferred }`.
   - `CLIENT_MERGE_SELF` (400) → `duplicate_id` equals the survivor; re-pick.
   - `CLIENT_MERGE_REASON_REQUIRED` (400) → reveal/require the reason field.
   - `CLIENT_MERGE_TARGET_NOT_FOUND` (404) → duplicate or survivor unknown; refetch.
   - `CLIENT_MERGE_ALREADY_MERGED` (409) → one side is already merged; reconcile.
   - `CLIENT_MERGE_ARCHIVED` (409) → the survivor is archived; restore it first (or
     pick a live survivor).
4. On success, show the `meta.transferred` per-relation counts, then **invalidate
   both clients' queries and the list** — the duplicate now reads as archived.
   Review the trail via `GET /api/v1/clients/<survivor_id>/merge-history/`
   (admin-only, paginated `MergeRecord[]`).

## Bulk CSV export / import

Export the filtered directory to CSV (**staff+**) and bulk-create clients from CSV
(**admin/superadmin only**).

1. **Export:** `GET /api/v1/clients/export/?<same list filters>` → a streamed
   `text/csv` download (`Content-Disposition: attachment`), **not** the JSON
   envelope. Fetch with the bearer token, read the blob, and save it. Wire the query
   params to the current table filter/search/ordering state. Staff CSVs **omit**
   `internal_notes`; privileged actors get it and may add `include_archived=true`.
   A `429` under load is expected (throttle-flagged) — back off.
2. **Import:** build `FormData` with a single `file` part (a CSV, **≤1000 data
   rows** — required `legal_name` + `client_type` columns). `POST
/api/v1/clients/import/` (**admin/superadmin only**) →
   `{ created, failed, created_ids, errors }`.
   - `CLIENT_IMPORT_INVALID` (400) → missing / non-CSV file; field error on the
     upload.
   - `CLIENT_IMPORT_TOO_LARGE` (400) → over 1000 rows; prompt to split into batches.
   - A `200` with `failed > 0` is **not** a failure — render `created` / `failed`
     counts and iterate `errors[]` ({`row`, `errors`}) into a per-row error table so
     the user fixes and re-uploads only the failed rows. `created_ids` deep-links
     the new clients. Each row is created through the same validation + `client_created`
     audit as a single create (`source=import`).

## Move a client through its lifecycle (status)

Directory `status` changes go through the `PATCH` transition map — never
archive/restore.

1. `PATCH /api/v1/clients/<id>/` `{ status: "active", record_version }` — from
   `prospective`.
2. `PATCH /api/v1/clients/<id>/` `{ status: "former", reason, record_version }` —
   entering `former` **requires** a `reason`.
   - `CLIENT_STATUS_REASON_REQUIRED` → reveal a reason field and resend.
   - `CLIENT_STATUS_TRANSITION_INVALID` (422) → the move isn't allowed from the
     current status; refetch and re-derive the allowed next statuses.
   - `CLIENT_VERSION_CONFLICT` (409) → reload, retry with the fresh
     `record_version`.
3. Reactivate: `PATCH /api/v1/clients/<id>/` `{ status: "active", reason,
record_version }` — `former → active` **also requires a reason**.

> Allowed edges: `prospective → active`; `active → {inactive, former}`;
> `inactive → {active, former}`; `former → active`. Reason-required targets:
> `former` and reactivating a `former` client.

## Archive and restore (soft delete)

1. `POST /api/v1/clients/<id>/archive/` `{ record_version, reason? }` → `status`
   → `archived`, `archived_at` set.
   - `CLIENT_ARCHIVED` (409) → already archived; reconcile the UI state.
   - `CLIENT_VERSION_CONFLICT` (409) → reload + retry.
2. `POST /api/v1/clients/<id>/restore/` `{ record_version, status?, reason? }` →
   clears `archived_at`, sets the chosen non-archived status (default `active`).
   - `CLIENT_NOT_ARCHIVED` (409) → the record isn't archived; hide the restore
     action.
   - `CLIENT_RESTORE_STATUS_INVALID` (400) → the target status is `archived` or
     otherwise invalid; correct the target-status picker.

> Archived rows are excluded from the list unless a privileged actor passes
> `include_archived=true`.

## Admin freezes a record during review (lock)

1. `POST /api/v1/clients/<id>/lock/` `{ reason }` (reason mandatory,
   admin/superadmin only) → `is_locked=true`.
   - `CLIENT_ALREADY_LOCKED` (409) → reconcile the lock toggle with server state.
   - `CLIENT_LOCK_REASON_REQUIRED` (400) → require a reason field.
2. Staff `PATCH /api/v1/clients/<id>/` while locked → `CLIENT_RECORD_LOCKED`
   (**423**). Show the lock state and disable staff edit controls rather than let
   the request 423.
3. `POST /api/v1/clients/<id>/unlock/` `{ reason }` releases it.
   - `CLIENT_NOT_LOCKED` (409) → the record isn't locked; reconcile the toggle.

> Lock/unlock take **no** `record_version` — only a `reason`. They are
> admin/superadmin only; hide the controls from staff.

## Add a contact and promote its role (primary / spokesperson)

Contacts are nested under a client. Roles are auto-exclusive — at most one active
primary contact and one active spokesperson per client.

1. `POST /api/v1/clients/<id>/contacts/` `{ full_name, ...one of
email/phone/designation/department }` → contact `id`.
   - `CLIENT_CONTACT_DETAIL_REQUIRED` (400) → require at least one of email /
     phone / designation / department; block submit.
   - `CLIENT_RECORD_LOCKED` (423) → the parent client is locked (staff); disable
     the add form. `CLIENT_ARCHIVED` (409) → the parent is archived; read-only.
2. Promote a role: `PATCH /api/v1/clients/<id>/contacts/<contact_id>/`
   `{ is_primary_contact: true }` (or `is_spokesperson: true`) → the prior active
   holder is demoted server-side in the same transaction.
   - `CLIENT_INACTIVE_CONTACT_ROLE` (400) → the contact is inactive; reactivate it
     first (`is_active: true`) or clear the role.
3. `DELETE /api/v1/clients/<id>/contacts/<contact_id>/` **deactivates** (soft) the
   contact and clears both roles.

> After any role change, refetch the contacts list **or** the client detail — the
> embedded `primary_contact` / `spokesperson` reflect the new holder.

## Add and deactivate an address (one active primary)

1. `POST /api/v1/clients/<id>/addresses/` `{ address_type, line_1, is_primary? }`
   → address `id`. Setting `is_primary: true` demotes the prior active primary.
   - `CLIENT_RECORD_LOCKED` (423) / `CLIENT_ARCHIVED` (409) → parent guard, as
     above.
2. `DELETE /api/v1/clients/<id>/addresses/<address_id>/` **deactivates** (soft) the
   address and clears its primary flag (historical document references survive).

## Add and remove aliases (duplicate rejection)

1. `POST /api/v1/clients/<id>/aliases/` `{ alias, alias_type? }` → alias `id`.
   - `CLIENT_ALIAS_DUPLICATE` (409) → a normalized duplicate already exists for
     this client; surface a field error on `alias`.
2. `DELETE /api/v1/clients/<id>/aliases/<alias_id>/` **hard-deletes** the alias.

> Aliases have **no update** — to change one, remove it and add the new value.

## Assign and unassign tags (resolve-or-create catalog)

1. (optional) `GET /api/v1/clients/tags/?search=<q>` → the company-wide catalog for
   a typeahead.
2. `POST /api/v1/clients/<id>/tags/` `{ name }` → assignment `id` (with the nested,
   resolved-or-created catalog `tag`). Free-typed names create new catalog tags.
   - `CLIENT_TAG_ALREADY_ASSIGNED` (409) → the tag is already on the client; treat
     as a no-op.
   - `CLIENT_RECORD_LOCKED` (423) / `CLIENT_ARCHIVED` (409) → parent guard.
3. `DELETE /api/v1/clients/<id>/tags/<assignment_id>/` removes the **link only**
   (the catalog tag persists).
   - `CLIENT_TAG_ASSIGNMENT_NOT_FOUND` (404) → refresh the assignment list.

> All four child collections are embedded read-only on the client detail read;
> after a mutation, invalidate the client-detail query to reflect the change.

## Upload, replace, and remove the logo (private media)

The logo is nested media under a client. It is stored in **private** storage with
**no public URL**; the client read exposes authenticated `logo_url` /
`logo_thumbnail_url` (or `null`).

1. `POST /api/v1/clients/<id>/logo/` — **multipart** with a single `file` part →
   `LogoUploadResult` `{ logo_id, checksum, mime_type, width, height }` (`201`).
   The prior current logo is **retired** (soft; file retained) and a PNG thumbnail
   is generated server-side.
   - `CLIENT_LOGO_TYPE_UNSUPPORTED` (415) → not JPEG/PNG/WebP (SVG or spoofed
     extension); field error on the file input.
   - `CLIENT_LOGO_INVALID` (400) → not a decodable image.
   - `CLIENT_LOGO_TOO_LARGE` (413) → over 5 MB.
   - `CLIENT_LOGO_DIMENSIONS_INVALID` (400) → over 4096×4096.
   - `CLIENT_RECORD_LOCKED` (423) / `CLIENT_ARCHIVED` (409) → parent guard (staff on
     a locked client / any write on an archived client); disable the upload control.
2. Render it: refetch the client (or invalidate its query) → `logo_url` /
   `logo_thumbnail_url` now resolve. **Fetch the bytes with the bearer token** and
   render an object URL — a bare `<img src>` only works if the app forwards auth.
   - `CLIENT_LOGO_NOT_FOUND` (404) on a stream → no current logo; show a placeholder.
3. `DELETE /api/v1/clients/<id>/logo/` → **soft-retires** the current logo (file
   retained so historical document snapshots stay resolvable); records
   `client_logo_removed`. Same parent guard as upload.

> Replacing = re-`POST` (no separate update). After any logo mutation, invalidate
> the client list/detail query so `logo_url` / `logo_thumbnail_url` refresh.
