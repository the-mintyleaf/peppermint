# CONCEPT — Search

Grounding file, adapted from `.backend/concepts/search.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **V1 built (2026-08-02).** Two read-only endpoints, nine searchable types.
> Four of the concept's open questions remain open; all four are recorded at the
> bottom of this file and none of them blocks a client.

## Purpose

Grandway spreads one person's information across many apps **by design**: a lead
becomes an applicant, the applicant grows a journey, the journey collects offers,
documents, files, and a checklist. That separation is correct — it is what
"Journey separation" and "Applicant-centred data ownership" protect — but it has a
cost at the front desk. Someone standing at the counter says a name, and the staff
member has to guess which list to open before they can type it.

This app removes the guess. **One box, one query, answers grouped by what kind of
record they are.** It is a _finder_, not a reporting or analytics surface: its
entire job is to get a person from a half-remembered name, phone number, or
filename to the record they actually wanted, in one step.

It **owns no data**. Every result is produced by the search selector of the app
that owns the row, and it is that composition — not any new query — that is the
whole of this app. The precedent is `dashboards`: no tables, no models, no
migrations.

## What this replaces in Grandway

Before this endpoint existed, the frontend implemented the same idea as a
**client-side fan-out**: `modules/admin/global-search/` fired one request per
domain at eight separate list endpoints on every keystroke and merged the
responses. That worked, but it put three things in the wrong place — the scoping
rules (the frontend decided which domains a role could query), the relevance
ranking (there was none), and the request cost (eight round trips per query).

The server-side endpoint moves all three back to the backend. **The one thing the
frontend must still own is routing**: `detail_path` on a hit is an **API** path,
and several searchable types have no frontend detail route at all.

## Actors

- **Admin** — searches everything the system holds, including files attached to
  documents and print snapshots.
- **Lead Manager** — searches the same box and gets the same _shape_ of answer,
  narrowed by the rules the owning apps already enforce: their own leads only, and
  no files belonging to Admin-only records. **They are not told a restricted record
  exists and was withheld** — it simply is not in the results.
- **Superadmin** — denied, as in every business app. Every route 403s, so the
  search box must be **hidden entirely** rather than shown and allowed to fail.

**An Admin and a Lead Manager calling the same URL with the same query will
legitimately see different totals.** That is the scoping working. Do not report it
as a defect and do not try to reconcile the numbers.

## Core concepts

There are no database entities. There are two conceptual ones:

- **Searchable type** — one kind of record the box can find. Each names the app
  that owns it, the fields a query is matched against, the permission key needed
  to open a result, and the list screen "see all" leads to. There are **nine**:
  lead, applicant, client, document, uploaded file, institution, program, document
  template, signatory.
- **Hit** — one found record, reduced to what a result row needs and **nothing
  more**: what it is, what to call it, one line of context to tell two similar rows
  apart, why it matched, and where to open it. A hit is deliberately **not a
  preview** — no status history, no personal detail beyond the identifying line,
  and no field the owning app would not already show in its own list.

## Key user flows

1. **Find a person at the counter** — type a name, phone number, or email; the box
   returns buckets; staff open the applicant.
   - Nothing matched → the screen says so **once**, not as nine empty sections.
   - Too many matched → each bucket reports its **true total** and shows the first
     few; "see all 43" opens the owning app's list already filtered by the same
     query.
2. **Find a file by its name** — someone remembers `passport-scan-final.pdf` but
   not whose it was. A Lead Manager searching a filename attached to a document
   record gets nothing, because that file is outside their visibility.
3. **Shortlist from the catalogue** — type an institution name while advising;
   "see all" opens the catalogue's own filtered list, where the real shortlisting
   filters live.
4. **Narrow a noisy search** — a common first name floods the people buckets, so
   staff restrict to one or two types. The same query returns only those buckets,
   and the cost of the request drops with them. `types=` is the **only** cost
   control a caller has: a full nine-type search is exactly 20 database queries.

## Screens the concept names

- **Global search bar** — persistent, in the application header, reachable from
  every screen. Typing opens a results panel **over** the current page rather than
  navigating away: the search is usually an interruption of other work, and losing
  that work to look someone up is the failure mode to avoid. A one-character query
  **is not sent**.
- **Results panel** — one section per **non-empty** type, in a **stable
  server-defined order**: people (applicants, leads, clients), then work
  (documents, files), then reference (institutions, programs, templates,
  signatories). Each section shows its name, its total, its first few rows, and a
  "see all N" link. Each row shows a title, a lighter subtitle, and a small label
  saying **which field matched**, so a person found by phone number does not look
  like a mysterious name match. **Empty sections are not rendered.**
- **Type filter chips** — built from the catalogue endpoint rather than hardcoded,
  so adding a type later does not require a frontend release.
- **Full results** — there is **no dedicated full-results screen and there should
  not be.** "See all" hands off to the owning app's existing list, which already
  has that type's real filters, sorting, and pagination. Building a second list
  view here would duplicate nine screens and immediately drift from them.

## Constraints / out of scope

- Owns no tables, models, or migrations.
- **Never widens access.** A result appears only if the owning app would have shown
  that row to that caller in its own list. Search must not become a side door
  around another app's scoping — the specific defect the dashboards app had to fix
  in its activity feed.
- **Read-only.** Nothing here creates, changes, or deletes anything, and searches
  are not audited.
- No search index, no separate search engine, no vector or semantic search, no
  ranking infrastructure. Matching is the trigram/`icontains` behaviour the owning
  apps already implement.
- **No cross-type relevance ordering.** An applicant's name score and an
  institution's name score are not on the same scale, so results stay **grouped by
  type rather than interleaved**. Within the `applicant` and `lead` buckets hits
  _are_ relevance-ranked (exact > prefix > substring).
- **Document contents, file bytes, and operator free-text notes are not searched.**
  Those fields hold personal financial and identity detail; making them reachable
  by guessing needs its own concept, not a side effect of a search box.
- **Journeys, offers, and checklists are not searchable types** and are not planned
  to be — none has a name of its own, and all are reached through the applicant.
- **Not an export surface.** Result limits are capped (`limit_per_type` 1–20); this
  cannot be used to walk the database.

## Open questions

- **Should a Lead Manager's search of the applicant, document, and catalogue types
  stay unnarrowed?** It currently does, because those apps do not narrow their own
  lists. This one matters to Grandway right now: the app's `documents` capability
  is `false` for that tier, so an unfiltered render would hand a Lead Manager
  document hits that dead-end in a forbidden panel. The client therefore sends a
  capability-derived `types=` allowlist rather than relying on the server to narrow.
- **Should searches be recorded in the audit log?** Reading is not audited anywhere
  in the project, but a search is a broader read than a list view.
- **Should the box match a partial phone number as it is typed, or only a complete
  one?** The owning selectors already substring-match; the question is whether that
  is desirable at three digits.
- **Is a search-as-you-type endpoint needed**, tuned tighter than the main query?
  Deferred until the results panel is in real use. Note the main query is rate
  limited to **60/minute on its own throttle scope**, which is what makes debounce
  non-optional.
