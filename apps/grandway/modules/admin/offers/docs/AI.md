# Offers Module — AI Navigation Map

## Purpose

The admission-decision record against an applicant's journey: what an institution
offered (program snapshot, money, conditions), whether it was issued, and how the
applicant responded. One offer = one journey's decision at a point in time. Backend
base path is `/api/v1/offers/`. Contract: `apps/grandway/docs/backend/offers/`.

## Module type

MultiPageModule — a `ModalTableShell` worklist plus a dedicated `[id]` detail route.

## Routes

| Route              | Entry export           | Component                 |
| ------------------ | ---------------------- | ------------------------- |
| /admin/offers      | `ModuleOffersWorklist` | pages/list/OffersWorklist |
| /admin/offers/[id] | `ModuleOfferDetail`    | pages/detail/OfferDetail  |

## Access (critical)

**Full, identical rights for `admin` AND `lead_manager`** — there is NO read/write
split (unlike Clients/Institutions). `superadmin` is denied everything. Each route
entry is wrapped in `RequireLeadAccess`. Every authorised user sees every control;
do **not** gate any control on `authorityType === "admin"` here.

## No delete / no reopen

There is no DELETE and no reopen. An offer moves draft → issued → a **final**
decision (accepted/rejected/withdrawn/deferred/expired). `is_terminal` is true for
every status except `draft`/`issued`. A decision is permanent.

## Data layer (module root)

| File                | Holds                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| offers.types.ts     | DTOs, `BsDate`, condition/decision payloads (immutable fields absent)          |
| offers.labels.ts    | `OFFER_STATUS_{COLORS,LABELS}`, `OFFER_TYPE_LABELS`                            |
| offers.queryKeys.ts | `offerQueryKeys` (`createQueryKeys`) + `offerHistoryKey`/`offerConditionsKey`  |
| offers.api.ts       | `createResourceApi` + issue/decision actions; hand-rolled history + conditions |
| offers.hooks.ts     | `useOfferDetail`/`useOfferHistory` reads + `useAppMutation` writes             |
| offers.utils.ts     | value/format helpers                                                           |

- History is nested under an offer id (`/offers/<id>/history/`) → hand-rolled with the
  `meta.count → total` remap, doesn't fit `createResourceApi`'s single base path.
- Conditions: **create is nested** (`POST /offers/<id>/conditions/`), **update/status
  are un-nested** by condition id (`PATCH`/`POST /offers/conditions/<id>/...`).

## Common edit targets

| Task                                | Files                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Worklist / shell wiring             | pages/list/OffersWorklist.tsx                                                        |
| Columns (snapshot + badges)         | pages/list/offers.columns.tsx                                                        |
| Row actions                         | pages/list/components/OfferRowActionsMenu/                                           |
| Create form                         | form/OfferCreateForm.tsx (+ `toOfferCreatePayload`)                                  |
| Edit form (changed-fields diff)     | form/OfferEditForm.tsx (`diffOfferUpdate`)                                           |
| Journey picker                      | form/components/JourneyPickerField.tsx                                               |
| Catalogue program / manual snapshot | form/components/ReferenceFields.tsx                                                  |
| Money inputs                        | form/components/MoneyFields.tsx                                                      |
| Inline conditions on create         | form/components/ConditionsRepeater.tsx                                               |
| Detail page shell / tabs            | pages/detail/OfferDetail.tsx                                                         |
| Summary (snapshot/money/decision)   | pages/detail/components/OfferSummaryPanel.tsx                                        |
| Conditions panel                    | pages/detail/components/OfferConditionsPanel.tsx                                     |
| History panel                       | pages/detail/components/OfferHistoryPanel.tsx                                        |
| Issue / decision                    | pages/detail/components/{IssueOfferModal,RecordDecisionModal}/                       |
| Add / edit / status a condition     | pages/detail/components/{AddConditionModal,EditConditionModal,ConditionStatusModal}/ |
| DTO shapes / API / keys             | offers.{types,api,queryKeys,hooks}.ts                                                |

## Worklist

- `ModalTableShell<Offer, OfferCreateValues, OfferUpdatePayload>`. Server-side
  pagination + filters over `GET /offers/`, newest-first, **no text search, no client
  ordering** (§3) — `search`/`sort` never forwarded.
- User-pickable filters (`status`/`offer_type`/`intake`/`deadline_before`) are column
  filters; the exact-id/period filters (`journey`/`applicant`/`institution`/`program`/
  `fiscal_year`) arrive as deep links and lock the view via `forceFilters`
  (`useSearchParams`, same pattern as `JourneyWorklist`).
- **Create modal** (`OfferCreateForm`): journey picker (via applicant-journeys), then
  reference is EITHER a catalogue program picker (via institutions) OR a manual
  snapshot fallback (`reference_mode`), money groups, and inline conditions. Maps to the
  create body via `toOfferCreatePayload` on `onCreateApi`.
- **Edit modal** (`OfferEditForm`): sends only the changed **mutable** fields
  (`diffOfferUpdate`). Journey, catalogue refs, all six snapshot fields, `status`, and
  `conditions` are immutable — absent from the payload type, never shown or sent.
- Columns render snapshot text (applicant/institution/program) + **Overdue** and
  **Open conditions** badges off the trusted `is_response_overdue` /
  `has_open_conditions` flags.

## Detail

- Header: status + journey-stage badges (stage links to the journey), snapshot line.
  Actions: **Issue offer** (draft only, `canIssue = status === "draft"`) and **Record
  decision** (non-terminal only, `canDecide = !is_terminal`).
- Tabs: **Overview** (`OfferSummaryPanel` — snapshot, money with currency on **every**
  figure, decision block, overdue indicator, and a note that the offer letter PDF lives
  in the separate **files** module, not on the offer), **Conditions**
  (`OfferConditionsPanel` — per-condition status control + add + edit-wording),
  **History** (`OfferHistoryPanel`, includes condition events).
- A condition **status** change invalidates the offer detail: the status endpoint flips
  `has_open_conditions` but does NOT return the offer, so the detail must be refetched
  (`useChangeConditionStatus` invalidates `lists()` + `detail(id)` + `conditions(id)`).

## Domain rules encoded here

- **Money is decimal strings, never floats.** Every amount is `string | null`; render
  currency on every figure. Client validation mirrors the server per-amount check (valid
  decimal + currency required when an amount is present).
- **No delete, no reopen; a decision is final.** `is_terminal` gates the decide action.
- **Deciding does NOT change the journey stage** — offer status and journey stage are
  independent; the header just labels the (read-only) stage.
- **Snapshot text is write-once** — set on create (catalogue-derived or manual), then
  immutable. `reference_source` is derived (`catalogue` when a FK resolved, else
  `manual`) and never sent.
- **Cross-module imports use concrete files, never barrels** — `listJourneys` from
  `applicant-journeys/applicantJourneys.api`, `fetchPrograms` from
  `institutions/institutions.api` (avoids import cycles). `JourneyStage` is imported
  from applicant-journeys' concrete type file, read-only here.

## State ownership

- Server data: React Query (`useQuery` / `useAppMutation`); no `useEffect` fetching.
- Form state: `@mantine/form` via `FormWrapper`.
- Local UI (active detail modal, drawers): `useState`.

## Do not do

- Do not add a delete or reopen control; a decision is final.
- Do not gate any control on `authorityType === "admin"` — admin and lead_manager have
  identical rights here.
- Do not send immutable fields (journey/refs/snapshot/status/conditions) on PATCH.
- Do not parse money as a float or drop the currency from any figure.
- Do not import applicant-journeys / institutions via their barrels; use concrete files.
- Do not fetch in `useEffect`; do not import Mantine directly.
