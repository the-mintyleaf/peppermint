# Dashboard Module AI Map

## Purpose

The operational command centre — eight independent, read-only sections
summarising what needs attention now, what is moving, and where work is
stuck. Owns no data, writes nothing (`docs/backend/dashboard/INTEGRATION.md`).
Folder is **singular** (`dashboard/`) to match the API base path
(`/api/v1/dashboard/`); the backend app is plural (`dashboards`).

## Module type

`ContainedModule` (Not-Contained — reporting/info-card page; no `ModalTableShell`/
`DataTableShell`, no CRUD of any kind).

## Route

`/admin/dashboard`

## Entry files

- `pages/DashboardOverview.tsx` → `ModuleDashboardOverview`
- `index.ts`

## Data layer (one file per concern, not per section)

| File                     | Carries                                                                                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.types.ts`     | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                       |
| `dashboard.queryKeys.ts` | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                         |
| `dashboard.api.ts`       | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                             |
| `dashboard.hooks.ts`     | 8 independent `useQuery` hooks (`useDashboard{Summary,Today,Pipeline,Blockers,Workload,Conversion,Outcomes,Activity}`) + `useDashboardFilters` (URL-synced `fiscal_year`/`country`)                                                                                  |
| `dashboard.labels.ts`    | Only labels with no existing home (`ApplicantStatusKey`, `DocumentRow.family`) + section/group headings. Every owned enum (offer/checklist/journey/lead/file status, journey outcome, offer decision) is imported CONCRETELY from its owning module, never redefined |
| `dashboard.utils.ts`     | `formatDate`/`formatDateTime`/`formatRatePercent`                                                                                                                                                                                                                    |

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

| Component             | Backs                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DashboardFilterBar`  | fiscal_year + country ONLY — no other filter control (§9: the rest are validated-and-ignored)                                                 |
| `SummaryStrip`        | Alert strip — each alert links to its in-page section anchor (`#today-worklists`/`#blockers`), not an external route (no drill-down contract) |
| `TodayWorklists`      | 6 worklists via `WorklistPreviewCard`                                                                                                         |
| `PipelineCounts`      | 7 zero-filled maps via local `CountMapCard`; each links to the OWNING APP'S PLAIN (unfiltered) list — see "Do not do"                         |
| `Blockers`            | 5 groups via `WorklistPreviewCard`, rendered SEPARATELY                                                                                       |
| `Workload`            | Branches on `is_scoped_to_caller`; 3 separate `Table`s, never joined/summed                                                                   |
| `Conversion`          | 4 independent `Rate`s + `by_source` table; takes `filters` prop                                                                               |
| `Outcomes`            | `journey_outcomes` vs `journeys_completed`/`journeys_closed` — two visually separate cards; takes `filters` prop                              |
| `ActivityFeed`        | The only paginated section; takes `fiscalYear` only (never `country`)                                                                         |
| `SectionState`        | Shared loading/error/empty chrome — every section wraps its content in this                                                                   |
| `WorklistPreviewCard` | Shared `Preview<T>` renderer (has_more → "see all", never length comparison) — reused by Today (6x) + Blockers (5x)                           |

## State ownership

- All 8 sections: React Query, independent hooks, independent cache keys.
- `fiscal_year`/`country`: URL search params (`useDashboardFilters`), not `useState` — shareable/bookmarkable.
- Activity page number: local `useState` in `ActivityFeed` (not shared, not shareable by design — no established pagination-in-URL convention for this feed).

## Do not do

- Do not combine the 8 queries into one — a slow section must never block the rest (CONCEPT.md).
- Do not render a control for `journey_stage`/`offer_status`/`document_status`/`checklist_status` — validated then silently ignored by every section.
- Do not send `country` to `fetchActivity` — the backend ignores it; sending it would look live but do nothing.
- Do not sum any figures across sections except `today.overdue_checklist_items.total + today.due_soon_checklist_items.total` (the one contract-documented exception).
- Do not draw a funnel for `conversion.rates` or multiply the four rates together.
- Do not merge `blockers`' five groups into one sorted list.
- Do not join/sum `workload`'s three lists, and never filter out the `owner_id: null` "Unassigned" row.
- Do not seed a pipeline count's link with a `?status=`/`?stage=` query param — `apps/grandway/docs/AI.md` "Cross-module integration" documents that `forceFilters` always wins over a column filter on the Applicants/Journeys shells, so a URL-seeded filter would permanently lock the control rather than just seed it; the same shell mechanics apply to Offers/Checklists/Documents/Files. Pipeline links go to the PLAIN unfiltered list.
- Do not add a superadmin-specific check beyond `RequireLeadAccess` — it already excludes superadmin (admin/lead_manager only), matching `DASHBOARDS_ACTOR_FORBIDDEN`.

## Known risks / open items (flagged to the orchestrator)

- **No route/nav wiring yet** — `app/admin/dashboard/page.tsx` and the admin nav entry are orchestrator-owned (see module-builder report).
- **Pipeline/Workload links point at PLAIN list routes**, not filtered ones — a deliberate deviation from a literal "link with a filter query" reading of the build brief, made because the contract has no drill-down guarantee (§9) and this app's own shells lock a URL-seeded filter permanently once set (see "Do not do" above).
- **No per-lead route exists** — `today.stale_leads` and any lead row link to `/admin/lead-management` (the board), not a specific lead (the board opens a lead via drawer state, not a URL).
