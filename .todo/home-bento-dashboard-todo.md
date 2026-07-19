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
- [x] Dual adversarial review — Opus reviewer clean (1 cosmetic-only staff-tail note, no fix). Codex unavailable in this env (ChatGPT-account model unsupported).
- [ ] Visual review of `/admin` (light + dark, breakpoints) — needs the authenticated dev stack + backend; run `/visual-review /admin` locally to confirm.
- [x] `docs/AI.md` — N/A: app AI.md doesn't enumerate components and the Home data-source row is unchanged.
