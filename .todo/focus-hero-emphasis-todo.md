# Focus hero — more eye-catching

Make the focus section the visual anchor. Chosen directions (light theme kept):

- **Warm accent wash** surface on the hero only (peach gradient, dark text)
- **Accent zone frame**: `TODAY'S FOCUS` eyebrow + accent left-edge + bigger headline
- **Spotlight the one task**: big glowing next-action card; other focus tasks
  become compact rows

## Phase 1 — Shared checkbox

- [x] Extract `SquareCheck` (size-parametrized) into its own component; reuse in
      FocusPill + FocusSpotlight

## Phase 2 — Spotlight card

- [x] New `FocusSpotlight` — solid white card, accent border + accentGlow, NEXT UP
      eyebrow, 16px title, meta row, filled accent Start/Continue CTA
- [x] Simplify `FocusPill` to the compact secondary row (drop `highlighted`)

## Phase 3 — Hero frame

- [x] FocusHero: warm wash bg + accent left-edge
- [x] Eyebrow `TODAY'S FOCUS` + date, bigger headline
- [x] Body: split into spotlight (highlightId) + compact rest

## Phase 4 — Verify

- [x] pnpm format && dashboard check-types + lint
- [ ] /visual-review /dashboard
