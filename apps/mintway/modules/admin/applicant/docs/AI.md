# Applicant CRM Module AI Map

## Purpose

The applicant aggregate: the enquiry funnel that precedes an applicant (leads),
the person master record and its lifecycle, and every child resource hanging off
it — addresses, identity, education, family, CRM/compliance, interests, cases,
assignments and history.

## Contract — read before any field work

`apps/mintway/docs/applicants/integration/` is the **single source** the frontend
integrates against. Do not read the backend build docs for field truth.

| File                 | Answers                                                     |
| -------------------- | ----------------------------------------------------------- |
| `overview.md`        | Envelope, roles, pagination, concurrency, **Empty vs null** |
| `enums.md`           | Every enum + UI labels                                      |
| `entities/<name>.md` | Per-entity fields, endpoints, validations, errors           |
| `flows.md`           | Multi-entity sequences (lead intake, qualify, lock, merge)  |
| `gaps.md`            | Open questions — **ask, don't invent**                      |

## Module type

MultiPageModule. `/admin/leads` and `/admin/applicants` are top-level lists;
`/admin/applicants/[applicantId]/<section>` are detail routes sharing
`_shared/ApplicantDetailShell`; `/admin/application-cases/[caseId]` is a separate
aggregate route.

## Entry files

| Surface        | Path                                       |
| -------------- | ------------------------------------------ |
| Module barrel  | `index.ts` (`ModuleApplicant` route map)   |
| Leads list     | `leads/LeadsList.tsx`                      |
| Applicant list | `applicants/pages/list/ApplicantsList.tsx` |
| Detail shell   | `_shared/ApplicantDetailShell/`            |

## Shared layer (`_shared/`)

| File                      | Owns                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| `applicant.types.ts`      | Every DTO. **The four role projections live here** — see below               |
| `applicant.enums.ts`      | Label + colour maps for every enum                                           |
| `applicant.api.ts`        | Applicant root: list/get/patch/archive/transition/lock/merge + history feeds |
| `applicantQueryKeys.ts`   | All query keys, incl. the per-slug child factory                             |
| `childResource/`          | `createChildResource` — the generic nested-CRUD factory                      |
| `BsDateText/`             | `BsDateText` + `bsDateColumn` (Bikram Sambat rendering)                      |
| `useApplicantMutation.ts` | Mutation + notification + invalidation wrapper                               |

## The three rules that cause real bugs here

**1. Role projections are four separate types.** `ApplicantStaff`,
`ApplicantAdmin`, `ApplicantListRowStaff`, `ApplicantListRowAdmin`. Pick by the
signed-in role, never by testing whether a field is present.

> **Neither list row carries `record_version`.** A write sourced from a table row
> must resolve the version separately — from the record `onEditTrigger` fetched,
> or from the detail query cache. Reading it off a row is now a compile error;
> it used to serialise to `undefined` and drop out of the request body silently.

**2. Empty vs null decides how a field clears.** From `overview.md`:

| Contract row                            | Clears with | Why                                               |
| --------------------------------------- | ----------- | ------------------------------------------------- |
| `Nullable=Yes`                          | `null`      | DRF Date/Decimal/UUID fields reject `""`          |
| `Nullable=No` optional text **or enum** | `""`        | Django `blank=True` — `""` **is** the unset value |
| `Req ✓`                                 | never blank | always sent                                       |

Every form encodes this as `TEXT_KEYS` / `NULLABLE_KEYS` + an `isEdit` flag. On
**create** empties are dropped; on **edit** they are sent explicitly, or the
PATCH no-ops that key and the cleared value comes back.

> Do **not** "drop enums when blank". That was a wrong assumption, corrected in
> `56d61a9` — it makes every clearable Select a silent no-op. Also note a Mantine
> `clearable` Select writes `null` into form state, not `""`, so normalise before
> any `typeof === "string"` check.

**3. `<field>_bs` is response-only.** ~20 fields carry a Bikram Sambat sibling.
Render it with `BsDateText` / `bsDateColumn`; the plain AD field stays the source
of truth and is the only one ever written back. Never put `_bs` in form values or
a request body. (`completion_year_bs` on educations is unrelated — that one is a
user-entered BS year _text field_.)

## Sections

| Section     | Path           | Route                                             | Access                  |
| ----------- | -------------- | ------------------------------------------------- | ----------------------- |
| Leads       | `leads/`       | `/admin/leads`                                    | Staff+ (convert: admin) |
| Applicants  | `applicants/`  | `/admin/applicants`                               | Staff+ (create: admin)  |
| Addresses   | `addresses/`   | `[id]/addresses`                                  | Staff+                  |
| Identity    | `identity/`    | `[id]/identity`                                   | Admin                   |
| Education   | `education/`   | `[id]/education`                                  | Admin                   |
| Family      | `family/`      | `[id]/family`                                     | Admin                   |
| CRM         | `crm/`         | `[id]/crm`                                        | Admin                   |
| Interests   | `interests/`   | `[id]/interests`                                  | Admin                   |
| Cases       | `cases/`       | `[id]/cases`, `/admin/application-cases/[caseId]` | Admin                   |
| Assignments | `assignments/` | `[id]/assignments`                                | Admin                   |
| History     | `history/`     | `[id]/history`                                    | Admin                   |

## Common edit targets

| Task                        | Files                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Add a field to a child form | `<section>/<child>/<Name>Form.tsx` + `.types.ts` + the DTO in `_shared/applicant.types.ts` |
| Add a nested child resource | `createChildResource` config + columns + form + a tab on the section page                  |
| Change an enum label/colour | `_shared/applicant.enums.ts` only                                                          |
| Add a list filter or sort   | the section's `*.columns.tsx` (`filter` / `sortable`)                                      |
| Add an error message        | `apps/mintway/lib/authErrorMessages.ts`                                                    |

## Known risks

- **Concurrency.** `applicant`, `application-case` and `document` require
  `record_version` on every PATCH/DELETE/transition. Never default it to `0` —
  that is a wrong version, not "unknown", and guarantees a 409. Block the write
  instead (`ClientPreconditionError`).
- **Ordering.** Server defaults are unstated (`gaps.md` #9) — send an explicit
  `ordering` on lists, but only fields in that endpoint's documented whitelist.
  An unlisted key is silently dropped. Append-only history feeds are the
  exception: they are documented newest-first, so don't pin one.
- **Locked / archived / converted records** reject writes (423 / 409). Disable
  the affordance rather than letting the request fail — and remember a
  per-row rule needs a per-row guard, which the selection toolbar does not have.
- **Documents are not part of this module.** They live in `modules/documents` +
  `modules/admin/documents` and answer staff with **404, not 403** — never render
  a document affordance for staff.

## What not to touch

- `_shared/applicant.types.ts` projections — changing them cascades everywhere.
  Read the `applicant.md` "Types" section before editing.
- `createChildResource` — 16 resources depend on its behaviour.
- `gaps.md` assumptions. If the contract doesn't answer it, ask; don't decide.
