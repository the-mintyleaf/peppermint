# Integration — Clients

**Owner app:** `clients`
**Version:** 1.2.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/clients/docs/{INTEGRATION,API,DATA_CONTRACT,SECURITY}.md`)

> Re-sync with `/sync-api grandway clients` when the backend's
> Change History moves past version 1.2.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `clients` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 7 endpoints, one resource (`Client`) plus its inline `ContactNumber` child                                          |
| 1.1.0   | 2026-07-24 | No endpoint change. History entries gained `actor_id` (shape owned by `audit`). Additive. `audit` recorded as a read dependency as well as a write |
| 1.2.0   | 2026-07-25 | **Breaking (backend):** English-only names — the `_np`/`_romanized` columns dropped and `_en` fields renamed to bare (`name`, `spokesperson_name`) |

---

## 1. Module

- **Name:** Clients — the consultancy's B2B partner directory: the agencies,
  schools, and companies that refer or send applicants, with the contact details
  staff need to reach them. It is **a reference directory, not a CRM** — no
  pipelines, deals, commissions, tasks, or communication history, and (crucially)
  **no attribution link** back to any lead or applicant (see §9).
- **Base path:** `/api/v1/clients/`
- **Auth — read-shared, write-Admin-only.** Bearer access JWT on every endpoint.
  `admin` and `lead_manager` may **read** (list, detail, history); **only `admin`
  may write** (create, update, retire, restore) — a `lead_manager` write is refused
  403 `CLIENTS_ACTOR_FORBIDDEN`. A `superadmin` token is refused 403 on
  **everything, reads included.** A directory screen must **hide or disable its
  write controls for a Lead Manager** rather than let them fail; reads stay open —
  looking up who to call at a partner is the whole point of the directory.

## 2. Requires

| Depends on     | Kind                      | Why                                                                                                                                                                                                                                                                     | What breaks without it                                                                                                                                |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticate` | framework + FK            | Issues the access JWT and supplies `authority_type` (decides both whether the caller may act and whether they may write). `created_by` (`PROTECT`), `retired_by` (`SET_NULL`) reference users.                                                                          | Every endpoint 401s; a `superadmin` gets 403 `CLIENTS_ACTOR_FORBIDDEN` on every route including reads; attribution of who added/retired unresolvable. |
| `audit`        | service call + read shape | Every create, update, retire, and restore appends one immutable event carrying the changed fields' previous and new values. This module keeps no history of its own; `/history/` reads audit's selector and renders audit's shared shape (read **and** write coupling). | Module does not start. If only the write path failed, edits would succeed but leave no trace and `/history/` would return an empty list.              |

**This module depends on no business app, and no business app depends on it.** It
is the **only app in the project with no cross-app edge in either direction** — a
client directory can be built, browsed, and maintained entirely on its own. No
write here touches another record; nothing outside this module references a client.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope (`../CORE_INTEGRATION.md` §3) —
  `{ success, message, data, meta }` / `{ success: false, error: { code, message, details } }`.
  `error.details` is always present (`{}` when no field errors). **Do not assert on `message`** —
  branch on HTTP status and `error.code`.
- **`CLIENTS_ACTOR_FORBIDDEN` replaces the global `PERMISSION_DENIED`, it does not coexist with it.**
  You will not see `PERMISSION_DENIED` from `/api/v1/clients/`. It applies identically to all seven
  endpoints (one code for two different refusals — a Lead Manager writing and a Superadmin doing
  anything; the `message` differs, the code does not) and is omitted from the per-endpoint error
  lists in §7.
- **404 is always genuine** — `CLIENTS_CLIENT_NOT_FOUND` never means "not yours". There is no owner
  scoping; nothing is hidden from an authorised caller.
- **Nothing is ever deleted — there is no `DELETE` on any endpoint.** Withdrawal is _retire_
  (`status: inactive` with a mandatory reason); the record is kept forever and stays in unfiltered
  list results. Build a "Retire" control, never a "Delete" (or even "Archive") button.
- **`status` and the retirement fields are REJECTED on `PATCH`, not ignored** (unlike `institutions`,
  which drops them). Sending `status`, `status_note`, `retired_at`, or `retired_by` to update →
  400 `CLIENTS_STATUS_IMMUTABLE`, every offending field named in `details`. Standing moves only
  through the retire/restore actions. **Send only the fields the user actually changed** — a
  read-modify-write-the-whole-object edit form fails on every save.
- **`contact_numbers` is a replacement set, and `null` ≠ `[]`.** Sending the key replaces every
  number the client has (the payload is the complete set it should hold afterwards, not an addition);
  **omitting** the key leaves the existing numbers alone; **sending `[]`** clears them. There are no
  per-number endpoints — a number has an `id` on read, but you never address it. A form that always
  sends `contact_numbers: []` for an empty repeater will silently wipe them.
- **A `PATCH` that changes nothing writes no audit event** — still 200 with the unchanged record. A
  UI showing "saved, history updated" after a no-op save is lying. **Exception:** sending
  `contact_numbers` always counts as a change and writes history, even when the resulting set is
  identical.
- **`logo_url` and `website` are plain URL STRING fields, not uploads or validated links.** Stored
  exactly as given, never fetched, reachability-checked, or proxied. Rendering `logo_url` in an
  `<img>` leaks a referrer to a third-party host and shows whatever that host serves; format
  validation is not safety validation. Proxy or allowlist at the frontend if that matters (§9).
- **HTTP:** `POST /clients/` → 201; every other success → 200. Domain-rule violations → 400; standing
  conflicts (retire on a retired client, restore on an active one) → 409; missing URL record → 404;
  authority failure → 403; unrouted method → 405 `METHOD_NOT_ALLOWED`.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100; over-max clamped).
  Applied to both list endpoints (the directory and the history). `data` is the bare array; page
  metadata (`count`, `page`, `page_size`, `next`, `previous`) lives in `meta`.
- **Ordering is fixed and not client-controllable** — no `sort`/`ordering` param. The directory is
  ordered **alphabetically by `name`** — the **opposite of every other list in the project**, which
  are newest-first; nobody looks up a partner by when it was added. History is newest-first.
- **IDs:** UUID strings. There is **no human-readable code** on a client (unlike `institutions.Country`
  or `leads.LeadSource`) — always address a client by `id`.
- **Times:** ISO 8601 UTC. `created_at`/`updated_at` carry **no** `_bs` sibling; only `retired_at`
  carries `retired_at_bs` (`{ year, month, day, month_name, display }` or `null`) — a date staff act
  on. No BS **input** anywhere.
- **Empty text fields are `""`, never `null`.** The only nullable fields are `retired_at`,
  `retired_by_username`, and `primary_contact_number` (on the list shape).
- **Invalid query params are rejected 400, not ignored** — `?status=retired` errors (the value is
  `inactive`, not `retired` or `archived`) rather than returning an unfiltered set. `page_size` over
  100 is clamped, not rejected.

## 4. Models

**Client — list shape** (`GET /api/v1/clients/` rows): `{ id, name, spokesperson_name, email, primary_contact_number?, status: enum, is_active, logo_url, updated_at }`.

- `primary_contact_number` is a **flat string or `null`**, not an object — the number flagged primary,
  else the first recorded, else `null`. It exists so the directory can show a phone column without a
  per-row detail fetch.
- The list deliberately omits `website`, `address`, `notes`, `spokesperson_designation`, and the full
  number list. Fetch the detail for those.

**Client — detail shape** (retrieve, create, update, retire, **and** restore): `{ id, name, spokesperson_name, spokesperson_designation, email, website, logo_url, address, contact_numbers: ContactNumber[], status: enum, is_active, status_note, retired_at?, retired_at_bs?: json, retired_by_username?, notes, created_by_username, created_at, updated_at }`.

- `name` is the organization's name, `spokesperson_name` the contact person's — both plain English
  fields, no language variants. Search covers both.
- `address` is **one free-text field**, not a structured object (unlike `applicants`, which has
  province/district/municipality/ward). No geographic filtering is possible.
- `status_note` is non-empty only when `status` is `inactive`; restoring clears it.
- `is_active` is derived, read-only — `status === "active"`.

**ContactNumber** — read shape `{ id, number, label: enum, is_primary }`.

- Read-only in this shape. On **write**, send `{ number, label?, is_primary? }` — the `id` is neither
  accepted nor needed (numbers are replaced as a set).
- `is_primary` is **not enforced unique or present** — a client may have zero primary numbers, or
  several. The array is ordered primaries-first, so `contact_numbers[0]` is the sensible one to show;
  do not assume exactly one is flagged.

**HistoryEvent** (`GET /api/v1/clients/<id>/history/` rows): `{ id, action: enum, actor_type: enum, actor_id: uuid | null, actor_label, summary, reason, changes: json, metadata: json, created_at, created_at_bs: json }`.

- Owned by the `audit` module (its `AuditEventHistoryEntry`); this app renders it, every module's
  `/history/` returns the identical shape. `actor_id` is the acting user's UUID or `null` for
  system/AI actors — prefer it over `actor_label` (a preserved username snapshot) when linking.
- `changes` maps field → `{ from, to }` (both stringified); `{}` on creation events.
- **A contact-number replacement appears as `changes.contact_numbers = { from: "replaced", to: "N number(s)" }`**
  — a marker, never a before/after list. You cannot recover which number was added or removed (§9).

## 5. Enums

- **`Client.status`** (2): `active` | `inactive`.
  - **No `paused`, no `archived`, and there will not be** — a partner is either offered as a current
    contact or not. The _reason_ lives in `status_note` as free text; a "paused" badge is the UI's
    own rule to define.
  - **`inactive` does not mean hidden** — a retired client is still returned by the unfiltered list.
    Whether to grey it out, move it to an "inactive" section, or drop it from a picker is a
    **presentation decision the API leaves to the UI**.
- **`ContactNumber.label`** (6): `mobile` | `home` | `work` | `whatsapp` | `viber` | `other` — the same
  value set as `leads` and `applicants` contact numbers, deliberately.
- **`HistoryEvent.action`** (4): `client_created` | `client_updated` | `client_retired` | `client_restored`.
- **`HistoryEvent.actor_type`** (5): `superadmin` | `admin` | `lead_manager` | `system` | `ai` — the
  `audit` enum. In practice only `admin` appears here, since only Admins can write.
- **`spokesperson_designation`** is **not an enum** — free text (e.g. `Managing Director`).

## 6. Dependency order

1. A `Client` needs **nothing** — no parent record, no external reference, no prerequisite. It is a
   root, and this is the **only module in the project you can populate from a completely empty
   database** without touching anything else.
2. `ContactNumber` needs a `Client`, but is never created independently — it arrives inside the client
   payload as a replacement set.

**Start here:** `POST /api/v1/clients/` as an Admin.

## 7. Endpoints

All seven live under one resource. `CLIENTS_ACTOR_FORBIDDEN` (403) applies to every one and is omitted
below. **There is no `DELETE`.** Reads (`GET`) allow `admin` + `lead_manager`; writes (`POST`/`PATCH`)
allow `admin` only.

| Endpoint                        | Method | Policy key                    | Auth             | Notes                                                                                                      |
| ------------------------------- | ------ | ----------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `/api/v1/clients/`              | GET    | `clients.client.list`         | Admin + Lead Mgr | Alphabetical by `name`. Filters: `status`, `search`, `fiscal_year`. List shape (omits detail-only fields)  |
| `/api/v1/clients/`              | POST   | `clients.client.create`       | Admin only       | 201. Only `name` required; `status` always starts `active` and is not accepted                             |
| `/api/v1/clients/<id>/`         | GET    | `clients.client.read`         | Admin + Lead Mgr | Detail shape with `contact_numbers` nested                                                                 |
| `/api/v1/clients/<id>/`         | PATCH  | `clients.client.update`       | Admin only       | `status`/retirement fields rejected; `contact_numbers` replaces (null ≠ [])                                |
| `/api/v1/clients/<id>/retire/`  | POST   | `clients.client.retire`       | Admin only       | Reason mandatory. **This is what the delete button becomes.** Client stays in the list; requires `active`  |
| `/api/v1/clients/<id>/restore/` | POST   | `clients.client.restore`      | Admin only       | Empty body. Clears retirement fields; requires `inactive`. History keeps `client_retired`                  |
| `/api/v1/clients/<id>/history/` | GET    | `clients.client.list_history` | Admin + Lead Mgr | Backed by `audit`; newest-first; contact-number changes shown as a marker only. **Readable by a Lead Mgr** |

### Request bodies

- **Create:** `name` (**required**); then optional `spokesperson_name`, `spokesperson_designation`,
  `email`, `website`, `logo_url`, `address`, `notes`, `contact_numbers`. `status` is not accepted —
  always starts `active`. Defaults for omitted fields: text → `""`, `contact_numbers` → `[]`.
- **Update:** any subset of the same writable fields (`name` becomes optional) — **and nothing else.**
  Sending `status`/`status_note`/`retired_at`/`retired_by` fails the whole request. `contact_numbers`
  replaces wholesale; omit to leave alone, `[]` to clear.
- **Retire:** `{ reason }` — required, non-empty (whitespace-only is rejected).
- **Restore:** no body (empty JSON object is fine).

## 8. Error codes

| Code                               | HTTP | Notes                                                                                           |
| ---------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| `CLIENTS_ACTOR_FORBIDDEN`          | 403  | Lead Manager writing, or Superadmin on any route (reads included). Replaces `PERMISSION_DENIED` |
| `CLIENTS_CLIENT_NOT_FOUND`         | 404  | No client with that id. Always genuine                                                          |
| `CLIENTS_STATUS_IMMUTABLE`         | 400  | `PATCH` carried `status`, `status_note`, `retired_at`, or `retired_by`; `details` names each    |
| `CLIENTS_CONTACT_NUMBER_DUPLICATE` | 400  | The same number appears twice in one payload (create or update)                                 |
| `CLIENTS_STATUS_NOTE_REQUIRED`     | 400  | Retire — reason missing or whitespace-only (a blank `""` fails earlier as `VALIDATION_ERROR`)   |
| `CLIENTS_CLIENT_ALREADY_RETIRED`   | 409  | Retire on an already-inactive client                                                            |
| `CLIENTS_CLIENT_NOT_RETIRED`       | 409  | Restore on an active client                                                                     |
| `VALIDATION_ERROR`                 | 400  | Missing `name` on create, a blank retire reason, or a bad filter value (`?status=retired`)      |

## 9. Gaps

**Blocking — features the concept describes with no endpoint here**

- **Attribution is not built — the largest gap, and the stated reason this module exists.**
  `concepts/clients.txt` flow 3 describes clients supplying the reference record for "which
  organizations are sending work". **There is no `client` field on a lead or an applicant, no
  `?client=` filter anywhere, and no referral count, statistic, or report.** A client cannot be
  connected to a single person the partner referred. **Do not ship UI that implies attribution
  works** — no "referred by" picker on a lead form, no "leads referred" count on the client detail.
  Building it means changing the `leads` app and is a separate piece of work.
- **No supporting files, and the logo is not one.** `logo_url` is a plain external URL string, not an
  upload — `uploaded_files` shipped but a `Client` is not one of its owner types, so a logo cannot be
  attached there today. Migrating it later would change a shipped response shape.

**Behavioural — things that will surprise a client**

- **`contact_numbers` replaces wholesale, and `null` ≠ `[]`.** Omit to leave alone, `[]` to clear,
  full array to replace. Sending it always writes a history event even when the set is identical.
- **`status` is rejected on `PATCH`, not dropped** — the inverse of `institutions`. Do not reuse a
  round-trip whole-object edit form; send only changed fields.
- **A retired client is not hidden** — it still comes back from the unfiltered list. Pass
  `status=active` for pickers; omit `status` for the maintenance directory. Presentation of retired
  rows is the UI's decision.
- **Contact-number history is a marker, not a diff** — `{ from: "replaced", to: "N number(s)" }`. You
  cannot recover which number was added or removed, nor a previous number, from the history.
- **`logo_url` / `website` are unvalidated third-party URLs** — not fetched, reachability-checked, or
  proxied. Rendering `logo_url` in an `<img>` leaks a referrer and shows whatever the host serves.
- **`is_primary` is neither unique nor required** — zero or several primaries are possible. Sort puts
  primaries first; use `contact_numbers[0]`.
- **No duplicate detection** — two clients may share a name, email, and numbers with no warning. Guard
  in the UI by checking the list before submitting, if it matters.
- **No `client_type`** — agencies, schools, and partner companies are the same shape here and cannot
  be filtered apart.
- **The address is unstructured** — one free-text field; no geographic filtering or grouping.
- **`search` covers organization + spokesperson names only** — not `email`, `website`, `address`, or
  `notes`. The spokesperson half is a sequential scan (not trigram-indexed), fine at the intended
  bounded scale.
- **No bulk import** — partners are added one at a time; there is no CSV path or management command.

> **Source note.** The v1.2.0 English-only rename left stale duplicate name entries in the source
> docs' `Send (create/update)` list (`name, name, name, spokesperson_name, …`). §4 Models above is
> taken from `DATA_CONTRACT.md`'s authoritative field tables and is the shape to trust.
