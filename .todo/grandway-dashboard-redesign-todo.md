# Grandway Dashboard Redesign — Mobility Ops Dashboard

Adopt the "Mobility Ops Dashboard" design over the existing 8-section dashboard,
preserving all real integrations (8 independent React Query hooks, links, status
labels/colors imported from owning modules, data-contract rules). Confirmed design
decisions: (1) Adapt honestly — no fabricated charts; (2) Meaningful color — module
status colors + neutral grays, brand orange reserved for the anchor/emphasis;
(3) Flat signal board — Progress/RingProgress + minimal SVG, no recharts.

## Phase 1 — Chart primitives + color helper

- [x] `dashboard.utils.ts` — add `chartColor(name, shade)` (Mantine name/hex → CSS var)
- [x] `components/MeterBar.tsx` (+ `.types.ts`) — labeled horizontal bar (+ optional href)
- [x] `components/StackedMeter.tsx` (+ `.types.ts`) — segmented Progress bar w/ trailing slot
- [x] `components/ColumnChart.tsx` (+ `.types.ts`) — vertical bar chart
- [x] `components/DonutStat.tsx` (+ `.types.ts`) — RingProgress donut + legend
- [x] `components/Gauge.tsx` (+ `.types.ts`) — half-circle SVG rate gauge
- [x] `components/SectionHeading.tsx` (+ `.types.ts`) — title + subtitle band
- [ ] Phase 1 commit + adversarial review (deferred to end — presentational, low-risk)

## Phase 2 — Page shell + Summary

- [x] `components/DashboardHero.tsx` — eyebrow + "Placement overview" + FY/role meta
- [x] `pages/DashboardOverview.tsx` — hero, grid of section bands, headings, anchors, keep ModuleHeader + Refresh + RequireLeadAccess + per-section ErrorBoundary
- [x] `components/SummaryStrip.tsx` — hero volume stats + "Needs attention" MeterBars (relative volume) linking to #anchors
- [x] `components/DashboardFilterBar.tsx` — reused as-is (already band-friendly)

## Phase 3 — Backed chart sections

- [x] `components/PipelineCounts.tsx` — leads(bars), journeys(bars), applicants(donut), offers(donut), checklists(cols), documents+files(stacked)
- [x] `components/Conversion.tsx` — 4 gauges + by_source stacked bars
- [x] `components/Outcomes.tsx` — journey outcomes(donut), offer decisions(cols), closed/archived(bars)

## Phase 4 — Tabbed list sections + activity

- [x] `components/TodayWorklists.tsx` — 6 tabs (PreviewTabs), real preview row lists (no bucket chart)
- [x] `components/Blockers.tsx` — 5 tabs (PreviewTabs), real preview row lists (no reason breakdown)
- [x] `components/Workload.tsx` — 3 tabs, per-owner bars, respect is_scoped_to_caller (no fake toggle)
- [x] `components/ActivityFeed.tsx` — table layout + pagination + real total (no sparkline)
- [x] Removed orphaned `WorklistPreviewCard`

## Phase 5 — Docs + verify

- [x] Update `docs/AI.md` (component table, new primitives, design notes)
- [x] check-types (clean, dashboard) · eslint (clean) · prettier (clean) — scoped to dashboard
- [ ] Commit dashboard files
- [ ] Adversarial review + fixes
- [ ] `/design-check` + fixes
- [ ] Final commit; delete this todo
