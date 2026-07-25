# CONCEPT — Clients

Grounding file, adapted from `.backend/concepts/clients.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **V1 built (2026-07-24).** All five of the concept's open questions were
> settled; where the build departed from the concept the departure is
> authoritative: **one inline spokesperson** (not a contact table), **two-value
> status** (`active`/`inactive`, no `paused`), the **logo is a URL** (not an
> upload), **reads are shared / writes are Admin-only**, and **attribution is not
> built** — the one flow in the concept with no endpoint behind it.

## Purpose

The Clients module keeps the consultancy's B2B partner directory in one place. It
records the companies, agencies, schools, and partner organizations that send or
refer applicants, along with the basic contact and identity details staff need to
work with them consistently. **This is not a sales CRM** — no pipelines, deals,
commissions, tasks, or communication inbox. It is a compact reference directory
for relationship management, browsed far more than it is edited.

## Relationship to other records

A client is a business organization, not an applicant and not a lead. The client
record stores the consultancy's external partner identity; leads and applicants
remain person records. If a lead or applicant came through a client, that
relationship is meant to be represented as a _reference_, not by copying the
client's details into the person record.

**The important caveat: that reference does not exist yet.** The concept describes
clients as "especially useful for tracking where referred leads originate", but
nothing in the project consumes the directory — there is no `client` field on a
lead or applicant, no `?client=` filter, and no referral report. The directory is
an **island**: it depends on no business app and no business app depends on it,
the only module in the project with no cross-app edge in either direction. See
`INTEGRATION.md` §9 — do not build UI that implies attribution works.

## Actors

**Read-shared, write-Admin-only.** Every Admin and Lead Manager may **read** the
directory — looking up who to call at a partner is the whole point, and a
directory only Admins can open is a phone list in a drawer. But **only an Admin
may create, edit, retire, or restore** a client: the records are _shared reference
data_, so a single careless edit to a spokesperson's number silently changes who
every Lead Manager calls. The blast radius, not the sensitivity of the data,
narrows the write right. **Superadmin is denied outright, reads included** — it is
a platform authority that manages accounts and does not participate in operations.
This is the same split as `institutions`, and only the second app in the project
to use it — do not assume it elsewhere.

## Core entities

- **Client** — the business organization being tracked: company/agency name,
  current status, spokesperson (name + designation), the organization's email,
  contact numbers, address, website, logo, and notes.
- **Client contact** — the named person the consultancy communicates with at the
  partner. In V1 this is represented **directly on the client record** as one
  inline spokesperson (name + designation), not a separate contact table.
- **Contact numbers** — a small child table, because an organization realistically
  has a landline and two mobiles while it has exactly one person you ask for.
  Managed as a replacement set through the client payload, never on their own.
- **Availability / status** — whether the client is `active` or `inactive`. A
  client is **never deleted** just because the relationship paused or ended; it is
  retired with a mandatory reason and kept forever.

## Lifecycle

A client is **created** by an Admin with at minimum a `name` — everything else,
including the spokesperson and any number, is optional, because a partner may be
an organization you deal with before you know who to ask for. Details are
**corrected** through partial updates that record each changed field's previous
and new value in the audit log (this is where "the previous value should remain
traceable" is met — there is no version history to browse). A partner the
consultancy has stopped working with is **retired** — `status: inactive` with a
mandatory reason — and later **restored** for further work. **Nothing is ever
deleted:** a client that should not have existed is retired, not erased, and a
retired client stays in the directory and in unfiltered results.

## History

Records created, changed, retired (with reason), and restored — never silently
rewritten or removed. Restoring **clears** the denormalized retirement fields but
does **not** erase the retirement from history: `client_retired` and its reason
stay in the audit log forever, which is where "have we worked with them before,
and did it end badly?" is answered. A **contact-number change is recorded only as
a marker** (`{ from: "replaced", to: "N number(s)" }`), not a before/after list —
you cannot recover which number changed.

## UI screens & wireframe notes

- **Client List** — a searchable directory of all client organizations. Columns:
  company name, primary spokesperson, email or phone, status, last-updated.
  **Ordered alphabetically by name** — not newest-first, the opposite of every
  other list in the project. Rows carry `primary_contact_number` and `email`, so a
  phone-and-email directory needs no per-row detail fetch. Primary action: add
  client (**hidden/disabled for a Lead Manager**).
- **Client Detail** — the full record: identity, contact information, logo,
  website, address, notes, status, and a **history/audit-trail panel** (readable
  by a Lead Manager). If `is_active` is false, show it — a badge and a muted row —
  but the record and its numbers stay readable. Primary actions: edit, retire, or
  restore (**Admin-only**).
- **New / Edit Client Form** — intentionally small and practical: company name,
  spokesperson, contact numbers, email, address, website, logo, notes. Only
  `name` is mandatory. The edit form must **send only changed fields** — sending
  `status` back is a 400 — and treat contact numbers as a replacement set.

## Constraints / Out of scope

No lead management (clients may be referenced by leads, but do not replace them);
no applicant management; no pipeline, deal, or commission tracking; no task
assignment or communication inbox; no document generation or contract workflow;
no deletion of historical records (inactive clients are retained); no complex
multi-contact CRM structure in V1. The logo is a URL, not an upload. There is no
`client_type`, no duplicate detection, no structured address, and no bulk import.

## Open questions

Settled in V1: **one inline spokesperson** (not a multi-contact table); **read by
both, write by Admin only** (Superadmin denied); **no referral statistics here**
(attribution belongs to `leads` and is not built); **logo is a `logo_url` field**,
not an upload; **two-value status** (`active`/`inactive`) with the nuance carried
by the mandatory retirement reason rather than a `paused`/`archived` enum.

Still open:

- When should `leads.Lead` gain a `client` reference, and should `applicants` get
  one too or inherit it through the lead? Until then, attribution is unbuildable.
- Should a client have a type (agency / school / partner company)? The prose names
  all three but the field list omits a type, so V1 has none and they cannot be
  filtered apart.
- Should the directory warn about a probable duplicate on create? Two clients may
  currently share a name, email, and phone number with no warning.
- Is a bulk import needed for the initial directory, or is one-at-a-time entry
  acceptable?
- Should a retired client be excluded from pickers automatically, or is that a
  presentation choice left to each screen? The API returns both by default.
