# Dashboard → Home + Mantine Charts rebuild

## Phase 1 — Re-home + routing + header

- [x] Salvage old-home admin quick-links into a `SuperadminLanding` fallback
- [x] New role-branching `ModuleHome` (lead access → dashboard; superadmin → fallback)
- [x] `app/admin/page.tsx` re-exports new home
- [x] Move fiscal_year + country into `ModuleHeader` right slot (compact), keep Refresh all
- [x] Simplify `DashboardHero` (drop FY text now in header), remove/retire `DashboardFilterBar`
- [x] Fix `DashboardOverview` breadcrumb (drop `/admin/dashboard` crumb)
- [x] Delete `app/admin/dashboard/` route folder
- [x] Point nav "Dashboard" entry href → `/admin` (`config/nav/admin-nav.ts`)
- [x] Delete `modules/admin/home/` module
- [x] Commit Phase 1 + post-phase review

## Phase 2 — Rebuild visualizations on @peppermint/ui/charts

- [x] `dashboard.chartConfig.ts` — shared series-color helpers + common chart props
- [x] `DonutStat` → `DonutChart` (applicants / offers / journey-outcomes)
- [x] `ColumnChart` → `BarChart` vertical (journeys / checklists / offer-decisions)
- [x] Leads-by-stage → `BarChart` horizontal
- [x] `Gauge` → `RadialBarChart` semicircle (conversion rates)
- [x] Leads-by-source (`StackedMeter`) → `BarChart` horizontal stacked
- [x] Workload tabs → `BarChart` horizontal + stacked
- [x] Verify meters kept as Progress (needs-attention / docs+files / closed+archived)
- [x] Light/dark, all-zero empty states, tooltips, a11y labels on every chart
- [x] Commit Phase 2 + post-phase review

## Phase 3 — Docs + verification

- [ ] Update `dashboard/docs/AI.md` (charts direction + re-home + header)
- [ ] Update `apps/grandway/docs/AI.md` (home/route change)
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] `/design-check` + `/visual-review /admin`
- [ ] Commit Phase 3
