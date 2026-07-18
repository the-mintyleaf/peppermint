# Work — Frontend Reshape Decisions

> Companion to `work.md` (the API contract digest). Records how the MintFlow UI
> adapts to the **real** backend `work` domain (faithful reshape, full-domain phased).
> Decided with the user 2026-07-18. Builders read this before wiring any work surface.

## Global decisions

1. **Faithful reshape.** The UI adopts the real domain: `reference_number`, `current_owner` +
   `responsible_unit`, real `WorkStatus`/`TaskStatus` enums, `visibility_mode`/`sensitivity_level`,
   `review_required`, BS+Gregorian dates, `aggregate_version` concurrency, and named-command actions.
   Mock-invented fields are dropped (below).

2. **Actor/unit name resolution — fetch from auth/org.** Work responses carry opaque UUIDs only. Resolve
   them for display via cached lookups against **`/api/v1/auth/users/`** (owner/assignee/creator/reviewer →
   `display_name`, `username`) and **`/api/v1/organization/units/`** (`responsible_unit` → unit name).
   Reuse the DTO shapes already defined in the sibling apps —
   `apps/mintway/modules/admin/authenticate/users/users.types.ts` (User) and
   `apps/mintflow-admin/modules/admin/organization/_shared/organization.types.ts` (`OrganizationUnit`) — do
   not re-invent them. Build a small shared resolver (proposed `lib/work/` or a `useActorNames`/`useUnitNames`
   hook) that batches ids and caches via React Query.
   - **Dependency added:** the mintflow client now reads `auth` + `organization`. Assumes the client
     account has read access to those endpoints (per user decision). If a lookup 403s, degrade to a compact
     id/initials placeholder — never block the work view on a name lookup.

3. **Dropped mock concepts (no backend source).** Remove `category` (criminal/harassment/…), `location`,
   and `departments` from the cases model and UI. Remove the mock **Files** sub-view
   (`CaseFile`/`MOCK_FILES`/`FileCard`/`FileRow`) and remap it to the real **Attachments + Evidence** lists:
   - Evidence: `text_statement`/`external_reference`/`structured_payload`/`generated_output`/`approval_record`/
     `communication_record` are live; file-backed (`document_reference`/`image_reference`) renders
     **disabled-with-explanation** (gated `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`).
   - Attachments: list is readable; creation is gated (503) → disabled control + tooltip.

## Per-surface mapping

| Surface                      | Backend source                                                                                                                                               | Reshape notes                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cases list (`/cases`)        | `GET /items/`                                                                                                                                                | Card/row shows `reference_number`, resolved owner, resolved unit, real `WorkStatus` badge, `WorkPriority`, `due_at`(+bs). Tabs re-derived from real `WorkStatus`. Filters map to `?status/priority/responsible_unit/fiscal_year/overdue`. Files rail removed. |
| Case profile (`/cases/[id]`) | `GET /items/{id}/` + `/tasks/` + `/activities/` + `/reviews/` + `/evidence/` + `/attachments/` + `/participants/` + `/stakeholders/` + `/hierarchy-preview/` | WorkDetail = real fields; TaskStrip = real task tree; ActivityTimeline = `WorkActivityEntry` (immutable + corrections); WorkTabs gains Evidence/Attachments/Review/Closure/Participants/Stakeholders.                                                         |
| Tasks (`/tasks`)             | `GET /items/{id}/tasks/`, `/tasks/{id}/`                                                                                                                     | Kanban columns = real `TaskStatus` (11), not mock done/in_progress/pending; commands = named endpoints; reorder = `POST .../tasks/reorder/` with `expected_version`.                                                                                          |
| Calendar (`/calendar`)       | tasks/work by `due_at`                                                                                                                                       | Lay out `WorkTask`/`WorkItem` by `due_at`; show BS date.                                                                                                                                                                                                      |
| Dashboard (`/dashboard`)     | `/my/active/`, `/my/pending-assignments/`, `/my/pending-reviews/`, `/units/{id}/queue/`, `/units/{id}/hierarchy-overview/`                                   | Unit endpoints need the actor's led-unit ids (source: `/organization/memberships/mine` or `/organization/actor-context/` — confirm in P5). No per-work metrics endpoint (facts are a backend selector only).                                                  |

## Status → badge intent (color tokens chosen per module presentational map, not here)

- Neutral/early: `assignment_pending`, `accepted`, `not_started`
- Active: `in_progress`
- Attention: `blocked`, `changes_requested`, `returned_uncompleted`
- Review/closure gates: `review_pending`, `closure_pending`
- Terminal: `completed`, `closed`, `cancelled`, `archived`

## Open items carried into later phases

- **Unit-leadership source** for dashboard unit endpoints (Gap #5) — resolve in P5 via
  `/organization/memberships/mine` or `/organization/actor-context/`.
- **`document_id` contract** for file-backed evidence/attachments is unpinned (gated regardless) — revisit
  when a document foundation exists.
- **Cursor-pagination cutover** for large timelines is a documented policy without a fixed row count — handle
  a possible `next`-cursor defensively.
