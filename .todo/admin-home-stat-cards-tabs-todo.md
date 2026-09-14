# Admin home — overall stat cards on top, tabs below

Restructure `/admin` (`apps/grandway/modules/admin/dashboard`): an always-visible
row of overall stat cards, then Leads / Applicants / Operations as tabs.

Confirmed design (design-decisions Phase 1.5):

- Top row = 3 volumes + the 8 alerts, ONE `/summary/` request.
- Alerts become visible to `lead_manager` too; the Operations _tab_ stays admin-only.
- Three tabs mirroring today's bands, held in the URL (`?tab=`).
- Band stat tiles stay in their tabs; only the duplicated "Active applicants" moves out.

## Phase 1 — The top stat row

- [x] Create `components/OverviewStats.tsx` + `.types.ts` — volumes row + 8 alert tiles off one `useDashboardSummary`
- [x] Delete `components/AttentionPanel.tsx` + `AttentionPanel.types.ts` (absorbed by OverviewStats)

## Phase 2 — The tab bar

- [x] Add `dashboard.tabs.ts` — tab spec (value, label, icon, subtitle, capability gate)
- [x] Add `useDashboardTab` to `dashboard.hooks.ts` — URL-held `?tab=`, falls back when the tab is not permitted
- [x] Make `SectionBand.title` optional (the tab label carries the name now)
- [x] Rewrite `pages/DashboardOverview.tsx` — greeting -> OverviewStats -> Tabs (`keepMounted={false}`)

## Phase 3 — De-duplicate figures

- [x] `ApplicantStatTiles`: drop "Active applicants" (now a top-row volume), show Archived beside Dormant

## Phase 4 — Docs + verification

- [ ] Update `modules/admin/dashboard/docs/AI.md`
- [ ] Update the dashboard row in `apps/grandway/docs/AI.md`
- [ ] `pnpm format` (own files only) + `pnpm check-types` + `pnpm lint`
