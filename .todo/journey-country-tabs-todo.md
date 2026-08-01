# Applicant journeys — country tabs

## Phase 1 — Canonical country on the form

- [ ] Replace `JourneyForm`'s free-text "Target country" with a searchable Select fed by `useCountries()`
- [ ] Keep an existing free-text value selectable so editing a legacy journey never silently clears it
- [ ] Verify (`tsc` + `eslint`) and commit

## Phase 2 — Country tabs on the worklist

- [ ] Build the tab list: All → usable countries (by `display_order`) → Unassigned
- [ ] Wire country tabs to the server `target_country` filter; Unassigned as a client `forceFilter`
- [ ] Keep the `applicant` deep-link `forceFilters` working alongside the tabs
- [ ] Verify (`tsc` + `eslint`) and commit

## Phase 3 — Docs

- [ ] Update the journeys module `docs/AI.md` if structure/behaviour changed
