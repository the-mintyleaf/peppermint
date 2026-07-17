# Dashboard — ModalPaper + line dividers (light theme)

Keep the white theme, make it cleaner: enclose the dashboard in `ModalPaper`
(like Cases/Tasks/Calendar) and replace the per-section card chrome
(border + shadow + rounded tile) with hairline dividers.

Decisions: two columns with a vertical divider between; strip chrome from the
5 top-level sections only — keep inner sub-cards (kanban columns, work-file
cards, KPI tiles) as-is.

## Phase 1 — Strip section chrome

- [x] FocusHero — drop outer border/bg/shadow/radius, keep internal header line
- [x] AttentionRail — drop card chrome
- [x] WorkFilesRail — drop card chrome
- [x] MetricsRail "This week" — drop card chrome (keep MomentumStrip dark accent)

## Phase 2 — Dashboard shell

- [x] Wrap content in `<ModalPaper withBorder>` + ScrollArea
- [x] Two-column flex with vertical hairline between columns
- [x] Horizontal dividers between stacked sections in each column
- [x] Rework LoadingState / ErrorState to sit inside the paper (light)

## Phase 3 — Verify

- [x] pnpm format && dashboard check-types & lint clean (tasks.tsx error is
      pre-existing user WIP, unrelated)
- [ ] /visual-review the /dashboard route (light + dark breakpoints)
