<!--
  PER-ENTITY BLOCK TEMPLATE — copy this file, rename to <entity>.md, fill it in.

  This block is the unit of the pack. It MUST be self-contained: a frontend dev
  integrating this resource should never need to open another file (except
  overview.md for envelopes/auth, enums.md for value lists, and flows.md for
  multi-entity sequences). All seven sections are required, in this order. If a
  section genuinely does not apply, keep the heading and write "None." — do not
  drop it.
-->

# `<Entity>` — `<one-line purpose: what this resource owns>`

**Endpoint base:** `/api/v1/<...>/`
**Access:** `<who can read / write; note role projection or non-disclosing 404 if
any>`
**Owns:** `<what real-world thing this represents; how it relates to the parent /
aggregate root>`

## 1. Fields (rows)

The full field contract, inline — this is what you type the DTO from. `TS type`
is frontend-oriented. `Req` = required in a create request. `Server-set` =
generated/computed → **never send in a request body**. `Enum` names a set in
`enums.md`. Put the **hard constraint** in `Validation` (max length, regex,
numeric range, format) — that is what a form validates against; if the source
doesn't state one, leave it blank rather than invent it.

| Field | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation                  | Notes       |
| ----- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | --------------------------- | ----------- |
| `id`  | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID                        | Primary key |
| `<f>` | `string \| null` | ✓      | ✓      | ✓   | Yes      | ✗          | —    | `<max len / regex / range>` | `<note>`    |

> If the entity has **role-projected responses** (staff vs admin see different
> fields), either add an "In res (staff)" column or list the staff-visible subset
> explicitly below the table.

## 2. Types

Paste-ready TypeScript — the frontend types straight from this, no re-derivation.
Include: the **response DTO** (one per role projection if they differ), enum
unions (or reference the ones in `enums.md`), and the **request payload** types
(`Create` / `Update`) with **server-set fields already omitted**. `Update`
carries `record_version` when the entity uses optimistic concurrency.

```ts
type <Enum> = "a" | "b" | "c"; // see enums.md

interface <Entity> {
  id: string;
  // ...one line per response field, nullable → | null
}

interface <Entity>Create {
  // ...only the writable fields; optional-in-create → `?`
}
type <Entity>Update = Partial<<Entity>Create> & { record_version: number };
```

## 3. Endpoints

One row per operation. `Request` lists only the **accepted** fields (a subset of
§1); call out `record_version` where required.

### `<METHOD> /api/v1/<path>/`

- **Purpose:** `<when the UI calls this>`
- **Request:** `<body fields | query params | multipart>` — `record_version`
  required on PATCH/DELETE/transition.
- **Returns:** `<resource | list[resource] | streamed bytes>` (which projection).
- **Query params (list):** `<search / filter / ordering options>`
- **Side effects:** `<audit event, projection update, supersede, stamp, ...>`
- **Policy key:** `<app.resource.action>`

## 4. Validations & business rules

Plain-language rules the UI should enforce up front or expect the server to
reject (the ones that aren't a single-field constraint already in the §1 table):

- `<cross-field rule, e.g. "issued_at ≤ expires_at">`
- `<business rule, e.g. "status is transition-only; forward-only">`

## 5. Errors

| Code           | HTTP | Trigger            | Suggested UI handling                        |
| -------------- | ---- | ------------------ | -------------------------------------------- |
| `<ERROR_CODE>` | 4xx  | `<what causes it>` | `<field error / toast / reload+retry / ...>` |

## 6. Examples

Concrete wire payloads — show the shapes prose can't, especially nested/derived
ones (`*_bs` date objects, `meta`, `error.details`, polymorphic content). At
minimum: one create **request** body and its **response** (unwrapped `data`), and
any non-obvious `meta`/error shape.

```jsonc
// POST /api/v1/<path>/  — request
{ "<field>": "<value>" }

// 201 — response.data
{ "id": "…", "<field>": "<value>" }
```

## 7. UI / integration notes

- **Concurrency:** `<record_version usage, or "N/A">`.
- **Role projection:** `<field deltas between roles, or "uniform">`.
- **Dates:** `<which fields carry a *_bs sibling>`.
- **Server-computed:** `<values the client must NOT send>`.
- **Media / streaming:** `<endpoints that return raw bytes, not JSON>`.
- **State mapping:** `<which error/response maps to which UI state>`.
