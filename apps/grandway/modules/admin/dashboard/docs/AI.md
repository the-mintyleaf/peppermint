# Dashboard Module AI Map

## Purpose

The operational command centre — eight independent, read-only sections
summarising what needs attention now, what is moving, and where work is stuck,
presented as an **always-visible headline row over three tabs**. Owns no data,
writes nothing (`docs/backend/dashboard/INTEGRATION.md`).

**Plus a ninth section that is not in that contract at all**: the Follow-ups
card in the **Applicants tab** reads `/api/v1/reminders/` directly, because
`/api/v1/dashboard/` has no reminder data (its §2 Requires table does not list
`reminders`, and none of the eight endpoints touches one). See the Follow-ups
notes below. Folder is **singular**
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

| File                       | Carries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard.types.ts`       | All 8 section response shapes + shared row/wrapper shapes (§4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `dashboard.queryKeys.ts`   | `dashboardQueryKeys.{summary,today,pipeline,blockers,workload,conversion,outcomes,activity}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `dashboard.api.ts`         | 8 `fetch*` functions — only `fetchConversion`/`fetchOutcomes` take `{fiscal_year, country}`; `fetchActivity` takes only `{fiscal_year, page, page_size}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `dashboard.hooks.ts`       | 8 independent `useQuery` hooks + `useDashboardFilters` (URL-synced `fiscal_year`/`country`) + `useDashboardTab` (URL-synced `tab`, resolved against the tabs the caller may open so a forwarded or stale `?tab=` falls back instead of rendering an empty page) + three cross-module hooks: `useApplicantsByCountry` (bounded `useQueries` fan-out over `/applicants/?country=` reading `meta.count`), `useRecentApplicants`, and **`useDueReminders`** (THREE `/reminders/?status=active` window requests — overdue / today / upcoming — whose boundary dates are computed ONCE from `nepalToday()` and sent explicitly, so one clock partitions all three. Each returns its own `meta.count`, the real total for that window). `useDashboard{Blockers,Workload,Conversion,Outcomes}` take an `enabled` flag so a multi-view card only fetches the open view |
| `dashboard.tabs.ts`        | `DASHBOARD_TABS` (value · label · subtitle · icon · capability gate) + `visibleDashboardTabs(caps)` — **the only place a tab is declared or gated.** Adding a tab here without a band in `DashboardBands.tsx` is a type error, not an empty panel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `dashboard.tone.ts`        | `FigureTone` · `TONE_COLOR`/`TONE_WORD` · `toneForAlert(value, band)` · `toneForShare(value, total)` · `worstTone(tones)` (a card of several figures wears its worst) — **the single place a dashboard hue is chosen.** Tone is DERIVED per render from the figure, never passed as a fixed colour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `dashboard.typeScale.ts`   | The five type roles (`TYPE_GREETING` · `TYPE_SECTION` · `TYPE_CARD_TITLE` · `TYPE_FIGURE_LG` · `TYPE_FIGURE_SM`) + `DISPLAY_TRACKING`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `dashboard.labels.ts`      | Only labels/colors with no existing home (`ApplicantStatusKey`, `DocumentRow.family`, `JOURNEY_OUTCOME_COLORS`/`OFFER_DECISION_COLORS`) + section/group headings. Every enum whose owning module already exports a color map is imported CONCRETELY, never redefined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `dashboard.utils.ts`       | `formatDate`/`formatDateTime`/`formatSince`/`formatRatePercent`/`formatFetchedAt`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `dashboard.chartConfig.ts` | `toChartColor(name, shade)` + `CHART_TRACK_COLOR`/`CHART_ZERO_COLOR`; the shared chart-grammar notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Access — the headline is shared, the third tab is not

Two independent gates, and they are not the same gate.

**The tabs.** A `lead_manager` sees the **Leads and Applicants** tabs; **Operations**
is gated on `caps.dashboardOperations` (Admin). `visibleDashboardTabs(caps)` in
`dashboard.tabs.ts` is the only place that decides, and `useDashboardTab` resolves
`?tab=` against its result — never branch on a role name at a call site.

**The headline cards.** `OverviewStats` above the bar is NOT gated as a block: both
staff tiers get the three volumes, because scale is not privileged information.
The alert cards are gated **one at a time, on the capability the card's destination
route actually checks** — every card is a button, and a button that lands the
operator on "Access Forbidden" is worse than the figure being absent:

| Card                   | Destination                 | Route's own gate | `lead_manager` |
| ---------------------- | --------------------------- | ---------------- | -------------- |
| Checklist items        | `/admin/checklists`         | `checklists`     | ✗              |
| Files                  | `/admin/files/review`       | `documents`      | ✗              |
| Stale leads            | `/admin/lead-management`    | `leads`          | ✓              |
| Journeys, no checklist | `/admin/applicant-journeys` | `leads`          | ✓              |
| Offers awaiting reply  | `/admin/offers`             | `leads`          | ✓              |

So a `lead_manager` gets three alert cards, an `admin` all five. **Read the gate off
the destination page, not the nav rail** — they disagree for file review: the rail
uses `caps.fileReview` (`layouts/admin/Admin.tsx`), the page uses `documents`
(`RequireDocumentAccess`), and the page is what decides whether the click works.
The `/summary/` request is identical either way — it returns all eight figures and
always did; this only decides what is drawn.

**The Follow-ups card sits INSIDE the Applicants tab, gated on `caps.reminders` —
do not "tidy" it into Operations or back out into a band of its own.** Two reasons,
both load-bearing. A `custom_reminder` alert is routed to Admins only
(`docs/backend/reminders/INTEGRATION.md` §9), so a Lead Manager's own follow-ups
surface nowhere automatically and that section names this exact query as the
client-side answer — the card must live in a tab that tier actually gets. And a
follow-up is a debt against a record in this tab, so "who just joined" and "what we
owe them" read as one thought. Leads and Applicants are the work — who
is waiting to hear back, and who those enquiries became. Operations is standing
measurement, which is an Admin's view of the office rather than a caseworker's view of
their day.

Because each tab is its own `ModuleErrorBoundary` over independent per-section
queries AND `keepMounted={false}`, an unopened tab costs nothing — hiding Operations
stops its six requests, and so does simply not clicking it. The monospace footer
caption states which set the reader is looking at; keep it truthful if the split
changes.

## Layout — a headline row, then three tabs

`DashboardOverview` renders `ModuleHeader` → a scrolling `ModalPaper` →
`DashboardGreeting` → **`OverviewStats`** → a **`Tabs`** bar with one panel per band.
The page answers the two questions a dashboard owes, in the order it owes them
(`DESIGN.md` Part 5C: freshness → key health indicators → exception cards):
**is the office healthy** (above the bar, always visible), then **what is behind
those figures** (the tabs).

Every card inside a tab measures against the SAME 12 columns:
**large 6/12 · medium 4/12 · small 2/12**, and nothing exceeds 6/12.

### Above the bar — always rendered, never gated by tab

`OverviewStats` is the whole of `/summary/` in one region: **eight cards of one
size** in a `SimpleGrid` (`base 1 · xs 2 · md 3 · lg 4`). One request for all
eleven figures, so this region is internally consistent even though the rest of
the page carries no cross-section guarantee (INTEGRATION.md §3) — and it costs
exactly one request whichever tab is open.

**Nothing that needs a human sits behind a tab.** An alert one click away is an
alert nobody sees on the morning it matters; the tabs hold detail, never the fact
that something is wrong.

**One size, three kinds of body.** Every card is the same width and height; what
differs is the KIND of answer. `OverviewCard` is that card — a tone hairline on
the top edge, a tinted strip naming the subject, a fixed-height body **slot**, a
footer pairing the caption with the tone's word. `BODY_HEIGHT` was tuned against
the tallest body (the donut plus legend) and then pulled in until a lone figure
stopped floating; it was **measured on the rendered page at 1440/768/390**, so do
not change it from the source alone.

| Card                                 | Figures                                                    | Body     | Destination / gate                    |
| ------------------------------------ | ---------------------------------------------------------- | -------- | ------------------------------------- |
| Leads · Active applicants · Journeys | the 3 `summary.volumes`                                    | `figure` | none — not buttons, no destination    |
| **Checklist items**                  | overdue · blocked · due soon                               | `meters` | `/admin/checklists` · `checklists`    |
| **Files**                            | rejected · awaiting verification                           | `donut`  | `/admin/files/review` · `documents`   |
| **Stale leads**                      | stale leads (+ share of `leads_total`)                     | `figure` | `/admin/lead-management` · `leads`    |
| **Journeys, no checklist**           | journeys without a checklist (+ share of `journeys_total`) | `figure` | `/admin/applicant-journeys` · `leads` |
| **Offers awaiting reply**            | offers awaiting response                                   | `figure` | `/admin/offers` · `leads`             |

- **The eight alerts are grouped BY DESTINATION MODULE, not by severity.** That
  grouping is what lets a card carry a chart at all — three checklist counts
  compared against each other say "the overdue pile is twice the blocked one",
  which none of them says alone — and it keeps the promise every card makes: one
  card, one click, one list. It also collapses the access rule to **one gate per
  card** rather than one per figure. A severity grouping was considered and
  rejected: a card mixing entities has no single destination, so it cannot be a
  button.
- **Chart grammar comes from `dashboard.chartConfig.ts`, applied one level up**:
  a magnitude comparison is `MeterBar`s, a total split into named parts is a
  `DonutStat`. Do not swap one for the other to vary the look.
- **A share track is only ever drawn against a `volumes` figure**, because both
  halves of that fraction arrive in the same request. The bar is clamped at 100%;
  the TEXT is not — an alert exceeding its denominator must read as the real
  percentage, never as a tidy full bar.
- **Tone is still derived**, now via `worstTone()` for a card carrying several
  figures: a card wears its worst news, so one breach still re-colours one card
  and suppression keeps doing the work (§1.1). Volumes are permanently `neutral`
  — a volume is never an alert.
- **The card's accessible name carries its individual figures**, not their total:
  12/7/5 and 0/0/24 are very different mornings that both add up to 24.
- States are owned by `SectionState` around the WHOLE grid, not per card — so a
  pending or failed `/summary/` replaces the region rather than painting eight
  cards of zeros. The per-card `isPending`/`isError` props are defensive only.

### The tabs

| Tab            | Left (figures)                                                                                                                   | Right (rows)                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Leads**      | `LeadStats` 4/12 + `LeadStatTiles` 2/12                                                                                          | `LeadsToAddress` 6/12                                       |
| **Applicants** | `ApplicantCountryStats` 4/12 + `ApplicantStatTiles` 2/12                                                                         | `RemindersPanel` 6/12, then `RecentApplicants` 6/12 (wraps) |
| **Operations** | six 6/12 `PanelCard`s: `TodayPanel` · `BlockersPanel` · `WorkloadPanel` · `PipelinePanel` · `PerformancePanel` · `ActivityPanel` | —                                                           |

- **`keepMounted={false}` is load-bearing.** Mantine `Tabs` keeps hidden panels
  mounted by DEFAULT, which would fire every tab's queries on first paint and undo
  the whole saving. With it the page opens on the `/summary/` request plus one
  band's; React Query keeps what has landed, so returning to a tab is a cache read
  (or one revalidation past the 30s stale time), not a cold fetch.
- **`dashboard.tabs.ts` + `useDashboardTab` are back**, and `tab` is URL state again
  alongside `fiscal_year`/`country`. `useDashboardTab` resolves `?tab=` against the
  tabs the CALLER may open, so a forwarded `?tab=operations` link, or any stale
  value, silently falls back to the first tab they have instead of an empty page.
- **Band bodies live in `DashboardBands.tsx`** (`LeadsBand`/`ApplicantsBand`/
  `OperationsBand`), each returning bare `Grid.Col`s so the surrounding
  `SectionBand` still owns the twelve columns. The page file is structure only.
- **Every large card is a `PanelCard`** — title left, its views behind ONE `Menu`
  dropdown right, and only the selected view rendered, so a card with six views
  costs one view's queries.
- **One `ModuleErrorBoundary` per region** (`resetKeys = [fiscalYear, country]`) —
  one over `OverviewStats`, one inside each tab panel — so a failing band leaves the
  headline figures and the other tabs reachable.
- The greeting is the page's single display-size line (§1.1) and the only
  page-level anchor. Inside a tab, `SectionBand` renders its **subtitle only**: the
  tab label already names the band, so `SectionBand.title` is optional and omitted
  here.

## Components (`components/`, flat — no per-component folder; only non-trivial props get a `.types.ts`)

### Page & band chrome

| Component                 | Backs                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AdminHome`               | `/admin` entry — `RequireAuth` + role branch                                                                                                                                                                                                                                                                            |
| `SuperadminLanding`       | Superadmin fallback home — Welcome + Users/Audit quick-links                                                                                                                                                                                                                                                            |
| `DashboardGreeting`       | "Good morning, {display_name}!" + subtitle + the header controls slot. Time of day is read via `useMounted` (never during SSR — the server's clock would disagree on hydration)                                                                                                                                         |
| `DashboardHeaderControls` | Data-freshness stamp + `fiscal_year` + `country` + "Refresh" — the only live filters (§9: the rest are validated-and-ignored). **"Refresh" invalidates `REFRESH_KEYS`, not just `["dashboard"]`** — the cross-module reads (`reminders.due`, `applicants`) sit under their own roots and a prefix match would miss them |
| `SectionBand`             | One band: an OPTIONAL title, the question it answers, and the 12-column `Grid` its cards sit in. Inside a tab the title is omitted — the tab label is the level that names the band                                                                                                                                     |
| `OverviewStats`           | The headline region above the tab bar: 3 `summary.volumes` + the `summary.alerts` this caller can act on, ONE request. Absorbed the old `AttentionPanel`. Each alert tile is a button into the owning module's PLAIN list, and a tile is rendered **only if its destination route would open** (see Access below)       |
| `DashboardBands`          | `LeadsBand` / `ApplicantsBand` / `OperationsBand` — each tab's cards as bare `Grid.Col`s, so `SectionBand` keeps ownership of the twelve columns                                                                                                                                                                        |
| `PanelCard`               | The large-card shell — title/subtitle/icon left, view `Menu` right (counts + descriptions per view), body slot. States belong to the caller's `SectionState`                                                                                                                                                            |

### Band cards

| Component               | Backs                                                                                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LeadStats`             | The grouped lead figure: live-stage ring + total from `pipeline.leads_by_stage`. `converted`/`lost` are terminal and reported as words, never slices                                                                                                                 |
| `LeadStatTiles`         | Needs-attention (from the lead board's cached query) + converted, as two 2/12 tiles                                                                                                                                                                                  |
| `LeadsToAddress`        | The day's lead queue. Rows + counts come from `useLeadBoardData` + `categorizeLead` — **the lead board's own cached query**, so dashboard and board cannot drift. 4 mutually-exclusive views; opens on "Needs attention today"; discloses the board's 1,000-lead cap |
| `LeadRowView`           | One lead row (name · why it is here · owner · stage badge). Nothing is a link — there is no per-lead route                                                                                                                                                           |
| `ApplicantCountryStats` | Applicants per destination as a ranked single-hue bar chart. ONE `/applicants/?country=` count per country (`INITIAL_COUNT`=8, +`STEP`=8, deliberately no "show all")                                                                                                |
| `ApplicantStatTiles`    | **Dormant + archived** from `pipeline.applicants_by_status`, as two 2/12 tiles. Active is deliberately NOT here — it is a `summary.volumes` figure in `OverviewStats`, and the same number from two endpoints on two clocks is a disagreement waiting to happen      |
| `RecentApplicants`      | Newest applicants, 3 views over the real `creation_source` server filter. `/applicants/` is newest-first with **no client-controlled ordering**, so no `ordering` is sent                                                                                            |
| `ApplicantRowView`      | One applicant row — the whole row is the link (an applicant HAS a route, unlike a lead)                                                                                                                                                                              |
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
   are not faked; each is replaced with the real data (preview rows, the alert cards,
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
- Do not move `RemindersPanel` out of the Applicants tab — not into Operations, and
  not back into a band of its own (see Access above).
- Do not demote it below `RecentApplicants`. The right-hand 6/12 of a band is that
  band's ACTION slot (the Leads tab puts its day's queue there, not its figures), and
  a card that wraps to a lonely second row reads as absent — that is exactly how this
  one was missed twice.
- Do not default the card to a fixed view. It opens on the first **populated** window
  (overdue → today → upcoming). A reminder cannot be created in the past — `due_date`
  must be Nepal's today or later — so a fixed "Overdue" default greets most offices
  with an empty card that looks identical to no card at all.
- Do not filter the Follow-ups card to applicant-owned reminders because of where it
  sits. The list endpoint has no "any applicant" filter, so dropping client rows
  client-side would leave the counts describing a set the rows do not match. Each row
  names its own owner type, and the caption says so.
- Do not pass `filters` to `RemindersPanel`, or add `fiscal_year`/`country` to
  `useDueReminders`. Reminders have no country, and `fiscal_year` on that API is a
  **Bikram Sambat label over `due_date`** — a different question from this page's
  filter. The card's caption states that it reads neither; keep it truthful.
- Do not collapse `useDueReminders` back into one `?status=active` request bucketed
  client-side. That page caps at 100 rows in **newest-created** order (this API has no
  due-date ordering), so an office with more than 100 open follow-ups silently drops
  older ones — including overdue ones — and every count on the card becomes a quiet
  under-report. The three windows each carry their own `meta.count`, which is true at
  any volume.
- Equally, do not let the three windows compute their own boundaries. They are safe
  **because** `nepalToday()` is called once and the dates are sent explicitly; three
  requests that each let the server decide "today" would be the three-clocks trap the
  notifications feed avoids.
- Do not pass `rows.length` as `PreviewList`'s `total` or derive `hasMore` from it.
  Both must come from the window's server total.
- Do not seed the Follow-ups "see all" link with a filter. There is no reminders list
  route (reminders live on the record they belong to), so it points at the plain
  applicants list.
- Do not re-introduce a tab bar, `dashboard.tabs.ts`, or `useDashboardTab`. A card's views
  belong in its `PanelCard` menu.
- Do not pass a literal colour to a `StatTile` or invent a hue at a call site — derive it
  through `dashboard.tone.ts`, or the "dynamic colour" property is silently lost.
- **Nothing renders in two places.** `OverviewStats` owns the 8 `summary.alerts` and the 3
  `summary.volumes`; the Leads tab owns `leads_by_stage`; the Applicants tab owns the
  per-country counts and the NON-active half of `applicants_by_status` (active is a
  headline volume — do not put it back in `ApplicantStatTiles`); each Operations card owns
  its own section. Check before adding a figure anywhere.
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

- **The Leads tab costs up to 10 requests.** `useLeadBoardData` pages `/leads/` at 100/page
  up to a 1,000-lead cap. It is the same cached query the lead board itself uses, so opening
  the board after the dashboard is free — but a first paint of `/admin` now pays for it.
  Chosen deliberately (confirmed with the user) because the dashboard contract has no
  "leads needing attention" concept beyond a ≤10-row `stale_leads` preview.
- **Two definitions of a stale lead coexist**: the client-side `needs_attention` category in
  the Leads tab, and the backend's `today.stale_leads` window in `TodayPanel`. Both are
  labelled with which they are; do not merge them.
- **Follow-ups is the one card whose "overdue" is computed in the browser.** Every other
  overdue/expiry flag on this page is server-computed. The reminders API exposes no due
  bucket, so `dueBucket()` derives it from a Nepal-calendar today — which means near
  midnight NPT this card can briefly disagree with the backend sweep. The page footer
  caption says so; keep it there.
- **Chart labels are axis/legend text**, not per-element ARIA — each chart carries an
  `aria-label` summary; exact per-segment numbers on stacked bars are tooltip-only.
- **No per-lead route exists** — lead rows link nowhere; the card header links to the board.
