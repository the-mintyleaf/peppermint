# Cases — New Case (create work) wiring

Wire the "New Case" button to a real create-work flow. Full form, modal on /cases.
Backend: `POST /api/v1/work/items/` (contract `docs/api-contracts/work.md` §1.1).

## Phase 1 — Data layer

- [ ] Add `CreateWorkPayload` + `createWork()` to `cases.commands.ts`
- [ ] Add `useCreateWork()` hook to `cases.mutations.ts` (invalidate `workKeys.items()`)

## Phase 2 — Reference data (org / unit / user pickers)

- [ ] `CreateCaseModal.api.ts` — `fetchOrganizations`, `fetchUnitsForOrg`, `fetchUsers`
- [ ] `CreateCaseModal.hooks.ts` — `useOrganizations`, `useOrgUnits(orgId)`, `useAssignableUsers(enabled)`

## Phase 3 — Form + modal

- [ ] `CreateCaseModal.types.ts` — props + `CreateCaseFormValues`
- [ ] `CreateCaseModal.tsx` — Modal + FormWrapper + Zod schema + Essentials + Advanced (disclosure)
- [ ] `index.ts` barrel

## Phase 4 — Wire the button

- [ ] `Cases.tsx` — `useDisclosure`, open modal from "New Case", drop `notConnected` for create (keep it on Upload — attachment upload is 503-gated)

## Phase 5 — Verify

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Dual adversarial review of the diff
