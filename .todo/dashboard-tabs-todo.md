# Dashboard reorganisation — tabbed, visual, progressive disclosure

Confirmed design (design-decisions Phase 1.5):

- **Structure** — Overview + detail tabs, in-page, `?tab=` URL param (ContainedModule stays contained)
- **Overview leads with** — KPI band → "Needs attention" (largest first, each jumps to its tab) → three compact headline visuals
- **Fidelity** — one bold moment (hero + KPI band); every card below quiet

## Phase 1 — Tab plumbing

- [x] `dashboard.tabs.ts` — tab keys, labels, icons, titles, "how to read this" subtitles
- [x] `useDashboardTab()` in `dashboard.hooks.ts` — URL `tab` param, default `overview`, validated
- [x] `components/DashboardTabs.tsx` + `.types.ts` — the tab bar

## Phase 2 — Overview landing

- [x] `DashboardHero` — absorb the three volume KPIs, expressive treatment
- [x] `SummaryStrip` → `NeedsAttention` — alerts sorted largest-first, click switches tab
- [x] `MeterBar` — support an `onNavigate` click target alongside `href`
- [x] `components/OverviewPanel.tsx` + `.types.ts` — needs-attention + journeys-by-stage + three compact cards (Today / Blockers / Conversion)

## Phase 3 — Wire the page

- [x] `pages/DashboardOverview.tsx` — hero + controls + tab bar + panel switch (`keepMounted={false}`)
- [x] Verify no section renders its old anchor-based navigation

## Phase 4 — Verify & document

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [x] Update `modules/admin/dashboard/docs/AI.md`
- [ ] Commit
