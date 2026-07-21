<!-- Copy to `<app>/docs/integration/overview.md` and fill in. This file carries
     the module-wide conventions ONCE so entity files can assume them. It opens
     with the pack version + change history — the frontend pins to this version.
     Fill every section from the app's build docs; delete guidance comments. -->

# Overview — `<Module title>` (`<app>`)

**Pack version:** `<x.y.z>` · **Backend source version:** `<x.y.z>` · **Synced:** `<YYYY-MM-DD>`

> Frontend pins to this version. When the backend Change History below moves past
> it, re-sync and bump.

## Change history

| Version   | Date           | Summary                                   |
| --------- | -------------- | ----------------------------------------- |
| `<x.y.z>` | `<YYYY-MM-DD>` | `<what changed: fields/endpoints/errors>` |

## Purpose

`<What the module owns, in aggregate, and — importantly — what it does NOT own
(which module owns that instead).>`

## Base paths

| Prefix           | Holds                          |
| ---------------- | ------------------------------ |
| `/api/v1/<...>/` | `<what lives under this path>` |

## Auth

- `<token scheme, e.g. JWT bearer / session: Authorization: Bearer <access>>`.
  `<which endpoints require auth>`.
- Unauthenticated → **401**. `<how the client should react>`.

## Response envelope

Every JSON response is wrapped. **Map the envelope to your UI shape at the API
layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or list payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy, may change).
- `error.details` carries per-field errors when present (`<shape known? else →
gaps.md>`).

## Pagination

Lists are paginated. `meta` carries `{ count, page, page_size, next, previous }`.

- Request: `?page`, `?page_size` (**max `<N>`**).
- **Map `meta.count` → `total`** at the API layer.

## Ordering, search, filtering

Passed as query params on list endpoints; the exact set is per-entity (see each
entity's **Endpoints** section). `ordering` is a comma list of field names,
prefix `-` for descending. `<Note any role-based availability differences.>`

## IDs, dates, money

- **IDs** are string UUIDs everywhere.
- **Timestamps** are ISO 8601 strings.
- **Bikram Sambat siblings:** `<if used — which fields carry a read-only
`<field>_bs`object`{ year, month, day, month_name_en, month_name_np,
  display_en, display_np }`; render `display_\*`, never send `\_bs`. Else: "None.">`
- **Money** fields (`<list them>`) are **decimal strings**, not numbers — keep
  them as strings to avoid float drift.
- **Empty vs null.** A field marked `Nullable=Yes` can come back `null`. An
  **optional text/enum** field marked `Nullable=No` (Django `blank=True`, not
  DB-null) comes back as an **empty string `""`** when unset — never `null`. So
  the DTO types it `string` (or the enum), and a fallback tests `value === ""`,
  not `value == null`. Only `Nullable=Yes` fields are typed `| null`.

## Throttling

`<Project defaults + any custom scopes; what a 429 means and how to back off.>`

## Role model

`<The application roles and how access differs. If responses are role-projected,
say so here and point at the entity files that carry the field deltas. If any
surface returns a non-disclosing 404 (not 403), state it.>`

| Surface | `<role A>`    | `<role B>` |
| ------- | ------------- | ---------- |
| `<...>` | `<✅/❌/404>` | `<...>`    |

## Optimistic concurrency

`<Which entities carry `record_version` (and thus require it on
PATCH/DELETE/transition → 409 on mismatch), and which don't. Per-entity files
restate which case applies.>`

## Dependency order (start here →)

Build/integrate in this order — later resources need earlier ones to exist:

1. `<external auth / token>`
2. `<aggregate root — create first>`
3. `<children that need the root>`
4. `<...>`
