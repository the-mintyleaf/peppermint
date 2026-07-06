# Organization Module — Bilingual Field Migration

Plan: `/Users/decoffee/.claude/plans/orgnization-module-has-added-moonlit-dream.md`
Contract: `.todo/org-data-contract.md` (v1.5.0)

## Phase 0 — Shared foundation (orchestrator)

- [x] Migrate `_shared/organization.types.ts` to bilingual fields (Organization, OrganizationUnit, UnitTreeNode, Position, ActorContext refs) + repoint header comment
- [x] Create `_shared/components/BilingualName/` (`.tsx`, `.types.ts`, `index.ts`)
- [x] Commit Phase 0

## Phase 1 — Per-sub-module migration (parallel builders)

- [x] `organizations/` — DTOs, forms (np/en/legal_np/short_np/short_en + sort_order + code/country_code validation), displays
- [x] `structure/` — unit DTOs, UnitFormModal, node/inspector displays
- [x] `positions/` — DTOs, forms (title_np/title_en + sort_order + code), columns, drawer
- [x] `reporting-lines/` — chain-of-command title refs → np/en
- [x] `members/` — PositionAssignmentsTab + UnitMembershipsTab display reads
- [x] `actor-context/` — ActorContextPreview org/position → np/en
- [x] `delegations/` + `event-log/` — verified: zero entity name/title reads, no changes needed
- [x] Fixed `_shared` pickers (Position/Unit) — orchestrator-owned stale reads
- [x] Dual adversarial review (Codex + adversarial-reviewer): fixed sort_order ""-on-clear (5 forms), ScopeFields cross-module break (authenticate), name_en search guard
- [x] Commit Phase 1

## Phase 2 — Wiring, docs, verification (orchestrator)

- [ ] Update module `docs/AI.md` (bilingual shapes + BilingualName + contract ref)
- [ ] Check/update `apps/mintflow/docs/AI.md`
- [ ] `pnpm format && pnpm check-types && pnpm lint` clean (org scope)
- [ ] Manual grep sweeps (stale `.name`/`.title`/`legal_name`/`short_name`; no `romanized` in JSX)
- [ ] Commit Phase 2
- [ ] Delete this file once complete
