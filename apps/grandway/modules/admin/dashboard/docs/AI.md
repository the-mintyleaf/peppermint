# Dashboard Module AI Map

## Purpose

The operational command centre — eight independent, read-only sections
summarising what needs attention now, what is moving, and where work is stuck,
presented as **one straight-through page** of four bands. Owns no data, writes
nothing (`docs/backend/dashboard/INTEGRATION.md`).

**Plus a ninth section that is not in that contract at all**: the Follow-ups
band reads `/api/v1/reminders/` directly, because `/api/v1/dashboard/` has no
reminder data (its §2 Requires table does not list `reminders`, and none of the
eight endpoints touches one). See the Follow-ups notes below. Folder is **singular**
(`dashboard/`) to match the API base path (`/api/v1/dashboard/`); the backend app
is plural (`dashboards`).

## Module type

`ContainedModule` (Not-Contained — reporting/info-card page; no `ModalTableShell`/
`DataTableShell`, no CRUD of any kind).

## Route

`/admin` — **the dashboard is the admin home.** `app/admin/page.tsx` re-exports
`ModuleAdminHome`, which renders the dashboard when `caps.dashboard` holds
(`admin`/`lead_manager`) and a minimal identity/audit landing (`SuperadminLanding`)
for `superadmin` (403'd on every dashboard section, so they must not land on it). There is no separate "Dashboard" rail entry — the
always-shown "Home" entry is the dashboard.

## Entry files

- `pages/AdminHome.tsx` → `ModuleAdminHome` — the `/admin` entry: `RequireAuth` + a
  `caps.dashboard` branch
- `pages/DashboardOverview.tsx` → `DashboardOverview` — the whole page (no auth gate of its
  own; `AdminHome` decides who reaches it)
- `components/SuperadminLanding.tsx` — the superadmin fallback home
- `index.ts` (exports `ModuleAdminHome`)

## Data layer (one file per concern, not per section)

| File                       | Carries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dashboard.types.ts`       | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `dashboard.queryKeys.ts`   | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `dashboard.api.ts`         | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                                                                                                                                                                                                                                                                                                   |
| `dashboard.hooks.ts`       | 8 independent `useQuery` hooks + `useDashboardFilters` (URL-synced `fiscal_year`/`country`) + three cross-module hooks: `useApplicantsByCountry` (bounded `useQueries` fan-out over `/applicants/?country=` reading `meta.count`), `useRecentApplicants`, and **`useDueReminders`** (ONE `/reminders/?status=active` request, bucketed client-side into overdue/today/upcoming against ONE Nepal-time clock). `useDashboard{Blockers,Workload,Conversion,Outcomes}` take an `enabled` flag so a multi-view card only fetches the open view |
| `dashboard.tone.ts`        | `FigureTone` · `TONE_COLOR`/`TONE_WORD` · `toneForAlert(value, band)` · `toneForShare(value, total)` — **the single place a dashboard hue is chosen.** Tone is DERIVED per render from the figure, never passed as a fixed colour                                                                                                                                                                                                                                                                                                          |
| `dashboard.typeScale.ts`   | The five type roles (`TYPE_GREETING` · `TYPE_SECTION` · `TYPE_CARD_TITLE` · `TYPE_FIGURE_LG` · `TYPE_FIGURE_SM`) + `DISPLAY_TRACKING`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `dashboard.labels.ts`      | Only labels/colors with no existing home (`ApplicantStatusKey`, `DocumentRow.family`, `JOURNEY_OUTCOME_COLORS`/`OFFER_DECISION_COLORS`) + section/group headings. Every enum whose owning module already exports a color map is imported CONCRETELY, never redefined                                                                                                                                                                                                                                                                       |
| `dashboard.utils.ts`       | `formatDate`/`formatDateTime`/`formatSince`/`formatRatePercent`/`formatFetchedAt`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `dashboard.chartConfig.ts` | `toChartColor(name, shade)` + `CHART_TRACK_COLOR`/`CHART_ZERO_COLOR`; the shared chart-grammar notes                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Access — two bands, three, or four

A `lead_manager` sees the **Leads, Applicants and Follow-ups bands**; the Operations
band is gated on `caps.dashboardOperations` (Admin).

**Follow-ups is gated on `caps.reminders`, NOT on `caps.dashboardOperations` — do not
"tidy" it into the Operations band.** A `custom_reminder` alert is routed to Admins
only (`docs/backend/reminders/INTEGRATION.md` §9), so a Lead Manager's own follow-ups
surface nowhere automatically, and that section names this exact query as the
client-side answer. Moving the card inside the Admin-only band would hide it from
precisely the people who have no other way to see their due work. Leads and Applicants are the work — who
is waiting to hear back, and who those enquiries became. Operations is standing
measurement, which is an Admin's view of the office rather than a caseworker's view of
their day.

Because each band is its own `ModuleErrorBoundary` over independent per-section
queries, hiding Operations also stops its seven requests — nothing is fetched and
discarded. The monospace footer caption states which set the reader is looking at;
keep it truthful if the split changes.

## Layout — one page, three bands (no tabs)

`DashboardOverview` renders `ModuleHeader` → a scrolling `ModalPaper` →
`DashboardGreeting` → three `SectionBand`s. Every card measures against the SAME
12 columns: **large 6/12 · medium 4/12 · small 2/12**, and nothing exceeds 6/12.

| Band           | Left (figures)                                                                                                                                        | Right (rows)            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Leads**      | `LeadStats` 4/12 + `LeadStatTiles` 2/12                                                                                                               | `LeadsToAddress` 6/12   |
| **Applicants** | `ApplicantCountryStats` 4/12 + `ApplicantStatTiles` 2/12                                                                                              | `RecentApplicants` 6/12 |
| **Follow-ups** | one 6/12 `PanelCard`: `RemindersPanel`                                                                                                                | —                       |
| **Operations** | seven 6/12 `PanelCard`s: `AttentionPanel` · `TodayPanel` · `BlockersPanel` · `WorkloadPanel` · `PipelinePanel` · `PerformancePanel` · `ActivityPanel` | —                       |

- **The tab bar, `dashboard.tabs.ts` and `useDashboardTab` are gone.** The reading
  order is the page's; `tab` is no longer URL state (`fiscal_year`/`country` still are).
- **Every large card is a `PanelCard`** — title left, its views behind ONE `Menu`
  dropdown right, and only the selected view rendered. This is what preserves the
  old `keepMounted={false}` property: a card with six views costs one view's queries.
- **One `ModuleErrorBoundary` per band** (`resetKeys = [fiscalYear, country]`), so a
  failing band never takes the page with it.
- The greeting is the page's single display-size line (§1.1) and the only
  page-level anchor; band titles and card titles are the two steps below it.

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

### Page & band chrome

| Component                 | Backs                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AdminHome`               | `/admin` entry — `RequireAuth` + role branch                                                                                                                                    |
| `SuperadminLanding`       | Superadmin fallback home — Welcome + Users/Audit quick-links                                                                                                                    |
| `DashboardGreeting`       | "Good morning, {display_name}!" + subtitle + the header controls slot. Time of day is read via `useMounted` (never during SSR — the server's clock would disagree on hydration) |
| `DashboardHeaderControls` | Data-freshness stamp + `fiscal_year` + `country` + "Refresh" — the only live filters (§9: the rest are validated-and-ignored)                                                   |
| `SectionBand`             | One band: title + question + the 12-column `Grid` its cards sit in                                                                                                              |
| `PanelCard`               | The large-card shell — title/subtitle/icon left, view `Menu` right (counts + descriptions per view), body slot. States belong to the caller's `SectionState`                    |

### Band cards

| Component               | Backs                                                                                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LeadStats`             | The grouped lead figure: live-stage ring + total from `pipeline.leads_by_stage`. `converted`/`lost` are terminal and reported as words, never slices                                                                                                                 |
| `LeadStatTiles`         | Needs-attention (from the lead board's cached query) + converted, as two 2/12 tiles                                                                                                                                                                                  |
| `LeadsToAddress`        | The day's lead queue. Rows + counts come from `useLeadBoardData` + `categorizeLead` — **the lead board's own cached query**, so dashboard and board cannot drift. 4 mutually-exclusive views; opens on "Needs attention today"; discloses the board's 1,000-lead cap |
| `LeadRowView`           | One lead row (name · why it is here · owner · stage badge). Nothing is a link — there is no per-lead route                                                                                                                                                           |
| `ApplicantCountryStats` | Applicants per destination as a ranked single-hue bar chart. ONE `/applicants/?country=` count per country (`INITIAL_COUNT`=8, +`STEP`=8, deliberately no "show all")                                                                                                |
| `ApplicantStatTiles`    | Active + dormant from `pipeline.applicants_by_status`, as two 2/12 tiles                                                                                                                                                                                             |
| `RecentApplicants`      | Newest applicants, 3 views over the real `creation_source` server filter. `/applicants/` is newest-first with **no client-controlled ordering**, so no `ordering` is sent                                                                                            |
| `ApplicantRowView`      | One applicant row — the whole row is the link (an applicant HAS a route, unlike a lead)                                                                                                                                                                              |
| `AttentionPanel`        | The 8 `summary.alerts` as 2/12 tiles, ONE request. Each tile is a button into the owning module's PLAIN list                                                                                                                                                         |
| `TodayPanel`            | All 6 `today` worklists as views off the one `today` request                                                                                                                                                                                                         |
| `BlockersPanel`         | The 5 blocker groups as views, grouped BY CAUSE and never merged                                                                                                                                                                                                     |
| `WorkloadPanel`         | The 3 per-owner measures as views; `is_scoped_to_caller` drives the caption only                                                                                                                                                                                     |
| `PipelinePanel`         | 4 views (journeys · offers · checklists · documents & files). Leads-by-stage and applicants-by-status are NOT here — the bands above own them                                                                                                                        |
| `PerformancePanel`      | 5 views across `conversion` + `outcomes`, each stating its own window. Gates both hooks on the open view                                                                                                                                                             |
| `ActivityPanel`         | The only paginated section, as event ROWS (not the old 6-column table — this card is half the page wide). `fiscalYear` only                                                                                                                                          |

### Shared primitives

| Primitive              | Renders                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StatTile`             | One tile in three registers: tone-tinted header band (entity icon + label) · the figure · footer (`caption` + the tone's word). `size` picks the figure step. Tone comes from the caller via `dashboard.tone.ts`. `—` on error, never `0`. `onActivate` makes it a button (and the only tiles that lift on hover) |
| `PreviewList`          | One `Preview<T>` queue as rows — REAL `total`, `has_more`-driven "see all", neutral empty message                                                                                                                                                                                                                 |
| `DistributionBar`      | One stacked `Progress` distribution + word+colour+value legend (documents, files)                                                                                                                                                                                                                                 |
| `DonutStat`            | `DonutChart` + center-total overlay + legend (all status breakdowns); gray track when all-zero                                                                                                                                                                                                                    |
| `CategoryBarChart`     | Single-hue `BarChart` with value labels for a magnitude set; zero bar → muted gray                                                                                                                                                                                                                                |
| `StackedBarChart`      | Horizontal stacked `BarChart` + legend + tooltip                                                                                                                                                                                                                                                                  |
| `Gauge`                | Semicircle `DonutChart` rate gauge; brand arc; null percent → empty track + "—"                                                                                                                                                                                                                                   |
| `MeterBar`             | One labelled horizontal `Progress` bar; kept as `Progress` — a nav meter, not a chart                                                                                                                                                                                                                             |
| `ChecklistItemRowView` | One checklist-item preview row, shared by the overdue and due-soon views                                                                                                                                                                                                                                          |
| `SectionState`         | Shared loading/error/empty chrome — every card wraps its body in this                                                                                                                                                                                                                                             |

## Visual design

1. **Colour is derived, not chosen.** `dashboard.tone.ts` maps a figure to a tone
   (`toneForAlert` for a fixed severity band, `toneForShare` for a threshold against a
   total), so the page re-colours itself as the day moves. Never colour alone — every
   toned element carries the tone's word too.
2. **Five type roles, no sixth.** `dashboard.typeScale.ts`. Greeting → band title →
   card title → figure → supporting figure.
3. **Adapt honestly** — the source design's trend line, per-worklist age buckets,
   per-blocker reason breakdowns and 14-day sparkline have NO backing endpoint. They
   are not faked; each is replaced with the real data (preview rows, the alert tiles,
   the `meta.count` total).
4. **Chart grammar** — a **breakdown** of a total is a `DonutChart` (`DonutStat`); a
   **magnitude** comparison is a single-hue `BarChart` (`CategoryBarChart`); a multi-part
   **comparison** is a stacked `BarChart`; a **rate** is a semicircle gauge. Navigational
   meters stay `Progress`. Status breakdowns reuse each owning module's status→color map.

## State ownership

- All 8 sections: React Query, independent hooks, independent cache keys.
- `fiscal_year`/`country`: URL search params (`useDashboardFilters`) — shareable/bookmarkable.
- The open view of each `PanelCard`: local `useState` in that card. Deliberately NOT URL
  state — seven cards' views in the query string would make every link a snapshot of
  someone else's reading position.
- Activity page number: local `useState` in `ActivityPanel`.

## Do not do

- Do not combine the 8 queries into one — a slow section must never block the rest (CONCEPT.md).
- Do not move `RemindersPanel` inside the `dashboardOperations` gate (see Access above).
- Do not pass `filters` to `RemindersPanel`, or add `fiscal_year`/`country` to
  `useDueReminders`. Reminders have no country, and `fiscal_year` on that API is a
  **Bikram Sambat label over `due_date`** — a different question from this page's
  filter. The card's caption states that it reads neither; keep it truthful.
- Do not split `useDueReminders` into three window-filtered requests
  (`due_before`/`due_after`). Three requests are three clocks, and a reminder can fall
  between them or land in two — the same rule the notifications feed follows.
- Do not seed the Follow-ups "see all" link with a filter. There is no reminders list
  route (reminders live on the record they belong to), so it points at the plain
  applicants list.
- Do not re-introduce a tab bar, `dashboard.tabs.ts`, or `useDashboardTab`. A card's views
  belong in its `PanelCard` menu.
- Do not pass a literal colour to a `StatTile` or invent a hue at a call site — derive it
  through `dashboard.tone.ts`, or the "dynamic colour" property is silently lost.
- **Nothing renders in two places.** The leads band owns `leads_by_stage`; the applicants
  band owns `applicants_by_status` and the per-country counts; `AttentionPanel` owns the 8
  alerts; each Operations card owns its own section. Check before adding a figure anywhere.
- Do not add a "show all countries" control or raise `STEP` in `ApplicantCountryStats` —
  it costs ONE request per country and `useCountries` returns up to 100 rows.
- Do not present the per-country counts as a backend breakdown — they are N independent
  requests, so the set is only as complete as the countries that resolved.
- Do not render a control for `journey_stage`/`offer_status`/`document_status`/
  `checklist_status` — validated then silently ignored by every section.
- Do not send `country` to `fetchActivity` — the backend ignores it.
- Do not sum figures across sections except `today.overdue_checklist_items.total +
today.due_soon_checklist_items.total` (the one contract-documented exception).
- Do not draw a funnel for `conversion.rates` or multiply the four rates together.
- Do not merge `blockers`' five groups into one sorted list.
- Do not join/sum `workload`'s three lists, and never filter out the `owner_id: null` row.
- Do not seed a list link with `?status=`/`?stage=` — `apps/grandway/docs/AI.md` documents
  that `forceFilters` always wins over a column filter, so a URL-seeded filter would lock
  the control rather than seed it. Every card links to the PLAIN unfiltered list.
- Do not add a per-section superadmin check inside `DashboardOverview` — access is decided
  once at `AdminHome`.

## Known risks / open items

- **The leads band costs up to 10 requests.** `useLeadBoardData` pages `/leads/` at 100/page
  up to a 1,000-lead cap. It is the same cached query the lead board itself uses, so opening
  the board after the dashboard is free — but a first paint of `/admin` now pays for it.
  Chosen deliberately (confirmed with the user) because the dashboard contract has no
  "leads needing attention" concept beyond a ≤10-row `stale_leads` preview.
- **Two definitions of a stale lead coexist**: the client-side `needs_attention` category in
  the Leads band, and the backend's `today.stale_leads` window in `TodayPanel`. Both are
  labelled with which they are; do not merge them.
- **Follow-ups is the one card whose "overdue" is computed in the browser.** Every other
  overdue/expiry flag on this page is server-computed. The reminders API exposes no due
  bucket, so `dueBucket()` derives it from a Nepal-calendar today — which means near
  midnight NPT this card can briefly disagree with the backend sweep. The page footer
  caption says so; keep it there.
- **Chart labels are axis/legend text**, not per-element ARIA — each chart carries an
  `aria-label` summary; exact per-segment numbers on stacked bars are tooltip-only.
- **No per-lead route exists** — lead rows link nowhere; the card header links to the board.
