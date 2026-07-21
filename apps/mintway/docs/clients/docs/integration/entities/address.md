# `Address` — a postal address for a client

**Endpoint base:** `/api/v1/clients/{client_id}/addresses/` (list/create),
`/api/v1/clients/{client_id}/addresses/{address_id}/` (detail/update/deactivate)
**Access:** staff and admin/superadmin (uniform — no role projection). Every write
honours the parent client's **lock** (staff → `423`) and **archive** (`409`).
Unknown address under the client → non-disclosing `404`.
**Owns:** postal addresses (registered / office / branch / mailing / other) for one
client. **At most one active `is_primary` per client** — setting a new primary
demotes the previous one server-side. The full address list is embedded on the
parent client's detail read (see `client.md`).

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. Optional text fields
marked `Nullable=No` come back as `""` when unset (see `overview.md` "Empty vs
null").

| Field               | TS type          | In req | In res | Req | Nullable | Server-set | Enum           | Validation             | Notes                                  |
| ------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | -------------- | ---------------------- | -------------------------------------- |
| `id`                | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | UUID                   | Primary key                            |
| `address_type`      | `AddressType`    | ✓      | ✓      | ✓   | No       | ✗          | `address_type` | required               |                                        |
| `label`             | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤255                   | e.g. "Head Office"; `""` when unset    |
| `line_1`            | `string`         | ✓      | ✓      | ✓   | No       | ✗          | —              | required, ≤255         | Address line 1                         |
| `line_2`            | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤255                   | `""` when unset                        |
| `locality`          | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤255                   | City/municipality; `""` when unset     |
| `district_or_state` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤255                   | `""` when unset                        |
| `postal_code`       | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤32                    | `""` when unset                        |
| `country_code`      | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —              | 2 ASCII letters; upper | `""` when unset                        |
| `latitude`          | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —              | decimal(9,6)           | Optional mapping support               |
| `longitude`         | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —              | decimal(9,6)           | Optional mapping support               |
| `is_primary`        | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —              | ≤1 active per client   | Setting `true` demotes the old primary |
| `is_active`         | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —              | —                      | Default `true`; DELETE deactivates     |
| `created_at`        | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601               |                                        |
| `updated_at`        | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601               |                                        |

## 2. Types

```ts
type AddressType = "registered" | "office" | "branch" | "mailing" | "other"; // see enums.md

// Optional text components are Nullable=No → "" when unset; only lat/long are
// DB-nullable. Decimals serialize as strings (avoid float drift). See overview.md.
interface Address {
  id: string;
  address_type: AddressType;
  label: string;
  line_1: string;
  line_2: string;
  locality: string;
  district_or_state: string;
  postal_code: string;
  country_code: string;
  latitude: string | null; // Nullable=Yes; decimal-as-string
  longitude: string | null; // Nullable=Yes; decimal-as-string
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Create — `address_type` and `line_1` required; server-set fields omitted.
interface AddressCreate {
  address_type: AddressType;
  line_1: string;
  label?: string;
  line_2?: string;
  locality?: string;
  district_or_state?: string;
  postal_code?: string;
  country_code?: string;
  latitude?: string;
  longitude?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

// Update = partial create. No record_version on addresses.
type AddressUpdate = Partial<AddressCreate>;
```

## 3. Endpoints

### `GET /api/v1/clients/{client_id}/addresses/`

- **Purpose:** list a client's addresses.
- **Returns:** `list[Address]`.
- **Query params (list):** `include_inactive` (bool, **privileged actors only** —
  otherwise only active addresses are returned), `page`, `page_size`.
- **Policy key:** `clients.address.list`

### `POST /api/v1/clients/{client_id}/addresses/`

- **Purpose:** add an address.
- **Request:** `AddressCreate` — `address_type` and `line_1` required.
- **Returns:** the created `Address`, `201`.
- **Side effects:** setting `is_primary=true` demotes the current active primary;
  records `client_address_created` (and `client_primary_address_changed` when the
  primary flag is set).
- **Policy key:** `clients.address.create`

### `PATCH /api/v1/clients/{client_id}/addresses/{address_id}/`

- **Request:** `AddressUpdate`. (No `record_version`.)
- **Returns:** the updated `Address`.
- **Side effects:** same primary-demotion behaviour as create.
- **Policy key:** `clients.address.update`

### `DELETE /api/v1/clients/{client_id}/addresses/{address_id}/`

- **Purpose:** **deactivate** (soft) — sets `is_active=false` and clears the
  primary flag. Not a physical delete (historical document references stay
  resolvable).
- **Side effects:** records `client_address_deactivated`.
- **Policy key:** `clients.address.delete`

## 4. Validations & business rules

- `address_type` and `line_1` are **required** on create.
- `country_code`, when sent, must be 2 ASCII letters (ISO 3166-1 alpha-2), stored
  uppercase.
- At most **one active `is_primary` address** per client; promoting one
  auto-demotes the other (enforced by a DB partial-unique constraint too).
- All writes honour the parent client's **lock** (staff → `423`) and **archive**
  (`409`).
- No optimistic-concurrency `record_version` on this entity.

## 5. Errors

| Code                       | HTTP | Trigger                                          | Suggested UI handling                   |
| -------------------------- | ---- | ------------------------------------------------ | --------------------------------------- |
| `CLIENT_ADDRESS_NOT_FOUND` | 404  | unknown address under the client                 | not-found / refresh the list            |
| `CLIENT_RECORD_LOCKED`     | 423  | staff mutation while the parent client is locked | show lock banner; disable edit controls |
| `CLIENT_ARCHIVED`          | 409  | mutation while the parent client is archived     | show archived state                     |

## 6. Examples

```jsonc
// POST /api/v1/clients/<id>/addresses/ — request
{
  "address_type": "registered",
  "label": "Head Office",
  "line_1": "Putalisadak",
  "locality": "Kathmandu",
  "district_or_state": "Bagmati",
  "postal_code": "44600",
  "country_code": "NP",
  "is_primary": true,
}

// 201 — response.data
{
  "id": "ad11ad11-0000-4000-8000-000000000001",
  "address_type": "registered",
  "label": "Head Office",
  "line_1": "Putalisadak",
  "line_2": "",
  "locality": "Kathmandu",
  "district_or_state": "Bagmati",
  "postal_code": "44600",
  "country_code": "NP",
  "latitude": null,
  "longitude": null,
  "is_primary": true,
  "is_active": true,
  "created_at": "2026-07-20T12:06:00+05:45",
  "updated_at": "2026-07-20T12:06:00+05:45",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on addresses.
- **Role projection:** uniform; staff and admin see the same address fields.
- **Dates:** `created_at` / `updated_at` only; no date components carry a `*_bs`
  sibling.
- **Server-computed (never send):** `id`, `created_at`, `updated_at`.
- **Decimals as strings:** `latitude` / `longitude` are `string | null` — parse to
  a number only at the map layer; send them back as strings.
- **One-primary invariant:** treat `is_primary` like a radio — promoting one
  address demotes the prior primary; refetch to reflect it.
- **State mapping:** `423 CLIENT_RECORD_LOCKED` → disabled edit affordance driven
  by the parent's `is_locked`; `409 CLIENT_ARCHIVED` → archived-parent read-only
  state; `404 CLIENT_ADDRESS_NOT_FOUND` → refresh the address list.

```

```
