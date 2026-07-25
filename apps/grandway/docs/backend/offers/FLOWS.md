# FLOWS — Offers

**Owner app:** `offers`
**Synced:** 2026-07-25, adapted from `.backend/concepts/offers_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Four rules govern every flow below.**
>
> 1. **No authority-based control hiding.** Every Admin **and** Lead Manager may
>    do everything here, read and write alike. This is **not** the `institutions`
>    split — do not carry a "hide write controls from Lead Managers" rule across
>    from the catalogue screens. Only a `superadmin` is refused (403
>    `OFFERS_ACTOR_FORBIDDEN`), and a `superadmin` has no reason to be on these
>    screens at all.
> 2. **There is no delete, anywhere.** No screen gets a delete button — not for an
>    offer, not for a condition. An offer that no longer applies gets a decision;
>    a condition that does not apply is marked `not_applicable` (with a note).
> 3. **A decision is final.** There is no reopen action. Once an offer is decided,
>    the Decision Dialog must be **closed** to the user, not merely disabled. An
>    institution that changes its mind means recording a _second_ offer.
> 4. **Nothing here moves the journey.** Recording, issuing, or deciding an offer
>    leaves the journey's `stage` exactly where it was. If the UI should advance
>    the journey on acceptance, it must make that call itself.

---

## Flow: Record an offer against a journey

**Actor:** Admin or Lead Manager · **Entry point:** Journey Detail → Offers panel → "Add offer"

1. **Offers panel** loads what already exists → `GET /api/v1/offers/?journey=<journey_id>` (`offers.offer.list`).
   - Rows are newest first. Show institution, program, intake, status, and response deadline.
   - **`is_response_overdue` is on every row** — use it for the deadline warning rather than comparing dates client-side. It is computed in Nepal time and only ever true for an `issued` offer.
   - Rows carry the snapshot names and `has_open_conditions` — but **not** the full money picture (scholarship/deposit live on the detail shape).
2. **New Offer Form** — find the program in the catalogue → `GET /api/v1/catalogue/programs/?q=...` (**cross-app: `institutions`**).
   - **Sending just the program id is enough** — it implies its own institution and campus. The form does not need three pickers.
   - **Skip this step entirely** for a historical offer with no catalogue record; go to step 3 on the manual branch.
3. **New Offer Form** — record the decision → `POST /api/v1/offers/` (`offers.offer.create`). Created at `status: draft`.
   - **The form has two branches and must make clear which one the user is in.** Send `program` for the catalogue branch, or `institution_name` + `program_title` for the manual branch. The response's `reference_source` confirms which was recorded.
   - **The journey's stage is not checked** — an offer may be recorded against a journey at any stage, including a closed or completed one.
   - **Enter the real intake in `intake_label`** — sending it alongside a `program` overrides the catalogue's generic `intake_pattern` ("Feb / Jul") with the actual one ("Feb 2027"). The only way a real intake gets recorded while intakes remain uncatalogued.
   - **Conditions can be created inline** — send a `conditions` array; they are created atomically with the offer, so a conditional offer never exists without its conditions.
   - `OFFERS_PROGRAM_REFERENCE_REQUIRED` → neither branch was completed; show it against the program field, not as a form-level error.
   - `OFFERS_CATALOGUE_REFERENCE_INVALID` → the campus/program picker was not filtered to the chosen institution — a UI bug. Reset and refilter.
   - `OFFERS_AMOUNT_INCOMPLETE` → highlight the amount and its currency together; treat each of tuition, scholarship, and deposit as one composite control filled or empty as a unit.
   - `OFFERS_JOURNEY_NOT_FOUND` → the journey id is stale; refetch the journey.
4. **Offer Detail** — mark it issued → `POST /api/v1/offers/<offer_id>/issue/` (`offers.offer.issue`) with an empty body. Requires status `draft`; from here `is_response_overdue` becomes meaningful.
   - `OFFERS_OFFER_NOT_ISSUABLE` (409) → already issued or decided. Refetch — someone else acted on it.
   - **Skip this step** when recording a historical offer resolved long ago; a decision may be recorded directly on a draft.

## Flow: Manage an offer's conditions

**Actor:** Admin or Lead Manager · **Entry point:** Offer Detail → Conditions panel

1. **Offer Detail** — the conditions are already there → `GET /api/v1/offers/<offer_id>/` (`offers.offer.read`).
   - **Do not call the conditions list endpoint to render this panel** — the detail response already nests the full `conditions` array in `display_order`. `offers.condition.list` exists for a standalone view and for refreshing the panel alone.
2. **Conditions panel** — add a requirement → `POST /api/v1/offers/<offer_id>/conditions/` (`offers.condition.create`).
   - **Its status is not checked** — a condition may be added **after** the offer has been accepted, which institutions routinely do. **Do not disable this control on a decided offer.**
   - `description` is required whatever the type is, so `other` loses nothing.
   - Appends `offer_condition_created` **to the offer's history**, and may flip the offer's `has_open_conditions` to `true`.
3. **Conditions panel** — resolve one → `POST /api/v1/offers/conditions/<condition_id>/status/` (`offers.condition.change_status`).
   - `OFFERS_CONDITION_NOTE_REQUIRED` → `waived` and `not_applicable` require a note; `satisfied` does not. Show the note input on selecting either of those two, not on all four.
   - **`has_open_conditions` is not in this response** — the response is the condition alone. Refetch the offer, or recompute locally, before re-rendering the offer header.
   - **Moving back to `pending` is allowed** and clears the resolution stamp. Offer it — a document rejected on review is a real event, and both transitions stay in the history.
4. **Conditions panel** — correct the wording → `PATCH /api/v1/offers/conditions/<condition_id>/` (`offers.condition.update`). **Un-nested** — the offer id carries no information once the condition id is known.
   - **Status is not editable here.** An edit form covering both wording and status must call two endpoints. A no-op edit writes no event.

## Flow: Record the applicant's decision

**Actor:** Admin or Lead Manager · **Entry point:** Offer Detail → "Record decision" → Decision Dialog

1. **Offer Detail** — check the conditions, deposit, and deadline → `GET /api/v1/offers/<offer_id>/` (`offers.offer.read`).
   - **Hide the "Record decision" action entirely when `is_terminal` is true.** There is no reopen, so a disabled-but-visible control implies a capability that does not exist.
2. **Decision Dialog** — record the outcome → `POST /api/v1/offers/<offer_id>/decision/` (`offers.offer.record_decision`). Requires status `draft` or `issued`; stamps `decided_at`, `decided_by_username`, and the reason.
   - **One form with a conditional required field:** `reason` becomes required for `rejected` and `withdrawn`; `to_intake` becomes required for `deferred`; `accepted` and `expired` require neither.
   - `OFFERS_DECISION_REASON_REQUIRED` / `OFFERS_DEFER_INTAKE_REQUIRED` → the conditional field was not enforced client-side; show inline on that field.
   - `OFFERS_OFFER_NOT_DECIDABLE` (409) → already decided. Refetch and close the dialog.
   - `OFFERS_ACCEPTED_OFFER_EXISTS` (409) → this journey already has an accepted offer. **Name it** — fetch it with `GET /api/v1/offers/?journey=<journey_id>&status=accepted` and tell the user which one, rather than showing a bare error.
   - **Deferring an offer is not deferring the journey.** This moves one institutional decision to a later intake. The whole plan is deferred via `applicant_journeys.journey.defer` — a different action.
3. **Offer Detail** — read the trail → `GET /api/v1/offers/<offer_id>/history/` (`offers.offer.list_history`, **cross-app: `audit`**).
   - **Condition events appear here too**, carrying `metadata.condition_id`. This is the offer's complete history; there is no separate condition history.
4. **Journey Detail** — _(optional, and the client's decision)_ advance the journey → `POST /api/v1/journeys/<journey_id>/stage/` (`applicant_journeys.journey.change_stage`, **cross-app: `applicant_journeys`**).
   - **This step is not automatic and never will be.** Journey stage and offer status are separate lifecycles by project rule. If accepting an offer should move a journey to `visa_stage`, the client makes that call; the backend will not.
   - `JOURNEYS_STAGE_NOT_EDITABLE` → the journey is terminal. The offer decision still stands — do not roll it back or present the two as one transaction.

## Flow: Compare competing offers on one journey

**Actor:** Admin or Lead Manager · **Entry point:** Journey Detail → Offers panel

1. **Offers panel** — list them all → `GET /api/v1/offers/?journey=<journey_id>` (`offers.offer.list`), newest first.
   - **Render `tuition_currency` beside every `tuition_amount`.** Amounts are stored exactly as quoted and are never converted — two rows may be in different currencies and are not directly comparable. A comparison table showing bare numbers will mislead.
   - The full money picture (scholarship, deposit) is on the detail shape, not the list — a side-by-side comparison needs one `offers.offer.read` per offer.
2. **Decision Dialog** — accept one → `POST /api/v1/offers/<chosen_id>/decision/` with `accepted`. Requires no other accepted offer on this journey.
3. **Decision Dialog** — resolve the rest → `POST /api/v1/offers/<other_id>/decision/` with `rejected` and a reason.
   - **Do not delete or hide the rejected offers.** They stay on the panel as part of the journey's decision trail — that is the reason this flow exists rather than one mutable "current offer" field.

> **There is no "supersede" action, and no superseded badge from the API.** Nothing records supersession.
> If the UI wants to mark older offers, it must define the rule itself from the newest-first ordering and
> which offer is `accepted`.

## Flow: Handle a lapsed offer

**Actor:** Admin or Lead Manager · **Entry point:** Offer List filtered to `?status=issued`

1. `GET /api/v1/offers/?status=issued` and read `is_response_overdue` on each row — **nothing expires automatically**; there is no background job and no deadline notification in this deployment. A client polls this itself to build a deadline view.
2. `POST /api/v1/offers/<offer_id>/decision/` with `outcome: expired` → `status: expired`, `is_terminal: true`. No reason is required.
3. If the applicant later responds after all, record a **new** offer. The expired one cannot be reopened.

---

## Endpoint coverage

| Policy key                       | Method / path                                           | Used by flow(s)                             | Notes                                                                                                                      |
| -------------------------------- | ------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `offers.offer.list`              | `GET /api/v1/offers/`                                   | Record (step 1); Compare; Lapsed            | Backs the standalone **Offer List** and the **Journey Detail offers panel** (`?journey=`). No text search                  |
| `offers.offer.create`            | `POST /api/v1/offers/`                                  | Record an offer                             | Two branches — catalogue or manual. `conditions` may be created inline                                                     |
| `offers.offer.read`              | `GET /api/v1/offers/<id>/`                              | Manage conditions; Record decision; Compare | The **Offer Detail** screen. Nests `conditions`                                                                            |
| `offers.offer.update`            | `PATCH /api/v1/offers/<id>/`                            | Edit Offer form                             | Rejects snapshot/journey/catalogue refs/`status`/`conditions` with `OFFERS_REFERENCE_IMMUTABLE` — send only changed fields |
| `offers.offer.issue`             | `POST /api/v1/offers/<id>/issue/`                       | Record an offer (step 4)                    | Requires `draft`. Skipped for historical offers                                                                            |
| `offers.offer.record_decision`   | `POST /api/v1/offers/<id>/decision/`                    | Record the decision; Compare; Lapsed        | The **Decision Dialog**. Final — no reopen                                                                                 |
| `offers.offer.list_history`      | `GET /api/v1/offers/<id>/history/`                      | Record the decision (step 3)                | Backed by `audit`; includes condition events (`metadata.condition_id`)                                                     |
| `offers.condition.list`          | `GET /api/v1/offers/<id>/conditions/`                   | —                                           | Unused by the flows above — the offer detail already nests conditions. For a standalone view / panel refresh               |
| `offers.condition.create`        | `POST /api/v1/offers/<id>/conditions/`                  | Manage conditions (step 2)                  | Allowed on a decided offer                                                                                                 |
| `offers.condition.update`        | `PATCH /api/v1/offers/conditions/<condition_id>/`       | Manage conditions (step 4)                  | Un-nested. Wording only; not status                                                                                        |
| `offers.condition.change_status` | `POST /api/v1/offers/conditions/<condition_id>/status/` | Manage conditions (step 3)                  | The tick / waive control                                                                                                   |

**Screens from `concepts/offers.txt`, and whether they are backed:**

- **Offer List** — backed. Filters for applicant, institution, program, intake, status, and offer type all exist. **No text search** across the snapshot names — only catalogue FKs filter, which miss manual offers.
- **Journey Detail → Offers panel** — backed via `?journey=`. The main operational entry point.
- **Offer Detail** — backed for the record, conditions (nested), decision, and history. **Its supporting-files section has no endpoint here** — use `uploaded_files`.
- **New / Edit Offer Form** — backed. Two branches (catalogue / manual); must make clear which one the user is in.
- **Decision Dialog** — backed. One form with a conditional required field; hide entirely when `is_terminal`.

## Cross-app dependencies

- **References (outbound):** `institutions.program.list`/`.read` for the New Offer form's catalogue lookup (a client-side call — the backend resolves the ids it is sent); `applicant_journeys.journey.list`/`.read` to reach the journey id an offer needs, and `applicant_journeys.journey.change_stage` for the **optional** journey advance after a decision (client-side, and deliberately never automatic); `uploaded_files.file.upload`/`.file.list` for the Offer Detail supporting-files section (`POST /api/v1/files/` with `offer=<id>`, `category=offer_letter`; `GET /api/v1/files/?offer=<id>&is_archived=false`) — one-way, this app returns no file references. History reads from `audit`. All flows require an `authenticate` session.
- **Referenced by other apps (inbound):** none yet. No other app's flow file references an `offers.*` permission key.

**Note the shared access model.** Unlike `institutions`, there is no read/write split and no owner
scoping — an offer inherits the visibility of the journey it hangs from, and journeys are shared across
the consultancy. Every Admin and Lead Manager sees and edits every offer; only a `superadmin` is refused.

## Open questions

- Should offer conditions migrate onto `checklists` when that module ships, or stay owned here?
- Where should an offer letter PDF live long-term? `uploaded_files` holds it, but an offer payload carries no reference in the other direction — a screen joins the two calls itself.
- Should a journey's free-text destination be reconciled against the catalogue reference on its offers? Today both are stored and nothing compares them.
- Does the offer list need text search across the snapshot institution and program names? Today only the catalogue foreign keys can be filtered, which misses every manually recorded offer.
