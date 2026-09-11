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

Backend: `/api/v1/documents/` + `/api/v1/document-history/`. Contracts:
`docs/backend/documents/`, `docs/backend/document-history/`.

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

| Component                   | What it is                                                                  |
| --------------------------- | --------------------------------------------------------------------------- |
| `DocHeader`                 | Black top bar. Brand, filename, date, **Signature button**, close           |
| `DocToolbar`                | White sub-bar. Status action, archive menu, print, print-all, panel toggles |
| `PagesSidebar`              | Left rail — the document list for the workspace                             |
| `HistorySidebar`            | Right rail — **Activity** (snapshots) on top, **Customizations** below      |
| `EditCurrentDocumentButton` | Floating bottom-right FAB → the edit-fields modal                           |

All of them import styles from the **shared** `pages/editor/DocumentEditor.module.css`
rather than owning a CSS module.

Modals follow one of three patterns: a context flag (`EditFieldsModal`,
`CreateDocumentModal`), local `useState` in the page (the two panels), or a fully
imperative `@peppermint/admin` modal (`openReasonConfirmModal` for archive).

## The template seam

`documentTypeConfig.ts` is the registry: `type → { label, Form, Template,
ConfigBar?, formModalSize? }`.

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
