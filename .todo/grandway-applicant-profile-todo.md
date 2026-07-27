# Grandway — Applicant Profile rework

Branch: `dev/grandway-applicant-profile`

## Phase 1 — Kill the bilingual name fields

- [ ] `applicants.types.ts` — Applicant/FamilyMember/EmergencyContact/inputs → `full_name`; `BsDate` → `month_name`/`display`
- [ ] `ApplicantForm.types.ts` — form row shapes
- [ ] `ApplicantForm.tsx` — zod, prefill, payload, display name, step description
- [ ] `FamilyMembersField.tsx` — single "Full name" + rebalance Grid spans to 12
- [ ] `EmergencyContactsField.tsx` — single "Full name" + collapse to one Grid row
- [ ] Applicant readers — detail page, panels, edit page, columns, row menu, status switch, Open\* buttons
- [ ] `applicant-journeys` — `ApplicantBrief`, `BsDate`, and all its readers
- [ ] `documents.api.ts` applicant mapper
- [ ] Delete dead `ChangeApplicantStatusModal/`
- [ ] `pnpm check-types` clean + grep proves zero `_np`/`_en`/`_romanized` name refs left in scope
- [ ] Adversarial review + commit

## Phase 2 — Shared profile kit

- [ ] `ProfileField` — split `labelSize` (xs) / `valueSize` (sm)
- [ ] `ProfilePanelHeader` (new)
- [ ] `ProfileList` (new)
- [ ] `HistoryTable` (new) replaces `HistoryTimeline`; switch both consumers, delete old
- [ ] Barrel `index.ts` updated
- [ ] Review + commit

## Phase 3 — Sidebar

- [ ] `ApplicantOverviewPanel` — Identity / Contact / Address / Record groups, responsive grid, sm values
- [ ] Drop dead `full_name_romanized` subtitle on `ProfileSidebar` usage
- [ ] Review + commit

## Phase 4 — Tabs

- [ ] Passport & Family — panel header + family/emergency as `ProfileList`
- [ ] Journeys — panel header, full-width list, View/Edit/Close row actions
- [ ] Documents — panel header, search, Open document editor, full list, all states
- [ ] Files + Alerts — panel headers
- [ ] History — panel header + `HistoryTable`
- [ ] Review + commit

## Phase 5 — Files folder view

- [ ] `FileFolderGrid` (category folders + counts)
- [ ] `FileTileGrid` (breadcrumb, in-folder search, tiles, actions menu)
- [ ] `FilesPanel` rewired; all states preserved
- [ ] Adversarial review + commit

## Phase 6 — Docs, verify, PR

- [ ] `apps/grandway/docs/AI.md` updated
- [ ] `apps/grandway/docs/backend/applicants/INTEGRATION.md` re-synced to v1.3.0
- [ ] `pnpm format` (scoped) + `check-types` + `lint`
- [ ] `/design-check` + `/visual-review /admin/applicants/<id>`
- [ ] Push branch
