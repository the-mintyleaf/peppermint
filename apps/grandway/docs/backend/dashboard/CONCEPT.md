# CONCEPT — Dashboards

Grounding file, adapted from `.backend/concepts/dashboards.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

`dashboards` is the operational command centre for Grandway. It owns no business
data; it summarises the current state of the platform so staff can see what
needs attention now, what is moving, and where the process is stuck. The source
of truth lives in the domain apps — applicants and journeys hold the people and
study plans, documents and uploaded files handle document work, offers hold
admission decisions, checklists hold outstanding work, and audit holds the trace
of important actions. The dashboard pulls the most useful signals from those
areas and presents them in one place.

## What it emphasises

Action, not vanity. The best content is work that is overdue, work due soon,
work waiting on a person, work blocked by a missing document/file/offer/checklist
item, pipeline movement across leads/applicants/journeys, workload by staff
member, and final outcomes that show whether the operation is converting. Raw
totals with no action, data already visible in a list view, and charts that look
good but change no decision are deliberately avoided.

## The six content areas

**Today's work** — the first screen: overdue tasks and deadlines, documents
waiting for completion or review, checklist items past due, offers waiting for a
response, files awaiting verification or replacement. The most useful part,
because it supports immediate action.

**Pipeline health** — the active flow through the business: new and qualified
leads, applicants in progress, journeys active by stage, offers by decision, and
documents by status. Shows whether the pipeline is moving or stalling.

**Blockers and risk** — risk surfaced before it becomes a missed outcome:
missing documents, overdue checklist items, expired or expiring offers,
time-sensitive expiries (passport, where the record exists), and rejected files.
The most visible section, because it prevents avoidable delays.

**Workload by owner** — how work is distributed: open items per Lead Manager,
pending checklist items per assignee, offers awaiting response per owner. Helps
managers rebalance rather than only count volume.

**Source and conversion** — the health of intake: lead sources, conversion by
source, and the conversion rates between each pair of stages (lead → applicant →
journey → offer, plus offer acceptance).

**Final outcomes** — results over time: accepted/deferred/rejected offers,
completed journeys, archived or closed records, active versus inactive workload.
A high-level picture for leadership without drilling into every record.

## Recommended reading order

Top-line counts and alerts → overdue and due-soon actions → pipeline movement →
blocked work → workload by owner → source and conversion trends → recent
activity. Urgent work before reporting.

## Filters

One shared filter bar narrows the same underlying data rather than creating
separate dashboards per role. The concept asks for date range, branch, Lead
Manager, journey stage, institution, destination country, offer status,
document status, and checklist status — but see **Not buildable yet** and the
`INTEGRATION.md §9` gaps: several of these are accepted-but-ignored, and branch
does not exist at all.

## Drill-down

Every metric leads somewhere useful — an overdue count opens the underlying
worklist, a document count opens the documents workspace, an offer count opens
the offers list, a workload card opens the assigned records. The dashboard is
only useful if it gets staff to the next action quickly. Each row carries the ids
needed to navigate, but there is no contract for which query parameters reproduce
a section's filtering on the destination list (see `FLOWS.md`).

## Boundaries

The dashboard owns no leads, applicants, documents, offers, or checklists; it
mutates no business state; it is not a reporting warehouse; and it never hides
the source record behind an opaque summary. Every number is derived at read time
from the domain apps — no stored counter, no nightly rollup, no cache. Each
summary query lives in the app that owns the records it counts; the dashboard
composes those results and never reaches into another app's tables directly.
Read-only for now — quick-create actions are not included.

## Actors and access

**Admin** — sees every metric across the whole consultancy. The workload section
shows every staff member's row.

**Lead Manager** — calls the same endpoints and gets the same sections, narrowed
to what they may already see elsewhere. Leads are owner-scoped, so their lead
counts, source mix, and conversion rates cover only their own leads, and the
workload section shows only their own row. Applicants, journeys, offers,
checklists, documents, and files are shared across the consultancy, so those
numbers are not narrowed.

**Superadmin** — denied. It is a platform authority that manages Admin accounts
and does not participate in consultancy operations — the same rule every other
business app applies.

The dashboard never widens what an actor can see. A number a Lead Manager cannot
drill into is a number they should not have been shown. An Admin and a Lead
Manager can therefore see different numbers at the same URL.

## Not buildable yet

Three things this concept asks for have nothing behind them in the backend and
are deliberately absent rather than faked with placeholder zeroes:

- **Appointments** — there is no appointments app, so "upcoming appointments" and
  "appointments missed or about to occur" ship as nothing.
- **Notifications** — there is no notifications app, so there are no pending
  alerts to summarise.
- **Branch** — no branch or office concept exists anywhere in the backend, so the
  branch filter cannot be built; it needs a field on the user account or its own
  app first.

Test and other time-sensitive expiries are only partially available: passport
expiry exists on the applicant record, but test scores are not yet a module.

## UI screens & wireframe notes

**Dashboard home** — the single screen the sections compose into, read in the
Recommended-order above. Every section loads independently, so a slow panel never
blocks the rest of the page. One shared filter bar sits at the top and applies to
every section at once (subject to the ignored-filter caveats above).

**Filter bar** — date range, fiscal year, destination country, journey stage,
owner, institution, offer status, document status, checklist status, and a "due
within N days" control for the due-soon horizon.

**Alert strip** — the top-line counts. Each is a number plus a label plus a
destination — never a number alone.

**Today's work** — a worklist, not a chart. Rows carry the applicant's name,
what is due, when it was due, and who owns it. Paginated at the preview cap.

**Pipeline health** — stage and status counts for leads, applicants, journeys,
offers, and documents, each count linking to that app's pre-filtered list view.

**Blockers and risk** — the most visible section. Grouped by cause, each group a
short list of the actual records, not a total.

**Workload by owner** — one row per staff member, columns for open leads,
pending checklist items, and offers awaiting response. A row opens that person's
assigned records.

**Source and conversion** — intake mix and the conversion rates between each pair
of stages, for the selected period.

**Final outcomes** — journey outcomes, offer decisions, and archived or closed
volumes for the selected period.

**Recent activity** — a paginated feed read from the audit trail.

## Constraints / Out of scope

No owned data and no writes; no stored counter, nightly rollup, or reporting
warehouse; no cache (every section queries live); read-only with no quick-create
actions; no appointments, notifications, or branch concept; no test-score
expiries; and it does not replace list views, workflow screens, or reporting
exports.

## Open questions

- Whether different roles need different default dashboard layouts.
- Which metrics should be visible on day one versus later.
- Whether charts are needed beyond summary cards and worklists.
- How much historical trend data should be retained in the UI.
- Whether the dashboard should include quick-create actions or stay read-first.
