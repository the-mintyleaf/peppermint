# Grandway — Integrate 4 New Frontend Modules (+ verify audit) — Todo

Branch: `dev/grandway-document-stack`
Plan: `~/.claude/plans/you-are-to-also-temporal-lynx.md`

## Phase 0 — Backend sync (parallel)

- [x] `/sync-api grandway uploaded_files` → `apps/grandway/docs/backend/uploaded-files/`
- [x] `/sync-api grandway notifications` → `apps/grandway/docs/backend/notifications/`
- [ ] Commit Phase 0 (docs-only, skip review)

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

- [ ] `dashboard.{api,queryKeys,hooks,types,labels}.ts` (8 independent sections)
- [ ] `pages/DashboardOverview.tsx` + 8 section card components + filter bar (fiscal_year + country only)
- [ ] Route `app/admin/dashboard/page.tsx` (RequireLeadAccess, hide+guard superadmin)
- [ ] Drill-through links wired to offers/checklists/files/applicants/journeys
- [ ] Module barrel `index.ts`
- [ ] Commit Phase 3 + dual review

## Phase 4 — Cross-module wiring (single owner)

- [ ] Embed FilesPanel + RecordAlertsPanel into `ApplicantDetail.tsx`
- [ ] Embed FilesPanel + RecordAlertsPanel into `OfferDetail.tsx` (admin-gated files)
- [ ] Embed FilesPanel into `JourneyDetail.tsx`
- [ ] Finish `badge`→Indicator in `packages/admin/.../MainNavIconButton.tsx` + thread through `MainNav.tsx`
- [ ] Update `packages/admin/docs/*` + `usage-doc/admin/*` for badge change
- [ ] `admin-nav.ts`: dashboard, checklists, files-review nav entries + notifications bell `additional` entry
- [ ] `Admin.tsx`: compute new gate flags + `useNotificationSummary()` + pass `unreadCount`
- [ ] audit verify-only: type-check/lint pass + add missing `modules/admin/audit/docs/AI.md`
- [ ] Add `docs/AI.md` for uploaded-files, checklists, notifications, dashboard modules
- [ ] Register all 4 modules in `apps/grandway/docs/AI.md` (via `/update-ai-map`)
- [ ] Commit Phase 4 + dual review

## Final verification

- [ ] `/verify` (format, check-types, lint)
- [ ] `/design-check` + `/visual-review` on new routes (defer to user if app can't run headless)
- [ ] Coverage matrix for uploaded-files + notifications endpoints
- [ ] `/pre-pr`
- [ ] Delete this todo file
