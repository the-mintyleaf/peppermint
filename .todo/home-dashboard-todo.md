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

- [ ] Update apps/mintway/docs/AI.md Home row

## Phase 5 — Verify

- [x] pnpm format && check-types && lint
- [ ] dual adversarial review (Codex + adversarial-reviewer)
- [ ] visual-review /admin (light+dark)
- [ ] design-check
- [ ] role sanity
- [ ] commit per phase; delete this file when done
