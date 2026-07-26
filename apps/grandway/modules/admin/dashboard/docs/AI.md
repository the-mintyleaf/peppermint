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

| File                     | Carries                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.types.ts`     | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                                                                                                                                           |
| `dashboard.queryKeys.ts` | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                                                                                                                                             |
| `dashboard.api.ts`       | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                                                                                                                                                 |
| `dashboard.hooks.ts`     | 8 independent `useQuery` hooks (`useDashboard{Summary,Today,Pipeline,Blockers,Workload,Conversion,Outcomes,Activity}`) + `useDashboardFilters` (URL-synced `fiscal_year`/`country`)                                                                                                                                                                                                      |
| `dashboard.labels.ts`    | Only labels/colors with no existing home (`ApplicantStatusKey`, `DocumentRow.family`, `JOURNEY_OUTCOME_COLORS`/`OFFER_DECISION_COLORS` — the owning modules export the outcome/decision LABELS but no color map) + section/group headings. Every enum whose owning module already exports a color map (offer/checklist/journey/lead/file status) is imported CONCRETELY, never redefined |
| `dashboard.utils.ts`     | `formatDate`/`formatDateTime`/`formatRatePercent` + `chartColor(name, shade)` (Mantine color name/hex → CSS var for custom bar/SVG fills)                                                                                                                                                                                                                                                |

## Visual design (Mobility Ops redesign)

Restyled to the "Mobility Ops Dashboard" design while keeping every integration.
Three confirmed design decisions drive the look:

1. **Adapt honestly** — the mockup's monthly trend line, per-worklist age/day
   buckets, per-blocker reason breakdowns, and 14-day activity sparkline have NO
   backing endpoint (the API returns totals + ≤10 preview rows, not
   aggregations). They are NOT faked; each is replaced with the real data
   (preview row lists, the alert bars, the `meta.count` total).
2. **Meaningful color** — status charts reuse each owning module's status→color
   map (so a slice/bar means the same here as on that module's list); pure
   quantities are neutral gray; the brand accent (orange, `color="brand"`) is
   reserved for the page anchor (`DashboardHero`) and the conversion gauges.
   Never color alone — every bar/slice carries a word + value.
3. **Flat signal board** — charts are lightweight `Progress`/`RingProgress` +
   minimal SVG (no `@peppermint/ui/charts`/recharts): static, tooltip-light,
   at-a-glance. `chartColor()` in `dashboard.utils.ts` turns a Mantine color
   name/hex into a CSS var for custom `<div>`/`<svg>` fills; `Progress`/
   `RingProgress` take the color name directly and don't need it.

Layout: page owns the `SectionHeading` bands + per-section `ModuleErrorBoundary`;
each section renders only its own card(s) with an internal `Grid`. Anchors
`#today-worklists` / `#blockers` live on those section headings.

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

### Section components (one per endpoint)

| Component            | Backs                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DashboardHero`      | Page anchor — eyebrow + "Placement overview" + time range (fiscal year) + role·user from `useCurrentUser`                       |
| `DashboardFilterBar` | fiscal_year + country ONLY — no other filter control (§9: the rest are validated-and-ignored)                                   |
| `SummaryStrip`       | Hero volume stats + "Needs attention" `MeterBar`s (relative volume = value/max); each alert links to its in-page section anchor |
| `TodayWorklists`     | 6 worklists as `PreviewTabs` (real preview rows; no invented bucket chart)                                                      |
| `PipelineCounts`     | 7 zero-filled maps as bars/columns/donuts/stacked; each links to the OWNING APP'S PLAIN (unfiltered) list — see "Do not do"     |
| `Blockers`           | 5 groups as `PreviewTabs` (real rows; no invented reason breakdown), never merged                                               |
| `Workload`           | Branches on `is_scoped_to_caller` (caption only); 3 tabbed per-owner bar measures, never joined/summed                          |
| `Conversion`         | 4 independent `Gauge`s + `by_source` `StackedMeter` rows; takes `filters` prop                                                  |
| `Outcomes`           | `journey_outcomes` donut vs created-window `ColumnChart`/`MeterBar`s — separate cards; takes `filters` prop                     |
| `ActivityFeed`       | The only paginated section, as a `Table`; real total from `meta.count` (no sparkline); `fiscalYear` only (never `country`)      |
| `SectionState`       | Shared loading/error/empty chrome — every section wraps its content in this                                                     |

### Flat-chart primitives (presentational; states handled by the section's `SectionState`)

| Primitive        | Renders                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `MeterBar`       | One labelled horizontal bar (label · `Progress` · value); optional `href` for alert links |
| `StackedMeter`   | Segmented `Progress.Root` bar + `trailing` slot (by-source, checklist workload)           |
| `ColumnChart`    | Compact vertical bars for a small fixed set (checklists, offer decisions)                 |
| `DonutStat`      | `RingProgress` + center total + word+color+value legend (applicants/offers/outcomes)      |
| `Gauge`          | Flat half-circle SVG rate gauge; brand arc; null percent → empty arc + "—"                |
| `PreviewTabs`    | Shared tabbed `Preview<T>` viewer (count badge = real `total`; `has_more` → "see all")    |
| `SectionHeading` | Title + "how to read this" subtitle band; carries the section anchor `id`                 |

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
