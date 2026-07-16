# Mintway — Applicant Documents Integration

Branch: `dev/mintflow-minister-app` (shared — do NOT create a new branch).
Plan: `~/.claude/plans/so-i-have-docs-snappy-neumann.md`.

## Phase 0 — Make templates compile (support layer + import swap) ✅

- [x] Swap `@zetsel/ui → @peppermint/ui` and `@zetsel/admin → @peppermint/admin` (72 files, imports only)
- [x] Reconstruct `context/DocumentContext.tsx` (Provider + `useDocContext` + data types)
- [x] Create canonical `components/framework/FormHandler/` (Provider + `useForm`)
- [x] Create canonical `components/layout/editor/editor.context.tsx` (`ContextEditor`)
- [x] Create `components/helper/chunkArray.ts`, `components/helper/getDaySuffix.ts`, `const/monthnames.ts`
- [x] Route module `TemplateRenderProvider` through canonical FormHandler + ContextEditor (re-exports)
- [x] Add `public/documents/assets/{leaf,logo}.svg` (PLACEHOLDERS — real brand SVGs are a hand-off item)
- [x] Mantine 9 migration: `Grid gutter` → `gap` across templates (34 uses; spacing-identical, not a restyle)
- [x] Gate: ZERO template/support-layer type errors. Remaining 14 errors are Phase 1–3 module-logic files.

**Note for user:** two necessary edits touched template files — (1) the `@zetsel/*`→`@peppermint/*`
import swap, and (2) the Mantine-9 `gutter`→`gap` prop rename. Both are mechanical and render
identically; no view/layout was redesigned.

## Phase 1 — Real data layer ✅

- [x] Rewrite `documents.api.ts` on `@/lib/api` (list/create/detail/update/delete, status
      actions, prefill, workspaces, revisions, print-events, signatures) + `unwrapList`
- [x] Rewrite `documents.types.ts` to real backend shapes (keep family content types)
- [x] Add `student-* ⇄ applicant-*` slug map at the API boundary
- [x] Rewrite `documents.queryKeys.ts` → applicant-scoped array-form keys

## Phase 2 — Provider + hooks rewire ✅

- [x] `DocumentEditorProvider`: studentId→applicantId, prefill, record_version + 409 retry, status actions
- [x] `useSignatures` → `/signatures/?active=true` + private image blobs → object URLs
- [x] `useDocumentActions` → print-event POST (client-derived bank values) + remove
- [x] `useDocumentHistory.ts` (merged revisions + print-events + restore) — replaces usePrintLogs
- [x] Unified History sidebar: merged revisions + print-events timeline, inline restore

## Phase 3 — Pages, routing, design tweaks ✅

- [x] `DocumentsList` → real workspaces endpoint (counts by status)
- [x] `DocumentsNew` → applicant picker via `fetchApplicants`
- [x] `DocumentEditor` → applicantId param
- [x] Routes: `app/documents/{page,new,[applicantId],signatures}` + `layout.tsx`
- [x] Signatures management screen (DataTableShell + multipart image upload)
- [x] `LayoutDocuments` (RequireAuth gate, full-screen, no admin shell)
- [x] "Prepare documents" link on admin applicant overview; "Manage signatures" in editor header
- [x] Chrome tweaks: DocHeader routes + branding (zetsel→mintway) — NOT templates

## Phase 4 — Verify

- [x] `pnpm format && pnpm check-types && pnpm lint` (mintway) — all green (2 pre-existing App.tsx warnings)
- [ ] `/visual-review /documents/[applicantId]` (needs a running backend — manual)
- [ ] Dual adversarial review (Codex + adversarial-reviewer) + final commit; delete this todo file
