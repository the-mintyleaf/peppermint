# Dashboard Module AI Map

## Purpose

The operational command centre — eight independent, read-only sections
summarising what needs attention now, what is moving, and where work is
stuck, presented as **an Overview signal board plus six detail tabs**. Owns no
data, writes nothing (`docs/backend/dashboard/INTEGRATION.md`).
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

| File                       | Carries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.types.ts`       | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `dashboard.queryKeys.ts`   | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `dashboard.api.ts`         | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `dashboard.hooks.ts`       | 8 independent `useQuery` hooks (`useDashboard{Summary,Today,Pipeline,Blockers,Workload,Conversion,Outcomes,Activity}`) + `useDashboardFilters` (URL-synced `fiscal_year`/`country`) + `useCountrySummaries(countryIds, fiscalYear)` (a `useQueries` fan-out — one `summary` per country, same key shape as `useDashboardSummary` so a matching header filter shares the cache; the CALLER must bound the list) + `useDashboardTab` (URL-synced `tab`); both write through one `useSearchParamPatch`, which rebuilds the whole query string from the current `searchParams` so a tab switch carries the filters through and vice versa. Known window: `patch` closes over its render's `searchParams`, so two writes dispatched in the same tick would let the second overwrite the first — no UI path fires both, but a future control that does must patch once, not twice |
| `dashboard.labels.ts`      | Only labels/colors with no existing home (`ApplicantStatusKey`, `DocumentRow.family`, `JOURNEY_OUTCOME_COLORS`/`OFFER_DECISION_COLORS` — the owning modules export the outcome/decision LABELS but no color map) + section/group headings. Every enum whose owning module already exports a color map (offer/checklist/journey/lead/file status) is imported CONCRETELY, never redefined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `dashboard.utils.ts`       | `formatDate`/`formatDateTime`/`formatRatePercent`/`formatFetchedAt` (the hero's data-freshness stamp, from `useQuery`'s `dataUpdatedAt`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `dashboard.chartConfig.ts` | `toChartColor(name, shade)` (status color name → Mantine chart shade, e.g. `blue.6`) + `CHART_TRACK_COLOR`/`CHART_ZERO_COLOR`; the shared chart-grammar notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `dashboard.tabs.ts`        | `DASHBOARD_TAB_VALUES` / `DashboardTab` / `isDashboardTab` / `DEFAULT_DASHBOARD_TAB` + `DASHBOARD_TAB_META` (tab label · the question the tab answers · the contract caveat rendered as its panel subtitle)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

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

## Layout — Overview + six detail tabs (progressive disclosure)

The eight sections are **unchanged and still independent**; they are no longer
stacked into one scroll. `DashboardOverview` renders the hero, then one `Tabs`
(`DashboardTabs`) whose seven panels each carry one section:

| Tab           | Panel content                                | The question it answers                    |
| ------------- | -------------------------------------------- | ------------------------------------------ |
| `overview`    | `OverviewPanel` (default)                    | Is everything okay?                        |
| `today`       | `TodayWorklists`                             | What has to happen today?                  |
| `pipeline`    | `PipelineCounts`                             | Where is everything?                       |
| `blockers`    | `Blockers`                                   | What is stuck?                             |
| `workload`    | `Workload`                                   | Who is carrying what?                      |
| `performance` | `Conversion` + `Outcomes` (the two together) | How are we converting, and how did it end? |
| `activity`    | `ActivityFeed`                               | What just changed?                         |

- **`keepMounted={false}`** — only the open tab's queries fire, so no tab pays for
  a section it isn't showing. React Query caches by key, so an Overview card and
  its own tab share ONE request, not two. Per-tab cost:
  - `summary` is the **one exception** — `DashboardHero` sits above the tabs and
    never unmounts, so `summary` is fetched on every tab. That is deliberate: the
    hero's three standing volumes are the scale a count in Today, Pipeline or
    Blockers is read against, and the freshness stamp has to be true wherever you
    are. `StatTiles` reuses the same cached query.
  - `overview` additionally mounts `pipeline`, `today` and `conversion` (3 more) —
    the sections its charts and lists actually show — **plus one `summary` per
    visible country card** (`useCountrySummaries`; 8 on load, +8 per "Show more").
  - every other tab mounts exactly its own one section (`performance` mounts two,
    `conversion` + `outcomes`).
- The page owns the per-panel `SectionHeading` (title + caveat, from
  `DASHBOARD_TAB_META`) and the per-panel `ModuleErrorBoundary`
  (`resetKeys = [fiscalYear, country, tab]`); each section still renders only its
  own card(s).
- **The in-page anchors (`#today-worklists`, `#blockers`) are gone** — a hidden
  tab panel cannot be scrolled to. Alert tiles switch tab via `onOpenTab`, so
  `StatTile` (and `MeterBar`) take `onActivate` (a button) rather than `href` (a
  link): nothing navigates, the view changes.
- The tab bar carries **no count badges** — every figure is defined by its own
  window and the contract forbids summing across sections (§7), so a bare digit
  on "Today" would be an unlabelled aggregate of non-addable things.

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

### Section components (one per endpoint)

| Component                 | Backs                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AdminHome`               | `/admin` entry — `RequireAuth` + role branch: dashboard for admin/lead_manager, `SuperadminLanding` for superadmin                                                                                                                                                                               |
| `SuperadminLanding`       | Superadmin fallback home — Welcome + Users/Audit quick-links (no dashboard access)                                                                                                                                                                                                               |
| `DashboardHero`           | Page anchor and the ONE expressive surface (brand-tinted card) — eyebrow + "Placement overview" + role·user, the 3 standing volumes from `summary`, and the data-freshness stamp (`dataUpdatedAt`). Shown on every tab; a failed fetch shows `—`, never `0`                                      |
| `DashboardTabs`           | The seven-tab bar (sticky inside the scrolling `ModalPaper`, `ScrollArea` on narrow viewports) wrapping the panels passed as `children`; owns `keepMounted={false}`                                                                                                                              |
| `OverviewPanel`           | The landing view, in four bands: `StatTiles` → `CountryCards` → charts (journeys-by-stage bar + applicants-by-status donut + the 4 conversion gauges) → the overdue/due-soon checklist queues as real rows. Each card carries ONE quiet tab button                                               |
| `DashboardHeaderControls` | fiscal_year + country + "Refresh" in the module header's right slot — the only live filters (§9: the rest are validated-and-ignored)                                                                                                                                                             |
| `StatTiles`               | All 11 `summary` figures as one grid — 3 volumes (inert) then the 8 alerts by severity band, each a button into its tab. ONE request, so the grid is internally consistent. Carries its own inline retry. _(Replaced `NeedsAttention`, which replaced `SummaryStrip`.)_                          |
| `CountryCards`            | Destination comparison — ONE `summary` per country (no group-by endpoint exists); `INITIAL_COUNT`=8, +`STEP`=8 per "Show more", deliberately no "show all". Ignores the header country filter (it IS the cross-country view) and highlights the filtered one; activating a card sets that filter |
| `TodayWorklists`          | 6 worklists as `PreviewTabs` (real preview rows; no invented bucket chart)                                                                                                                                                                                                                       |
| `PipelineCounts`          | 7 zero-filled maps — stage magnitudes as `CategoryBarChart`, status breakdowns as `DonutStat`, docs/files as `Progress`; each links to the OWNING APP'S PLAIN list                                                                                                                               |
| `Blockers`                | 5 groups as `PreviewTabs` (real rows; no invented reason breakdown), never merged                                                                                                                                                                                                                |
| `Workload`                | Branches on `is_scoped_to_caller` (caption only); 3 tabbed per-owner measures (`CategoryBarChart` + `StackedBarChart`), never joined/summed                                                                                                                                                      |
| `Conversion`              | 4 independent `Gauge`s + `by_source` `StackedBarChart`; takes `filters` prop                                                                                                                                                                                                                     |
| `Outcomes`                | `journey_outcomes` + `offer_decisions` as `DonutStat`, created-window counts as `MeterBar`s — separate cards; takes `filters` prop                                                                                                                                                               |
| `ActivityFeed`            | The only paginated section, as a `Table`; real total from `meta.count` (no sparkline); `fiscalYear` only (never `country`)                                                                                                                                                                       |
| `SectionState`            | Shared loading/error/empty chrome — every section wraps its content in this                                                                                                                                                                                                                      |

### Chart primitives (presentational; states handled by the section's `SectionState`)

| Primitive              | Renders                                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DonutStat`            | `DonutChart` + center-total overlay + word+color+value legend (all status breakdowns); gray track when all-zero                                                                                                           |
| `CategoryBarChart`     | Single-hue `BarChart` (columns or bars) with value labels for a magnitude set; zero bar → muted gray                                                                                                                      |
| `StackedBarChart`      | Horizontal stacked `BarChart` + legend + tooltip (leads by source, per-owner checklist load)                                                                                                                              |
| `Gauge`                | Semicircle `DonutChart` rate gauge; brand arc; null percent → empty track + "—"                                                                                                                                           |
| `MeterBar`             | One labelled horizontal `Progress` bar (label · bar · value); optional `onActivate` + `activateLabel` makes the row an `UnstyledButton` (used by the alerts to switch tab). Kept as `Progress` — a nav meter, not a chart |
| `StatTile`             | One tile: entity icon (the glyph that entity wears in the nav rail) · label · number, with a tinted left edge only when a non-zero alert. `—` on error, never `0`. `onActivate` makes it a button                         |
| `ChecklistItemRowView` | One checklist-item preview row (applicant · checklist — item · status badge · due date), shared by `TodayWorklists` and the Overview queues so the row can't drift into two shapes                                        |
| `PreviewTabs`          | Shared tabbed `Preview<T>` viewer (count badge = real `total`; `has_more` → "see all")                                                                                                                                    |
| `SectionHeading`       | Title + "how to read this" subtitle band, one per tab panel (fed from `DASHBOARD_TAB_META`). The `id` anchor prop is now unused — a hidden panel can't be scrolled to                                                     |

## State ownership

- All 8 sections: React Query, independent hooks, independent cache keys.
- `fiscal_year`/`country`: URL search params (`useDashboardFilters`), not `useState` — shareable/bookmarkable.
- Active `tab`: URL search param (`useDashboardTab`), same reason — "open the dashboard on Blockers for FY82/83" has to be one link. Unknown/absent → `overview`; `overview` is written as an absent param, not `?tab=overview`.
- Activity page number: local `useState` in `ActivityFeed` (not shared, not shareable by design — no established pagination-in-URL convention for this feed).

## Do not do

- Do not combine the 8 queries into one — a slow section must never block the rest (CONCEPT.md).
- Do not put a count badge on a tab, and do not re-add an in-page `#anchor` link — a hidden panel can't be scrolled to; cross-section navigation is a tab switch (`onOpenTab`).
- Do not widen `OverviewPanel` past its four bands (tiles → countries → charts → the two checklist queues). It carries the overdue/due-soon rows **by explicit request** because they drive the day; the other four worklists, all five blocker groups, per-owner workload, outcomes and the activity feed stay one tab away and must not be copied here.
- Do not add a "show all countries" control, and do not raise `STEP` — `CountryCards` costs ONE request per visible card and `useCountries` alone returns up to 100 rows, so a single click must never be able to fan out across the catalogue.
- Do not present a country card's figures as a backend-provided breakdown — they are N independent `summary` calls, so cards can land at different moments and the set is only as complete as the cards actually loaded.
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
