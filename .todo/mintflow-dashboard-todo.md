# mintflow — Today's Focus Dashboard

## Phase 1 — Data model + hooks

- [x] `module.api.ts` — types (WorkFile, FocusTask, FlowTask, AttentionItem, ScheduleItem, Kpi, Momentum), style maps, §16 MOCK data, fetchers
- [x] `Dashboard.hooks.ts` — useDashboard, useFocus, useTaskFlow (WIP + auto-focus rule), useDrawer, rankWorkFiles, notConnected
- [x] verify types compile

## Phase 2 — FocusPanel (§5)

- [x] FocusPanel + FocusRow components (moss header, ring, "N of 3", 3 honest states, empty state)
- [x] estimate chip render-guarded (never shows)

## Phase 3 — TaskFlowBoard (§6)

- [x] TaskFlowBoard + FlowCard (@dnd-kit 3 cols, on-hold lavender badge, WIP 3/3 notice, overdue accent, done dimmed)
- [x] keyboard moves + quick-complete + open-in-drawer

## Phase 4 — Rails (§7 §8 §9) [parallelizable]

- [ ] WorkFilesRail + WorkFileCard (rankWorkFiles, yours/overdue badges, View all)
- [ ] AttentionRail (exceptions only, one action each)
- [ ] ScheduleRail (timeline + free-time gaps, no capacity judgment)

## Phase 5 — MetricsRail (§10)

- [ ] KpiTile x4 (on-time via RateReadout empty state) + MomentumStrip + Plan tomorrow

## Phase 6 — TaskDrawer (§15)

- [ ] Drawer: primary fields top, secondary lower, complete/archive/move actions

## Phase 7 — States, responsive, a11y, assembly

- [ ] Dashboard.tsx assembly (2-col + rail), mobile (Focus first, flow tabs, quick-create)
- [ ] empty-focus + first-run variants, reduced-motion, aria labels
- [ ] /verify, /design-check, update AI.md
