# Staff (Lead Manager) role scoping — todo

## Phase 0 — Capability core (zero behaviour change)

- [x] Create `apps/grandway/config/access/capabilities.types.ts` — `Capabilities` interface, one documented field per rule
- [x] Create `apps/grandway/config/access/capabilities.ts` — pure `getCapabilities(authorityType)` + `LEAD_MANAGER_DOCUMENT_READ_ENABLED` constant (`allowedDocumentFamilies()` deferred to P5's `documents.families.ts`, so `config/` keeps zero module coupling)
- [x] Create `apps/grandway/config/access/useCapabilities.ts` — `useCurrentUser()` → memoized capabilities
- [x] Create `apps/grandway/config/access/index.ts` barrel
- [x] Create `apps/grandway/components/RequireCapability/` (tsx + types + index) — shared loading / isError / forbidden panel
- [x] Rewrite `RequireAuth` as a `RequireCapability` wrapper
- [x] Rewrite `RequireStaff` as a wrapper
- [x] Rewrite `RequireLeadAccess` as a wrapper
- [x] Rewrite `RequireDocumentAccess` as a wrapper (+ rewrite its now-inverted doc comment)
- [x] `pnpm check-types` passes with P0 alone
- [x] Commit P0 + adversarial review

## Phase 1 — Forced role in account creation

- [x] Run `/form-builder` for the control choice
- [x] `UserForm.tsx` — read-only "Account role" field above Username, submit label, move password sentence
- [x] `UsersList.tsx` — modal title states the tier
- [x] Commit P1 + adversarial review

## Phase 2 — Nav, shell, spotlight

- [x] `config/nav/admin-nav.ts` — add `canAccessDocumentWorkspaces`, admin-only catalogue/clients/checklists, rewrite header JSDoc
- [x] `layouts/admin/Admin.tsx` — consume `useCapabilities()`, rebuild `searchAccess`
- [x] `global-search` — split `documents` / `signatories` access, add `family` to `DocumentSearchRow`
- [x] Swap gates on institutions (2 files), clients (1), checklists list/templates (4) — leave `ChecklistDetail.tsx` alone
- [x] Verify Catalogue rail disappears entirely for staff (no iconless stub)
- [x] Commit P2 + adversarial review

## Phase 3 — Dashboard bands

- [x] `DashboardOverview.tsx` — gate Operations band, update footer caption
- [x] `AdminHome.tsx` — swap inline role branch for `caps.dashboard`
- [x] Commit P3 + adversarial review

## Phase 4 — Applicants read-only for staff

- [ ] `ApplicantsList.tsx` — `caps.applicantCreate`, pass `canChangeStatus`
- [ ] `applicants.columns.tsx` — Status switch or read-only badge
- [ ] `ApplicantRowActionsMenu` — drop Edit when `!caps.applicantEdit`
- [ ] `ApplicantDetail.tsx` — hide Edit, badge instead of switch, Documents tab on `caps.documents`
- [ ] `ApplicantCreatePage.tsx` / `ApplicantEditPage.tsx` — nested capability gates
- [ ] Comment why the Journeys/Files/Alerts/History tabs are deliberately untouched
- [ ] Commit P4 + adversarial review

## Phase 5 — Documents read access for staff (ships dark)

- [ ] Create `modules/documents/documents.families.ts` + barrel export
- [ ] `DocumentsWorklist.tsx` — role-dependent family tabs for staff
- [ ] `documents.columns.tsx` — add status column filter
- [ ] `DocumentWorkspaces.tsx` — gate to `caps.documentWorkspaces`
- [ ] `ApplicantDocumentsPanel` — client-filter families, filtered count, gate on `caps.documents`
- [ ] `OpenDocumentButton` — same family filter + fix the query-key mismatch
- [ ] `globalSearch.sources.ts` — drop bank rows, over-fetch, comment the cost
- [ ] `documents.queryKeys.ts` + panel key — encode family scope
- [ ] Commit P5 + adversarial review

## Phase 6 — Editor read-only seam (ships dark)

- [ ] `DocumentEditorProvider.types.ts` — `canEdit`, `isActiveDocumentEditable`, `readOnlyReason`
- [ ] `DocumentEditorProvider.tsx` — compose the predicate, early-return every mutating callback
- [ ] `EditCurrentDocumentButton`, `DocToolbar`, `PagesSidebar`, `AddPageMenu`, `EmptyState`
- [ ] `CreateDocumentModal`, `EditFieldsModal`, `HistorySidebar`
- [ ] `DocumentEditor.tsx` — read-only banner for `readOnlyReason === "role"`
- [ ] `DocHeader` — retarget close, hide the dead `/admin/signatures` link
- [ ] Standalone route — neutral `DocumentUnavailable` for a disallowed family
- [ ] Commit P6 + adversarial review

## Phase 7 — Docs + verification

- [ ] `apps/grandway/docs/AI.md` — Role gates section, Modules table, `config/access` adoption rule
- [ ] Add the eslint / anti-pattern-gate fence for direct `authorityType` reads
- [ ] `pnpm format && pnpm check-types && pnpm lint` + `/verify`
- [ ] Write up the two backend asks (lead_manager document reads scoped off bank families; snapshot POST)
- [ ] Commit P7
