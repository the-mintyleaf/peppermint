# Dashboard v3 rebuild — "Home Work Desk v3"

Rebuild `modules/dashboard` (ModuleDashboard, `/dashboard`) to match the Claude
Design **Home Work Desk v3** mockup. Decisions (from user):

- **Palette:** adapt to app's fixed brand — v3 blue → accent-orange, v3 grey/white
  surfaces → the app's dark body + warm-paper cards (no new palette).
- **Scope:** rebuild from scratch; reuse the solid data/hooks/drawer/dnd machinery.
- Drop the mockup's own header + sidebar (the app shell already provides them).

## Phase 1 — Data + cleanup

- [ ] Remove `schedule` (ScheduleItem/ScheduleKind, MOCK/EMPTY.schedule) from `module.api.ts`
- [ ] Delete `components/ScheduleRail/`
- [ ] Delete `components/FocusPanel/` (replaced by FocusHero)

## Phase 2 — FocusHero (replaces FocusPanel)

- [ ] `FocusHero/` — greeting + team avatars + preview toggle slot; stat readout row
      (focus done · done this week · on hold now); focus pills; empty state
- [ ] `FocusHero/components/FocusPill/` — one focus row (checkbox, title, file+due/priority chips, Continue)
- [ ] `FocusHero/components/FocusStat/` — one big-number stat cell

## Phase 3 — TaskFlowBoard

- [ ] Board header → "Today's task flow" + "Open Tasks" link (routes /tasks)
- [ ] Keep dnd; refine `FlowColumn` (v3 In-progress 3/3 amber pill + WIP notice) + `FlowCard`

## Phase 4 — Rails

- [ ] `AttentionRail` — "Needs your attention" (exceptions, tinted icon rows + action link)
- [ ] `WorkFilesRail` — "Active work files" (dot+count, dept·milestone, progress, avatars, badges, Open work file)
- [ ] `MetricsRail` — "This week" 2×2 KPI grid + dark Momentum card (MomentumStrip)

## Phase 5 — Orchestrator

- [ ] Rewrite `Dashboard.tsx` — v3 layout (primary flex + 336px rail), loading/error/empty, drawer, swap modal, preview toggle
- [ ] Update `Dashboard.types.ts` if needed; check barrels/index

## Phase 6 — Verify + docs

- [ ] `pnpm format && pnpm --filter mintflow check-types && lint`
- [ ] Update `docs/AI.md` (dashboard section, drop schedule)
- [ ] Visual review of `/dashboard`
- [ ] Dual adversarial review; apply fixes; commit
