# Documents — outstanding backend asks (frontend side is built and waiting)

Written 2026-08-05 by the staff role-scoping work. The frontend for staff document
access is complete but **inert**: `LEAD_MANAGER_DOCUMENT_READ_ENABLED` in
`apps/grandway/config/access/capabilities.ts` is `false`, and every surface — the nav
entry, the applicant Documents tab, `ApplicantDocumentsPanel`, `OpenDocumentButton`,
the worklist and the editor — flips together when it becomes `true`.

Nothing below can be done client-side. Until both land, do not flip the flag.

---

## Ask 1 — Let a Lead Manager READ documents, scoped off the bank families

**Today:** `INTEGRATION.md` §1 — "`lead_manager` and `superadmin` are both refused 403
on every route, `GET` included. This is the strictest access model in the project and
the first where a Lead Manager is denied a _read_."

**Wanted:** `lead_manager` may read documents whose `family` is **not**
`bank_statement` or `bank_certificate`. `superadmin` stays refused. Writes
(create/update/status/archive/restore) stay Admin-only.

Specifically:

| Route                        | Wanted for `lead_manager`                                                        |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `GET /documents/`            | 200, **server-side excluding the two bank families** from results and from count |
| `GET /documents/<id>/`       | 200 for a non-bank family; **404 for a bank one** — not 403                      |
| `GET /documents/workspaces/` | Either refuse, or add a `family` filter — see the note below                     |
| Every write route            | unchanged (403)                                                                  |

**Why 404 and not 403 on a bank document:** a 403 confirms the document exists, which
is the disclosure §1 already argues against ("knowing _which_ applicants have bank
statements on file is itself disclosure"). The frontend already renders that case as
plain "not found" and never distinguishes the two.

**Why the exclusion must be server-side.** The list `family` filter takes one value and
has no exclude operator, so the frontend can only narrow by asking per family. It does
that (one tab per allowed family on the worklist, client-side filtering on the
single-fetch panels), but that is **ergonomics, not enforcement** — a hand-edited
`/documents/standalone/<id>` URL still reaches a bank document today. Only this scope
makes the boundary real.

**Workspaces roll-up.** `GET /workspaces/` returns a `document_count` computed across
all families, so a bank-excluded viewer would see a count that cannot match what opens.
The frontend currently keeps that screen Admin-only for exactly this reason. Either
leave it Admin-only, or add a `family` filter (or family-scoped counts) and we will
open it up.

---

## Ask 2 — Let a Lead Manager capture a document-history snapshot

**Today:** `document_history` snapshot capture is Admin-only, in line with documents.

**Wanted:** `POST /api/v1/document-history/documents/<id>/snapshots/` accepted for
`lead_manager`, on documents they may read.

**Why:** printing is not a read in this codebase. `useDocumentActions.handlePrintCurrent`
captures a snapshot and _then_ prints, so the audit record and the printed copy are
produced together. The product decision was that staff may print — which means they
must be able to capture, or printing would either fail or silently skip the audit
record. Keeping capture Admin-only would force one of:

- staff cannot print at all (loses most of the value of read access), or
- staff print without an audit record (worse than the write itself).

Recovering a snapshot back into the live document stays Admin-only — that is authoring,
and the frontend already gates it separately.

---

## What flipping the flag turns on

Once both land, set `LEAD_MANAGER_DOCUMENT_READ_ENABLED = true` and re-sync
`docs/backend/documents/`. A Lead Manager then gets:

- A "Documents → All documents" nav entry (never the workspaces roll-up).
- The applicant detail's Documents tab and the list row's open-document button.
- The worklist with one tab per non-bank family (no "All" tab — the server takes one
  `family` value, so "all four" is not expressible in a single request).
- The full-screen editor in read-only mode: a view-only banner, no add/edit/status/
  archive/recover, but print and save-snapshot intact.

Verify after flipping: sign in as a `lead_manager` and confirm no request is issued for
a bank family anywhere, including the spotlight, and that a bank document's id in the
standalone URL renders "not found".
