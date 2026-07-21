# Integration Pack — `operations`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

The `operations` app owns platform maintenance capabilities. In this version that
is a single resource: the on-demand **database backup** (a `pg_dump` archive plus
its audit record) and the authenticated **download** of that archive. Every
endpoint is **superadmin-only**.

## What makes this format different

Backend build docs split field truth (`DATA_CONTRACT.md`, by model) from
endpoints (`API.md`, by operation) from access rules (`SECURITY.md`). Integrating
one screen means stitching three files together — and it's easy to read the
endpoint and miss the field contract.

Here, **each entity file is self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — module purpose, base path, auth, the response envelope,
   pagination, the role model, and the dependency order (**start here** →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/<entity>.md`** — one per resource; the unit you actually build
   against. Each has the same seven sections — Fields, **Types** (paste-ready
   TS), Endpoints, Validations, Errors, **Examples** (wire payloads), UI notes
   (see `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences that span endpoints (create → download).
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                          | Covers                                                    |
| ----------------------------- | --------------------------------------------------------- |
| `overview.md`                 | Envelopes, auth, pagination, role model, dependency order |
| `enums.md`                    | All enum sets + UI labels                                 |
| `entities/database-backup.md` | Backup record — create, list, and byte-streamed download  |
| `flows.md`                    | Multi-step sequences (take a backup, then download it)    |
| `gaps.md`                     | Open questions / assumptions                              |
