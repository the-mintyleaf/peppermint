# CONCEPT — Uploaded Files

Grounding file, adapted from `.backend/concepts/uploaded_files.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

`uploaded_files` is the single place for files that belong to the platform and
are attached to business records — the platform's file ledger. It owns the
whole file lifecycle — category, ownership, versioning, verification state,
replacement, rejection, archival, and restoration history — while every other
app keeps its own domain logic and only points at a file id. This is the first
and only place in Grandway where bytes are actually stored.

## Why it exists

The project overview requires file handling for applicants, education records,
journeys, offers, and documents — category, ownership, version, verification
state, replacement, rejection, archival, and restoration history, all in one
place. `uploaded_files` is that registry. It is **not** the document renderer —
the frontend still assembles document views, and `documents` /
`document_history` keep their own persisted/immutable state. This app is the
durable file layer underneath them.

## What it stores

Each uploaded file carries: a unique identifier, the owning record's type and
id, a file category, the original filename, a storage reference (never
returned to a client), MIME type and size, a checksum, an upload source, a
version number, its place in a replacement chain, verification state, a
rejection reason when relevant, archive state, and timestamps/audit metadata.

## Core relationships — the one-way rule

Files may be linked to applicants, journeys, offers, documents, or document
history snapshots (education records are named in the concept but have no
column yet — no `education` app exists). **The relationship is one-way**: a
file knows its owner; the owner does not know its files. There is no
"attach" field on `applicants`, `offers`, `documents`, or `document_history` —
every attach is `POST /api/v1/files/` with the owner id, and every panel is
`GET /api/v1/files/?<owner>=<id>`. Other apps store a reference to a file id
rather than embedding blobs or inventing their own file fields.

## Lifecycle

1. Upload a file.
2. Attach it to exactly one supported record (enforced by a database
   constraint, not just validation).
3. Review it — mark verified or rejected (a verdict may be revised later).
4. Replace it with a newer file when the applicant supplies a better copy.
5. Archive or restore it without losing the history chain.

**Deletion is not exceptional — it does not exist.** There is no delete
endpoint, no delete service, and no way to remove a file record or its bytes.
The system preserves traceability over time; archiving is the closest thing to
deletion and it is fully reversible.

## Ownership — exactly one record

A file belongs to exactly one business record — enforced by a database
constraint (`uploaded_file_single_owner`), not only a serializer. The same
scan attached to both an applicant and their journey is two separate rows
sharing a checksum, not one row with ambiguous ownership. Moving to
many-owners later is additive; moving back from many to one would not be.

## Versioning — a snapshot chain, not an overwrite

A replacement is a new row pointing back at its predecessor via `replaces`,
never a rewrite of the existing one. The predecessor keeps its bytes, its
verdict, and its rejection reason permanently — a rejected v1 sitting under a
pending v2 is normal and expected. The chain is linear (one `OneToOne` link),
so "which version is current" always has exactly one answer, and a file may be
replaced only once — to supersede again, address the current version. The
successor is always `pending`, even when the predecessor was verified, because
a re-scan is a different artefact that must be reviewed again.

## Verification — recorded, not enforced

Every file starts `pending`. An Admin marks it `verified` or `rejected`, with a
reason mandatory for rejection. **Verification gates nothing anywhere in
Grandway** — no endpoint refuses to proceed because a file is unverified. It
is a review record for humans, not a precondition a client may assume the
backend enforces.

## Access — split by duty, and split again by owner

Two authority levels:

- **Admin and Lead Manager** share list, read, edit (category/notes only),
  upload, replace, download, and version-history reads.
- **Only an Admin** may verify, archive, or restore. The split is deliberate:
  a Lead Manager is who sits with the applicant and receives the scan —
  gating that behind an Admin would push clerical work through an approval
  gate and get worked around. But if the uploader were also the reviewer,
  verification would record who uploaded a file rather than anyone's
  judgement, which is the one thing the field exists to prevent.
- **Superadmin has no access** to any route.
- **A file inherits the visibility of the record it belongs to.** Files owned
  by a `document` or a `document_history` snapshot are Admin-only in every
  respect, because those two modules are Admin-only on every route including
  reads. For a Lead Manager such a file does not appear in any list and every
  per-file route returns **404, not 403** — confirming it exists would leak
  exactly what those modules hide.
- Reads are otherwise **not owner-scoped** — any Admin or Lead Manager may
  read/download any file on any applicant, journey, or offer, regardless of
  assignment.

## No deletion

Nothing is deleted, ever. A file no longer in active use is archived (with a
mandatory reason) rather than removed, and restore reverses it completely —
the record keeps no trace that it was ever archived (that history lives in
`audit`, not on the file).

## UI screens & wireframe notes

- A **file list and filters**, embedded inside parent screens (applicant,
  journey, offer, document) rather than a standalone directory.
- A **file detail view** with metadata and lifecycle actions.
- An **upload flow**.
- An Admin-only **review queue** (`?verification_status=pending`).
- A **replacement history** view (oldest-first).
- **Archive and restore actions.**

The underlying state always comes from the same file ledger — a panel on an
applicant screen and the review queue are the same resource, filtered
differently.

## Boundaries / Out of scope

`uploaded_files` does not render documents, manage document template
definitions, own document business rules, duplicate applicant/offer/client
data, or silently remove historical records. `documents` keeps the persisted
document state, `document_history` keeps immutable snapshots, and
`document_templates` keeps template metadata and signatory records —
`uploaded_files` is the shared storage and lifecycle layer those apps (and
`applicants`, `applicant_journeys`, `offers`) reference by file id.

## Resolved questions

- **Which file categories are required in v1?** Eleven: passport, photograph,
  academic transcript, academic certificate, test score report, offer letter,
  financial, sponsorship, signature image, generated document, other.
- **Can a file belong to more than one business record?** No — exactly one,
  enforced in the database. Attaching the same scan to two records means two
  rows sharing a checksum.
- **Do generated PDFs live here immediately?** Yes, in principle — the
  `generated_document` category and `system_generated` source both exist and
  work — but `document_history` does not yet call this app, so nothing
  connects a snapshot to a generated file today.
- **Which categories require verification before use?** None — verification
  gates nothing anywhere in the product.

## Still open

- Which assets move from URL-based references (`clients.logo_url`,
  `document_templates.signature_image_url`) into this app first.
- Whether education/test-score records get their own owner type once those
  apps exist (transcripts currently attach to the applicant and will not be
  re-pointed automatically).
- Whether there should be a concept of "the primary" file per category (today,
  "newest current one" is a client-side convention, not a backend rule).
