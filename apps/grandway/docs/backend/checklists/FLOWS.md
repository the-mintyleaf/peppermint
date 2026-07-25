# FLOWS — Checklists

**Owner app:** `checklists`
**Synced:** 2026-07-25, adapted from `.backend/concepts/checklists_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **One flow here has no endpoint of its own.** "An applicant receives their
> checklist" is the module's headline behaviour and its only step is a call into
> another app — setting a journey's destination country. The checklist appears
> as a side effect, asynchronously, after the transaction commits. A frontend
> that waits for a checklist endpoint to call will wait forever.

---

## Flow: Author a destination country's requirement list

**Actor:** Admin (Lead Managers are refused on every step) · **Entry point:** Checklist template authoring screen

1. **Authoring screen** — pick the destination country from the catalogue → `GET /api/v1/catalogue/countries/` (`institutions.country.list`, **cross-app: `institutions`**).
2. **Authoring screen** — save the list's identity, scoped to that country → `POST /api/v1/checklists/templates/` (`checklists.template.create`, **Admin only**). Requires the country exists and has no other active `is_default: true` template.
   - `CHECKLISTS_DEFAULT_TEMPLATE_EXISTS` (409) → blocking dialog naming the existing list, linked from `details.existing_template_id`. Offer "edit that one instead", not "try again".
   - `CHECKLISTS_DEFAULT_REQUIRES_COUNTRY` (400) → inline field error on the country picker.
   - `CHECKLISTS_ACTOR_FORBIDDEN` (403) → the screen should not have been reachable; hide it for a Lead Manager rather than rendering it read-only.
3. **Authoring screen** — add each requirement, typed `document` / `stage` / `task` → `POST /api/v1/checklists/templates/<template_id>/items/` (`checklists.template_item.create`, **Admin only**). The template need not be active — requirements are normally added while it is still a draft.
4. **Authoring screen** — publish the list → `PATCH /api/v1/checklists/templates/<template_id>/` (`checklists.template.update`, **Admin only**) with `{ "status": "active" }`. **From this moment, any journey saved with that country inherits this list.** Journeys that already name the country are _not_ retroactively covered — see "Find destinations nobody has set up".
   - `CHECKLISTS_DEFAULT_TEMPLATE_EXISTS` (409) → as step 2.

## Flow: An applicant receives their checklist

**Actor:** Admin or Lead Manager · **Entry point:** Journey detail screen

1. **Journey detail screen** — choose the destination country → `PATCH /api/v1/journeys/<journey_id>/` (`applicant_journeys.journey.update`, **cross-app: `applicant_journeys`**) with `{ "target_country_ref": "<country_id>" }`. **The applicant's checklist is created automatically, once, after this request's transaction commits.** The journey response says nothing about it. Nothing happens if the country has no active default template, and that is not an error.
   - `JOURNEYS_COUNTRY_NOT_FOUND` → inline field error on the country picker.
2. **Applicant detail → Checklist panel** — show what is now outstanding → `GET /api/v1/checklists/?applicant=<applicant_id>` (`checklists.checklist.list`).
   - _Empty result:_ **do not render "this applicant has no requirements"** — it is indistinguishable from a country nobody has set up. Either retry once (inheritance is asynchronous), or show "no requirement list has been authored for this destination yet" and, for an Admin, link to the authoring flow. Confirm with `?journey_missing_checklist=true`.

> There is no "create checklist" button in this flow, deliberately. A second,
> explicit way to do the same thing would let the two disagree.

## Flow: Work an applicant's list to completion

**Actor:** Admin or Lead Manager · **Entry point:** Applicant detail → Checklist panel

1. **Checklist detail screen** — open the list → `GET /api/v1/checklists/<checklist_id>/` (`checklists.checklist.read`) — the only shape carrying `items[]` and `progress`.
2. **Checklist detail screen** — upload the document the applicant handed over → `POST /api/v1/files/` (`uploaded_files.file.upload`, **cross-app: `uploaded_files`**) with `applicant` or `journey` as the owner. The new file is **not** attached to any checklist item yet.
3. **Checklist detail screen** — tick the matching item, citing the file → `POST /api/v1/checklists/<checklist_id>/items/<item_id>/status/` (`checklists.item.status`) with `{ "status": "completed", "evidence_file": "<file_id>" }`. The item's completion stamps set and the checklist's `progress` counts move, but **the response is the item and carries no `progress`** — either re-read `GET /api/v1/checklists/<checklist_id>/` or recompute the counts client-side from the items already on screen.
   - `CHECKLISTS_EVIDENCE_NOT_ALLOWED` (400) → the file was uploaded against a different applicant. Inline error on the file picker; scope the picker to this applicant's files so it cannot happen.
   - `CHECKLISTS_INVALID_TRANSITION` (409) → the checklist is completed. Offer "reopen and edit".
4. **Checklist detail screen** — declare the work finished → `POST /api/v1/checklists/<checklist_id>/complete/` (`checklists.checklist.complete`). Precondition: every required item is `completed`, `waived`, or `not_applicable` — exactly `progress.required_resolved == progress.required_total`. **Disable the button until then rather than letting the call fail.**
   - `CHECKLISTS_REQUIRED_ITEMS_PENDING` (409) → scroll to and highlight each item in `details.items`. Do not show a generic toast — the response names exactly what is left. A `blocked` item counts as outstanding.

## Flow: A requirement that cannot be met

**Actor:** Admin or Lead Manager · **Entry point:** Checklist detail screen

1. **Checklist detail screen** — flag the item as blocked, with the reason → `POST /api/v1/checklists/<checklist_id>/items/<item_id>/status/` (`checklists.item.status`) with `{ "status": "blocked", "status_note": "..." }`. `progress.blocked` increases; **a blocked item still counts as outstanding** and still prevents completion — surface it as a warning, not a resolution.
   - `CHECKLISTS_STATUS_NOTE_REQUIRED` (400) → the note is mandatory here. Make it a required input on the blocked/waived option, not one the user discovers by failing.
2. **Checklist detail screen** — later, resolve it (`{ "status": "completed" }`) or waive it (`{ "status": "waived", "status_note": "..." }`). The item becomes resolved; completion may now be possible.

## Flow: Find destinations nobody has set up

**Actor:** Admin · **Entry point:** Checklist worklist → "Awaiting setup" view

1. **Worklist** — list journeys with a country and no checklist → `GET /api/v1/checklists/?journey_missing_checklist=true` (`checklists.checklist.list`). **The rows are journeys, not checklists** — each `id` is a journey id, and there is no checklist to link to. This flag overrides all other filters; `page`/`page_size` still apply.
2. For each distinct country in that list, run "Author a destination country's requirement list".
3. **Journey detail screen** — cover applicants already waiting: re-save each journey with the same country → `PATCH /api/v1/journeys/<journey_id>/` (`applicant_journeys.journey.update`, **cross-app: `applicant_journeys`**). Inheritance fires as in "An applicant receives their checklist".
   - **Note:** the backend has a bulk command (`apply_country_checklists`), but **no endpoint exposes it.** A frontend must either re-save each journey or ask an operator.

## Flow: Start an applicant's list over

**Actor:** Admin or Lead Manager · **Entry point:** Checklist detail screen

1. **Checklist detail screen** — archive the current list with a reason → `POST /api/v1/checklists/<checklist_id>/archive/` (`checklists.checklist.archive`) with `{ "reason": "..." }`. It leaves active work, refuses every edit, **and stops blocking a fresh copy of the same template**.
   - `CHECKLISTS_ARCHIVE_REASON_REQUIRED` (400) → the reason is mandatory. Require it in the dialog.
2. **Checklist detail screen** — apply the country's current list again → `POST /api/v1/checklists/` (`checklists.checklist.create`) with `{ journey, template }`. A fresh copy reflecting the template **as it stands now** — how an applicant picks up requirements added since they first inherited theirs. Alternatively, re-saving the journey re-triggers automatic inheritance, since the archived checklist no longer blocks it.
   - `CHECKLISTS_TEMPLATE_ALREADY_APPLIED` (409) → step 1 was skipped or failed.
   - **Note:** archived checklists remain in `GET /api/v1/checklists/` results. Filter with `?status=active` or the applicant panel shows both.

---

## Endpoint coverage

| Policy key                        | Method / path                                          | Used by flow(s)                                                            | Notes                                                                                  |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `checklists.template.list`        | `GET /api/v1/checklists/templates/`                    | Author a country's list                                                    | Also the template picker in "Start an applicant's list over"                           |
| `checklists.template.create`      | `POST /api/v1/checklists/templates/`                   | Author a country's list                                                    | **Admin only**                                                                         |
| `checklists.template.read`        | `GET /api/v1/checklists/templates/<id>/`               | Author a country's list                                                    | Returns retired requirements too — show them greyed, not hidden                        |
| `checklists.template.update`      | `PATCH /api/v1/checklists/templates/<id>/`             | Author a country's list                                                    | **Admin only.** Also how a list is retired (`status: inactive`)                        |
| `checklists.template_item.create` | `POST /api/v1/checklists/templates/<id>/items/`        | Author a country's list                                                    | **Admin only**                                                                         |
| `checklists.template_item.update` | `PATCH /api/v1/checklists/templates/<id>/items/<iid>/` | Author a country's list                                                    | **Admin only. No delete** — retire with `is_active: false`                             |
| `checklists.checklist.list`       | `GET /api/v1/checklists/`                              | An applicant receives their checklist; Find destinations nobody has set up | One endpoint, two response shapes — `?journey_missing_checklist=true` returns journeys |
| `checklists.checklist.create`     | `POST /api/v1/checklists/`                             | Start an applicant's list over                                             | The manual override. **The normal path calls no checklist endpoint at all**            |
| `checklists.checklist.read`       | `GET /api/v1/checklists/<id>/`                         | Work an applicant's list to completion                                     | The only shape carrying `items`                                                        |
| `checklists.checklist.update`     | `PATCH /api/v1/checklists/<id>/`                       | — (inline edits)                                                           | Title, owner, due date, notes — not a journey of their own. **Not `status`**           |
| `checklists.checklist.activate`   | `POST /api/v1/checklists/<id>/activate/`               | — (blank checklists only)                                                  | Inherited and template-applied checklists arrive active                                |
| `checklists.checklist.complete`   | `POST /api/v1/checklists/<id>/complete/`               | Work an applicant's list to completion                                     | Disable the button until `required_resolved == required_total`                         |
| `checklists.checklist.reopen`     | `POST /api/v1/checklists/<id>/reopen/`                 | Work an applicant's list to completion                                     | Recovery path from the `CHECKLISTS_INVALID_TRANSITION` failure                         |
| `checklists.checklist.archive`    | `POST /api/v1/checklists/<id>/archive/`                | Start an applicant's list over                                             | `reason` required; frees re-inheritance                                                |
| `checklists.checklist.restore`    | `POST /api/v1/checklists/<id>/restore/`                | — (undo an archive done in error)                                          | **Restore is not a reopen** — returns to the exact status it was archived in           |
| `checklists.item.create`          | `POST /api/v1/checklists/<id>/items/`                  | — (inline "add item")                                                      | The one-off requirement an institution asks of a single applicant                      |
| `checklists.item.update`          | `PATCH /api/v1/checklists/<id>/items/<iid>/`           | — (inline edit)                                                            | Label, owner, or due date. **Status is NOT editable here**                             |
| `checklists.item.status`          | `POST /api/v1/checklists/<id>/items/<iid>/status/`     | Work an applicant's list to completion; A requirement that cannot be met   | The most-called endpoint in the module                                                 |

## Cross-app dependencies

- **References (outbound):** `institutions.country.list` — the country picker when authoring a template. `applicant_journeys.journey.update` — **the trigger for automatic inheritance**, the only outbound reference whose effect is invisible in its own response. `uploaded_files.file.upload` — evidence a requirement was met; `uploaded_files.file.list` — scoping the evidence picker to this applicant's files so `CHECKLISTS_EVIDENCE_NOT_ALLOWED` never reaches a user; `GET /api/v1/files/<id>/` — resolving a cited `evidence_file` id to filename/size/verification. All flows require an `authenticate` session.
- **Referenced by other apps (inbound):** none yet. No other app's flow calls a `checklists.*` endpoint. The natural future one is an applicant-file overview showing outstanding requirements alongside documents and offers.

## Open questions

- Should overdue and blocked items raise notifications once the `notifications` app exists?
- Should a checklist item point at a specific offer condition, so the two stop being tracked separately?
- Should a country's template carry a study-level dimension, or is one template per situation enough?
