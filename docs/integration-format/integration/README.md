# Integration Pack — `<domain>`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

This example pack is a faithful re-projection of the `applicant` domain, kept
deliberately to a **representative slice** (5 entities) so it reads as a template
rather than a finished 20-entity doc. Treat it as the gold standard to match.

## What makes this format different

Backend build docs split field truth (`DATA_CONTRACT.md`, by model) from
endpoints (`API.md`, by operation) from access rules (`SECURITY.md`). Integrating
one screen means stitching three files together — and it's easy to read the
endpoint and miss the field contract.

Here, **each entity file is self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one
resource.

## Read order

1. **`overview.md`** — module purpose, base paths, auth, the response envelope,
   pagination, the role model, and the dependency order (**start here** →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/<entity>.md`** — one per resource; the unit you actually build
   against. Each has the same seven sections — Fields, **Types** (paste-ready
   TS), Endpoints, Validations, Errors, **Examples** (wire payloads), UI notes
   (see `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences that span entities (intake, convert,
   lock).
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                                   | Covers                                                          |
| -------------------------------------- | --------------------------------------------------------------- |
| `overview.md`                          | Envelopes, auth, pagination, role model, dependency order       |
| `enums.md`                             | All enum sets + UI labels                                       |
| `entities/applicant.md`                | Aggregate root — projection, `record_version`, transition, lock |
| `entities/address.md`                  | Staff-editable child — one-primary rule                         |
| `entities/qualification-assessment.md` | Append-only / supersede child — lifecycle coupling              |
| `entities/document.md`                 | Polymorphic content, status actions, non-disclosing 404         |
| `entities/document-revision.md`        | Immutable per-edit content snapshot (read + restore)            |
| `entities/document-print-event.md`     | Immutable print/render evidence (frontend-derived values)       |
| `entities/signature.md`                | Global resource, private-media stream, deactivate-not-delete    |
| `flows.md`                             | Multi-entity sequences                                          |
| `gaps.md`                              | Open questions / assumptions                                    |

## Scaling rule

- **≤ 3 entities** → collapse the whole pack into a single `INTEGRATION.md` using
  the same section order (overview → enums → per-entity blocks → flows → gaps).
- **> 3 entities** → split per entity as shown here.

Either way the **per-entity block never changes shape** — header + the same
seven sections.

## Relationship to `/sync-api`

This pack is a **distinct consumable** from the backend's build docs
(`API.md` / `DATA_CONTRACT.md` / `INTEGRATION.md` / `SECURITY.md`). The frontend
`/sync-api` (mint-api-sync) skill currently reads those four files by name and
produces its own contract digest + typed layer. This pack overlaps the **digest's**
role, not the skill's inputs — so today it is read directly by an integrator, and
pointing `/sync-api` at this format is a separate, deliberate change, not
something that happens automatically. Keep the `overview.md` version + change
history so a future drift check can still pin against it.
