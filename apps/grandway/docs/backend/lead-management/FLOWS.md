# FLOWS — Leads

**Owner app:** `leads`
**Synced:** 2026-07-23, adapted from `.backend/concepts/leads_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> Screen names below are proposed (the backend's own flow file notes they
> aren't sourced from a wireframe spec) — treat as a starting vocabulary, not
> a fixed IA. Grandway's actual module uses one route with tabs/drawers/modals
> rather than the separate screens implied below; see the module plan.

---

## Flow: Record a new enquiry

**Actor:** Lead Manager (or Admin) · **Goal:** capture someone who just contacted the consultancy.

1. Populate the source picker → `GET /api/v1/leads/sources/` (`leads.source.list`)
   - Empty array → a Lead Manager can't resolve this; block submission, "Ask an Admin to configure lead sources."
   - `LEADS_ACTOR_FORBIDDEN` → signed-in account is Superadmin; this module isn't available to it at all.
2. User picks a source flagged `requires_detail` → no call; reveal a required "Please specify" field bound to `source_detail`.
3. Submit name + ≥1 contact number (+ optional study interest) → `POST /api/v1/leads/` (`leads.lead.create`)
   - Creates at stage `new`; one `lead_created` history entry.
   - `LEADS_SOURCE_DETAIL_REQUIRED` → inline error under "Please specify."
   - `LEADS_CONTACT_REQUIRED` → inline error on the contact-number repeater.
   - `LEADS_SOURCE_INACTIVE` → source was retired mid-form; re-fetch sources, ask user to re-pick.

## Flow: Work a lead through follow-up

**Actor:** Lead Manager (own) or Admin (any) · **Goal:** move a lead along as contact happens.

1. `GET /api/v1/leads/?stage=new` (or any single-stage filter) — same endpoint serves both scopes: a Lead Manager sees only their own, an Admin sees all.
2. `GET /api/v1/leads/<lead_id>/` (`leads.lead.read`) — `LEADS_LEAD_NOT_FOUND` → generic not-found, **never** "you don't have access" (deliberately indistinguishable from "not yours").
3. Change stage → `POST /api/v1/leads/<lead_id>/stage/` — dropdown offers only the 6 selectable stages. `LEADS_STAGE_NOT_EDITABLE` → lead is terminal; swap the control for a "Reopen" action.
4. Record follow-up (optional note + optional stage) → `POST /api/v1/leads/<lead_id>/follow-up/` — this records contact that already happened; do not build a "schedule next follow-up" control.
5. Add a standalone note → `POST /api/v1/leads/<lead_id>/notes/` — append-only, no edit/delete affordance.

## Flow: Close an enquiry that will not proceed

**Actor:** Lead Manager (own) or Admin (any) · **Goal:** record that the person isn't proceeding, and why.

1. Populate the reason picker → `GET /api/v1/leads/loss-reasons/` — empty array → block the dialog, a reason is mandatory.
2. User picks a reason flagged `requires_detail` → reveal a required explanation field.
3. Confirm → `POST /api/v1/leads/<lead_id>/lost/` — stage becomes `lost`; the lead stays in the list, never removed/archived.
   - `LEADS_LOSS_DETAIL_REQUIRED` → inline error on the explanation field.
   - `LEADS_LOSS_REASON_INACTIVE` → re-fetch, ask user to re-pick.
   - `LEADS_STAGE_NOT_EDITABLE` → someone else already closed it; refresh and show current state.

## Flow: Revive a closed enquiry

**Actor:** Lead Manager (own) or Admin (any) · **Goal:** bring a lost (or converted) lead back without erasing what happened.

1. Optionally choose the landing stage (default `follow_up`) → `POST /api/v1/leads/<lead_id>/reopen/` — clears all 5 loss fields; does **not** clear `converted_at`/`converted_by`.
   - `LEADS_LEAD_NOT_LOST` → already active; refresh and hide the button.
2. History still shows the original `lead_marked_lost` entry alongside the new `lead_reopened` one — reopening never erases history, and reopening a converted lead never undoes the conversion (keep any applicant link visible).

## Flow: Convert a lead into a client

**Actor:** Admin only · **Goal:** turn a qualified enquiry into a client with an applicant record and an initial study objective.

1. `GET /api/v1/leads/<lead_id>/` — confirm the lead is in an active stage. Any active stage qualifies; `ready_for_conversion` is a signal, not a gate.
2. "Convert to Applicant" → `POST /api/v1/leads/<lead_id>/convert/` (`leads.lead.convert`), empty body — creates an `Applicant` (`creation_source: lead_conversion`) plus a seed `ApplicantJourney` (`creation_source: lead_conversion`, seeded from `study_interest`) **(cross-app: `applicants`, `applicant_journeys`)**, links both onto the lead, moves the lead to terminal stage `converted`.
   - Returns `{ lead, applicant_id, journey_id }` — navigate straight to the new applicant using `applicant_id`, no extra fetch needed.
   - `LEADS_ACTOR_FORBIDDEN` → the caller is a Lead Manager or Superadmin; hide the action entirely for non-Admins.
   - `LEADS_LEAD_ALREADY_CONVERTED` → read `converted_applicant_id` off the lead and navigate there instead of retrying.
   - `LEADS_CONVERSION_NOT_READY` → the lead is lost or already converted; reopen it first.
3. `GET /api/v1/leads/<lead_id>/` — now `stage: converted`, with `converted_applicant_id`/`converted_journey_id` populated; render a link to the applicant instead of the stage badge.

## Flow: Configure the pickers

**Actor:** Admin only · **Goal:** maintain the source/loss-reason lists the whole team picks from.

1. List both, including retired → `GET /leads/sources/?include_inactive=true` + `GET /leads/loss-reasons/?include_inactive=true` — only this settings screen passes `include_inactive=true`; every other picker omits it.
2. Add an entry → `POST /leads/sources/` or `POST /leads/loss-reasons/` — Admin only. `LEADS_ACTOR_FORBIDDEN` → hide this screen from non-Admins entirely. `LEADS_SOURCE_CODE_TAKEN`/`LEADS_LOSS_REASON_CODE_TAKEN` → the clash may be with a retired entry.
3. Retire an entry → `PATCH .../<id>/` with `is_active: false` — no delete exists; offer "Retire," never "Delete."

_(Out of scope for this module's v1 build — no admin source/reason management screen is planned; only the list reads are consumed for pickers.)_

## Flow: Review a lead's full story

**Actor:** Lead Manager (own) or Admin (any) · **Goal:** understand how a lead reached its current state.

1. `GET /api/v1/leads/<lead_id>/history/` (backed by `audit`) — render `summary` as the primary label, `changes` as a from→to detail when present.
2. `GET /api/v1/leads/<lead_id>/notes/` — note **text** lives only here; history records that a note was added, never its content.

---

## Endpoint coverage

| Policy key                   | Method / path                            | Used by flow(s)                              |
| ---------------------------- | ---------------------------------------- | -------------------------------------------- |
| `leads.source.list`          | `GET /api/v1/leads/sources/`             | Record a new enquiry; Configure pickers      |
| `leads.source.create`        | `POST /api/v1/leads/sources/`            | Configure pickers (Admin only, not in v1)    |
| `leads.source.update`        | `PATCH /api/v1/leads/sources/<id>/`      | Configure pickers (Admin only, not in v1)    |
| `leads.loss_reason.list`     | `GET /api/v1/leads/loss-reasons/`        | Close an enquiry; Configure pickers          |
| `leads.loss_reason.create`   | `POST /api/v1/leads/loss-reasons/`       | Configure pickers (Admin only, not in v1)    |
| `leads.loss_reason.update`   | `PATCH /api/v1/leads/loss-reasons/<id>/` | Configure pickers (Admin only, not in v1)    |
| `leads.lead.list`            | `GET /api/v1/leads/`                     | Work a lead; the dashboard's aggregate fetch |
| `leads.lead.create`          | `POST /api/v1/leads/`                    | Record a new enquiry                         |
| `leads.lead.read`            | `GET /api/v1/leads/<id>/`                | Work a lead; Close; Revive; Review           |
| `leads.lead.update`          | `PATCH /api/v1/leads/<id>/`              | Edit Lead form (correction path)             |
| `leads.lead.change_stage`    | `POST /api/v1/leads/<id>/stage/`         | Work a lead through follow-up                |
| `leads.lead.record_followup` | `POST /api/v1/leads/<id>/follow-up/`     | Work a lead through follow-up                |
| `leads.lead.mark_lost`       | `POST /api/v1/leads/<id>/lost/`          | Close an enquiry                             |
| `leads.lead.reopen`          | `POST /api/v1/leads/<id>/reopen/`        | Revive a closed enquiry                      |
| `leads.lead.convert`         | `POST /api/v1/leads/<id>/convert/`       | Convert a lead into a client                 |
| `leads.note.list`            | `GET /api/v1/leads/<id>/notes/`          | Review a lead's full story                   |
| `leads.note.create`          | `POST /api/v1/leads/<id>/notes/`         | Work a lead through follow-up                |
| `leads.lead.list_history`    | `GET /api/v1/leads/<id>/history/`        | Review a lead's full story                   |

## Cross-app dependencies

- **References (outbound):** `history` is served from `audit`'s event log; every mutating endpoint writes to it. Convert calls `applicants.services.create_applicant` and `applicant_journeys.services.create_journey` (**cross-app**). All flows require a session from `authenticate`.
- **Referenced by other apps (inbound):** `applicants` — reads the applicant right after conversion creates it. `applicant_journeys` — the seed journey conversion creates.

## Open questions

- No `UI screens & wireframe notes` section exists in the source concept doc — screen names here are proposed, not sourced.
- Direct applicant creation (skip-the-lead-lifecycle) belongs to the `applicants` app, not here.
- No funnel/dashboard endpoint is defined — `stage`/`source`/`search`/`fiscal_year` filters exist and are enough to build a client-aggregated one (this module's chosen approach — see the module plan), but there's no server-side multi-category aggregate.
- Whether an Admin should get a `created_by`/owner filter on the lead list is undecided — no such param exists today.
