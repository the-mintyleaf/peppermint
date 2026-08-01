# Dashboard rework — tabbed board → straight-through page

**Design decisions (confirmed with user 2026-08-02):**

- Leads card: `fetchAllLeads` + `categorizeLead` from lead-management → 4 real tabs with counts.
- Applicants by country: `GET /applicants/?country=<id>&page_size=1` → `meta.count`, ranked bar chart.
- Below the fold: multi-view large cards (title left, Menu dropdown right), only the selected view mounts.
- Lead stats: one composite card (4/12) + two small tiles (2/12 stacked).
- Grid: 12-col, large cards 6/12 max, small cards 2/12 min.

## Phase 1 — Foundations

- [x] `dashboard.tone.ts` — dynamic figure→tone mapping (thresholds, not hardcoded colours) + the type scale constants
- [x] `PanelCard` — the large-card shell: title left, view `Menu` dropdown right, body slot, states
- [x] `SectionBand` — section heading (title + the question it answers) + 12-col `Grid` wrapper
- [x] `DashboardGreeting` — time-of-day greeting + display name + subtitle, header controls on the right

## Phase 2 — Section 1: leads

- [x] `dashboard.leads.ts` (hooks) — `useCategorizedLeads` over `fetchAllLeads` + `categorizeLead`
- [x] `LeadStatsPanel` — composite lead card (total + stage donut + legend) at 4/12
- [x] Two 2/12 tiles: needs-attention + converted
- [x] `LeadsToAddress` — 6/12 `PanelCard`, 4 category views, real counts, capped disclosure
- [x] Lead row view (name · stage badge · last touched · owner)

## Phase 3 — Section 2: applicants

- [x] `dashboard.applicants.ts` (hooks) — `useApplicantsByCountry` (bounded fan-out) + `useRecentApplicants`
- [x] `ApplicantCountryStats` — total tile (2/12) + ranked bar chart (4/12)
- [x] `RecentApplicants` — 6/12 `PanelCard`, creation-source views, applicant rows

## Phase 4 — Below the fold

- [ ] `AttentionPanel` (6/12) — the 8 `summary.alerts` figures, dynamically toned
- [ ] `ActivityPanel` (6/12) — re-home `ActivityFeed` into a `PanelCard`
- [ ] `PipelinePanel` (6/12) — pipeline + conversion + outcomes as selectable views (chromeless)
- [ ] `WorkloadPanel` (6/12) — workload + blockers as selectable views (chromeless)

## Phase 5 — Page assembly & teardown

- [ ] Rewrite `DashboardOverview` as the straight-through grid
- [ ] Delete tabs plumbing: `DashboardTabs`, `dashboard.tabs.ts`, `useDashboardTab`, `OverviewPanel`, `CountryCards`
- [ ] Reconcile `SectionHeading` / `TodayWorklists` / `StatTiles` — reuse or remove
- [ ] Update barrels

## Phase 6 — Docs & verification

- [ ] Rewrite `modules/admin/dashboard/docs/AI.md` for the new layout
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Commit per phase; final review pass
