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

`/admin` — **the dashboard is the admin home.** `app/admin/page.tsx` re-exports
`ModuleAdminHome`, which renders the dashboard for `admin`/`lead_manager` and a minimal
identity/audit landing (`SuperadminLanding`) for `superadmin` (403'd on every dashboard
section, so they must not land on it). The old `/admin/dashboard` route and the old
`modules/admin/home/` module are gone; there is no separate "Dashboard" rail entry — the always-shown "Home" entry is the dashboard.

## Entry files

- `pages/AdminHome.tsx` → `ModuleAdminHome` — the `/admin` entry: `RequireAuth` + role branch
- `pages/DashboardOverview.tsx` → `DashboardOverview` — the section stack (no auth gate of its
  own; `AdminHome` decides who reaches it)
- `components/SuperadminLanding.tsx` — the superadmin fallback home
- `index.ts` (exports `ModuleAdminHome`)

## Data layer (one file per concern, not per section)

| File                       | Carries                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.types.ts`       | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                                                                                                                                           |
| `dashboard.queryKeys.ts`   | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                                                                                                                                             |
| `dashboard.api.ts`         | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                                                                                                                                                 |
| `dashboard.hooks.ts`       | 8 independent `useQuery` hooks (`useDashboard{Summary,Today,Pipeline,Blockers,Workload,Conversion,Outcomes,Activity}`) + `useDashboardFilters` (URL-synced `fiscal_year`/`country`)                                                                                                                                                                                                      |
| `dashboard.labels.ts`      | Only labels/colors with no existing home (`ApplicantStatusKey`, `DocumentRow.family`, `JOURNEY_OUTCOME_COLORS`/`OFFER_DECISION_COLORS` — the owning modules export the outcome/decision LABELS but no color map) + section/group headings. Every enum whose owning module already exports a color map (offer/checklist/journey/lead/file status) is imported CONCRETELY, never redefined |
| `dashboard.utils.ts`       | `formatDate`/`formatDateTime`/`formatRatePercent`                                                                                                                                                                                                                                                                                                                                        |
| `dashboard.chartConfig.ts` | `toChartColor(name, shade)` (status color name → Mantine chart shade, e.g. `blue.6`) + `CHART_TRACK_COLOR`/`CHART_ZERO_COLOR`; the shared chart-grammar notes                                                                                                                                                                                                                            |

## Visual design (Mobility Ops redesign, on Mantine Charts)

Restyled to the "Mobility Ops Dashboard" design while keeping every integration.
Three design decisions drive the look:

1. **Adapt honestly** — the mockup's monthly trend line, per-worklist age/day
   buckets, per-blocker reason breakdowns, and 14-day activity sparkline have NO
   backing endpoint (the API returns totals + ≤10 preview rows, not
   aggregations). They are NOT faked; each is replaced with the real data
   (preview row lists, the alert bars, the `meta.count` total).
2. **Meaningful color** — status breakdowns reuse each owning module's status→color
   map (so a slice means the same here as on that module's list); magnitude bars are
   single-hue with the value printed on them; the brand accent (orange, `color="brand"`)
   is reserved for the page anchor (`DashboardHero`), the stage-magnitude bars, and the
   conversion gauges. Never color alone — every bar/slice carries a word + value.
3. **Chart grammar on `@peppermint/ui/charts`** (Mantine Charts / recharts) — a **breakdown**
   of a total is a `DonutChart` (`DonutStat`); a **magnitude** comparison is a single-hue
   `BarChart` (`CategoryBarChart`) with value labels; a multi-part **comparison** is a
   stacked `BarChart` (`StackedBarChart`); a **rate** is a semicircle `DonutChart` gauge
   (`Gauge`). A few **navigational meters** stay as `@peppermint/ui` `Progress` — the
   needs-attention alert links, the docs/files distribution bars, and the six "do-not-sum"
   closed/archived counts — because a full chart's axes/ticks would strip their per-item
   links or heterogeneous legends. `toChartColor()` in `dashboard.chartConfig.ts` maps a
   status color name to the chart shade so slices match their legend dots.
   _(This reverses the earlier "flat signal board, no charts" decision, at the user's
   direction — the visualizations are now real chart components.)_

Layout: page owns the `SectionHeading` bands + per-section `ModuleErrorBoundary`;
each section renders only its own card(s) with an internal `Grid`. Anchors
`#today-worklists` / `#blockers` live on those section headings.

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

### Section components (one per endpoint)

| Component                 | Backs                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AdminHome`               | `/admin` entry — `RequireAuth` + role branch: dashboard for admin/lead_manager, `SuperadminLanding` for superadmin                                                 |
| `SuperadminLanding`       | Superadmin fallback home — Welcome + Users/Audit quick-links (no dashboard access)                                                                                 |
| `DashboardHero`           | Page anchor — eyebrow + "Placement overview" + role·user from `useCurrentUser` (fiscal year now lives in the header controls)                                      |
| `DashboardHeaderControls` | fiscal_year + country + "Refresh" in the module header's right slot — the only live filters (§9: the rest are validated-and-ignored)                               |
| `SummaryStrip`            | Hero volume stats + "Needs attention" `MeterBar`s (relative volume = value/max); each alert links to its in-page section anchor                                    |
| `TodayWorklists`          | 6 worklists as `PreviewTabs` (real preview rows; no invented bucket chart)                                                                                         |
| `PipelineCounts`          | 7 zero-filled maps — stage magnitudes as `CategoryBarChart`, status breakdowns as `DonutStat`, docs/files as `Progress`; each links to the OWNING APP'S PLAIN list |
| `Blockers`                | 5 groups as `PreviewTabs` (real rows; no invented reason breakdown), never merged                                                                                  |
| `Workload`                | Branches on `is_scoped_to_caller` (caption only); 3 tabbed per-owner measures (`CategoryBarChart` + `StackedBarChart`), never joined/summed                        |
| `Conversion`              | 4 independent `Gauge`s + `by_source` `StackedBarChart`; takes `filters` prop                                                                                       |
| `Outcomes`                | `journey_outcomes` + `offer_decisions` as `DonutStat`, created-window counts as `MeterBar`s — separate cards; takes `filters` prop                                 |
| `ActivityFeed`            | The only paginated section, as a `Table`; real total from `meta.count` (no sparkline); `fiscalYear` only (never `country`)                                         |
| `SectionState`            | Shared loading/error/empty chrome — every section wraps its content in this                                                                                        |

### Chart primitives (presentational; states handled by the section's `SectionState`)

| Primitive          | Renders                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `DonutStat`        | `DonutChart` + center-total overlay + word+color+value legend (all status breakdowns); gray track when all-zero                 |
| `CategoryBarChart` | Single-hue `BarChart` (columns or bars) with value labels for a magnitude set; zero bar → muted gray                            |
| `StackedBarChart`  | Horizontal stacked `BarChart` + legend + tooltip (leads by source, per-owner checklist load)                                    |
| `Gauge`            | Semicircle `DonutChart` rate gauge; brand arc; null percent → empty track + "—"                                                 |
| `MeterBar`         | One labelled horizontal `Progress` bar (label · bar · value); optional `href` for alert links (kept — a nav meter, not a chart) |
| `PreviewTabs`      | Shared tabbed `Preview<T>` viewer (count badge = real `total`; `has_more` → "see all")                                          |
| `SectionHeading`   | Title + "how to read this" subtitle band; carries the section anchor `id`                                                       |

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
- Do not add a per-section superadmin check inside `DashboardOverview` — access is decided once at the home route (`AdminHome` branches on `authority_type`; superadmin never reaches the dashboard content, matching `DASHBOARDS_ACTOR_FORBIDDEN`). Do not point a superadmin at the dashboard — they get `SuperadminLanding`.

## Known risks / open items (flagged to the orchestrator)

- **Chart labels are axis/legend text**, not per-element ARIA — each chart carries an `aria-label` summary, but Mantine Charts don't expose per-bar/slice SR text the way the old `Progress` `aria-label`s did. Exact per-segment numbers on the stacked bars are tooltip-only.
- **Pipeline/Workload links point at PLAIN list routes**, not filtered ones — a deliberate deviation from a literal "link with a filter query" reading of the build brief, made because the contract has no drill-down guarantee (§9) and this app's own shells lock a URL-seeded filter permanently once set (see "Do not do" above).
- **No per-lead route exists** — `today.stale_leads` and any lead row link to `/admin/lead-management` (the board), not a specific lead (the board opens a lead via drawer state, not a URL).
