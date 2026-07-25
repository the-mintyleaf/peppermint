# CONCEPT — Document History

Grounding file, adapted from `.backend/concepts/document_history.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

Document History owns Grandway's immutable document snapshots. It records what a
document looked like at a specific moment, who captured that state, and why. The
`documents` app is the editable working record; `document_history` is the frozen
record of what was printed, saved to history, or later reprinted. This is the
layer that makes a document's previous state recoverable without turning the
working record into a version-control system.

The module exists because document work in Grandway is not just "edit and save."
Staff need to know what was shown at print time, what was issued, and which
version of a document a client or institution actually received.

## Relationship to other records

A print snapshot is not the same thing as a document. The `documents` app owns
the current editable body: identity, ownership, template association, status,
and source data. `document_history` owns the immutable copies of that body plus
the render-time context needed to reproduce what the frontend showed. It must
never rewrite the working document, and the working document must never silently
rewrite history.

`document_templates` supplies the template family, version, and signatory
metadata used when a snapshot was produced — the ids frozen into a snapshot's
render context now resolve against it, though this module depends on it in
neither direction. `uploaded_files` may hold generated PDFs and can be referenced
from the file's side once a client stores one; the snapshot itself remains the
authoritative historical record even if no file is retained.

## Core entities

**Print snapshot** — the immutable copy of a document at print or
save-to-history time: document id, family, template key, label, source data
(`content`), frontend render context, and the metadata needed to understand
exactly what was issued. Snapshots are append-only and never edited in place.

**Print event** — the action that produced or reused a snapshot: who triggered
the print, save, reprint, or recovery, when, and what kind of capture it was. A
document may have many print events over time.

**Version chain** — the ordered series of snapshots for one document. Each new
print or saved history entry creates a new point in the chain; older entries
remain visible and unchanged. A reprint or recovery does **not** grow the chain.

**Recovery payload** — the data returned when staff recover a previous snapshot
into the working document. This is not a rewrite of the historical record; it is
a source of truth the `documents` app uses to write a new working state. In this
module the recovery is a direct endpoint, not a payload the client re-applies —
it writes the frozen `label` and `content` forward through the documents app's
own update service and returns the updated `Document`.

**Generated file reference** — an optional pointer to a generated PDF, named as a
core entity in the source concept but **deliberately not built here**. A snapshot
has no file field; if a PDF is retained it lives in `uploaded_files`, and only
that module knows it exists.

## The content / render-context split

A snapshot freezes two things. `content` is the input fields — exactly what
`documents` stores, copied byte-for-byte from the committed row. `render_context`
is everything the frontend calculated or resolved at render time: the running
balances, totals, closing balance, and amount-in-words under
`render_context.computed`, plus the template version and the resolved
signatories. This is the one place in Grandway where a derived value is stored on
purpose — the values `documents` forbids you from persisting are exactly what you
must freeze here.

The split is load-bearing for reliable recovery and is a **convention the backend
does not enforce**: a client that puts a computed closing balance in `content`
will have it frozen there silently. No markup or rendered HTML is stored — it is
unbounded, duplicates data already held, and would be an injection liability if
anything served it back.

## Key user flows (product intent)

1. **Capture a snapshot** — an Admin reviews the rendered document, prints or
   saves it to history, and the module stores an immutable snapshot of the
   current committed state including render context. Frontend-computed values are
   frozen, not recomputed later.
2. **Review history** — an Admin opens a document's timeline, sees every snapshot
   and print event in order, and opens one snapshot to inspect what was issued.
   The timeline distinguishes reprints and recoveries from original captures.
3. **Recover a prior version** — an Admin selects an older snapshot and recovers
   it; the module writes the frozen body forward into `documents`, creating a new
   working state without altering the snapshot.
4. **Reprint the same issue** — an Admin reuses a past snapshot; the module
   records a new print event linked to the same lineage and the frontend
   regenerates output from the saved snapshot context. A reprint is new activity,
   not a body rewrite.

## UI screens & wireframe notes

**Document History Timeline** — the main history view, opened from the documents
workspace. A chronological list of snapshots and print events for one document.
Each row shows time, actor, `event_type`, and a short label or version marker.
Distinguishing an original capture from a reprint or recovery is the screen's
stated purpose.

**Snapshot Detail** — one frozen snapshot in full: document identity, template
context, rendered metadata, source data, and any generated-file reference. This
is **read-only, permanently** — there is no edit endpoint to hide behind a
permission. Render the snapshot's own `label` and `render_context.computed`,
never the document's current values.

**Compare Snapshots** — a side-by-side view of two historical versions of the
same document, backed by two snapshot fetches and a client-side diff. There is no
compare endpoint.

**Recover Snapshot Dialog** — a focused confirmation step that returns a prior
snapshot to the documents workspace as the starting point for a new working
version.

## Permissions

**Admin only — reads included.** A Lead Manager and a superadmin receive 403 on
every route here, including `GET`. The panel must be **hidden** for a Lead
Manager, not rendered read-only or shown empty — a snapshot holds the same bank
statement the working document does. This matches the `documents` module, which
this one inherits its access rule from; it publishes no security decision of its
own.

## Constraints / Out of scope

No editing of existing snapshots, no deletion of historical snapshots, no
replacement of the live document workspace, no template authoring or rendering
engine, no recomputation of display-only values once a snapshot is stored, and no
assumption that a generated PDF must exist (the snapshot is the record, the file
is optional). The history timeline is per-document only — there is no
document-family or cross-document view.

## Open questions

- Should the timeline gain a document-family or date-range view for Admin review?
  Deferred; both list endpoints are per-document today. `audit`'s event list
  (`?app=document_history`) is the nearest substitute and returns audit events,
  not snapshots.
- Should generated PDFs be retained? Now answerable and still unanswered:
  `uploaded_files` exists, carries a `generated_document` category, and accepts a
  snapshot as an owner — retention is a product decision, not a missing
  capability. What is still absent is any _automatic_ retention and any reverse
  pointer from a snapshot to an uploaded file.
- What exact fields must be frozen per document family for reliable recovery
  stays open by design — the backend freezes the whole body verbatim rather than
  a per-family list. The unresolved half is that nothing enforces the
  `content` / `render_context` split.
- `render_context` has no schema and no version gate — if the client's shape
  changes, older snapshots keep the old one and nothing migrates or warns.
