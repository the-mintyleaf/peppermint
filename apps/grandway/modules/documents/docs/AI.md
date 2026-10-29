# Documents Module — AI Navigation Map

> **Partial map.** This module is the largest in the app (~40 document types) and
> had no AI map at all. This one covers the editor shell, its state model, the
> template/adapter seam, and the signature seam — the areas verified while
> building signature selection. **The per-document-type forms and templates are
> not yet documented**; read `documentTypeConfig.ts` for the registry and the
> `document-types/<slug>/` folder for a given type.

## Purpose

The full-screen **document editor**: creating, editing, printing and versioning
generated documents (certificates, CVs, bank statements, WODA/LOR/MOI letters)
for an applicant workspace or a standalone document.

**Not** the document list screens — those are `modules/admin/documents`
(`/admin/documents`, `/admin/documents/all`, `ApplicantDocumentsPanel`), a
separate module.

Backend: `/api/v1/documents/` (incl. `prefill/<applicant_id>/`) +
`/api/v1/document-history/`. Contracts: `docs/backend/documents/` (v1.5.0),
`docs/backend/document-history/`.

## Module type

Custom / Not-Contained. No `DataTableShell` or `ModalTableShell`; a bespoke
fixed-position full-screen shell with its own header, toolbar and two sidebars.

Deliberately **outside `app/admin`** — `app/documents/{workspace/[applicantId],
standalone/[documentId]}/page.tsx`, using `layouts/documents` (no AdminShell, no
sidenav). Barrel: `ModuleDocuments = { editor: DocumentEditor }`.

## State model

**There is no zustand here.** `zustand` is a dependency of the app but is used
only inside `@peppermint/*` packages; this app has zero module-level stores. The
editor's store is a React Context.

- `context/DocumentEditorProvider.tsx` — the provider.
- `context/DocumentEditorProvider.types.ts` — the contract. **Read it before
  adding a field.**

Everything else is server state via React Query. The whole mutable surface is
seven `useState`s in the provider (active document, historical log, the two
create-modal flags, the edit-fields flag, printing-all, pending-edits).

**Two derived values nothing outside the provider may recombine:**
`isActiveDocumentEditable` (role AND document exists AND status editable AND
server `isEditable` AND not previewing history) and `readOnlyReason`. Consume
them; do not re-derive read-only in a new component.

Modal setters are **guarded in the provider** so a reader can never flip them.

## Chrome

| Component                   | What it is                                                                |
| --------------------------- | ------------------------------------------------------------------------- |
| `DocHeader`                 | Black top bar. Brand, filename, date, **Signature button**, close         |
| `DocToolbar`                | White sub-bar. Status action, Remove / Restore, print, print-all, toggles |
| `PagesSidebar`              | Left rail — live pages, then an **Archived** group (removed documents)    |
| `HistorySidebar`            | Right rail — **Activity** (snapshots) on top, **Customizations** below    |
| `EditCurrentDocumentButton` | Floating bottom-right FAB → the edit-fields modal                         |

All of them import styles from the **shared** `pages/editor/DocumentEditor.module.css`
rather than owning a CSS module.

**Removing a document archives it** — there is no delete endpoint. An archived
document is not a page: it has no page number, is skipped by "Print all", and no
longer holds its type's one-per-student slot, so a fresh one can be created.
`isLiveDocument` (`documents.status.ts`) is the one test for this. A bank
certificate and its statement are removed and restored together
(`findBankPartner` in `utils/documentTypeMenu.ts`, matched on reason and archive time). Restore is disabled while a live document of
the same one-per-student type exists, so it can never leave two.

- **The backend list hides archived documents unless asked** (since 1.2.0).
  `documentsApi.listByApplicant` sends `include_archived=true` — the Archived
  group, the applicant panel and the list-row button all need them, and they
  share one cache entry. `documentsApi.list` takes `includeArchived`.
- **Restore returns the status the document had when removed** (`draft` or
  `ready`; `draft` for anything removed before 2026-10-29); the toast says which.
  Restore stays **one click** — `documentsApi.restore(id, reason?)` accepts the
  optional reason, the toolbar does not ask for it (the removal already carries
  a mandatory one, and restore is itself reversible).

Modals follow one of three patterns: a context flag (`EditFieldsModal`,
`CreateDocumentModal`), local `useState` in the page (the two panels), or a fully
imperative `@peppermint/admin` modal (`openReasonConfirmModal` for archive).

## The template seam

`documentTypeConfig.ts` is the registry: `type → { label, Form, Template,
ConfigBar?, formModalSize?, templateVersion?, formSchema? }`.

- **`templateVersion`** is sent as `template_version` on **create only**
  (`getTemplateVersion`). Every Woda letter is created as `"2"`; everything else
  takes the backend's `"1"`. `Document.templateVersion` is mapped but **no
  template branches on it yet** — older Woda content is recognised by its shape
  (see WODA letters), which is what keeps it rendering.
- **A form's `onSubmit` returns the save's promise.** `EditFieldsModal` and
  `CreateDocumentModal` close only when it resolves; on a refusal the provider
  toasts and the modal stays open with the operator's edits. Forms may ignore
  the promise; the certificate form awaits it to mark server field errors.

- **`Template`** renders the document. Templates live in `@/components/templates/`
  and are **pure presentational components** — they receive resolved data and
  never fetch.
- **`Form`** is the create/edit field set, shown in a modal.
- **`ConfigBar`** is the **Customizations** panel in the right rail. Optional; a
  type without one shows "No Customizations for this Document".
- **Adapters** (`utils/createTemplateAdapter.tsx`, and per-type files like
  `document-types/student-certificate/CertificateTemplate.tsx`) sit between the
  two, resolving `document.content` into the shape a template wants.

**A ConfigBar has two update channels and they are not interchangeable:**
`onUpdate` writes the local cache only (instant preview, and the right and only
channel for render-only settings like bank padding), while `onPersist` PATCHes.
Anything that must survive a reload or a print needs `onPersist`.

> **`content` is PATCHed WHOLESALE.** Always merge from the freshest cache
> content and send the complete object — never a partial. This is why every
> persisting ConfigBar keeps a `contentRef` and merges at flush time, with an
> unmount flush so a debounced save is not lost when the panel closes or the
> document switches.

## Student certificate content

**The one body the backend validates** (`documents/INTEGRATION.md` §7): on create
and on every PATCH with content, snake_case keys; a refusal is 400
`DOCUMENTS_CONTENT_INVALID` with `error.details.fields` keyed by path
(`marking[2].present`). Folder: `document-types/student-certificate/`.

| File                       | Role                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `certificateContent.ts`    | **Pure.** `normalizeCertificateContent` (read either era) / `toStoredCertificateContent` (write the validated keys only) |
| `certificateForm.utils.ts` | Zod schema mirroring the backend rules, content ↔ form values, `serverPathToFormPath`                                    |
| `CertificateForm.tsx`      | Form; seeds a NEW certificate from the prefill; marks server refusals                                                    |
| `CertificateConfigBar.tsx` | Customizations: issue date, signatories, study status — writes only those keys (`withCertificatePanelChange`)            |
| `CertificateTemplate.tsx`  | Adapter → `StudentCertificateData` (`@/context/DocumentContext`)                                                         |
| `useCertificatePhoto.ts`   | Resolves `photo_media_id` to a URL, reusing the editor's current photo                                                   |

- **Read both, write only the new.** Certificates saved before 2026-10-29 use
  the template's old keys (`gender: "Male"`, top-level grades, `coursehour`,
  `studyType`, `instructorId`/`directorId`, `customBranch`/`customBranchNo`,
  `batch.course.*`, `issueDate`, `studentName`, `program`). Every reader goes
  through `normalizeCertificateContent`, so they open, preview and print
  unchanged. **Only an Edit-fields save migrates a body** — it rewrites it under
  the new keys and drops the old ones (`LEGACY_CERTIFICATE_KEYS`), with every
  field on screen and validated first.
- **The Customizations panel never migrates.** `withCertificatePanelChange`
  writes only its four keys (`issue`, `study_type`, `instructor_id`,
  `director_id`) onto the stored body as it is, plus one lossless fix:
  `gender` lowercased (`"Male"` is refused). If older data still breaks a rule,
  the panel reverts its preview to the content before the change and lists the
  fields to fix in Edit fields — preview and print never show an unsaved choice.
- **No attendance row is ever dropped or rewritten in passing.** `toYearMonth`
  reads `"2024-08"`, `"2024-8"`, `"2024-08-15"`, `"2024/8"`, bare numbers and
  English month names. A row it still can't place (`0`, `13`, free text) opens in
  the form with its stored text and "pick the month"; the save waits for it.
  The printed table has one slot per month, so such a row is not printed.
  Stored numbers pass through unclamped; the schema keeps them valid.
- **Every printed field is entered in the certificate's own form or its
  Customizations panel.** Nothing needs filling in on the applicant's profile.
  Keep it that way — the prefill only seeds editable fields.
- **Prefill seeds a NEW certificate only**: name parts, date of birth, gender,
  address (current, else permanent, `formatted`), `photo_media_id`.
  `FormWrapper` reads `initial` once, so the form waits for a **fresh** prefill
  fetch (`isFetchedAfterMount`; the hook keeps no cache) and for the applicant
  summary (at most 4 s); a failed prefill opens it empty with a notice.
- **Photograph.** The photo field edits the applicant's photograph; the save
  stores whichever is current as `photo_media_id` (`resolvePhotoMediaId`). The
  template prints the stored one — reusing the editor's resolved URL when it is
  the current photo, otherwise resolving the stored id itself (the byte query is
  shared by file id, so the common case downloads nothing extra).
  No `photo_media_id` (older certificates) → stored `image`, else current photo.
- **Server field errors land on the open form.** `saveDocumentContent` /
  `createDocumentWithContent` reject after the provider's toast; the form maps
  each path (`marking[i].*` → `attendance.i.*`, `grades.x` → `x`,
  `course_books[i]` → `course_books`, others by name) with `form.setErrors`, and
  lists the unplaceable ones (`photo_media_id`) in an alert above the fields.
  The form's `finalSubmitFn` returns `ok: true` on purpose — `ok: false` would
  add a second, generic toast. Both also reject (with a toast) when the editor
  sends nothing (reader, missing document, no applicant), so a modal never
  closes on a no-op.
- **Customizations refusals**: the toast names the fields
  (`describeContentSaveError`, `utils/contentFieldErrors.ts`) and the panel shows
  them with "open Edit fields". `onPersist` returns the save's promise for this.
  A certificate whose stored photograph was archived after saving is refused on
  its next content save; opening Edit fields and saving re-pins the current photo.

## Prefill

`useDocumentPrefill(applicantId, { enabled })` (`hooks/useDocumentPrefill.ts`,
exported from the barrel) → `GET /documents/prefill/<applicant_id>/`, mapped to
camelCase `DocumentPrefill` (`documentPrefill.types.ts`). Key
`documentPrefillKey(id)`, outside the documents tree. No cache (`gcTime: 0`,
`refetchOnMount: "always"`) — seed only once `isFetchedAfterMount`; no retry.
`fetchDocumentPrefill(queryClient, id)` in the same file is the imperative read
(`fetchQuery`, same options) for flows with no form to mount.

Two consumers, one per creation path:

| Path                                       | Seeded where                                          | File                                                                |
| ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Create modal (`student-certificate`)       | the form, before `FormWrapper` mounts                 | `document-types/student-certificate/CertificateForm.tsx`            |
| Quick-create (every Woda, LOR, MOI letter) | the **default content, at creation**, in the provider | `context/quickCreateContent.ts` → `utils/prefillDocumentContent.ts` |

- **Why quick-create seeds at creation, not on first Edit fields.** These
  letters have no create form — "Add page" POSTs `getDefaultDocumentContent`
  straight away. Creation is the only moment that is unambiguously "new";
  "never edited" has no reliable marker (letters made before this change look
  identical), so seeding on a first edit would re-seed old letters. The page
  also previews with the applicant's details from its first render.
- **The gate is `DocumentTypeConfig.formSchema`.** `createSchemaForm(schema)`
  (`components/WodaForm`) builds every Woda/LOR/MOI form and attaches its
  schema; the registry exposes it. No schema (bank pair, CVs, certificate) → no
  prefill read; a schema with no seedable field (`woda-agriculture-income`) →
  no read either (`schemaUsesPrefill`) — it carries identity numbers.
- **`seedContentFromPrefill` (pure) rules:** only keys the letter's form shows
  or its default content holds; only into blank values (defaults such as legal
  basis, institution constants, stock relations are never overwritten); a
  `null` relative/address leaves the field as it was. A seeded parent or
  grandparent name brings its honorific's form default ("Mr."/"Mrs.") when blank.
  Gender: `male`/`female` set `applicant_gender`, `student_pronoun`,
  `student_kinship`, and the honorific — "Mr." for a man; a woman keeps a female
  honorific she has, else "Ms." (marital status is not on the file); `other`,
  `undisclosed` and blank change nothing. Addresses are written the ward-office
  way, `municipality-ward, district` (`wardAddress`, falling back to `formatted`);
  Woda letters use the **permanent** address only; LOR/MOI `student_address`
  falls back to the current one. B.S. dates as `YYYY/MM/DD`. The affidavit's
  sponsor and three signers are named only while their relation still reads
  Grandfather / Grandmother / Father / Mother.
- **Failure:** the letter is still created, unseeded, with one yellow notice
  ("Applicant details not filled in"). The "Add page" button is disabled for the
  whole read + create (`isCreatingDocument`).
- **Not seeded:** place of birth, citizenship issue district, occupation, the
  relatives table, `parent_citizenship_no`, the agriculture landowner — no
  unambiguous source. The CV forms are untouched (names come from the applicant
  summary at render).

## WODA letters

Ward-office letters, in two **sets** (`WODA_CATEGORIES` in
`documentTypeDefinitions.ts`), each its own "Add page" submenu:

| Set                                | Slugs                                                                                                               | Templates                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `japan` — "Woda Documents - Japan" | `woda-dob`, `-relationship`, `-occupation`, `-income`, `-tax-clearance`, `-family`, plus the older address/fiscal/… | `components/templates/woda/<folder>/`         |
| `english` — "… - English Country"  | `woda-english-dob`, `-relationship`, `-income`                                                                      | `components/templates/woda/english/<folder>/` |

- **A new letter is frontend-only.** The backend accepts any well-formed
  `woda-*` slug (`documents/INTEGRATION.md` §5); add it to `WODA_VARIANTS`
  with its `category`, to `wodaComponents` in `documentTypeConfig.ts`, and seed
  wording in `utils/defaultDocumentContent.ts`.
- **Templates are assembled from shared parts** in `components/templates/woda/`
  (`WodaPage`, `WodaSubject`, `WodaApplicantIdentity`, `WodaMembersTable`,
  `WodaTable`, `WodaPhotoGrid`, `WodaFiscalPeriods`, `WodaSignatureBlock`) and
  the pure helpers in `wodaFormat.ts`. The two sets differ in wording and
  table shape, not in parts.
- **Forms are schemas**, rendered by `components/WodaForm`. Shared sections
  live in `utils/wodaCommonSections.ts`; the Japan and English birth and
  relationship forms are one schema each, parameterised by legal basis
  (`utils/wodaDefaults.ts`). Each type's form is
  `createSchemaForm(schema, { displayName })` — it carries the schema for the
  registry's `formSchema` (see Prefill). LOR/MOI use the same factory through
  `utils/sharedForms.tsx` + `utils/letterFormSchema.ts`.
- **Clipboard suggestions** (`@/modules/admin/clipboard`): a schema field with
  `clipboardKey` (text/textarea) gets `ClipboardFieldSuggest` as its right
  section, inserting via `form.setFieldValue`. Given only to values retyped
  across applicants — spokesperson name/post/contact (`spokespersonSection`),
  tax-clearance contact office, occupation title, the affidavit's institution
  and ward chairman, LOR recommender name/title, MOI signatory name; plus the
  bank certificate's spokesperson name/post (hand-built form). Never on the
  applicant's own details. A new key must be registered in
  `modules/admin/clipboard/clipboard.fieldKeys.ts`. The modal sits at Mantine's
  default 200 and the popover at 300, so no `popoverZIndex` is passed.
- **New letters are created with `template_version: "2"`** (registry
  `templateVersion`); letters created before keep `"1"`. Nothing branches on it.
- **Old content keeps rendering.** The relationship letter still prints the
  single `extra_relation` relative when a document has no `relatives` list,
  and a blank occupation note or family paragraph prints the standard wording.

## The signature seam

**This module does not own signatories.** `@/modules/admin/signatures` does, and
the dependency runs **documents → signatures, never the reverse** (`DocHeader`
imports that module's barrel, so the other direction would close a cycle).

| File                                                                | Role                                                                 |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `hooks/useSignatures.ts`                                            | Thin mapper: `Signatory` DTO → the editor's `Signature` render shape |
| `hooks/useCertificateSignatures.ts`                                 | Resolves the **two** named signatories to usable image URLs          |
| `document-types/student-certificate/certificateSignatureOptions.ts` | Shared picker labels                                                 |

Three things to know:

1. **The picker resolves no images.** `Signature` carries `signature_source`,
   `signature_file_id` and `signature_image_url` but **no resolved image** —
   uploaded bytes need an authenticated fetch, and a picker of twenty names must
   not mean twenty audited downloads.
2. **The adapter resolves exactly two**, by a fixed pair of hook calls, because
   a certificate has two signature slots. Never loop `useResolvedSignatureImage`.
   This keeps every certificate template unchanged — it still receives a
   `signature_image` string and still finds its signer by id.
3. **The picker only ever lists `status: "active"` signatories.** A document that
   names a signatory who has since been retired renders a **blank** signature
   block, because the id will not be found in the list. That is pre-existing and
   deliberate: `documents` stores the id as an opaque string and nothing
   validates it, so the picker is the only guard.

`Signature.validFrom`/`validTo` and `utils/signatureValidity.ts` were **removed**:
no endpoint ever supplied those fields, so every signatory read as "unbounded"
and the picker suffix was always `""`. The annotation that replaced it —
"(no image)", from `signature_source` — says something true.

## Access

- `RequireDocumentAccess` (`caps.documents`) is the **read** gate. A reader who
  may not write is admitted and gets a read-only editor.
- `caps.documentWrite` is the separate write right. Do not put write checks back
  into the read gate.
- `caps.documentBankFamilies` hides the two bank families. **Ergonomics, not a
  security control** — nothing client-side stops a hand-edited
  `/documents/standalone/<id>`.
- `caps.signatories` gates the Signature button. Distinct from `documentWrite`.
- `LEAD_MANAGER_DOCUMENT_READ_ENABLED` in `config/access/capabilities.ts` is
  `false`; the read-only surfaces are built behind it so they all flip together.
