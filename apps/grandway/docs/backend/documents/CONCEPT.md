# CONCEPT — Documents

Grounding file, adapted from `.backend/concepts/documents.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **V1 built (2026-07-24).** Where the build departed from the original concept
> the departure is authoritative: access is **Admin-only including reads** (the
> concept's "Admin or Lead Manager" is superseded), the status enum is
> `draft`/`ready`/`archived`, and printing lives in a separate `document_history`
> module — there is no print endpoint here.

## Purpose

The Documents module owns Grandway's editable document state. It keeps the
current working record for a document: who it belongs to, what kind of document
it is, which template family it uses, what data has been entered, and what state
it is in. **The frontend renders the document and computes every display-only
value; the backend stores the persisted source data.** A consultancy does not
work with documents as one static file — it works with draft data,
template-driven rendering, frontend-computed presentation values, supporting
files, revisions, and history.

## Relationship to other records

A document is not an uploaded file, a template, or a print snapshot. The document
record is the editable business object — identity, ownership, status, template
association, and input data. The immutable copy created at print/save time lives
in `document_history`; the template definition and versioning live in
`document_templates`; supporting files live in `uploaded_files`. The backend is
the source of truth for saved document _state_, not the rendering engine for the
final visual layout.

Documents may be **applicant-owned** or **standalone**. Applicant-owned documents
are part of a person's file and stay attached to that applicant. Standalone
documents have no applicant but must still carry an explicit purpose — the owner
reference is nullable only when a clearly documented operational purpose stands
in its place. Exactly one of the two is present on every record.

## Actors

**Admin only.** Documents are the single most sensitive material in Grandway — a
record may carry a bank statement with an account number, opening balance, and
full transaction history, a passport-derived declaration, or a family financial
affidavit. The project owner ruled that **Lead Managers have no access at all,
not even read** — the only module in Grandway a Lead Manager cannot see.
Superadmin is refused too. This is the strictest access model in the project and
supersedes the original concept's "Admin or Lead Manager" phrasing.

## Core entities

- **Document** — the editable record staff work on: owner, document type, label,
  template link, status, notes, and the saved input data used to render or
  complete it.
- **Document type** — the stable class of the document (letter, form,
  declaration, certificate family). The backend owns a stable six-value `family`
  enum — `student`, `woda`, `lor`, `moi`, `bank_statement`, `bank_certificate` —
  and stores the concrete slug as a format-validated `template_key` string that
  must agree with the family. Bank documents are two families because a statement
  and a certificate have different content shapes and screens.
- **Document input data (`content`)** — the structured source data entered into
  the workspace, stored **verbatim**. The backend recomputes no client-side
  presentation values. Bank documents are the clearest example: running balances,
  debit/credit totals, closing balance, auto interest and tax rows, and
  amount-in-words are all derived in the frontend at render and are never the
  canonical editable source.
- **Standalone document** — a document not directly owned by an applicant; its
  owner/purpose must still be explicit.
- **Template association** — the link to the approved template family/version.
- **Supporting file reference** — a pointer to an `uploaded_files` file used while
  preparing the document; the file lives there, documents only reference it.
- **Signature reference** — signatory records for certificate templates, stored in
  `document_templates`, referenced by id from `content` where needed.
- **Print snapshot** — the immutable copy created at print/save time; captured and
  stored by `document_history`, not here.

## Lifecycle

A document is **created** with an owner (applicant or standalone purpose), a
family + template, a label, and initial status `draft`. Staff **work on the
data** in the workspace — entering source fields, saving the working copy while
the frontend continues to generate the rendered presentation from stored state
(derived values are never treated as ordinary editable data; a later template
change leaves saved input intact). A document is **marked ready** when finished.
It may be **archived** (retired with a mandatory reason) when no longer current —
the record and history remain, the workspace goes read-only — and later
**restored** for further work, always returning to `draft`. **Review and print**
is delegated to `document_history`: the workspace renders the final presentation
and that app captures the immutable snapshot; a reopened document creates a new
working version without rewriting the old snapshot. **Nothing is ever deleted** —
a document that should not have existed is archived, not erased.

## History

Records created, information changed, status changed, archived (with reason), and
restored — never silently rewritten or removed. A **body change is redacted to a
`<changed>` marker**: the audit log records _that_ the body changed and who
changed it, never what it said, because the body may hold account numbers and
transaction histories and the audit store is separate and widely readable. A
previous body therefore cannot be reconstructed from history.

## UI screens & wireframe notes

- **Documents landing table** — one row per applicant with **live** document work:
  name, document count, last-updated. Excludes standalone and all-archived
  applicants. Answers "who has live work", not "who has documents". Standalone
  documents need their own tab.
- **Document List** — a searchable worklist across all documents: columns label,
  owner, document type, template, status, last updated. Filters for owner, status,
  type (`family`), and template family; search matches **label only**.
- **Applicant Detail → Documents panel** — the primary entry point for
  applicant-owned documents. **Hidden entirely for a Lead Manager** — never shown
  read-only or empty.
- **Standalone Documents list** — a separate operational list for internal
  forms/letters that belong to no applicant.
- **Document Workspace** — the main editing surface: header, ownership, type,
  template link, status, source-data form, supporting files, and save actions,
  plus a **live client-side preview** rendered from the current input data. Goes
  read-only when archived.
- **Print Preview / History handoff** — a review screen for final presentation and
  snapshot capture — **backed by `document_history`, not by any endpoint here.**

## Constraints / Out of scope

No template authoring or versioning (that is `document_templates`); no immutable
snapshot storage (that is `document_history`); no uploaded-file storage or
verification (that is `uploaded_files`); no applicant self-service portal; no
automatic rewriting of historical snapshots when source data or template changes;
no deletion that erases history — retire, archive, or restore instead; no full
word processor or rich editor in V1; no e-signature workflow; no backend-side
rendering engine for the final layout. Send input fields only — never derived
values.

## Open questions

Settled in V1: the frontend slugs are **not** the canonical types (the six-value
`family` enum is, with the slug a validated `template_key` string); the status
enum is `draft`/`ready`/`archived` (`active` dropped, `printed` and `submitted`
excluded); Lead Managers see **none**; the backend stores input verbatim and
computes nothing.

Still open:

- Should standalone documents have their own lifecycle, or live in the workspace
  only? V1 gives them a `?standalone=true` filter but no separate lifecycle, and
  excludes them from the workspaces landing table.
- Should generated PDF files be retained alongside document data and snapshots?
  Unanswerable until `document_history` and `uploaded_files` mature.
- Can one document reference multiple supporting files, or only a primary one?
  V1 references none directly.
- What is the final canonical set of template families? The six cover the current
  slugs, but nothing validates a slug against a real template — a typo matching
  the family prefix is accepted until `document_templates` provides a registry.
- Should a document's previous body be recoverable? Today it is not: the audit log
  redacts the body and there is no versioning; editing loses previous contents
  until a print snapshot exists.
- Should `content` be searchable? V1 searches labels only; full-text search over
  personal financial data needs its own decision.
