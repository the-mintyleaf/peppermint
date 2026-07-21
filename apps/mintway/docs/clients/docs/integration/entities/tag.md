# `Tag` — the company-wide tag catalog and per-client tag assignments

**Endpoint base:** catalog `GET /api/v1/clients/tags/` (read-only, **not
nested**); assignments `/api/v1/clients/{client_id}/tags/` (list/assign) and
`/api/v1/clients/{client_id}/tags/{assignment_id}/` (unassign)
**Access:** staff and admin/superadmin (uniform — no role projection). Assignment
writes honour the parent client's **lock** (staff → `423`) and **archive**
(`409`). Unknown assignment under the client → non-disclosing `404`.
**Owns:** two resources — the **`Tag`** catalog (a company-wide controlled
vocabulary) and the **`TagAssignment`** links between a client and a tag.
**Assigning is by name** — the server resolves an existing catalog tag by
normalized name or creates one, then links it. **Unassigning removes only the
link** (the catalog tag persists) and is a **hard delete** (audited). The full
assignment list is embedded on the parent client's detail read (see `client.md`).

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. The catalog `Tag` is
**never created directly** — its `name` is supplied through the assign input
(`TagAssignInput.name`), which resolves-or-creates it.

**`Tag` (catalog — `GET /api/v1/clients/tags/`):**

| Field             | TS type  | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                                             |
| ----------------- | -------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ------------------------------------------------- |
| `id`              | `string` | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Catalog primary key                               |
| `name`            | `string` | ✗      | ✓      | —   | No       | ✗          | —    | ≤100       | Display name; set via the assign `name`, not here |
| `normalized_name` | `string` | ✗      | ✓      | —   | No       | ✓          | —    | ≤100       | Case/whitespace-normalized; **globally unique**   |

**`TagAssignment` (link — `GET /api/v1/clients/{client_id}/tags/`):**

| Field        | TS type  | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                             |
| ------------ | -------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | --------------------------------- |
| `id`         | `string` | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Assignment primary key            |
| `tag`        | `Tag`    | ✗      | ✓      | —   | No       | ✓          | —    | —          | The assigned catalog tag (nested) |
| `created_at` | `string` | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                                   |

**`TagAssignInput` (assign body — `POST /api/v1/clients/{client_id}/tags/`):**

| Field  | TS type  | In req | In res | Req | Nullable | Server-set | Enum | Validation                | Notes                               |
| ------ | -------- | ------ | ------ | --- | -------- | ---------- | ---- | ------------------------- | ----------------------------------- |
| `name` | `string` | ✓      | ✗      | ✓   | No       | ✗          | —    | required, non-blank, ≤100 | Resolves-or-creates the catalog tag |

## 2. Types

```ts
// Catalog tag — a company-wide controlled vocabulary entry.
interface Tag {
  id: string;
  name: string;
  normalized_name: string; // server-set, globally unique
}

// A client ↔ tag link (the catalog tag is nested).
interface TagAssignment {
  id: string;
  tag: Tag;
  created_at: string;
}

// Assign-by-name input — resolves an existing catalog tag by normalized name or
// creates one, then links it to the client. There is no update payload.
interface TagAssignInput {
  name: string; // required, non-blank, ≤100
}
```

## 3. Endpoints

### `GET /api/v1/clients/tags/`

- **Purpose:** the company-wide tag catalog for filter dropdowns / typeahead. Not
  nested under a client.
- **Returns:** `list[Tag]`.
- **Query params (list):** `search` (optional, `icontains` over the name), `page`,
  `page_size`.
- **Policy key:** `clients.tag.list`

### `GET /api/v1/clients/{client_id}/tags/`

- **Purpose:** list a client's tag assignments.
- **Returns:** `list[TagAssignment]` (each with the nested `tag`).
- **Query params (list):** `page`, `page_size`.
- **Policy key:** `clients.tag_assignment.list`

### `POST /api/v1/clients/{client_id}/tags/`

- **Purpose:** assign a tag to the client by name.
- **Request:** `TagAssignInput` — `{ name }`.
- **Returns:** the created `TagAssignment` (with nested `tag`), `201`.
- **Side effects:** resolves-or-creates the catalog tag (case/whitespace
  normalized), links it, and records `client_tag_added`. Re-assigning an
  already-linked tag → `CLIENT_TAG_ALREADY_ASSIGNED`.
- **Policy key:** `clients.tag_assignment.create`

### `DELETE /api/v1/clients/{client_id}/tags/{assignment_id}/`

- **Purpose:** unassign — removes the client↔tag link only (the catalog tag
  persists). **Hard delete** (audited).
- **Side effects:** records `client_tag_removed`.
- **Policy key:** `clients.tag_assignment.delete`

## 4. Validations & business rules

- Assigning is **by name**: the server normalizes the name (case/whitespace),
  finds the existing catalog `Tag`, or creates it — the frontend never creates a
  catalog tag directly.
- `normalized_name` is **globally unique** across the catalog; two names that
  normalize equally resolve to the same tag.
- A tag can be assigned to a client only **once** — a duplicate assignment →
  `CLIENT_TAG_ALREADY_ASSIGNED`.
- Unassigning **hard-deletes the link only**; the catalog tag is never removed by
  this endpoint.
- Assignment writes honour the parent client's **lock** (staff → `423`) and
  **archive** (`409`).
- No optimistic-concurrency `record_version` on this entity.

## 5. Errors

| Code                              | HTTP | Trigger                                                  | Suggested UI handling                          |
| --------------------------------- | ---- | -------------------------------------------------------- | ---------------------------------------------- |
| `CLIENT_TAG_ALREADY_ASSIGNED`     | 409  | tag already assigned to the client                       | note it's already applied; no-op the toggle    |
| `CLIENT_TAG_ASSIGNMENT_NOT_FOUND` | 404  | unknown assignment under the client                      | not-found / refresh the assignment list        |
| `CLIENT_TAG_NOT_FOUND`            | 404  | reference to an unknown catalog tag                      | refresh the catalog; re-pick                   |
| `CLIENT_RECORD_LOCKED`            | 423  | staff assignment write while the parent client is locked | show lock banner; disable tag controls         |
| `CLIENT_ARCHIVED`                 | 409  | assignment write while the parent client is archived     | show archived state                            |
| —                                 | 405  | `PATCH` / `PUT` on an assignment or catalog (no update)  | never offer an edit action — unassign + re-add |

## 6. Examples

```jsonc
// POST /api/v1/clients/<id>/tags/ — request
{ "name": "Priority Partner" }

// 201 — response.data (assignment, with the resolved-or-created catalog tag)
{
  "id": "7a55eeee-0000-4000-8000-000000000001",
  "tag": {
    "id": "7a900000-0000-4000-8000-000000000009",
    "name": "Priority Partner",
    "normalized_name": "priority partner",
  },
  "created_at": "2026-07-20T12:08:00+05:45",
}

// GET /api/v1/clients/tags/ — response.data (catalog rows)
[
  { "id": "7a900000-0000-4000-8000-000000000009", "name": "Priority Partner", "normalized_name": "priority partner" },
  { "id": "7a900000-0000-4000-8000-00000000000a", "name": "Government", "normalized_name": "government" },
]
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on tags or assignments.
- **Role projection:** uniform; staff and admin see the same tag/assignment fields.
- **Dates:** `created_at` only; no `*_bs` sibling.
- **Server-computed (never send):** `id`, `normalized_name`, the nested `tag`
  object, `created_at`. The **only** field you send is `TagAssignInput.name`.
- **Assign by name, not id:** power a tag input with a typeahead against
  `GET /api/v1/clients/tags/`, but assign by sending `{ name }` — the server
  resolves or creates the catalog tag. Free-typed names create new catalog tags.
- **Catalog is shared & read-only:** the tag catalog is company-wide; there is no
  endpoint to rename or delete a catalog tag. Unassigning only drops the link.
- **State mapping:** `409 CLIENT_TAG_ALREADY_ASSIGNED` → treat as a no-op (already
  applied); `423 CLIENT_RECORD_LOCKED` → disabled tag controls from the parent's
  `is_locked`; `409 CLIENT_ARCHIVED` → archived-parent read-only state; `404
CLIENT_TAG_ASSIGNMENT_NOT_FOUND` → refresh the assignment list.

```

```
