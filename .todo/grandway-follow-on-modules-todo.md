# Grandway — Integrate 4 New Frontend Modules (+ verify audit) — Todo

Branch: `dev/grandway-document-stack`
Plan: `~/.claude/plans/you-are-to-also-temporal-lynx.md`

## Phase 0 — Backend sync (parallel)

- [x] `/sync-api grandway uploaded_files` → `apps/grandway/docs/backend/uploaded-files/`
- [x] `/sync-api grandway notifications` → `apps/grandway/docs/backend/notifications/`
- [x] Commit Phase 0 (docs-only, skip review)

## Phase 1 — uploaded-files

- [x] `uploadedFiles.{api,queryKeys,hooks,types,labels}.ts` (+ `uploadedFiles.utils.ts`)
- [x] `_shared/FilesPanel/` (reusable embed — built as a component folder per Component Structure, not a flat file)
- [x] `_shared/useFileBlob.ts` + `_shared/downloadFile.ts` (auth-blob helpers)
- [x] `pages/detail/FileDetail.tsx` + route `app/admin/files/[id]/page.tsx`
- [x] `pages/review/FileReviewQueue.tsx` + route `app/admin/files/review/page.tsx`
- [x] Modals: UploadFileModal, ReplaceFileModal, VerifyFileModal, EditFileModal
- [x] Module barrel `index.ts`
- [x] Commit Phase 1 + dual review (Codex + adversarial-reviewer)

## Phase 2 — checklists + notifications (parallel)

### checklists

- [x] `checklists.{api,queryKeys,hooks,types,labels}.ts` (templates + checklists + dual-response awaiting-setup)
- [x] Templates: `ChecklistTemplatesList.tsx` + `TemplateDetail.tsx` + routes (RequireLeadAccess read, admin-gated authoring — corrected from RequireDocumentAccess during review)
- [x] Instances: `ChecklistWorklist.tsx` + `AwaitingSetupList.tsx` + `ChecklistDetail.tsx` + routes (RequireLeadAccess)
- [x] `EvidencePickerModal.tsx` (consumes uploaded-files `useFilesList`)
- [x] Module barrel `index.ts`

### notifications

- [x] `notifications.{api,queryKeys,hooks,types}.ts` + `useNotificationSummary` (polled)
- [x] `_shared/RecordAlertsPanel.tsx` (reusable embed)
- [x] `pages/centre/NotificationCentre.tsx` + route `app/admin/notifications/page.tsx` (RequireLeadAccess)
- [x] Module barrel `index.ts`

- [x] Commit Phase 2 + dual review per sub-module

## Phase 3 — dashboard

- [x] `dashboard.{api,queryKeys,hooks,types,labels}.ts` (8 independent sections, shared fiscal_year+country filter set)
- [x] `pages/DashboardOverview.tsx` + 8 section card components + filter bar (fiscal_year + country only)
- [x] Route `app/admin/dashboard/page.tsx` (RequireLeadAccess, hide+guard superadmin)
- [x] Drill-through links wired to offers/checklists/files/applicants/journeys
- [x] Module barrel `index.ts`
- [x] Commit Phase 3 + dual review

## Phase 4 — Cross-module wiring (single owner)

- [x] Embed FilesPanel + RecordAlertsPanel into `ApplicantDetail.tsx` (files not admin-gated — only document/snapshot-owned files are; alerts use `applicant.passport?.id`, corrected during review)
- [x] Embed FilesPanel + RecordAlertsPanel into `OfferDetail.tsx` (not admin-gated — offer-owned files are shared Admin+Lead Manager, corrected from the plan's original note)
- [x] Embed FilesPanel into `JourneyDetail.tsx`
- [x] Finish `badge`→Indicator in `packages/admin/.../MainNavIconButton.tsx` + thread through `MainNav.tsx`
- [x] Update `packages/admin/docs/*` + `usage-doc/admin/*` for badge change — N/A, no existing doc file describes AdminShell/MainNav's nav config API; nothing stale to update
- [x] `admin-nav.ts`: dashboard, checklists, files-review nav entries + notifications bell `additional` entry
- [x] `Admin.tsx`: compute new gate flags + `useNotificationSummary()` + pass `unreadCount`
- [x] audit verify-only: type-check/lint pass + add missing `modules/admin/audit/docs/AI.md`
- [x] Add `docs/AI.md` for uploaded-files, checklists, notifications, dashboard modules (created by each module's own build)
- [x] Register all 4 modules in `apps/grandway/docs/AI.md` (via `/update-ai-map`)
- [x] Commit Phase 4 + dual review (found + fixed: ChecklistDetail/ApplicantDetail alerts panels were querying source_entity_id values no notification type produces)

## Final verification

- [x] `/verify` (format, check-types, lint) — run at root: format:check, check-types, lint all PASS across all 9 packages; `pnpm --filter grandway build` PASS with all 9 new routes present
- [x] Mechanical design scan (B1/B2/B3) on new interactive components — no violations found
- [ ] `/design-check` + `/visual-review` on new routes — DEFERRED to user; needs the app running against a live backend, unavailable in this headless session (same deferral as the institutions/offers/clients trio)
- [x] Coverage check for uploaded-files + notifications endpoints — every documented endpoint (8 files, 7 notifications) has a corresponding frontend call site
- [x] `/pre-pr` Steps 1-4 (verify, AI-map check, PR description prepared) — Step 5 (push + gh pr create) held for explicit user confirmation given the scope of this branch
- [ ] Delete this todo file (after user confirms push/PR)
