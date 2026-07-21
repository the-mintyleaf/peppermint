# `Contact` — a natural person associated with a client

**Endpoint base:** `/api/v1/clients/{client_id}/contacts/` (list/create),
`/api/v1/clients/{client_id}/contacts/{contact_id}/` (detail/update/deactivate)
**Access:** staff and admin/superadmin. **Role-projected** — the protected `notes`
field is admin-only (absent from the staff read; a staff write cannot set it).
Every write honours the parent client's **lock** (staff → `423`) and **archive**
(`409`). Unknown contact under the client → non-disclosing `404`.
**Owns:** contact persons (spokesperson, director, account officer, general point
of contact) for one client. **At most one active `is_primary_contact` and one
active `is_spokesperson` per client** — setting either demotes the prior holder in
the same transaction. The compact `ContactMini` projection of the active primary /
spokesperson is embedded on the parent client (see `client.md`).

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. The `notes` field is
**admin-only** (absent from the staff projection entirely). Optional text fields
marked `Nullable=No` come back as `""` when unset (see `overview.md` "Empty vs
null").

| Field                | TS type          | In req    | In res    | Req | Nullable | Server-set | Enum | Validation           | Notes                                             |
| -------------------- | ---------------- | --------- | --------- | --- | -------- | ---------- | ---- | -------------------- | ------------------------------------------------- |
| `id`                 | `string`         | ✗         | ✓         | —   | No       | ✓          | —    | UUID                 | Primary key                                       |
| `full_name`          | `string`         | ✓         | ✓         | ✓   | No       | ✗          | —    | required, ≤255; NFC  | Person's name                                     |
| `honorific`          | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤32                  | Mr./Ms./Dr./Prof.; `""` when unset                |
| `designation`        | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤255                 | Job title; `""` when unset                        |
| `department`         | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤255                 | `""` when unset                                   |
| `email`              | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | email; lowercased    | `""` when unset                                   |
| `phone`              | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤32                  | `""` when unset                                   |
| `alternate_phone`    | `string`         | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤32                  | `""` when unset                                   |
| `is_primary_contact` | `boolean`        | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤1 active per client | Default `false`; setting `true` demotes prior     |
| `is_spokesperson`    | `boolean`        | ✓         | ✓         | ✗   | No       | ✗          | —    | ≤1 active per client | Default `false`; setting `true` demotes prior     |
| `is_active`          | `boolean`        | ✓         | ✓         | ✗   | No       | ✗          | —    | —                    | Default `true`; DELETE deactivates + clears roles |
| `valid_from`         | `string \| null` | ✓         | ✓         | ✗   | Yes      | ✗          | —    | date                 | Association start                                 |
| `valid_until`        | `string \| null` | ✓         | ✓         | ✗   | Yes      | ✗          | —    | date, ≥ `valid_from` | Association end                                   |
| `created_at`         | `string`         | ✗         | ✓         | —   | No       | ✓          | —    | ISO 8601             |                                                   |
| `updated_at`         | `string`         | ✗         | ✓         | —   | No       | ✓          | —    | ISO 8601             |                                                   |
| **admin-only ↓**     |                  |           |           |     |          |            |      |                      | absent from staff projection                      |
| `notes`              | `string`         | ✓ (admin) | ✓ (admin) | ✗   | No       | ✗          | —    | text                 | protected; `""` when unset                        |

**Embedded (`ContactMini`) projection** — the compact shape carried on the parent
client's `primary_contact` / `spokesperson` / `contacts` fields exposes only:
`id`, `full_name`, `honorific`, `designation`, `department`.

## 2. Types

```ts
// Compact projection embedded on the parent client (see client.md §2).
interface ContactMini {
  id: string;
  full_name: string;
  honorific: string;
  designation: string;
  department: string;
}

// Full contact projection — staff (omits the protected `notes`).
// Optional text fields are Nullable=No → "" when unset; only the two dates are
// DB-nullable. See overview.md "Empty vs null".
interface ContactStaff {
  id: string;
  full_name: string;
  honorific: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  alternate_phone: string;
  is_primary_contact: boolean;
  is_spokesperson: boolean;
  is_active: boolean;
  valid_from: string | null; // Nullable=Yes
  valid_until: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Admin projection adds the protected `notes`.
interface ContactAdmin extends ContactStaff {
  notes: string; // "" when unset
}

// Create payload — server-set fields omitted; `notes` is admin/superadmin only.
interface ContactCreate {
  full_name: string;
  honorific?: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  is_primary_contact?: boolean;
  is_spokesperson?: boolean;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  notes?: string; // admin/superadmin only — a staff body must omit it
}

// Update = partial create. No record_version on contacts.
type ContactUpdate = Partial<ContactCreate>;
```

## 3. Endpoints

### `GET /api/v1/clients/{client_id}/contacts/`

- **Purpose:** list a client's contact persons.
- **Returns:** `list[ContactStaff]` (staff) or `list[ContactAdmin]` (admin).
- **Query params (list):** `include_inactive` (bool, **privileged actors only** —
  otherwise only active contacts are returned), `page`, `page_size`.
- **Policy key:** `clients.contact.list`

### `POST /api/v1/clients/{client_id}/contacts/`

- **Purpose:** add a contact person.
- **Request:** `ContactCreate` — `full_name` required; `notes` admin-only.
- **Returns:** the created `Contact` (role projection), `201`.
- **Side effects:** setting `is_primary_contact` / `is_spokesperson` demotes the
  prior active holder; records `client_contact_created` (and
  `client_primary_contact_changed` / `client_spokesperson_changed` when a role is
  set).
- **Policy key:** `clients.contact.create`

### `GET /api/v1/clients/{client_id}/contacts/{contact_id}/`

- **Returns:** `ContactStaff` or `ContactAdmin` by role.
- **Policy key:** `clients.contact.read`

### `PATCH /api/v1/clients/{client_id}/contacts/{contact_id}/`

- **Request:** `ContactUpdate` — any writable subset. (No `record_version`.)
- **Returns:** the updated `Contact` (role projection).
- **Side effects:** same role-demotion behaviour as create.
- **Policy key:** `clients.contact.update`

### `DELETE /api/v1/clients/{client_id}/contacts/{contact_id}/`

- **Purpose:** **deactivate** (soft) — sets `is_active=false` and clears both
  roles. Not a physical delete.
- **Side effects:** records `client_contact_deactivated`.
- **Policy key:** `clients.contact.delete`

## 4. Validations & business rules

- A contact needs at least one of `email` / `phone` / `designation` /
  `department` (`CLIENT_CONTACT_DETAIL_REQUIRED`).
- `valid_until` cannot precede `valid_from` (`CLIENT_CONTACT_DATE_ORDER_INVALID`).
- An **inactive** contact cannot be `is_primary_contact` or `is_spokesperson`
  (`CLIENT_INACTIVE_CONTACT_ROLE`).
- At most **one active primary contact** and **one active spokesperson** per
  client; setting either role auto-demotes the previous holder (no client
  bookkeeping needed).
- All writes honour the parent client's **lock** (staff → `423`) and **archive**
  (`409`).
- No optimistic-concurrency `record_version` on this entity.

## 5. Errors

| Code                                | HTTP | Trigger                                          | Suggested UI handling                      |
| ----------------------------------- | ---- | ------------------------------------------------ | ------------------------------------------ |
| `CLIENT_CONTACT_NOT_FOUND`          | 404  | unknown contact under the client                 | not-found / refresh the list               |
| `CLIENT_CONTACT_DETAIL_REQUIRED`    | 400  | no email / phone / designation / department      | field error prompting for at least one     |
| `CLIENT_CONTACT_DATE_ORDER_INVALID` | 400  | `valid_until` precedes `valid_from`              | field error on the end-date field          |
| `CLIENT_INACTIVE_CONTACT_ROLE`      | 400  | primary/spokesperson set on an inactive contact  | reactivate first, or clear the role toggle |
| `CLIENT_RECORD_LOCKED`              | 423  | staff mutation while the parent client is locked | show lock banner; disable edit controls    |
| `CLIENT_ARCHIVED`                   | 409  | mutation while the parent client is archived     | show archived state                        |

## 6. Examples

```jsonc
// POST /api/v1/clients/<id>/contacts/  (admin) — request
{
  "full_name": "Sita Sharma",
  "honorific": "Ms.",
  "designation": "Director",
  "email": "sita@tribeni.edu.np",
  "phone": "+977-1-4444445",
  "is_spokesperson": true,
  "notes": "Prefers email contact",
}

// 201 — response.data (admin projection)
{
  "id": "c1a2b3c4-0000-4000-8000-000000000001",
  "full_name": "Sita Sharma",
  "honorific": "Ms.",
  "designation": "Director",
  "department": "",
  "email": "sita@tribeni.edu.np",
  "phone": "+977-1-4444445",
  "alternate_phone": "",
  "is_primary_contact": false,
  "is_spokesperson": true,
  "is_active": true,
  "valid_from": null,
  "valid_until": null,
  "notes": "Prefers email contact",
  "created_at": "2026-07-20T12:05:00+05:45",
  "updated_at": "2026-07-20T12:05:00+05:45",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on contacts.
- **Role projection:** `notes` is **absent** for staff (use `ContactStaff`), not
  `null`; admin/superadmin get `ContactAdmin`. A staff form must not render or send
  `notes` — the server rejects it via the write serializer whitelist.
- **Dates:** `valid_from` / `valid_until` are plain dates (no `*_bs` sibling).
- **Server-computed (never send):** `id`, `created_at`, `updated_at`.
- **One-active invariant:** treat the primary/spokesperson toggles as radio-like —
  setting one on a contact silently clears it on whoever held it before; refetch
  the list (or the client detail) to reflect the demotion.
- **State mapping:** `423 CLIENT_RECORD_LOCKED` → disabled edit affordance driven
  by the parent's `is_locked` (ideally never fire the request); `409
CLIENT_ARCHIVED` → archived-parent read-only state; `404
CLIENT_CONTACT_NOT_FOUND` → refresh the contacts list.

```

```
