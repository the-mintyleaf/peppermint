# Dependent catalogue modules — institutions, offers, clients

Branch: `dev/grandway-document-stack` (stay on it). App: `apps/grandway`.

## Phase 0 — Backend sync (contract digests + typed API)

- [x] `/sync-api` institutions → `apps/grandway/docs/backend/institutions/`
- [x] `/sync-api` offers → `apps/grandway/docs/backend/offers/`
- [x] `/sync-api` clients → `apps/grandway/docs/backend/clients/`
- [x] Verify DTO shapes against §4 Models (ignore stale "Send" duplicate names)
- [x] Commit Phase 0

## Phase 1 — Clients + Institutions (parallel module-builders)

### Clients (ContainedModule)

- [ ] `clients.{api,queryKeys,types,hooks}.ts` + `index.ts`
- [ ] `form/ClientForm.tsx` (+ contact-numbers repeater, logo_url URL field)
- [ ] `pages/list/ClientDirectory.tsx` + `clients.columns.tsx`
- [ ] `components/`: RowActionsMenu, DetailDrawer (+history), RetireClientModal, restore
- [ ] Route `app/admin/clients/page.tsx`

### Institutions (sub-nav group)

- [ ] Shared `institutions.{api,queryKeys,types,hooks}.ts` (5 resources) + `index.ts`
- [ ] `programs/` primary list+filters + rich ProgramForm + detail drawer → `/admin/institutions`
- [ ] `providers/` institution list + campuses-on-detail (nested endpoint) → `/admin/institutions/providers`
- [ ] `reference-data/` Countries+Fields tabbed modal (ReferenceEntryPanel trio)
- [ ] Availability-note rule enforced client-side
- [ ] Routes `app/admin/institutions/{page,providers/page}.tsx`

- [ ] Orchestrator: nav wiring + barrels
- [ ] Commit Phase 1 + dual adversarial review + fixes

## Phase 2 — Offers (MultiPageModule)

- [ ] `offers.{api,queryKeys,types,hooks}.ts` (offers + conditions + actions)
- [ ] `pages/list/OffersWorklist.tsx` + `offers.columns.tsx`
- [ ] `pages/detail/OfferDetail.tsx` → `/admin/offers/[id]`
- [ ] `form/OfferForm.tsx` (journey picker + program picker + manual fallback + conditions)
- [ ] Action modals: IssueOfferModal, RecordDecisionModal, condition status
- [ ] Routes `app/admin/offers/{page,[id]/page}.tsx`
- [ ] Commit Phase 2 + dual adversarial review + fixes

## Phase 3 — Wiring, docs, verification

- [ ] Nav entries in `config/nav/admin-nav.ts` (3 entries + gating)
- [ ] `docs/AI.md` per module + `/update-ai-map`
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] `/design-check` + `/visual-review` on 3 routes
- [ ] Delete this file when complete
