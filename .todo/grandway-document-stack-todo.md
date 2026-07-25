# Grandway Document Stack + Checklists + Dashboard — Build Todo

Branch: `dev/grandway-document-stack`
Plan: `~/.claude/plans/in-this-backend-i-synthetic-chipmunk.md`

## Phase 0 — Doc intake (blocking; parallel × 5)

- [ ] Sync `documents` backend docs → `apps/grandway/docs/backend/documents/`
- [ ] Sync `document_history` → `apps/grandway/docs/backend/document-history/`
- [ ] Sync `document_templates` → `apps/grandway/docs/backend/document-templates/`
- [ ] Sync `checklists` → `apps/grandway/docs/backend/checklists/`
- [ ] Sync `dashboard` (dashboards app) → `apps/grandway/docs/backend/dashboard/`
- [ ] Commit Phase 0 (docs) — skip dual-review (docs-only)

## Phase 1 — Independent modules (parallel)

### 1a. Template engine port

- [ ] Copy `components/templates/**` (53 components + barrels + templateprops + BankPaddingSpace)
- [ ] Copy 3 render contexts (FormHandler, editor.context, DocumentContext)
- [ ] Copy helpers (getDaySuffix, chunkArray) + const/monthnames
- [ ] Copy engine glue (documentTypeDefinitions, documentTypeConfig, document-types/_, utils/_, TemplateRenderProvider, A4Page, documents.types trimmed)
- [ ] Load "Rubik" font in grandway
- [ ] Add byte-identity diff check for templates
- [ ] Verify types/lint

### 1b. dashboard

- [ ] dashboard.api.ts (8 sections) + queryKeys + hooks + types
- [ ] Dashboard.tsx + components (StatTile reuse, Preview panels, DashboardFilters)
- [ ] Route app/admin/dashboard/page.tsx
- [ ] Guard RequireLeadAccess

### 1c. document-templates

- [ ] documentTemplates.api.ts (signatories + templates) + queryKeys + hooks + types + labels
- [ ] SignatoriesList + TemplatesList (ModalTableShell ×2) + columns
- [ ] SignatoryForm + TemplateForm
- [ ] Picker hooks useActiveTemplates / useActiveSignatories
- [ ] Route + guard RequireDocumentAccess

### 1d. checklists

- [ ] checklists.api.ts (checklists + templates + nested items + lifecycle + safety-net) + queryKeys + hooks + types + labels
- [ ] Template authoring: ChecklistTemplatesList + ChecklistTemplateDetail + forms
- [ ] Instances: ChecklistWorklist + ChecklistDetail (item status, lifecycle) + safety-net tab
- [ ] Routes + guard RequireLeadAccess (authoring admin-gated)

- [ ] Commit Phase 1 + dual review per sub-module

## Phase 2 — Documents editor + document-history

### 2a. documents

- [ ] documents.api.ts + queryKeys + hooks + types + labels
- [ ] DocumentEditorProvider (reimplemented data layer)
- [ ] Editor shell DocumentEditor.tsx + ported sub-components re-pointed to grandway provider
- [ ] List surfaces (workspaces + standalone + all-documents) + columns
- [ ] ApplicantDocumentsPanel (cross-module)
- [ ] Routes (workspace/[applicantId], standalone/[documentId])

### 2b. document-history

- [ ] documentHistory.api.ts (snapshots/timeline/capture/recover/reprint) + hooks
- [ ] HistorySidebar reads both audit markers + print snapshots

- [ ] Commit Phase 2 + dual review

## Phase 3 — Integration wiring

- [ ] admin-nav.ts flags + entries (documents, checklists, dashboard)
- [ ] RequireDocumentAccess guard
- [ ] Cross-module panels (ApplicantDocumentsPanel, JourneyChecklistPanel, dashboard links)
- [ ] Update apps/grandway/docs/AI.md
- [ ] Final verify (/verify, /design-check, /visual-review), coverage matrix
- [ ] Commit Phase 3 + dual review
- [ ] Delete this todo file, prepare PR
