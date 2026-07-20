# Applicant profile modal — v2 (everything in-modal)

Pivot from user: no route redirects — render ALL sections inside the modal.
Overview shown by default. Empty sections show their built-in "nothing yet"
state. Restyle to look like an actual profile (reference: avatar + name +
health pill, divided details list, chips, projects/cases list, footer actions).

Decisions (confirmed): full CRUD embedded (reuse existing `*Section` tables
in-modal) · overview = real fields + Cases list (no invented metrics).

Architecture: modal = persistent ProfileHeader + in-modal section Tabs
(role-filtered, overview default, `keepMounted={false}`) + section content
(overview = custom; others = registry hosting existing leaf `*Section`
components) + footer actions. Big modal, explicit-close (no Esc/click-out —
avoids nested-modal stacking issues). Routes/pages untouched.

## Phase 1 — Overview + header (the "profile" look)

- [ ] `ProfileHeader` — restyle persistent header (round avatar, name + engagement pill, stage subtitle, code, lock/archived)
- [ ] `ProfileOverview` (+ .module.css) — divided details list (icons + right values) + chips (interests, best-effort) + Cases summary (fetchCases, read-only rows)

## Phase 2 — In-modal section registry

- [ ] `SectionContent` — per-section content hosting existing leaf `*Section` components with sub-tabs (identity/education/family/interests/crm), single (addresses/cases/assignments), history (inline DataTableShell blocks). `keepMounted={false}` sub-tabs

## Phase 3 — Modal rework

- [ ] Rework `ApplicantProfileModal` — header + section Tabs + content + footer actions; large size; explicit-close; remove editing-gating
- [ ] Remove `ProfileSectionTile` / `sectionTiles.ts` / tile+grid CSS / old `ProfileHero`
- [ ] Update `index.ts` barrel + types

## Phase 4 — Verify & finalize

- [ ] `check-types` + lint (scoped) + prettier (own files)
- [ ] Dual adversarial review (Codex if available + adversarial-reviewer)
- [ ] Update `apps/mintway/docs/AI.md`
- [ ] Commit
