# Integration Pack — `core` (global infrastructure)

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, and error states lives in here — you should
> never need to open the backend's build docs (`API.md`, `DATA_CONTRACT.md`) to
> integrate.

`core` is **not a business app** — it is the platform's global infrastructure.
Its frontend-relevant surface is therefore mostly **conventions, not resources**:
the standard success/error **response envelope**, the **pagination `meta` shape**,
the ID / date / money conventions, the auth + role model, and the two public
**health / readiness** probes. Every other app's pack assumes the conventions
documented here, so **`overview.md` is the most important file in this pack** —
read it first, and read it once for the whole platform.

## What makes this format different

Backend build docs split field truth (`DATA_CONTRACT.md`, by model) from
endpoints (`API.md`, by operation). Here each entity file is **self-contained**:
purpose, fields, paste-ready TypeScript, endpoints, validations, errors, example
payloads, and UI notes all sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — the canonical platform conventions: the response
   envelope, pagination `meta`, IDs / dates / money, auth + role model,
   optimistic concurrency, dependency order (**start here** →). Every other
   app's pack builds on these.
2. **`enums.md`** — the enum registry (`core` itself defines none; see the note).
3. **`entities/<entity>.md`** — one per resource. `core` exposes only the
   health/readiness probes. Same seven sections — Fields, **Types** (paste-ready
   TS), Endpoints, Validations, Errors, **Examples** (wire payloads), UI notes
   (see `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences (the liveness/readiness probe).
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                 | Covers                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| `overview.md`        | **Envelope, pagination, IDs/dates/money, auth, role model, concurrency** |
| `enums.md`           | Enum registry (core defines none — pointer note only)                    |
| `entities/health.md` | Public liveness (`/health/`) + readiness (`/ready/`) probes — raw-body   |
| `flows.md`           | Liveness / readiness probe sequence                                      |
| `gaps.md`            | Open questions / assumptions                                             |

## A note on scope

`core.models.BaseModel` (UUID PK + `created_at` / `updated_at`) is an **abstract
base class**, not a frontend-facing resource — it has no endpoints and is never
created, read, or listed on its own. It is therefore **not** an entity file here;
its `id` / `created_at` / `updated_at` conventions are documented once, generally,
in `overview.md` (they appear on the concrete entities of every other app).
