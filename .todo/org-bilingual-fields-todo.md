# Organization Module — Bilingual Field Migration

Plan: `/Users/decoffee/.claude/plans/orgnization-module-has-added-moonlit-dream.md`
Contract: `.todo/org-data-contract.md` (v1.5.0)

## Phase 0 — Shared foundation (orchestrator)

- [x] Migrate `_shared/organization.types.ts` to bilingual fields (Organization, OrganizationUnit, UnitTreeNode, Position, ActorContext refs) + repoint header comment
- [x] Create `_shared/components/BilingualName/` (`.tsx`, `.types.ts`, `index.ts`)
- [x] Commit Phase 0

## Phase 1 — Per-sub-module migration (parallel builders)

- [ ] `organizations/` — DTOs, forms (np/en/legal_np/short_np/short_en + sort_order + code/country_code validation), displays
- [ ] `structure/` — unit DTOs, UnitFormModal, node/inspector displays
- [ ] `positions/` — DTOs, forms (title_np/title_en + sort_order + code), columns, drawer
- [ ] `reporting-lines/` — chain-of-command title refs → np/en
- [ ] `members/` — PositionAssignmentsTab + UnitMembershipsTab display reads
- [ ] `actor-context/` — ActorContextPreview org/position → np/en
- [ ] `delegations/` + `event-log/` — verify only (no changes expected)
- [ ] Dual adversarial review (Codex + adversarial-reviewer) over Phase-1 diff; apply fixes
- [ ] Commit Phase 1

## Phase 2 — Wiring, docs, verification (orchestrator)

- [ ] Update module `docs/AI.md` (bilingual shapes + BilingualName + contract ref)
- [ ] Check/update `apps/mintflow/docs/AI.md`
- [ ] `pnpm format && pnpm check-types && pnpm lint` clean (org scope)
- [ ] Manual grep sweeps (stale `.name`/`.title`/`legal_name`/`short_name`; no `romanized` in JSX)
- [ ] Commit Phase 2
- [ ] Delete this file once complete
