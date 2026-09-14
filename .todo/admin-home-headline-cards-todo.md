# Admin home — one uniform headline card, some carrying charts

Redesign the `/admin` headline region (`OverviewStats`) so every card is the same
size, some carry a small chart instead of a bare number, and the region reads as
designed rather than assembled.

Confirmed direction:

- Uniform size applies to the HEADLINE ROW only; the tabs keep their deliberate
  6/12 - 4/12 - 2/12 widths, which encode what a card is.
- Alerts consolidate BY DESTINATION MODULE: Checklist items (3 figures) and Files
  (2 figures) each become one chart-carrying card; leads / journeys / offers stay
  single figures. 8 tiles -> 5 cards, each still one click to one place.
- Fidelity: signal board with real visual weight. Colour stays DERIVED per figure;
  every toned element keeps its word.

## Phase 1 — The uniform card shell

- [x] Add `worstTone()` to `dashboard.tone.ts` — a card of several figures wears its worst band
- [x] Create `OverviewCard.tsx` + `.types.ts` + `.module.css` — tinted header strip, fixed-height body slot, footer (caption + tone word)
- [x] Export `OverviewFigure` from it — the big-number body, with an optional share meter for context

## Phase 2 — Rebuild the headline region

- [x] Rewrite `OverviewStats.tsx`: 3 volume cards + 5 destination cards in ONE uniform grid
- [x] Checklist card = 3 `MeterBar`s (magnitude comparison); Files card = `DonutStat` (breakdown)
- [x] Carry the per-card capability gate over from the tile version (one gate per card now)

## Phase 3 — Docs + verification

- [ ] Update `modules/admin/dashboard/docs/AI.md` (layout + components + the chart grammar used)
- [ ] Update the dashboard row in `apps/grandway/docs/AI.md`
- [ ] `pnpm format` (own files only) + `pnpm check-types` + `pnpm lint`
