# Integration Pack — `applicant`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

This is the full pack for the `applicant` app (CRM + prepared documents + Phase-7
lead intake). It replaces the legacy single-file `INTEGRATION.md`.

## What makes this format different

Backend build docs split field truth (`DATA_CONTRACT.md`, by model) from
endpoints (`API.md`, by operation) from access rules (`SECURITY.md`). Integrating
one screen means stitching three files together — and it's easy to read the
endpoint and miss the field contract.

Here, **each entity file is self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — module purpose, base paths, auth, the response envelope,
   pagination, the role model, concurrency, and the dependency order
   (**start here** →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/<entity>.md`** — one per resource; the unit you build against.
   Each has the same seven sections — Fields, **Types** (paste-ready TS),
   Endpoints, Validations, Errors, **Examples** (wire payloads), UI notes (see
   `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences that span entities (lead intake +
   convert, qualify + transition, lock, prepare a document).
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                                   | Covers                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `overview.md`                          | Envelopes, auth, pagination, role model, concurrency, dependency order          |
| `enums.md`                             | All enum sets + UI labels                                                       |
| `entities/applicant.md`                | Aggregate root — projection, `record_version`, transition, lock, archive, merge |
| `entities/lead.md`                     | Phase-7 enquiry funnel — staff CRUD + admin convert                             |
| `entities/address.md`                  | Staff-editable child — one-primary rule                                         |
| `entities/media.md`                    | Private media — profile image (staff) + evidence media (admin), byte streaming  |
| `entities/profile-children.md`         | The 11 admin-only generic profile children (identity, education, …)             |
| `entities/interest-profile.md`         | OneToOne migration-preference profile                                           |
| `entities/crm-children.md`             | The 5 admin-only CRM/compliance children (interactions, sponsors, …)            |
| `entities/qualification-assessment.md` | Append-only / supersede child — lifecycle coupling                              |
| `entities/application-case.md`         | Destination/program pathway — transition-only status + history                  |
| `entities/assignment.md`               | Counsellor assignment history                                                   |
| `entities/document.md`                 | Polymorphic content, status actions, non-disclosing 404, prefill, workspaces    |
| `entities/document-revision.md`        | Immutable per-edit content snapshot (read + restore)                            |
| `entities/document-print-event.md`     | Immutable print/render evidence (frontend-derived values)                       |
| `entities/signature.md`                | Global resource, private-media stream, deactivate-not-delete                    |
| `flows.md`                             | Multi-entity sequences                                                          |
| `gaps.md`                              | Open questions / assumptions                                                    |

## A note on the two "family" files

`profile-children.md` and `crm-children.md` each cover a **family** of nested
resources that share one generic CRUD view, one serializer base, and identical
access/error/concurrency behaviour — exactly how the backend's `API.md` documents
them (§5 and §8). Each family file gives every member its own field table and TS
interface; the shared endpoint shape, errors, and UI notes are stated once.

## Relationship to the backend build docs

This pack is a **distinct consumable** from the backend's build docs
(`API.md` / `DATA_CONTRACT.md` / `SECURITY.md`). It re-projects the
frontend-relevant slice of them into a self-contained, per-entity shape. Keep the
`overview.md` version + change history so a drift check can pin against it — bump
the pack version on every change.
