# FLOWS — Applicant Journeys

**Owner app:** `applicant_journeys`
**Synced:** 2026-07-23, adapted from `.backend/concepts/applicant_journeys_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> Screen names are quoted from the backend's own `concepts/applicant_journeys.txt` →
> "UI screens & wireframe notes." This module's actual routes closely mirror
> them: a standalone Journey List/worklist plus a linkable Journey Detail page
> (`MultiPageModule`), with create/edit staying modal-based — see the module
> plan.

---

## Flow: Record a new study objective

**Actor:** Admin or Lead Manager · **Entry point:** Applicant Detail → Journeys panel → "New journey"

1. **Journeys panel** lists what the person already pursues → `GET /api/v1/journeys/?applicant=<id>` (`applicant_journeys.journey.list`, **cross-app: `applicants`**). This per-person view is the primary entry point; the standalone Journey List is secondary.
2. **New Journey Form** — submit a destination and whatever else is known → `POST /api/v1/journeys/` (`applicant_journeys.journey.create`) — only `applicant` is required. Created at stage `planning`, `creation_source: manual`.
   - `JOURNEYS_APPLICANT_NOT_FOUND` → the applicant id is wrong; re-select the person.
   - The form must not require country/level/intake — a journey often begins as little more than "Australia, sometime next year."
3. Redirect to **Journey Detail** using the returned `id`.

## Flow: Work an objective forward

**Actor:** Admin or Lead Manager · **Entry point:** Journey List, or Applicant Detail → Journeys panel

1. **Journey List** filters to a phase of work → `GET /api/v1/journeys/?stage=<stage>` — the operational worklist ("everything at Offer Stage"). No free-text search, always newest-first.
2. **Journey Detail** loads → `GET /api/v1/journeys/<id>/` — header shows the applicant's name, linking to their file; the journey holds no contact details itself.
3. **Change stage** from the dropdown → `POST /api/v1/journeys/<id>/stage/` (`applicant_journeys.journey.change_stage`) — dropdown offers **only** the six active stages; `Completed`/`Closed`/`Deferred` are separate buttons.
   - `JOURNEYS_STAGE_NOT_EDITABLE` → already closed/deferred; replace the dropdown with Reopen.
4. **Correct the objective** as it firms up → `PATCH /api/v1/journeys/<id>/` — one history entry when something moved. The applicant cannot be changed here — no person picker on the edit form.

## Flow: End an objective

**Actor:** Admin or Lead Manager · **Entry point:** Journey Detail → "Close"

1. **Close Journey dialog** — pick an outcome; `Other` reveals a required explanation. The outcome list is a fixed enum, not fetched from an endpoint (unlike lead loss reasons).
2. Confirm → `POST /api/v1/journeys/<id>/close/` (`applicant_journeys.journey.close`) — stage becomes `completed` (outcome `successful`) or `closed` (anything else). **The applicant's status is untouched.**
   - `JOURNEYS_OUTCOME_DETAIL_REQUIRED` → inline error on the explanation field.
   - `JOURNEYS_STAGE_NOT_EDITABLE` → already ended; refresh and show current state.
   - Report how a journey ended by reading `outcome`, never `stage` — `closed` covers five different outcomes.
3. **Journey Detail** shows the closed state with Reopen as the primary action. If this was the person's last open journey, a client-side "mark them dormant?" prompt may call the applicant status endpoint explicitly (**cross-app**) — the server does nothing automatically.

## Flow: Pause and resume an objective

**Actor:** Admin or Lead Manager · **Entry point:** Journey Detail → "Defer"

1. **Defer Journey dialog** — name the intake being deferred to, optional reason → `POST /api/v1/journeys/<id>/defer/` (`applicant_journeys.journey.defer`) — stage becomes `deferred`; `outcome` stays **empty**. Not a way to close a journey; reports must not count deferred as finished.
   - `JOURNEYS_DEFER_INTAKE_REQUIRED` → inline error on the intake field.
2. Work restarts → `POST /api/v1/journeys/<id>/reopen/` (`applicant_journeys.journey.reopen`) — one action serves all three terminal states; all closure/deferment fields clear.
   - `JOURNEYS_JOURNEY_NOT_TERMINAL` → someone resumed it first; refresh and hide the button.
   - Reopening a **completed** journey doesn't undo that it was completed — the closure stays visible in history.

## Flow: Review a journey's history

1. **History panel** loads → `GET /api/v1/journeys/<id>/history/` (**cross-app: `audit`**) — render `summary` as the primary label, `changes` as from→to. Closure/deferment **reasons** live on the journey record, not the history entry — a complete picture reads both.

---

## Endpoint coverage

| Policy key                                | Method / path                        | Used by flow(s)                      | Notes                                             |
| ----------------------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------- |
| `applicant_journeys.journey.list`         | `GET /api/v1/journeys/`              | Record a new objective; Work forward | Serves both the per-person panel and the worklist |
| `applicant_journeys.journey.create`       | `POST /api/v1/journeys/`             | Record a new objective               | Open to Lead Managers, unlike applicant creation  |
| `applicant_journeys.journey.read`         | `GET /api/v1/journeys/<id>/`         | Work forward                         |                                                   |
| `applicant_journeys.journey.update`       | `PATCH /api/v1/journeys/<id>/`       | Work forward                         | Applicant is immutable                            |
| `applicant_journeys.journey.change_stage` | `POST /api/v1/journeys/<id>/stage/`  | Work forward                         | Active stages only                                |
| `applicant_journeys.journey.defer`        | `POST /api/v1/journeys/<id>/defer/`  | Pause and resume                     | Not an outcome                                    |
| `applicant_journeys.journey.close`        | `POST /api/v1/journeys/<id>/close/`  | End an objective                     | Outcome mandatory                                 |
| `applicant_journeys.journey.reopen`       | `POST /api/v1/journeys/<id>/reopen/` | Pause and resume                     | Serves all three terminal states                  |
| `applicant_journeys.journey.list_history` | `GET /api/v1/journeys/<id>/history/` | Review history                       | Backed by `audit`                                 |

## Cross-app dependencies

- **References (outbound):** `applicants.applicant.read`/`.list` to pick and label the person; `applicants.applicant.change_status` as an optional post-close prompt; history from `audit`'s event log. All flows require an `authenticate` session.
- **Referenced by other apps (inbound):** `applicants` — the Journeys panel on Applicant Detail calls `journey.list`/`.create`. `leads` — conversion produces a journey and links to it.

## Open questions

- Is `Visa Stage` right for V1, given visa case management is explicitly out of scope?
- No offer records — a journey reaching `Offer Stage` says nothing about which offers exist.
- No institution/intake picker — both are free text with no catalogue or date semantics.
- No priority or target date — the worklist can only be ordered newest-first.
- No flow prevents two open journeys for the same country/intake.
- Whether closing the last open journey should prompt an applicant status change is undecided — purely a client-side convention if built.
