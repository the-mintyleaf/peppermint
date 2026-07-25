# Uploaded Files Module — AI Navigation Map

## Purpose

The platform's file ledger — the only place bytes are stored in Grandway. Every
applicant/journey/offer/document/snapshot screen shows its files through this
module's `GET /api/v1/files/?<owner>=<id>` list endpoint with a filter; there is
no standalone file directory route. Backend base path `/api/v1/files/`.
Contract: `apps/grandway/docs/backend/uploaded-files/{INTEGRATION,CONCEPT,FLOWS}.md`.

## Module type

Hybrid — no list/directory route (files are always viewed through the embedded
`FilesPanel`), but a dedicated `[id]` File Detail route and an Admin-only File
Review queue both exist as real pages. Build/edit each piece the way its
`MultiPageModule` counterpart would (`DataTableShell`/`FormWrapper`), just
without a `pages/list/` route.

## Routes

| Route               | Entry export            | Component                        | Guard                                                                              |
| ------------------- | ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| /admin/files/[id]   | `ModuleFileDetail`      | pages/detail/FileDetail.tsx      | `RequireLeadAccess`                                                                |
| /admin/files/review | `ModuleFileReviewQueue` | pages/review/FileReviewQueue.tsx | `RequireDocumentAccess` (reused for its exact-admin gate — see file's own comment) |

## Entry files

- `index.ts` — exports `FilesPanel` (the cross-module embed), `ModuleFileDetail`, `ModuleFileReviewQueue`, plus hooks/types/labels other modules need.
- `_shared/FilesPanel/FilesPanel.tsx` — **the headline deliverable**. Embed this in any applicant/journey/offer/document screen with `<FilesPanel scope={{ applicant: id }} />` (exactly one key).

## Access (critical)

- **Admin + Lead Manager** share list/read/edit(category+notes)/upload/replace/download/versions.
- **Admin only**: verify, archive, restore.
- **Superadmin**: refused everywhere.
- A file owned by a `document`/`snapshot` is **Admin-only in every respect** — a
  Lead Manager gets 404 (not 403) on it, and it never appears in their lists.
  **This module does not enforce that for the caller** — whichever screen embeds
  `FilesPanel` against a `document`/`snapshot` scope must itself be Admin-gated.
- Verification gates nothing else in the product (no endpoint anywhere refuses
  an operation because a file is unverified) — never build a flow that assumes it does.
- No delete, anywhere. Archive (mandatory reason) is the closest thing, and
  restore reverses it completely — the record keeps no trace it was archived.

## Data layer (module root)

| File                         | Holds                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `uploadedFiles.types.ts`     | `UploadedFile` (the one shape — list/detail/upload/replace/every action), 5 enums, write payloads, form-value types                  |
| `uploadedFiles.labels.ts`    | Category + verification-status label/color maps                                                                                      |
| `uploadedFiles.queryKeys.ts` | `fileQueryKeys` (`createQueryKeys`) + `filesListKey(scope, isArchived)` + `fileVersionsKey(id)`                                      |
| `uploadedFiles.api.ts`       | `createResourceApi` for get/update/action; hand-rolled `listFiles`/`fetchFileVersions`/`uploadFile`/`replaceFile`/`downloadFileBlob` |
| `uploadedFiles.hooks.ts`     | `useFilesList(scope)`, `useFileDetail(id)`, `useFileVersions(id)` + `useAppMutation` writes                                          |
| `uploadedFiles.utils.ts`     | `getOwnerEntry`, size/date formatters, upload-validation constants                                                                   |

- `listFiles`/`getFile`/`update`/lifecycle actions all read/write the SAME
  `UploadedFile` shape — no list-vs-detail widening needed (unlike `clients`).
- Upload/Replace are `multipart/form-data`, hand-rolled against a caller-built
  `FormData` — they don't fit `createResourceApi`'s JSON `create`.
- Version history is unpaginated and **oldest-first** — the opposite of the
  list endpoint's newest-first order. Don't "fix" the sort to match the list.

## Common edit targets

| Task                                   | Files                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Embed a files panel on another screen  | Import `FilesPanel` from this module's barrel; pass `scope`                            |
| Panel card layout / row menu           | `_shared/FilesPanel/FilesPanel.tsx`, `_shared/components/FileRowActionsMenu/`          |
| Upload / Replace / Edit / Verify forms | `_shared/components/{UploadFileModal,ReplaceFileModal,EditFileModal,VerifyFileModal}/` |
| Archive / Restore confirms             | `_shared/fileLifecycleModals.ts`                                                       |
| Inline image preview / downloads       | `_shared/useFileBlob.ts`, `_shared/downloadFile.ts`                                    |
| File Detail page / lifecycle buttons   | `pages/detail/FileDetail.tsx`                                                          |
| Overview / Version history panels      | `pages/detail/components/{FileOverviewPanel,FileVersionHistoryPanel}.tsx`              |
| Review queue                           | `pages/review/FileReviewQueue.tsx`, `pages/review/fileReview.columns.tsx`              |
| DTO shapes / API / keys                | `uploadedFiles.{types,api,queryKeys,hooks,labels,utils}.ts`                            |

## Domain rules encoded here

- **Exactly one owner, always** — `FileOwnerScope` and `getOwnerEntry` enforce
  picking the single set key; the backend enforces it as a DB constraint too.
- **`is_current` and `is_archived` are independent axes** — a file can be
  archived AND current, or superseded and NOT archived. Never collapse them
  into one status.
- **A replace creates a NEW file id.** `ReplaceFileModal`'s optional
  `onReplaced(newFileId)` callback exists so `FileDetail` can navigate to the
  successor; `FilesPanel`'s usage ignores it (the list just refetches).
- **Bytes never appear in any JSON payload.** `downloadFileBlob`/`downloadFile`/`useFileBlob`
  are the ONLY places this module fetches file contents — never build
  `<img src>` or `<a href>` against anything in a file payload.
- **`FileOwnerScope` currently covers `applicant`/`journey`/`offer`/`document`
  only** (not `snapshot`) — this phase's consumers don't embed a panel for a
  print snapshot yet. Extend the type + the four-key assumption together if that changes.

## State ownership

- Server data: React Query (`useQuery` / `useAppMutation`); no `useEffect` fetching.
- Form state: `@mantine/form` via `FormWrapper` (Upload/Replace/Edit); Verify is
  hand-rolled local state (mirrors `offers`' `RecordDecisionModal`).
- Object-URL lifecycle (`useFileBlob`): the fetch is `useQuery`; a scoped
  `useEffect` only creates/revokes the blob URL when the query's data changes.
- Local UI (active modal, panel open state): `useState`.

## Do not do

- Do not point `<img src>` or `<a href>` at anything in a file API response —
  fetch as a blob (`useFileBlob`/`downloadFile`) every time.
- Do not gate Replace/Edit/Download on `authorityType === "admin"` — those are
  shared with Lead Manager. Only Verify/Archive/Restore are Admin-only.
- Do not build a flow that assumes verification blocks anything downstream.
- Do not add a delete action — archive/restore is the entire lifecycle.
- Do not fetch in `useEffect`; do not import Mantine directly.
