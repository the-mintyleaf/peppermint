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

A template has **no detail route** — it opens in `TemplateDrawer` over the
templates list (`_shared/TemplateDrawer`, the same move `WorklistDrawer` made).
`/admin/checklists/templates?template=<id>` opens the drawer on that template
— that param IS the drawer's state (read every render, rewritten by `replace`
on open/close), not a one-shot seed, because global search can deep-link here
while the list is already mounted. It is also the deep link global search uses.
A duplicate derived `key` comes back as a generic `VALIDATION_ERROR` against a
field create never shows, so `checklists.errors.ts` rewrites that one case into
label language.

## Routes

| Route                            | Entry export                   | Component                                   |
| -------------------------------- | ------------------------------ | ------------------------------------------- |
| /admin/checklists/templates      | `ModuleChecklistTemplatesList` | pages/templates/list/ChecklistTemplatesList |
| /admin/checklists                | `ModuleChecklistWorklist`      | pages/list/ChecklistWorklist                |
| /admin/checklists/awaiting-setup | `ModuleAwaitingSetupList`      | pages/list/AwaitingSetupList                |
| /admin/checklists/[id]           | `ModuleChecklistDetail`        | pages/detail/ChecklistDetail                |

## Access (critical)

- **App-level rule is narrower than the contract.** The backend grants a Lead
  Manager template reads (§1), but this app does not: the worklist,
  awaiting-setup and template routes are **Admin-only**, gated
  `RequireCapability capability="checklists"`. Checklist authoring and
  cross-applicant triage are not staff work here.
- **`/admin/checklists/[id]` is the deliberate exception** — still
  `RequireLeadAccess`, so a Lead Manager reaches a single checklist. The journey
  Worklist tab and the notification drawer both deep-link to it, and it is the only
  place item-level history lives. Its breadcrumb and not-found button therefore
  follow the reader (back to the **journey**, not to the Admin-only list) — if you
  add another way out of that page, do the same.
- **Templates (authoring)** — only the four write routes (create/update
  template, create/update template item) are **Admin-only**. These are gated
  **inline**, not at the page level: `createFormComponent`/`onCreateApi`/
  `onEditApi` on `ChecklistTemplatesList` and the publish/retire/add-item/
  edit-item controls on `TemplateProfilePanel`/`TemplateItemsList`/
  `TemplateRowActionsMenu` are all `undefined`/hidden when
  `authorityType !== "admin"`. These stay even though the screen is now Admin-only:
  they encode the narrower backend rule directly, and would still hold if template
  reads were reopened to staff.
- **Instances (tracking)** — the backend gives Admin and Lead Manager identical
  read/write rights, and the detail route honours that; only the cross-applicant
  worklist is closed. `superadmin` is refused on **every** route in this module.

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
| checklists.errors.ts    | `getTemplateErrorMessage` — the duplicate-`key` `VALIDATION_ERROR` retold against the label, since create never renders `key`                                                        |
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

| Task                                   | Files                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Templates list / shell wiring          | pages/templates/list/ChecklistTemplatesList.tsx                                                       |
| Templates columns                      | pages/templates/list/templates.columns.tsx                                                            |
| Template create/edit form              | form/TemplateForm.tsx (+ `.utils.ts` for payload mapping)                                             |
| Template detail (publish/retire/items) | \_shared/TemplateDrawer/{TemplateDrawer,TemplateProfilePanel}.tsx                                     |
| Template item add/edit/retire          | \_shared/TemplateDrawer/components/{AddTemplateItemModal,EditTemplateItemModal,TemplateItemsList.tsx} |
| Checklist worklist / shell wiring      | pages/list/ChecklistWorklist.tsx                                                                      |
| Checklist worklist columns             | pages/list/checklistWorklist.columns.tsx                                                              |
| Checklist create form (2 shapes)       | form/ChecklistCreateForm.tsx (+ `.utils.ts`'s `toCreateChecklistPayload`)                             |
| Checklist edit form (mutable subset)   | form/ChecklistEditForm.tsx (diffs changed fields only)                                                |
| Safety-net view                        | pages/list/AwaitingSetupList.tsx + awaitingSetup.columns.tsx                                          |
| Checklist detail (lifecycle + items)   | pages/detail/ChecklistDetail.tsx                                                                      |
| Item status transitions + evidence     | pages/detail/components/{ItemStatusModal,EvidencePickerModal}                                         |
| Add/edit a one-off checklist item      | pages/detail/components/{AddChecklistItemModal,EditChecklistItemModal}                                |
| DTO shapes / API / keys / hooks        | checklists.{types,api,queryKeys,hooks}.ts                                                             |

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

## Known gaps (deliberately not fixed in this pass)

- `ChecklistWorklist`/`AwaitingSetupList` render `ModalTableShell`/
  `DataTableShell`'s default toolbar search box, but neither
  `GET /checklists/` nor `?journey_missing_checklist=true` supports `?search=`
  (§3/§9 — no search param anywhere in this API). Typing in it is a silently
  dead control. There is no shell-level prop to disable search alone
  (`hideToolbar` hides tabs/filters too) — fixing this needs a
  `@peppermint/admin` change, out of scope here.
- `ItemStatusModal`/`AddChecklistItemModal`/`EditChecklistItemModal`/
  `AddTemplateItemModal`/`EditTemplateItemModal` hand-roll `useState` forms
  rather than building on `FormWrapper`, unlike this module's own
  `TemplateForm`/`ChecklistCreateForm`/`ChecklistEditForm`. CLAUDE.md's Forms
  rule calls for `FormWrapper` everywhere; two real bugs (missing-`null`
  clearing on `due_at`/`assigned_to` in `EditChecklistItemModal`) were found
  and fixed in this hand-rolled diff logic during review — the same class of
  bug `FormWrapper`'s dirty-tracking exists to prevent. Converting all five
  is a follow-up, not folded into this build.
