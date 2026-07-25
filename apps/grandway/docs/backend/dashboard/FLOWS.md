# FLOWS — Dashboards

**Owner app:** `dashboards`
**Synced:** 2026-07-25, adapted from `.backend/concepts/dashboards_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Every flow here ends in another app.** That is not incidental — this module
> owns no data and accepts no writes, so a flow that stayed inside it would be a
> flow where nobody did anything. The dashboard's whole job is to get staff to
> the next action, so each flow below starts on the dashboard and finishes with a
> `(cross-app: …)` step where the work actually happens.

---

## Flow: Morning triage

**Actor:** Admin or Lead Manager · **Entry point:** Dashboard home → Alert strip

1. **Alert strip loads** → `GET /api/v1/dashboard/summary/` (`dashboards.summary.read`). Nothing else is required — every count is `0` on an empty system. Render each alert as a number **plus a destination**; a count with nowhere to go is the one thing this app is explicitly asked not to produce.
   - `DASHBOARDS_ACTOR_FORBIDDEN` (403) → the caller is a Superadmin. Do not render an empty dashboard — hide the nav entry entirely, because no section will ever answer for this authority.
2. **Today's work loads, in parallel with the other panels** → `GET /api/v1/dashboard/today/` (`dashboards.today.read`). **Load the eight sections as eight independent requests** — they are separate endpoints precisely so a slow panel cannot block the page; a client that awaits all eight before painting discards the only reason they were split. `overdue_checklist_items` and `due_soon_checklist_items` are disjoint, so their totals may be summed (nothing else on the page may be). Each worklist returns at most 10 rows with an accurate `total` — show `total`, use `has_more` for the "see all" link rather than comparing lengths.
3. **An overdue row** → the user clicks a checklist item → `GET /api/v1/checklists/<checklist_id>/` (`checklists.checklist.read`) **(cross-app: `checklists`)**. Every row carries `checklist_id`, `journey_id`, and `applicant_id`, so no lookup call is needed to navigate.
4. **Checklist detail** → resolve or reassign the requirement → `POST /api/v1/checklists/<checklist_id>/items/<item_id>/status/` (`checklists.item.status`) **(cross-app: `checklists`)**. The checklist must be `draft` or `active`. One audit event is appended — which also makes it appear in the dashboard's own activity feed.
   - `CHECKLISTS_STATUS_NOTE_REQUIRED` → waiving/blocking needs an explanation; inline field error on the note.
5. **Return to Dashboard home** → `GET /api/v1/dashboard/summary/` again → the count has already dropped. Nothing here caches, so a refetch always reflects the change — but there is also no push, no polling contract, and no ETag, so **the client decides when to refetch**.

## Flow: Unblock a stalled file

**Actor:** Admin · **Entry point:** Dashboard home → Blockers and risk

1. **Blockers and risk loads** → `GET /api/v1/dashboard/blockers/` (`dashboards.blockers.read`). Render the five groups **separately, by cause** — they call for five different people to act, and a single list sorted by urgency would obscure which is which.
2. **"Journeys without a checklist"** → the user reads a row; no call, the row carries `country_id`, `country_name`, `applicant_id`, and `journey_id`. This group is the safety net behind automatic checklist inheritance: the journey named a destination, nobody had authored that country's requirements, so **no checklist was created and no error was raised**. This panel is the only place that silence is visible. An empty group is the healthy state, not a missing feature.
3. **Checklist templates** → check whether a template exists → `GET /api/v1/checklists/templates/?country=<country_id>` (`checklists.template.list`) **(cross-app: `checklists`)**.
4. **Template editor** → the Admin authors and activates the country's list → `POST /api/v1/checklists/templates/` (`checklists.template.create`) **(cross-app: `checklists`)**. Template authoring is Admin-only even though checklists are shared. **Future** journeys to that country inherit the list automatically, with no endpoint call; the journeys already in step 2's list do **not** retroactively gain one.
   - `CHECKLISTS_DEFAULT_TEMPLATE_EXISTS` → a default already exists for this country, so the blocker has another cause; send the user back to step 3.
5. **Checklist workspace** → apply the new list to each already-affected applicant → `POST /api/v1/checklists/` (`checklists.checklist.create`) **(cross-app: `checklists`)**. The applicant gains a checklist and the blocker row disappears on the next dashboard load. This step is easy to skip and is the whole point of the flow — authoring the template fixes the future; only this fixes the people already waiting.

## Flow: Rebalance the team

**Actor:** Admin (a Lead Manager may open the screen, but has nothing to rebalance) · **Entry point:** Dashboard home → Workload by owner

1. **Workload by owner loads** → `GET /api/v1/dashboard/workload/` (`dashboards.workload.read`). **Branch on `is_scoped_to_caller` before rendering** — `true` means the caller is a Lead Manager and the `leads` list holds only their own row; label the panel "My workload" and drop the rebalancing affordances, which would be dead controls. Do not infer team size from the row count. The three lists are **not** joinable into one row per person and **must not be summed** — render three tables, not one. The `checklist_items` list includes an `owner_id: null` "Unassigned" row; **do not filter it out** — it is the most likely work to be missed and the most useful row on the panel.
2. **Workload row → that person's items** → `GET /api/v1/checklists/?assigned_to=<owner_id>` (`checklists.checklist.list`) **(cross-app: `checklists`)**. For the unassigned row there is no `owner_id`, so this link must be disabled or point at an unassigned-work view the API does not currently provide (see Open questions).
3. **Checklist item** → the Admin reassigns it → `PATCH /api/v1/checklists/<checklist_id>/items/<item_id>/` (`checklists.item.update`) **(cross-app: `checklists`)**. Both people's workload rows move on the next dashboard load.

## Flow: Chase a decision

**Actor:** Admin or Lead Manager · **Entry point:** Dashboard home → Today's work, or Blockers and risk

1. **Offers awaiting response** → `GET /api/v1/dashboard/today/` (`dashboards.today.read`). An offer appears only if it is `issued` **and** carries a `response_deadline`. This list holds both already-passed and approaching deadlines — read `is_response_overdue` on each row to style them; do not re-derive it from `response_deadline` in the browser timezone, because the backend computes it against today in **Nepal**. An offer with no deadline set never appears here — the list is "offers with a deadline", not "offers awaiting a response".
2. **Offer detail** → `GET /api/v1/offers/<offer_id>/` (`offers.offer.read`) **(cross-app: `offers`)**.
3. **Decision dialog** → record the applicant's answer → `POST /api/v1/offers/<offer_id>/decision/` (`offers.offer.record_decision`) **(cross-app: `offers`)**. The offer must be `issued`; a decision is final, there is no reopen. It leaves this worklist and enters `outcomes.offer_decisions` for the period the decision was recorded, **not** the period the offer was created.
   - `OFFERS_ACCEPTED_OFFER_EXISTS` → the journey already has an accepted offer; blocking dialog naming the existing one.

## Flow: Review intake health for a period

**Actor:** Admin · **Entry point:** Dashboard home → Filter bar

1. **Country picker populates** → `GET /api/v1/catalogue/countries/` (`institutions.country.list`) **(cross-app: `institutions`)**. Never hardcode country codes — the catalogue is data, added by staff without a deployment.
2. **Set a fiscal year and destination; every panel refetches** → `GET /api/v1/dashboard/conversion/?fiscal_year=2081/82&country=<id>` (`dashboards.conversion.read`). **The four rates are four independent measures, not one funnel** — each is windowed on its own stage's dates, so a lead that arrived in Ashadh and converted in Shrawan counts toward Ashadh's intake and Shrawan's conversions. Render four figures; **do not draw a funnel chart and do not multiply them together.** A `percent` of `null` means the denominator was zero — render "—", never "0%".
   - `VALIDATION_ERROR` on `fiscal_year` → malformed label; inline error, format is `YYYY/YY`.
   - `VALIDATION_ERROR` on `date_to` → the range runs backwards; inline error on the end-date control.
3. **Final outcomes** → `GET /api/v1/dashboard/outcomes/?fiscal_year=2081/82&country=<id>` (`dashboards.outcomes.read`). `journey_outcomes` is windowed on **when each journey ended**, while `journeys_completed` on the same payload is windowed on **when it was created** — the two can disagree about the same journey and both be right. Do not present them as parts of one total.
4. **Applicant list** → the people behind the numbers → `GET /api/v1/applicants/?country=<id>` (`applicants.applicant.list`) **(cross-app: `applicants`)**. The dashboard does **not** tell you which query parameters reproduce its filtering on the target list; `fiscal_year`→`fiscal_year` and `country`→`country` map across, but `due_within_days` and the worklist predicates have no equivalent, so a drill-down is an approximation, not a guarantee of the same rows.

---

## Endpoint coverage

| Policy key                   | Method / path                       | Used by flow(s)                                                                         | Notes                                                                                         |
| ---------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `dashboards.summary.read`    | `GET /api/v1/dashboard/summary/`    | Morning triage                                                                          | The alert strip. Every figure is duplicated in a fuller section                               |
| `dashboards.today.read`      | `GET /api/v1/dashboard/today/`      | Morning triage; Chase a decision                                                        | Six worklists, 10 rows each                                                                   |
| `dashboards.pipeline.read`   | `GET /api/v1/dashboard/pipeline/`   | **No dedicated flow** — read-only panel; every count links into another app's list view | Zero-filled maps                                                                              |
| `dashboards.blockers.read`   | `GET /api/v1/dashboard/blockers/`   | Unblock a stalled file                                                                  | Grouped by cause, never merged                                                                |
| `dashboards.workload.read`   | `GET /api/v1/dashboard/workload/`   | Rebalance the team                                                                      | Branch on `is_scoped_to_caller`                                                               |
| `dashboards.conversion.read` | `GET /api/v1/dashboard/conversion/` | Review intake health                                                                    | Four independent rates, not a funnel                                                          |
| `dashboards.outcomes.read`   | `GET /api/v1/dashboard/outcomes/`   | Review intake health                                                                    | Two windowing rules in one payload                                                            |
| `dashboards.activity.list`   | `GET /api/v1/dashboard/activity/`   | **No dedicated flow** — passive change feed at the foot of the page                     | The only paginated section; ignores every filter but `fiscal_year`; not narrowed by authority |

## Cross-app dependencies

- **References (outbound):** every flow above ends in another app. `checklists`
  is the largest destination by far — `checklists.checklist.read`,
  `checklists.item.status`, `checklists.item.update`, `checklists.template.list`,
  `checklists.template.create`, `checklists.checklist.create`,
  `checklists.checklist.list`; then `offers.offer.read` and
  `offers.offer.record_decision`; `institutions.country.list` for the destination
  filter; `applicants.applicant.list` for the drill-down. All flows require a
  session from `authenticate`.
- **Reads seven apps with no endpoint call.** Every figure on every panel comes
  from `leads`, `applicants`, `applicant_journeys`, `offers`, `checklists`,
  `documents`, `uploaded_files`, and `audit` — but a client never calls those
  modules to render the dashboard. One request per section is all a panel costs.
- **Referenced by other apps (inbound): none.** No other app's flow calls a
  dashboard endpoint, and none ever should — this module summarises the others
  and is never a step in their work.

## Open questions

- **No flow covers appointments or notifications**, because neither module
  exists — all three of upcoming appointments, missed appointments, and a
  pending-alert summary are absent from every response rather than returned as
  zero. A wireframe must not include those panels.
- **No branch filter, and no branch concept exists anywhere in the backend.**
  Building the control would promise a narrowing the API cannot perform.
- **Four filters are accepted but change nothing.** `journey_stage`,
  `offer_status`, `document_status`, and `checklist_status` are validated and
  ignored by every section. **Do not render them as active controls** — a user who
  sets one and sees no change will reasonably conclude the dashboard is broken.
- **The activity feed ignores the filter bar** except for `fiscal_year`. If one
  filter bar sits above the whole page, that panel must say it is unfiltered.
- **There is no drill-down contract.** Each row carries the ids needed to
  navigate, but nothing states which query parameters reproduce a section's
  filtering on the target list. A "see all 47" link is a best-effort
  approximation, and the destination count may legitimately differ.
- **Nothing marks which figures were owner-scoped**, except
  `workload.is_scoped_to_caller`. For a Lead Manager, lead-derived numbers are
  narrowed and the rest are not, so **an Admin and a Lead Manager see different
  dashboards at the same URL.** Whether the UI should say so per panel is
  undecided.
- **No refresh contract.** No polling interval, push channel, cache header, or
  staleness indicator — how often a client refetches is entirely its own
  decision.
- **Whether different roles need different default layouts is unresolved.** All
  eight sections are available to both authorities today.
