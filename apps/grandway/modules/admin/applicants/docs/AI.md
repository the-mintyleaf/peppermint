# Applicants Module — AI Navigation Map

## Purpose

The permanent record of a person the consultancy works with: identity (incl.
citizenship / national ID numbers), contact, addresses, passport, family, emergency
contacts, education, language tests, an optional assignee, and notes. Study plans are
**not** here — those are journeys (`applicant-journeys`). Backend base path
`/api/v1/applicants/`. Contract: `apps/grandway/docs/backend/applicants/`
(INTEGRATION.md v1.5.0, 2026-10-29).

## Module type

MultiPageModule — `pages/{list,new,detail,edit}`.

## Route

| Route                         | Export                  | Gate                                  |
| ----------------------------- | ----------------------- | ------------------------------------- |
| `/admin/applicants`           | `ModuleApplicantsList`  | `RequireLeadAccess`                   |
| `/admin/applicants/new`       | `ModuleApplicantCreate` | + `RequireCapability applicantCreate` |
| `/admin/applicants/[id]`      | `ModuleApplicantDetail` | `RequireLeadAccess`                   |
| `/admin/applicants/[id]/edit` | `ModuleApplicantEdit`   | + `RequireCapability applicantEdit`   |

## Entry files

- `applicants.{types,api,queryKeys,hooks,labels}.ts` — data layer. `createResourceApi`
  for the resource + `status`/`restore`/`assign` actions; notes, history and the
  assignee list are hand-rolled (nested paths).
- `applicants.access.ts` — `useApplicantAuthority()`: assign-anyone / assign-self /
  restore / archive / moderate-notes, **derived from `config/access` capabilities**
  (never `authority_type`). Swap the derivations here if `config/access` grows
  dedicated capabilities.
- `applicants.lifecycle.ts` — `useApplicantLifecycleActions(applicant)`: the Archive
  (soft delete) and Restore confirms, shared by the status switch, the row menu and
  the detail page's archived banner.
- `form/ApplicantForm.tsx` (+ `.schemas.ts`, `.utils.ts`, `.types.ts`,
  `education.utils.ts`) — the 5-step create/edit form.
- `pages/detail/ApplicantDetail.tsx` — profile page.
- `photograph/` — the portrait (an `uploaded_files` row). Cross-module consumers import
  this sub-barrel, never the module `index.ts` (cycle — see app AI.md).

## Common edit targets

| Task                              | File                                                                      |
| --------------------------------- | ------------------------------------------------------------------------- |
| Form steps / field order          | `form/ApplicantForm.schemas.ts` (`STEPS`, `STEP_FIELDS`, validation)      |
| Payload / prefill / server errors | `form/ApplicantForm.utils.ts`                                             |
| Education editor                  | `form/components/EducationsField/` (+ `components/EducationRow/`)         |
| Identity numbers inputs           | `form/components/IdentityNumbersSection.tsx`                              |
| Status / Archive / Restore        | `pages/list/components/ApplicantStatusSwitch/`, `applicants.lifecycle.ts` |
| Assign / Take / Release           | `pages/detail/components/ApplicantAssigneeControl/`                       |
| List columns / assignee filter    | `pages/list/applicants.columns.tsx`, `pages/list/ApplicantsList.tsx`      |
| Detail tabs                       | `pages/detail/ApplicantDetail.tsx` (`getApplicantTabs`)                   |

## Form (5 steps)

Identity & Contact → Addresses → **Documents** (citizenship no. + issue district,
national ID, passport) → **Education & Tests** (`EducationsField` +
`@/components/academic` `LanguageTestsField path="language_tests"`) → Family &
Emergency Contacts (family rows carry `citizenship_no`; relationships include
grandfather/grandmother). Only full name + one contact number are required.

- `educations` / `language_tests` replace wholesale and **resending a carried-over
  record drops its `source_lead_id`** — `toApplicantPayload` sends each list only
  when it changed (compared as payloads against the mount snapshot). Do not make it
  always send them.
- Server field errors: pages' `onSubmit` **rejects** on a failed save; `ApplicantForm`
  catches it and `applyServerErrors` maps `details.fields`
  (`educations[i].field`, via academic's `applyApiFieldErrors`) and DRF-style
  `details` onto fields (`addresses[i]` → the i-th non-blank address section), then
  jumps to the first step with an error. The mutation's toast is the only
  notification.
- **The edit page seeds only from a fresh fetch** (`useApplicantDetail(id, { fresh:
true })`, waits for `isFetchedAfterMount`): the form freezes `initial` and lists
  replace wholesale, so a stale cache could delete a colleague's newer record.
- Decimal / year inputs use academic's `DraftNumberInput` (keeps "3." while typing);
  never feed a parsed number straight back into a controlled `NumberInput`.

## Detail page

Header right: `ApplicantAssigneeControl` · `ApplicantStatusSwitch` · Edit.
Sidebar: Identity, **Identity numbers**, Contact, Address, Record. Tabs: Passport &
Family / **Education & Tests** / Journeys / **Notes** / Documents* / Files /
Reminders* / **Alerts** (`ApplicantAlertsPanel`, `?applicant_id=`) / History
(\*capability-gated). Archived → `ArchivedBanner` (Restore for Admins).

## State ownership

Server state only (React Query). Keys: `applicantsQueryKeys`; `applicantHistoryKey(id)`
and `applicantNotesKey(id)` are both under `detail(id)`, so a detail invalidation
refreshes them. `assignableStaffKey` = the Admin picker list (every page of
`/auth/users/`, active only; invalidated on `APPLICANTS_ASSIGNEE_INVALID`).

## Access rules (this app)

- Applicant **record** (create / edit / status / archive / restore) — Admin only.
- **Assignment** — routing only, never access. Admin: picker (Me + Lead Managers from
  `GET /auth/users/`) + Clear. Lead Manager: Take (unassigned) / Release (own); a file
  held by someone else is a plain fact. Archived → frozen for everyone.
- **Notes** — Admin and Lead Manager write; author or Admin edits/deletes
  (`NotesPanel isAdmin={moderateNotes}`); read-only while archived.

## Do not do

- Do not offer `archived` as a plain status pick or any move out of `archived`
  through `POST /status/` (409) — Archive has its own confirm; Restore is
  `POST /restore/`.
- Do not show an assignment or restore lever to someone the backend will refuse.
- Do not render `changes.assigned_to` UUIDs in History (`withoutAssigneeIds`).
- Do not read `authority_type` here — extend `applicants.access.ts` from capabilities.
- Do not import the module barrel from another module (cycle) — use concrete files.

## Known gaps (contract §9)

- No assignee picker endpoint: an Admin's list (`/auth/users/`) has Lead Managers only;
  a fellow Admin assigns a file to themselves with "Me". Said in one line in the menu.
- Identity numbers are not format-checked or searchable.
