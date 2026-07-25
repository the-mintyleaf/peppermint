# Checklists Module — AI Navigation Map

## Purpose

The destination-country requirement list an Admin authors once, and each
applicant's own tracked copy of it. Answers what's outstanding, who owns it,
when it's due, and whether it's done — points at `applicant_journeys`,
`institutions`, and `uploaded_files` rather than duplicating their data.
Backend base path `/api/v1/checklists/`. Contract: `docs/backend/checklists/`.

## Module type

MultiPageModule with TWO distinct route trees under one module: Templates
(Admin-only authoring) and Instances (Admin + Lead Manager tracking).

## Routes

| Route                            | Entry export                   | Component                                   |
| -------------------------------- | ------------------------------ | ------------------------------------------- |
| /admin/checklists/templates      | `ModuleChecklistTemplatesList` | pages/templates/list/ChecklistTemplatesList |
| /admin/checklists/templates/[id] | `ModuleTemplateDetail`         | pages/templates/detail/TemplateDetail       |
| /admin/checklists                | `ModuleChecklistWorklist`      | pages/list/ChecklistWorklist                |
| /admin/checklists/awaiting-setup | `ModuleAwaitingSetupList`      | pages/list/AwaitingSetupList                |
| /admin/checklists/[id]           | `ModuleChecklistDetail`        | pages/detail/ChecklistDetail                |

## Access (critical)

- **Templates (authoring)** — the four template-authoring routes are
  **Admin-only** (`RequireDocumentAccess`, the exact-admin gate reused from
  `uploaded-files/FileReviewQueue` — same rule: `authorityType === "admin"`,
  nothing else). A Lead Manager never even sees these pages.
- **Instances (tracking)** — Admin AND Lead Manager share identical read/write
  rights (`RequireLeadAccess`). `superadmin` is refused on **every** route in
  this module.

## No delete, anywhere in this module

- Template requirements retire via `is_active: false` (`TemplateItemsList`'s
  row toggle) — never removed.
- Checklist items have **no `is_active` and no delete at all**. A mistaken item
  is set `not_applicable`, which counts as **resolved** (§9 gap — silently
  satisfies the completion check; there is no UI workaround for this).

## Data layer (module root)

| File                    | Holds                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| checklists.types.ts     | DTOs for both resources — `ChecklistTemplate(Item)`, `Checklist(Detail)`, `ChecklistItem`, `JourneyAwaitingChecklist` (a DISTINCT type, never merged with `Checklist`), all payloads |
| checklists.labels.ts    | Status/origin/item-type label + color maps, `*_OPTIONS` for selects                                                                                                                  |
| checklists.queryKeys.ts | `templateQueryKeys` + `checklistQueryKeys` (two `createQueryKeys` sets) + `awaitingChecklistKey` (own cache slot, not nested under either)                                           |
| checklists.api.ts       | `templateResource`/`checklistResource` (`createResourceApi`) + hand-rolled item/status/safety-net functions                                                                          |
| checklists.hooks.ts     | All reads/writes for both resources; `useUpdateItemStatus` is the one mutation where invalidating the checklist's own `detail(id)` is not optional                                   |

- Templates have **one retrieve shape** for list AND detail (`ChecklistTemplate`
  — unlike checklists, no separate trimmed list row).
- Checklists have **two shapes** — `Checklist` (list, includes `progress`) and
  `ChecklistDetail extends Checklist` (adds `items`/`notes`/lifecycle stamps).
  `checklistResource` is typed against the richer `ChecklistDetail`; `listChecklists`
  rows are really the trimmed shape but `ChecklistDetail extends Checklist` makes
  this a safe fit (same looseness as `offers.api.ts`).
- `fetchJourneysAwaitingChecklist` is a SEPARATE function (never routed through
  `checklistResource.list`) — `?journey_missing_checklist=true` returns
  `JourneyAwaitingChecklist[]` (rows are JOURNEYS, `id` is a journey id), a
  completely different resource from a normal checklist list row.
- `updateItemStatus`'s response carries **no `progress`** — callers must
  invalidate the checklist's own detail key to ever see progress move.

## Common edit targets

| Task                                   | Files                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Templates list / shell wiring          | pages/templates/list/ChecklistTemplatesList.tsx                                                      |
| Templates columns                      | pages/templates/list/templates.columns.tsx                                                           |
| Template create/edit form              | form/TemplateForm.tsx (+ `.utils.ts` for payload mapping)                                            |
| Template detail (publish/retire/items) | pages/templates/detail/TemplateDetail.tsx                                                            |
| Template item add/edit/retire          | pages/templates/detail/components/{AddTemplateItemModal,EditTemplateItemModal,TemplateItemsList.tsx} |
| Checklist worklist / shell wiring      | pages/list/ChecklistWorklist.tsx                                                                     |
| Checklist worklist columns             | pages/list/checklistWorklist.columns.tsx                                                             |
| Checklist create form (2 shapes)       | form/ChecklistCreateForm.tsx (+ `.utils.ts`'s `toCreateChecklistPayload`)                            |
| Checklist edit form (mutable subset)   | form/ChecklistEditForm.tsx (diffs changed fields only)                                               |
| Safety-net view                        | pages/list/AwaitingSetupList.tsx + awaitingSetup.columns.tsx                                         |
| Checklist detail (lifecycle + items)   | pages/detail/ChecklistDetail.tsx                                                                     |
| Item status transitions + evidence     | pages/detail/components/{ItemStatusModal,EvidencePickerModal}                                        |
| Add/edit a one-off checklist item      | pages/detail/components/{AddChecklistItemModal,EditChecklistItemModal}                               |
| DTO shapes / API / keys / hooks        | checklists.{types,api,queryKeys,hooks}.ts                                                            |

## Domain rules encoded here

- **Automatic inheritance has no endpoint.** Setting a journey's
  `target_country_ref` (in `applicant-journeys`, not here) creates the
  checklist as a side effect, asynchronously. There is deliberately no
  "create checklist" button on that flow — `ChecklistCreateForm` is the manual
  override only, reached from the Checklists worklist, never from a journey.
- **Completion is disabled proactively, never allowed to fail.** The Complete
  button on `ChecklistDetail` is disabled until
  `progress.required_resolved === progress.required_total`. If a
  `CHECKLISTS_REQUIRED_ITEMS_PENDING` 409 fires anyway, `details.items` is
  read and every outstanding item is highlighted inline in
  `ChecklistItemsList` — never a generic toast.
- **`blocked` is not resolved.** It counts as fully outstanding and still
  blocks completion — surfaced as a warning count, never treated as done.
- **`status_note` is required up front**, not discovered by a 400 — the note
  field is marked required in `ItemStatusModal` the moment `waived`/`blocked`
  is selected.
- **Evidence picker is pre-scoped to the checklist's own applicant**
  (`useFilesList({ applicant })`) so `CHECKLISTS_EVIDENCE_NOT_ALLOWED` can
  never be produced from this module's own UI.
- **Restore is not a reopen.** Restoring an archived checklist returns it to
  `status_before_archive`, which may be `draft` — the UI copy says so
  explicitly rather than implying "active again."
- **No `assigned_to` user picker.** The contract names this as an open gap
  (§9, no user-list endpoint here) — every `assigned_to` field is a plain
  text id input with an inline note, not invented UI over a missing endpoint.
- **Cross-module imports use concrete files, never barrels** —
  `useCountries`/`Country` from `institutions/institutions.hooks`+`.types`,
  `listJourneys`/`journeyQueryKeys`/`ApplicantJourney` from
  `applicant-journeys/applicantJourneys.{api,queryKeys,types}`, `useFilesList`/
  `UploadedFile` from `uploaded-files/uploadedFiles.{hooks,types}`.

## State ownership

- Server data: React Query (`useQuery`/`useAppMutation`); no `useEffect` fetching.
- Form state: `@mantine/form` via `FormWrapper`.
- Local UI (active item modal, add-item toggle, outstanding-item highlight set): `useState`.

## Do not do

- Do not add a delete for a checklist item — there is none; use `not_applicable`.
- Do not let the Complete button fire and fail — keep it disabled until
  `required_resolved === required_total`.
- Do not send `status` on `PATCH /<id>/` (checklist) or
  `PATCH /<id>/items/<item_id>/` (item) — both reject it; status moves only
  through the dedicated lifecycle/status endpoints.
- Do not route `?journey_missing_checklist=true` through `checklistResource.list`
  or `Checklist` — it is a different resource (`JourneyAwaitingChecklist`).
- Do not import applicant-journeys / institutions / uploaded-files via their
  barrels; use concrete files.
- Do not fetch in `useEffect`; do not import Mantine directly.
