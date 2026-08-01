# Dashboard Overview rebuild — stat tiles → country cards → charts → lists

Confirmed design (design-decisions Phase 1.5, round 2):

- **Stat tiles** — all 11 `/summary/` numbers as tiles (3 volumes + 8 alerts); alerts
  colour-coded by severity and clickable to their tab. Replaces the `NeedsAttention` bar list.
- **Country cards** — no group-by endpoint exists; `country` is only a filter. One
  `/summary/` request per catalogue country, top ~8 by journey volume, "Show all" toggle.
- **Charts** — journeys-by-stage bar + applicants-by-status donut, then the 4 conversion gauges.
- **Lists** — overdue + due-soon checklist items only (real preview rows, capped at 10 by the API).
- Tile/entity icons reuse `config/nav/admin-nav.ts` glyphs (AddressBook · Users · Compass ·
  ListChecks · Handshake · FileMagnifyingGlass) — one icon per concept; severity is colour + word.

## Phase 1 — Stat tiles

- [x] `components/StatTile.tsx` + `.types.ts` — one presentational tile (icon · label · value · tone · optional activate)
- [x] `components/StatTiles.tsx` + `.types.ts` — the 11 from `useDashboardSummary`, alerts → tab
- [x] Delete `NeedsAttention.tsx` + `.types.ts` (tiles supersede it)

## Phase 2 — Country cards

- [x] `useCountrySummaries` in `dashboard.hooks.ts` — `useQueries`, one `summary` per country, same key shape as `useDashboardSummary` (so the header filter shares the cache)
- [x] `components/CountryCards.tsx` + `.types.ts` — sorted by journeys, capped at 8, "Show all" toggle, per-country loading/error

## Phase 3 — Charts + lists + wiring

- [x] Extract `components/ChecklistItemRowView.tsx` shared by `TodayWorklists` and the Overview lists
- [x] Rewrite `OverviewPanel.tsx` — tiles → countries → bar+donut → gauges → the two checklist lists
- [x] Each card keeps its one "Open <tab>" action

## Phase 4 — Verify & document

- [x] `prettier --check && check-types && lint`
- [ ] Post-phase adversarial review
- [ ] Update `modules/admin/dashboard/docs/AI.md` + `apps/grandway/docs/AI.md`
- [ ] Commit
