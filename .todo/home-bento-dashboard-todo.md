# Home Bento Dashboard — restyle todo

Restyle `apps/mintway/modules/admin/home` into a compact bento-grid card layout.
Decisions (confirmed): compact bento + ONE honest composition visual (no fake
sparklines); **Needs attention** is the hero card; restrained + accented color.

## Phase 1 — Bento primitives

- [x] `BentoCard` — compact tinted card shell (accent, header row: icon + title + optional action, body slot). Replaces SectionCard on the dashboard.
- [x] `CompositionCard` — engagement-health donut (RingProgress) + legend counts; the one honest composition visual. Handles loading / error / empty.
- [x] Restyle `StatTile` into a compact bento tile (accent tint surface, tighter). Keep API + all UI states.
- [x] Update `components/index.ts` barrel.

## Phase 2 — Bento layout

- [x] `Home.module.css` — responsive bento grid (4→2→1 cols) + span classes.
- [x] Rebuild `Home.tsx` — greeting header + QuickActions, then bento grid: hero attention (admin), pipeline tiles, engagement composition, recent activity, ops tiles. Non-admin degrades gracefully.
- [x] Remove now-unused `SectionCard` if fully replaced (grep first).

## Phase 3 — Verify & review

- [x] `pnpm format && pnpm check-types && pnpm lint` (scoped) pass.
- [ ] Dual adversarial review of the diff; apply fixes.
- [ ] Visual review of `/admin` (light + dark, breakpoints).
- [ ] Update module/app `docs/AI.md` if structure changed.
