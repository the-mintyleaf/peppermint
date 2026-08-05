# Institutions Module — AI Navigation Map

## Purpose

The study-opportunity **catalogue**: the countries, providers (institutions),
campuses, fields, and programs the consultancy can offer — each program's tuition,
entry expectations, and availability. Reference data (what _can_ be offered), never
an applicant's plan. Backend base path is `/api/v1/catalogue/` (differs from the
module name). Contract: `apps/grandway/docs/backend/institutions/INTEGRATION.md`.

## Module type

Two ContainedModule sub-areas (each a single list route with modal create/edit +
drawer detail) plus one ModalModule (reference data). Five backend resources: Field,
Country, Institution, Campus, Program.

## Routes

| Route                         | Entry export                 | Component                             |
| ----------------------------- | ---------------------------- | ------------------------------------- |
| /admin/institutions           | `ModuleInstitutionPrograms`  | programs/pages/list/ProgramSearch     |
| /admin/institutions/providers | `ModuleInstitutionProviders` | providers/pages/list/InstitutionsList |

Reference data (Countries + Fields) is a modal opened from the Programs header —
**no route**, Admin-only.

## Access (critical)

**The routes are Admin-only in this app**, gated
`RequireCapability capability="catalogue"`; `superadmin` is denied everything.

> **Do not gate the catalogue's DATA hooks on that capability.** The backend still
> grants a Lead Manager catalogue reads, and `useCountries` feeds the applicants
> list's country tabs, the journeys worklist tabs, `JourneyForm` and two dashboard
> cards. Only the routes and nav were removed.

Writes were already Admin-only within the module. Every write
control (create/edit form components, reference-data trigger, campus add/edit,
withdraw) is gated on exact `authorityType === "admin"` — never `isAdmin` (that
includes superadmin).

## No delete

There is no DELETE. The destructive control is **"Withdraw from use"** — PATCH
`availability_status → inactive` (Field: `is_active → false`). Withdraw of a
Country/Institution/Campus/Program collects the required availability note through the
reason-confirm modal; Field withdraw needs no note.

## Shared data layer (module root)

| File                      | Holds                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| institutions.types.ts     | DTOs, briefs, create/update payloads, `*Values` form types          |
| institutions.constants.ts | enum label/color/option maps, `formatTuition`, `statusRequiresNote` |
| institutions.queryKeys.ts | one `createQueryKeys` per resource + `campusesByInstitutionKey`     |
| institutions.api.ts       | one `createResourceApi` per resource; campuses nested/un-nested     |
| institutions.hooks.ts     | `useQuery` reads + `useAppMutation` writes                          |

## Common edit targets

| Task                       | Files                                                       |
| -------------------------- | ----------------------------------------------------------- |
| Program search / columns   | programs/pages/list/ (ProgramSearch, programs.columns)      |
| Program form               | programs/form/ (ProgramForm + fields/ + programForm.utils)  |
| Program detail             | programs/pages/list/components/ProgramDetailDrawer/         |
| Institution list / columns | providers/pages/list/ (InstitutionsList, providers.columns) |
| Institution form           | providers/form/InstitutionForm                              |
| Campus management          | providers/pages/list/components/CampusManager/              |
| Countries + Fields admin   | reference-data/ (InstitutionsReferenceModal + components)   |
| Availability status+note   | components/AvailabilityFields/ (control + Zod refine)       |
| DTO shapes / API / keys    | institutions.{types,api,queryKeys,hooks}.ts                 |

## Domain rules encoded here

- **Availability rule:** a non-`active` status requires a non-empty note, on create
  AND update, re-affirmed each time — one control (`AvailabilityFields`) + Zod
  `refineAvailabilityNote` mirroring `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED`.
- **Immutable fields** are read-only on edit: `code` (Country/Field), `institution`
  (Program), and never sent for Campus. `Program.country` is derived (no field).
- **Tuition** is a decimal string; an amount requires currency + fee period together
  (client-validated; backend `INSTITUTIONS_TUITION_INCOMPLETE`).
- **Institution country IS editable** — changing it cascades to every program;
  `InstitutionForm` warns on change.
- **Campus** lists/creates nested at `/institutions/<id>/campuses/`; retrieves/updates
  un-nested at `/campuses/<id>/`. `(institution, name)` unique → duplicate on rename.
- **Program search** `usable_only` defaults true (chain-aware), toggled via the
  "Offerable only" switch → `forceFilters`. `q` → shell search. `tuition_max` maps
  from the Tuition column's number filter. Ordering is server-fixed (no client sort).

## State ownership

- Server data: React Query (`useQuery` / `useAppMutation`); no `useEffect` fetching.
- Form state: `@mantine/form` via `FormWrapper`.
- Local UI (drawers, modals, toggles): `useState`.

## Do not do

- Do not add a delete button — withdraw only.
- Do not gate writes on `isAdmin` (superadmin must be excluded).
- Do not send immutable fields on edit; do not parse money as a float.
- Do not fetch in `useEffect`; do not import Mantine directly.
