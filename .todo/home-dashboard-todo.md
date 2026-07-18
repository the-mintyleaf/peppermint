# Home Dashboard — Todo

## Phase 1 — Data hooks

- [x] Read exact signatures: fetchApplicants, QueryParams, useCurrentUser, RequireAuth, QueryErrorState, documentsApi types, fetchUsers, applicant.enums, detail route paths, ModuleErrorBoundary props, theme
- [x] Home.types.ts — StatTileProps, AttentionItem, section prop types
- [x] Home.hooks.ts — useApplicantCount(s), useRecentApplicants, useFollowUpsDue, useDocOpsCounts, useDashboardFreshness

## Phase 2 — Tiles & sections

- [x] components/StatTile
- [x] components/SectionCard
- [x] components/QuickActions
- [x] components/AttentionList
- [x] components/RecentApplicants

## Phase 3 — Orchestrator + gating

- [x] Home.tsx — greeting, RequireAuth, ModuleErrorBoundary, role gating, layout
- [x] home/index.ts confirm exports

## Phase 4 — Docs

- [x] Update apps/mintway/docs/AI.md Home row

## Phase 5 — Verify

- [x] pnpm format && check-types && lint (0 errors)
- [x] adversarial review (Opus) — 4 findings applied in 6dceda1. Codex unavailable
      in this env (ChatGPT-account model rejection); single-gate degradation.
- [x] design-check — PASS (one soft anchor note, not a blocker)
- [x] commit per phase (9bfaa84 build, 6dceda1 review fixes)

### Deferred — needs a running app + authenticated backend session (not available in sandbox)

- [ ] visual-review /admin at breakpoints, light + dark
- [ ] role sanity: staff / admin / superadmin projections against live /me
