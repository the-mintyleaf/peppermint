# CONCEPT — Document Templates

Grounding file, adapted from `.backend/concepts/document_templates.txt` (with the
concept's own "Correction notes" applied — see below). Freeform prose; the formal
contract lives in `INTEGRATION.md`.

**Synced: 2026-09-10 (backend v1.2.0).** The 2026-07-25 sync described a signatory
whose signature was an external link and stated there was no upload. **That is no
longer true** — signature images are now uploaded to the file ledger. Every
statement to the contrary has been corrected below.

> **What the concept asked for and what was built diverge deliberately.** The
> original concept describes a versioned template-definition store with sections,
> field hints, signature slots, and previews. **None of that was built**, because
> the frontend called exactly one endpoint in this domain
> (`GET /signatories/?status=active`) and carried no template-definition model at
> all — its ~53 slugs are a hardcoded TypeScript union and its content shapes are
> compiled-in types. What exists is the **Signatory record** in full plus a **thin
> template catalogue** (key, family, label, display order, status). This file
> describes what was built; the un-built parts are flagged.

## Purpose

Document Templates owns the controlled configuration the documents workspace
depends on: the library of **signatory records** certificate documents point at,
and a **catalogue of template slugs** the document picker offers. It does not
store document bodies — it stores the names, signatures, and slug metadata that
tell the frontend what is _offerable_. The templates themselves are frontend
code; this module never describes how a document renders.

## Relationship to other records

A template is not a document, and it is not a snapshot.

- `documents` stores the current editable record and the chosen `template_key`.
- `document_history` freezes the exact template context used when a snapshot was
  created — the template key, version string, and resolved signatories go into
  each snapshot's `render_context`, so a snapshot reproduces itself **without
  reading this module at all**.
- `document_templates` owns the signatory library and the slug catalogue that the
  document workspace's picker draws from.

**The module holds no foreign key to `documents` in either direction, and is
consulted by neither.** It publishes two libraries that clients are trusted to
use — nothing validates the reference.

## Core entities

**Signatory record** — a stored person-and-signature record a certificate may
name. A signatory is **not** a system user and implies **no** login access. It
exists so certificate-style documents can point at an approved `name`, `title`,
`role`, and signature image. Fields: `name`, `title`, `role` (free text),
`signature_image_url`, activation `status`.

**Signature asset** — the image for a signatory, which can arrive **two ways**:

- **An uploaded file** (`signature_file`) — real bytes, posted to
  `POST /signatories/<id>/signature/` and stored in the `uploaded_files` ledger
  owned by the signatory. PNG/JPG/JPEG/WEBP only, 10 MB max, checked on both the
  extension and the leading bytes.
- **An external URL** (`signature_image_url`) — a plain link this API stores
  verbatim, never fetches, and never validates beyond well-formedness. Retained
  for backward compatibility and still honoured.

**An uploaded file always wins when both are present**, and the server says which
one did in `signature_source` (`"uploaded"` / `"url"` / `"none"`). Read that field;
do not re-derive the rule from `signature_file` being non-null — part of the
judgement is invisible to a client, because an archived or superseded file stops
counting and looks identical from the payload.

Removing a signature is **archiving its file** (`POST /api/v1/files/<file_id>/archive/`
on the file module). There is no removal endpoint here.

**Template key** — the concrete slug the frontend and `documents` use, e.g.
`student-cv-extended`, `woda-address`, `lor-kcmit`, `moi-vinayak`,
`bank-vyas-statement`. Unique and immutable once created.

**Template family** — the broad document class a template belongs to. Six
families: `student`, `woda`, `lor`, `moi`, `bank_statement`, `bank_certificate`.
The vocabulary is imported from `documents`, so a seventh can appear with no
change here — treat it as an open string.

**Activation state** — whether a template or signatory is `draft`, `active`, or
`inactive`. Every record is created `draft`; only `active` entries are offered
for new work; `inactive` (retired) entries remain readable for history but are
not offered.

## Not built (deliberately)

The following core entities and screens from the original concept **have no
backing endpoint** and none is planned:

- **Template definition / version chain** — no sections, field hints, signature
  slots, layout, or versioning. The templates are frontend code.
- **Template Editor** — backed only for `label`, `description`, `family`, and
  `display_order`. There is no structural editing.
- **Template Detail / Version History** — the detail read exists; there is no
  version chain, so no history to show.
- **Template Preview** — nothing renderable is returned.

Building any of these would mean inventing a schema no consumer reads and
guaranteeing drift from the templates that actually render.

## Key user flows

1. **Add a certificate signer** — an Admin creates a signatory (`draft`), uploads
   their signature image, then activates it so certificates can name them. The
   upload targets an existing signatory, so the record must be created first.
2. **Fill the instructor/director selects** — the document workspace loads
   `?status=active` signatories and stores the chosen **ids** in the document
   body. This is the one call the frontend makes into this module.
3. **Retire a signer** — mark them `inactive`. They vanish from the picker but
   every document naming them still renders their name, and they stay retrievable
   by id forever.
4. **Register / retire a template slug** — add a slug the frontend already
   supports to the catalogue (does not make it renderable), or retire a bank
   partner so the picker stops offering it without a frontend deploy.

## Permissions

**Admin only — reads included.** A `lead_manager` and a `superadmin` are both
refused with 403 on **every** route. This module holds **no applicant data at
all** — the rule is inherited from its consumer (a Lead Manager cannot open a
document workspace, so a signatory picker is a screen they can never reach), not
from the sensitivity of what it stores. **Hide these screens** for a Lead
Manager rather than rendering them read-only.

## No deletion

Never deleted. There is no `DELETE` on any route. Retirement is a status change;
a retired record stays retrievable by id so old documents and snapshots keep
resolving.

## Constraints / Out of scope

No editable document body or per-document data; no immutable print-snapshot
storage (that is `document_history`); no **byte storage of its own** — signature
uploads are delegated wholly to `uploaded_files`, and this module reimplements
none of that validation; no document workflow state; no signatory as a system
actor; no backend rendering engine; no deletion of history; and no Lead Manager
access.

## Two consequences worth designing around

**Signature bytes are Admin-only and audited.** `signatory` is one of
`uploaded_files`' admin-only owner types, so a Lead Manager gets 404 on a signature
file rather than 403. The download route is the project's only audited read and
forbids caching — **fetch each signature once per session and hold the object URL**,
or every render writes audit events.

**Replacing a signature rewrites the past.** `document_history` freezes a
signatory's `id`, `name`, and `role` into a snapshot, and **never the image**, so a
reprint resolves the signature live. Replacing a director's signature changes what
every historical certificate renders, beside a frozen historical name. The backend
calls this a known non-repudiation weakness; freezing the image at print time is a
client decision this API will not make.

## Open questions

- **Is the real slug count 42 or 53?** The frontend contract heads its list "42
  slugs" and then lists 53; the seed loads ~42. If 42 is right, ~eleven seeded
  rows would name templates the frontend cannot render, and the picker would
  offer them. **Unresolved.**
- **Should `documents` enforce the catalogue?** Today a `template_key` absent
  from it, or retired, is still accepted. Enforcing would narrow a shipped
  endpoint's accepted input and add a runtime dependency — deferred.
- **Should `documents` validate signatory ids?** Same shape, harder — it would
  mean parsing `content` per template shape, which that app refuses to do.
- **Should a template ever be renderable-but-not-offerable, or vice versa?** The
  catalogue and the frontend's union are maintained independently, so either can
  hold a slug the other lacks, with nothing reporting the mismatch.
