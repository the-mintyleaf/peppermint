# `Address` — an applicant's structured + free-text address

**Endpoint base:** `/api/v1/applicants/<applicant_id>/addresses/`
**Access:** **staff and above** (the one profile child staff may edit). Honours
the parent applicant's lock (staff → 423) and archive (409).
**Owns:** postal/residential addresses for one applicant. At most **one primary**
per applicant — setting a new primary demotes the previous one server-side.

## 1. Fields (rows)

| Field               | TS type          | In req | In res | Req | Nullable | Server-set | Enum           | Validation | Notes                                  |
| ------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | -------------- | ---------- | -------------------------------------- |
| `id`                | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | UUID       | Primary key                            |
| `address_type`      | `AddressType`    | ✓      | ✓      | ✗   | No       | ✗          | `address_type` | —          | Default `current`                      |
| `country`           | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `province_or_state` | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `district`          | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `municipality`      | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `ward`              | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `locality`          | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `street`            | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `postal_code`       | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          |                                        |
| `address_text`      | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —              | —          | Free-text fallback when unstructured   |
| `is_primary`        | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —              | —          | Setting `true` demotes the old primary |
| `valid_from`        | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —              | date       |                                        |
| `valid_to`          | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —              | date       |                                        |
| `created_at`        | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601   |                                        |
| `updated_at`        | `string`         | ✗      | ✓      | —   | No       | ✓          | —              | ISO 8601   |                                        |

> Structured components (`country`…`postal_code`) are plain `CharField`s; the
> source states no max lengths, so none are asserted here — validate presence,
> not length.

## 2. Types

```ts
type AddressType = "current" | "permanent" | "mailing" | "foreign" | "other"; // see enums.md

// Optional text components are Nullable=No → "" when unset (never null);
// only valid_from/valid_to are DB-nullable. See overview.md "Empty vs null".
interface Address {
  id: string;
  address_type: AddressType;
  country: string;
  province_or_state: string;
  district: string;
  municipality: string;
  ward: string;
  locality: string;
  street: string;
  postal_code: string;
  address_text: string;
  is_primary: boolean;
  valid_from: string | null; // Nullable=Yes
  valid_to: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// All writable fields are optional — none is individually required
interface AddressCreate {
  address_type?: AddressType;
  country?: string;
  province_or_state?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  locality?: string;
  street?: string;
  postal_code?: string;
  address_text?: string;
  is_primary?: boolean;
  valid_from?: string;
  valid_to?: string;
}
type AddressUpdate = Partial<AddressCreate>; // no record_version on addresses
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/addresses/`

- **Returns:** `list[Address]`.
- **Policy key:** `applicant.address.list`

### `POST /api/v1/applicants/<applicant_id>/addresses/`

- **Request:** `AddressCreate`.
- **Returns:** the created `Address`.
- **Side effects:** setting `is_primary=true` demotes the current primary.
- **Policy key:** `applicant.address.create`

### `PATCH /api/v1/applicants/<applicant_id>/addresses/<address_id>/`

- **Request:** `AddressUpdate`. (No `record_version` on addresses.)
- **Returns:** the updated `Address`.
- **Policy key:** `applicant.address.update`

### `DELETE /api/v1/applicants/<applicant_id>/addresses/<address_id>/`

- **Purpose:** hard delete (the change is audit-logged server-side).
- **Policy key:** `applicant.address.delete`

## 4. Validations & business rules

- At most one `is_primary` address per applicant; promoting one auto-demotes the
  other (no client bookkeeping needed).
- All mutations honour the parent applicant's **lock** (staff → 423) and
  **archive** (409).
- No optimistic-concurrency `record_version` on this entity.

## 5. Errors

| Code                          | HTTP | Trigger                             | Suggested UI handling                   |
| ----------------------------- | ---- | ----------------------------------- | --------------------------------------- |
| `APPLICANT_ADDRESS_NOT_FOUND` | 404  | unknown address under the applicant | not-found / refresh the list            |
| `APPLICANT_RECORD_LOCKED`     | 423  | staff mutation while parent locked  | show lock banner; disable edit controls |
| `APPLICANT_ARCHIVED`          | 409  | mutation on an archived applicant   | show archived state                     |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/addresses/ — request
{
  "address_type": "permanent",
  "country": "Nepal",
  "district": "Kathmandu",
  "municipality": "Kathmandu Metropolitan City",
  "ward": "16",
  "is_primary": true,
}

// 201 — response.data
{
  "id": "aa11…",
  "address_type": "permanent",
  "country": "Nepal",
  "province_or_state": "",
  "district": "Kathmandu",
  "municipality": "Kathmandu Metropolitan City",
  "ward": "16",
  "locality": "",
  "street": "",
  "postal_code": "",
  "address_text": "",
  "is_primary": true,
  "valid_from": null,
  "valid_to": null,
  "created_at": "2026-07-19T04:20:00Z",
  "updated_at": "2026-07-19T04:20:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Role projection:** uniform; staff and admin see the same address fields.
- **Dates:** `valid_from` / `valid_to` are plain dates (no `_bs` sibling here).
- **Server-computed:** `id`, timestamps.
- **State mapping:** treat 423 as a _disabled_ edit affordance driven by the
  parent's `is_locked`, not as a form error — ideally never let the request fire.
