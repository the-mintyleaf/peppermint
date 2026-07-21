# `Alias` — an alternate searchable name for a client

**Endpoint base:** `/api/v1/clients/{client_id}/aliases/` (list/add),
`/api/v1/clients/{client_id}/aliases/{alias_id}/` (remove)
**Access:** staff and admin/superadmin (uniform — no role projection). Every write
honours the parent client's **lock** (staff → `423`) and **archive** (`409`).
Unknown alias under the client → non-disclosing `404`.
**Owns:** alternate names (former name, acronym, brand, local-language name) that
broaden client search. **Add / remove only** — there is no update; removal is a
**hard delete** (audited). A normalized duplicate for the same client is rejected.
The full alias list is embedded on the parent client's detail read (see
`client.md`).

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. `alias_type` marked
`Nullable=No` comes back as `""` when unset (see `overview.md` "Empty vs null").

| Field              | TS type           | In req | In res | Req | Nullable | Server-set | Enum         | Validation     | Notes                                   |
| ------------------ | ----------------- | ------ | ------ | --- | -------- | ---------- | ------------ | -------------- | --------------------------------------- |
| `id`               | `string`          | ✗      | ✓      | —   | No       | ✓          | —            | UUID           | Primary key                             |
| `alias`            | `string`          | ✓      | ✓      | ✓   | No       | ✗          | —            | required, ≤200 | The alternate name                      |
| `alias_type`       | `AliasType \| ""` | ✓      | ✓      | ✗   | No       | ✗          | `alias_type` | —              | `""` when unset                         |
| `normalized_alias` | `string`          | ✗      | ✓      | —   | No       | ✓          | —            | ≤200           | Romanized+lowercased dedupe/search form |
| `created_at`       | `string`          | ✗      | ✓      | —   | No       | ✓          | —            | ISO 8601       |                                         |

## 2. Types

```ts
type AliasType = "acronym" | "former_name" | "translation" | "brand" | "other"; // see enums.md

// alias_type is Nullable=No → "" when unset (never null). See overview.md.
interface Alias {
  id: string;
  alias: string;
  alias_type: AliasType | ""; // "" when unset
  normalized_alias: string; // server-set dedupe/search form
  created_at: string;
}

// Add payload — `alias` required; server-set fields omitted.
// There is no update payload — aliases are add/remove only.
interface AliasCreate {
  alias: string;
  alias_type?: AliasType;
}
```

## 3. Endpoints

### `GET /api/v1/clients/{client_id}/aliases/`

- **Purpose:** list a client's aliases.
- **Returns:** `list[Alias]`.
- **Query params (list):** `page`, `page_size`.
- **Policy key:** `clients.alias.list`

### `POST /api/v1/clients/{client_id}/aliases/`

- **Purpose:** add an alias.
- **Request:** `AliasCreate` — `alias` required, optional `alias_type`.
- **Returns:** the created `Alias`, `201`.
- **Side effects:** derives `normalized_alias`; records `client_alias_added`. A
  normalized duplicate for the client is rejected (`CLIENT_ALIAS_DUPLICATE`).
- **Policy key:** `clients.alias.create`

### `DELETE /api/v1/clients/{client_id}/aliases/{alias_id}/`

- **Purpose:** **hard delete** the alias (the removal is audit-logged).
- **Side effects:** records `client_alias_removed`.
- **Policy key:** `clients.alias.delete`

## 4. Validations & business rules

- `alias` is **required** and non-blank.
- A normalized duplicate (`normalized_alias`) for the **same client** is rejected
  (`CLIENT_ALIAS_DUPLICATE`) — normalization is romanize + lowercase, so
  case/script variants collide.
- **No update** — to change an alias, remove it and add the new one.
- All writes honour the parent client's **lock** (staff → `423`) and **archive**
  (`409`).
- No optimistic-concurrency `record_version` on this entity.

## 5. Errors

| Code                     | HTTP | Trigger                                          | Suggested UI handling                        |
| ------------------------ | ---- | ------------------------------------------------ | -------------------------------------------- |
| `CLIENT_ALIAS_NOT_FOUND` | 404  | unknown alias under the client                   | not-found / refresh the list                 |
| `CLIENT_ALIAS_DUPLICATE` | 409  | normalized alias already exists for the client   | field error on `alias`; it already exists    |
| `CLIENT_RECORD_LOCKED`   | 423  | staff mutation while the parent client is locked | show lock banner; disable edit controls      |
| `CLIENT_ARCHIVED`        | 409  | mutation while the parent client is archived     | show archived state                          |
| —                        | 405  | `PATCH` / `PUT` on an alias (no update exists)   | never offer an edit action — remove + re-add |

## 6. Examples

```jsonc
// POST /api/v1/clients/<id>/aliases/ — request
{
  "alias": "TEC",
  "alias_type": "acronym",
}

// 201 — response.data
{
  "id": "a11a5000-0000-4000-8000-000000000001",
  "alias": "TEC",
  "alias_type": "acronym",
  "normalized_alias": "tec",
  "created_at": "2026-07-20T12:07:00+05:45",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on aliases.
- **Role projection:** uniform; staff and admin see the same alias fields.
- **Dates:** `created_at` only; no `*_bs` sibling.
- **Server-computed (never send):** `id`, `normalized_alias`, `created_at`.
- **Add/remove only:** there is no PATCH — render an add form and a delete action,
  no inline edit. Removal is a **hard delete**, not a soft deactivation.
- **State mapping:** `409 CLIENT_ALIAS_DUPLICATE` → field error on `alias`; `423
CLIENT_RECORD_LOCKED` → disabled edit affordance from the parent's `is_locked`;
  `409 CLIENT_ARCHIVED` → archived-parent read-only state; `404
CLIENT_ALIAS_NOT_FOUND` → refresh the alias list.

```

```
