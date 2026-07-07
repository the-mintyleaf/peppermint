# Backend Updates Integration — Todo

Wiring the frontend to backend items shipped per `.todo/updates.md`
(T1–T6, A1–A3, P1; T7/T8 deferred). Branch: `dev/backend-updates-integration`.

## Phase 1 — Small independent wins (A2, A3, P1)

- [x] A2: add `AUTH_MFA_CHALLENGE_EXPIRED` to `ERROR_MESSAGES` in `lib/authErrorMessages.ts`
- [x] A3: add `revokeUserSession(userId, sessionId)` to `users/users.api.ts`
- [x] A3: add per-row "Revoke" action to `SessionsTab.tsx` (port `SessionsCard` pattern)
- [x] P1: add `is_active`/`is_deprecated` to `PolicyPermission` in `policyTree.types.ts`
- [x] P1: add status `Badge` in `PermissionCatalogPanel.tsx`
- [ ] Phase 1 commit + dual adversarial review + fixes

## Phase 2 — Org tree data: counts + direct members (T1, T2, T3, T6)

- [ ] Types: add count fields + `unit_members` + `UnitMember` to `organization.types.ts`
- [ ] `Structure.types.ts`: add counts + `unitMembers` to `UnitNodeData`, `descendantCount` to `OrgRootNodeData`
- [ ] `Structure.utils.ts`: map new fields in `buildGraphFromFlatNodes`; height estimate in `autoArrangeNodes`
- [ ] `Structure.tsx`: extend `graphSignature`; fix `flatNodes` merge guard for `unit_members`
- [ ] `UnitNode.tsx`: count badge + expand-strip label + "Direct members" section
- [ ] `OrgRootNode`: show `descendantCount`
- [ ] T6: verify enveloped responses resolve; update stale comments in `Structure.api.ts`/`organization.api.ts`
- [ ] Phase 2 commit + dual adversarial review + fixes

## Phase 3 — Org tree UX/perf (T5, T4)

- [ ] T5: `UnitMutationResult` return types in `Structure.api.ts`
- [ ] T5: targeted `setQueryData` in `Structure.hooks.ts` mutations, with invalidate fallback
- [ ] T4: `searchUnits` + `UnitSearchResult` in `organization.api.ts`/`.types.ts`
- [ ] T4: `unitSearch` query key + `useUnitSearch` hook
- [ ] T4: async server-search Select in `Structure.tsx`; lazy-expand ancestor path + setCenter
- [ ] T4: extend `Toolbar` for async options if needed
- [ ] Phase 3 commit + dual adversarial review + fixes

## Phase 4 — Invitation inbox (A1, greenfield)

- [ ] `invitations.api.ts`: `fetchMyMemberships`, `acceptMembership`, `declineMembership`
- [ ] Types: "mine" response type; reuse `MembershipStatus`
- [ ] `ContainedModule`: list + accept/decline (reuse `MembershipStatusBadge`, `MemberStatusMenu` pattern); all UI states
- [ ] Routing: `app/` re-export + group/module barrels
- [ ] Docs: update `docs/AI.md`
- [ ] Phase 4 commit + dual adversarial review + fixes

## Wrap-up

- [ ] Final `/verify` + `/design-check` (Phases 2, 4)
- [ ] Remove/mark done the integrated items in `.todo/updates.md`
- [ ] Delete this todo file
