# FLOWS — Clients

**Owner app:** `clients`
**Synced:** 2026-07-25, adapted from `.backend/concepts/clients_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Four rules govern every flow below.**
>
> 1. **Reads are shared; writes are Admin-only.** A Lead Manager loads every
>    screen here but receives 403 `CLIENTS_ACTOR_FORBIDDEN` on every create, edit,
>    retire, and restore. **Hide or disable the write controls for a Lead Manager**
>    rather than let them fail. Only `institutions` shares this split —
>    `applicants`, `applicant_journeys`, and `offers` do **not**. Superadmin is
>    denied outright, reads included.
> 2. **There is no delete, anywhere.** No screen gets a delete button. Withdrawal
>    is "Retire", which demands a reason and keeps the record forever.
> 3. **A retired client is not hidden.** It still comes back from the unfiltered
>    list. Whether to grey it out, move it to a separate section, or drop it from a
>    picker is a **presentation decision the API leaves to the UI**.
> 4. **Names are single English fields.** Render `name` for the organization and
>    `spokesperson_name` for the contact person — no language variants.

---

## Flow: Maintain the client directory

**Actor:** Admin · **Entry point:** Client List

1. **Client List** loads what exists → `GET /api/v1/clients/` (`clients.client.list`).
   - **Requires state:** nothing — the only screen in the project that works against a completely
     empty database with no prerequisite record anywhere.
   - Ordered **alphabetically by `name`**, not newest-first — the opposite of every other list.
     There is no `ordering` param; do not add a "recently added" default sort.
   - Rows carry `primary_contact_number` and `email`, so the phone-and-email columns need no per-row
     detail fetch.
2. **New Client Form** — add a partner → `POST /api/v1/clients/` (`clients.client.create`). Created at
   `status: active`; `status` is not accepted from the request.
   - **Only `name` is required.** Everything else — the spokesperson, any number — is optional. Do not
     mark the spokesperson fields required.
   - `VALIDATION_ERROR` on `name` → inline error; the form's one mandatory field.
   - `CLIENTS_CONTACT_NUMBER_DUPLICATE` → the same number was entered twice in the numbers repeater.
     Highlight the duplicate rows, not the whole form.
   - `CLIENTS_ACTOR_FORBIDDEN` → a Lead Manager reached this form; the button should not have been there.
3. **Edit Client Form** — correct details → `PATCH /api/v1/clients/<client_id>/` (`clients.client.update`).
   - **Send only the changed fields.** A read-modify-write-the-whole-object form fails here: including
     `status` (or `status_note`/`retired_at`/`retired_by`) returns 400 `CLIENTS_STATUS_IMMUTABLE`.
     This differs from `institutions`, which silently drops immutable fields — do not carry that form
     component across.
   - **Contact numbers replace, they do not append.** Send the complete new array; omit the key to
     leave them alone; send `[]` to clear. A form that always sends `contact_numbers: []` for an empty
     repeater will silently wipe them.
   - **A no-op save writes no audit event** — a UI showing "saved, history updated" after an unchanged
     submit is lying. _(Exception: sending `contact_numbers` always counts as a change.)_
   - This is where the concept's "the previous value should remain traceable" is met — the
     `client_updated` event carries each changed field's previous and new value; there is no version
     history to browse.
4. **Client Detail** — retire a partner → `POST /api/v1/clients/<client_id>/retire/` (`clients.client.retire`) with a reason.
   Sets `status: inactive`, `status_note`, `retired_at`, `retired_by`; appends `client_retired`.
   **The client stays in the directory.**
   - **The reason is mandatory** — enforce it before submit. `CLIENTS_STATUS_NOTE_REQUIRED` → a
     whitespace-only reason reached the server.
   - `CLIENTS_CLIENT_ALREADY_RETIRED` (409) → refetch; someone else retired it.
   - **This is the closest thing to a delete this app has.** Label the button "Retire", not "Delete"
     or "Archive", and say in the confirmation that the record is kept.
5. **Client Detail** — bring one back → `POST /api/v1/clients/<client_id>/restore/` (`clients.client.restore`).
   Sets `status: active`; clears the three retirement fields; appends `client_restored`.
   - `CLIENTS_CLIENT_NOT_RETIRED` (409) → it was already active; refresh and hide the button.
   - **Restoring does not erase the retirement** — `client_retired` and its reason stay in the history
     forever. If the UI shows "never retired" after a restore it is contradicting the audit trail.

## Flow: Find the right partner

**Actor:** Lead Manager or Admin · **Entry point:** Client List

1. **Client List** — search → `GET /api/v1/clients/?status=active&search=<query>` (`clients.client.list`).
   - **One search box covers the organization and spokesperson names** — the concept's "look up the
     company or contact person" is one input, not two. (Search covers those names only, not email,
     address, or notes.)
   - **Pass `status=active` for this flow.** Omitting it returns retired partners too — right for the
     maintenance directory, wrong for "who do I call".
   - `VALIDATION_ERROR` on `status` → the value is `inactive`, not `retired` or `archived`.
2. **Client Detail** — read the full record → `GET /api/v1/clients/<client_id>/` (`clients.client.read`).
   - The list row has only one number; the detail has all of them with labels (`mobile`, `work`,
     `whatsapp`, `viber`, …), plus website, address, and notes.
   - **`is_primary` is not guaranteed unique or present** — zero or several primaries are possible. The
     array is ordered primaries-first, so `contact_numbers[0]` is the sensible default.
   - **If `is_active` is false, show it** — a badge and a muted row. The record and its numbers stay
     readable; just don't present a retired partner as a preferred current contact.
   - **A Lead Manager can do all of this.** Only the edit/retire/restore controls are refused.
3. **Client Detail → history panel** _(optional)_ → `GET /api/v1/clients/<client_id>/history/` (`clients.client.list_history`, **cross-app: `audit`**).
   - **Readable by a Lead Manager**, unlike every write in this app. Never empty for an existing
     client — creation always writes one event.
   - The only place a past retirement shows up after a restore, and the only place a previous
     spokesperson's name can be recovered.
   - **Contact-number changes appear as a marker** (`changes.contact_numbers = { from: "replaced", to: "N number(s)" }`),
     **not** a before/after list. You cannot show "0141234567 was removed" from this data.

## Flow: Attribution support — NOT DELIVERABLE

`concepts/clients.txt` flow 3 describes referencing a client when recording where a lead or applicant
came from, so reporting can later show which organizations send work.

**No endpoint in this project supports it.** There is no `client` field on a lead or an applicant, no
`?client=` filter, and no referral count, statistic, or report anywhere. The `clients` app supplies the
directory; nothing consumes it yet.

This is listed rather than omitted because a frontend author reading the concept file will look for
these endpoints and needs to know they do not exist rather than conclude they missed them. Building it
means changing the shipped `leads` app and is a separate session.

**Do not ship UI that implies attribution works** — no "referred by" picker on a lead form, no "leads
referred" count on the client detail. Both would need an API that is not there.

---

## Endpoint coverage

| Policy key                    | Method / path                        | Used by flow(s)                                    | Notes                                                       |
| ----------------------------- | ------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------- |
| `clients.client.list`         | `GET /api/v1/clients/`               | Maintain (step 1); Find the right partner (step 1) | The Client List screen. Alphabetical, not newest-first      |
| `clients.client.create`       | `POST /api/v1/clients/`              | Maintain (step 2)                                  | Admin only. Only `name` is required                         |
| `clients.client.read`         | `GET /api/v1/clients/<id>/`          | Find the right partner (step 2)                    | The Client Detail screen                                    |
| `clients.client.update`       | `PATCH /api/v1/clients/<id>/`        | Maintain (step 3)                                  | Admin only. Rejects `status`; send only changed fields      |
| `clients.client.retire`       | `POST /api/v1/clients/<id>/retire/`  | Maintain (step 4)                                  | Admin only. Reason mandatory. **This is the delete button** |
| `clients.client.restore`      | `POST /api/v1/clients/<id>/restore/` | Maintain (step 5)                                  | Admin only. Retirement stays in history                     |
| `clients.client.list_history` | `GET /api/v1/clients/<id>/history/`  | Find the right partner (step 3)                    | Backed by `audit`. **Readable by a Lead Manager**           |

**Screens from `concepts/clients.txt`, and whether they are backed:**

- **Client List** — backed. Filters for `status`, `search` (org + spokesperson names), `fiscal_year`.
- **Client Detail** — backed, including its history/audit-trail panel.
- **New / Edit Client Form** — backed. **Admin-only; hide write controls for a Lead Manager.**
- **Attribution support (flow 3)** — **not a screen and not backed.** No endpoint records which partner
  referred a lead or applicant (see the flow above).

## Cross-app dependencies

- **References (outbound):** none. No flow here calls another app's endpoint, and the backend holds no
  foreign key into any business app. All flows require an `authenticate` session; history reads are
  served by `audit`, but that is this module's own history endpoint, not a cross-app call the frontend
  makes.
- **Referenced by other apps (inbound):** none. No other app's flow references a `clients.*` permission
  key.

**This is the only app in the project with no cross-app flow in either direction.** It will not stay
that way: when `leads.Lead` gains a client reference, the lead-creation flow will reference
`clients.client.list` as a picker fed by this directory.

## Open questions

- When should `leads.Lead` gain a `client` reference, and should `applicants` get one too or inherit it
  through the lead? Until then, attribution is unbuildable.
- Should a client have a type (agency / school / partner company)? V1 has none; they cannot be filtered
  apart.
- Should the directory warn about a probable duplicate on create? Two clients may currently share a
  name, email, and number with no warning.
- Is a bulk import needed for the initial directory, or is one-at-a-time entry acceptable?
- Should a retired client be excluded from pickers automatically, or is that a presentation choice left
  to each screen? The API returns both by default.
