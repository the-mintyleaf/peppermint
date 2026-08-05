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

- [x] `ApplicantsList.tsx` — `caps.applicantCreate`, pass `canChangeStatus`
- [x] `applicants.columns.tsx` — Status switch or read-only badge
- [x] `ApplicantRowActionsMenu` — drop Edit when `!caps.applicantEdit`
- [x] `ApplicantDetail.tsx` — hide Edit, badge instead of switch, Documents tab on `caps.documents`
- [x] `ApplicantCreatePage.tsx` / `ApplicantEditPage.tsx` — nested capability gates
- [x] Comment why the Journeys/Files/Alerts/History tabs are deliberately untouched
- [x] Commit P4 + adversarial review

## Phase 5 — Documents read access for staff (ships dark)

- [x] Create `modules/documents/documents.families.ts` + barrel export
- [x] `DocumentsWorklist.tsx` — role-dependent family tabs for staff
- [x] `documents.columns.tsx` — add status column filter
- [x] `DocumentWorkspaces.tsx` — gate to `caps.documentWorkspaces`
- [x] `ApplicantDocumentsPanel` — client-filter families, filtered count, gate on `caps.documents`
- [x] `OpenDocumentButton` — same family filter + fix the query-key mismatch
- [x] `globalSearch.sources.ts` — drop bank rows, over-fetch, comment the cost
- [x] `documents.queryKeys.ts` + panel key — encode family scope (editor provider's own key + filtering moves to P6, same edit)
- [x] Commit P5 + adversarial review

## Phase 6 — Editor read-only seam (ships dark)

- [x] `DocumentEditorProvider.types.ts` — `canEdit`, `isActiveDocumentEditable`, `readOnlyReason`
- [x] `DocumentEditorProvider.tsx` — compose the predicate, early-return every mutating callback
- [x] `EditCurrentDocumentButton`, `DocToolbar`, `PagesSidebar`, `AddPageMenu`, `EmptyState`
- [x] `CreateDocumentModal`, `EditFieldsModal`, `HistorySidebar`
- [x] `DocumentEditor.tsx` — read-only banner for `readOnlyReason === "role"`
- [x] `DocHeader` — retarget close, hide the dead `/admin/signatures` link
- [x] Standalone route — neutral `DocumentUnavailable` for a disallowed family
- [x] Commit P6 + adversarial review

## Phase 7 — Docs + verification

- [x] `apps/grandway/docs/AI.md` — Role gates section, Modules table, `config/access` adoption rule
- [x] Module AI maps now contradicting the code: `checklists/docs/AI.md` (routes listed as lead_manager-reachable), `clients/docs/AI.md`, `institutions/docs/AI.md` (all still say "reads shared admin + lead_manager" / `RequireLeadAccess`)
- [x] `applicants/docs/AI.md` + `dashboard/docs/AI.md` — read-only record for staff, Operations band admin-only
- [x] ~~eslint / anti-pattern-gate fence for direct `authorityType` reads~~ — **deliberately not added.** It would block the legitimate module-local write gates the adoption rule permits, and GOVERNANCE.md authorizes a new mechanism only from a logged failure of the matching cause. Docs + code review cover it.
- [x] `pnpm format && pnpm check-types && pnpm lint` + `/verify`
- [x] Write up the two backend asks (lead_manager document reads scoped off bank families; snapshot POST)
- [x] Commit P7
