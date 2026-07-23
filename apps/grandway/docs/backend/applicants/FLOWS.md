# FLOWS — Applicants

**Owner app:** `applicants`
**Synced:** 2026-07-23, adapted from `.backend/concepts/applicants_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> Screen names below are quoted from the backend's own `concepts/applicants.txt` →
> "UI screens & wireframe notes" and map closely to this module's actual routes
> (a `MultiPageModule` with dedicated list/new/detail/edit pages — see the
> module plan) rather than being a proposed vocabulary that diverged, as in
> `lead-management`.

---

## Flow: Create an applicant directly

**Actor:** Admin only · **Goal:** record someone already committed, no preceding enquiry.

1. **Applicant List** → "New applicant" — visible to Admins only; hide the action entirely for a Lead Manager rather than disabling it.
2. **New Applicant Form** — name + ≥1 contact number (+ whatever else is known) → `POST /api/v1/applicants/` (`applicants.applicant.create`)
   - Created at status `active`, `creation_source: direct_admin`; one history entry.
   - `APPLICANTS_CONTACT_REQUIRED` → inline error on the contact-number repeater.
   - `APPLICANTS_PASSPORT_EXPIRY_INVALID` → inline error on the expiry field — dates likely transposed.
   - 400 on `addresses` → two of the same type were sent; the form must offer at most one permanent + one current.
3. Redirect to **Applicant Detail** using the returned `id`.
4. **Applicant Detail → Journeys panel** — prompt to record the objective → `POST /api/v1/journeys/` (`applicant_journeys.journey.create`, **cross-app**). Optional in the API, should be strongly prompted in the UI — an applicant with no journey has no objective.

## Flow: Complete a file that arrived from conversion

**Actor:** Admin or Lead Manager · **Goal:** fill in the identity detail a lead never carried.

1. **Applicant Detail** loads → `GET /api/v1/applicants/<id>/` — `creation_source: lead_conversion`, `originating_lead_id` populated; render a link back to the lead in the header.
2. **Edit Applicant Form** — add date of birth, passport, addresses, family, emergency contacts → `PATCH /api/v1/applicants/<id>/` — one history entry per section actually changed. `APPLICANTS_PASSPORT_EXPIRY_INVALID` → inline error. Conversion copies only name/email/contact/address — the form should make the rest visibly incomplete, not look done.
3. **Journeys panel** — review the seeded journey → `GET /api/v1/journeys/?applicant=<id>` (**cross-app**). If the lead named more than one country, the seeded journey has a **blank** `target_country` — surface that as an incomplete-journey prompt.

## Flow: Maintain a file over time

**Actor:** Admin or Lead Manager · **Goal:** keep contact/address/passport current.

1. **Applicant List** search → `GET /api/v1/applicants/?search=<q>` — one box matches Devanagari/Roman/romanized simultaneously; no separate per-script fields.
2. **Applicant Detail** opens → `GET /api/v1/applicants/<id>/` — `APPLICANTS_APPLICANT_NOT_FOUND` is always a genuine not-found (unlike leads, never "not yours").
3. **Edit Applicant Form** — e.g. add a second phone number → `PATCH /api/v1/applicants/<id>/` — **the form must submit the complete list**; sending one entry deletes the others. Same for addresses, family members, emergency contacts.

## Flow: Wind a file down and revive it

**Actor:** Admin or Lead Manager · **Goal:** reflect standing without losing anything.

1. **Applicant Detail** → status control in the header → `POST /api/v1/applicants/<id>/status/` (`applicants.applicant.change_status`) — one history entry; **nothing else changes**, open journeys stay open.
2. Archive → same endpoint, `status: archived` — not hidden or deleted; still appears in unfiltered lists/search unless the caller filters on `status`.
3. Reactivate → same endpoint, `status: active` — if journeys should also resume, reopen those separately; archival never closed them.

## Flow: Review what changed on a file

1. **History panel** loads → `GET /api/v1/applicants/<id>/history/` (**cross-app: `audit`**) — render `summary` as the primary label, `changes` as from→to. Nested-collection events carry only a **count** in `metadata` — no passport numbers, addresses, or family names copied in. Do not build a diff viewer expecting old values.

---

## Endpoint coverage

| Policy key                           | Method / path                          | Used by flow(s)                  | Notes                               |
| ------------------------------------ | -------------------------------------- | -------------------------------- | ----------------------------------- |
| `applicants.applicant.list`          | `GET /api/v1/applicants/`              | Maintain a file over time        | Also the search surface             |
| `applicants.applicant.create`        | `POST /api/v1/applicants/`             | Create an applicant directly     | Admin only                          |
| `applicants.applicant.read`          | `GET /api/v1/applicants/<id>/`         | Complete a file; Maintain a file |                                     |
| `applicants.applicant.update`        | `PATCH /api/v1/applicants/<id>/`       | Complete a file; Maintain a file | Collections replace wholesale       |
| `applicants.applicant.change_status` | `POST /api/v1/applicants/<id>/status/` | Wind a file down and revive it   | Never triggered by journey activity |
| `applicants.applicant.list_history`  | `GET /api/v1/applicants/<id>/history/` | Review what changed              | Backed by `audit`                   |

## Cross-app dependencies

- **References (outbound):** `applicant_journeys.journey.create`/`.journey.list` from the Journeys panel; history served from `audit`'s event log. All flows require an `authenticate` session.
- **Referenced by other apps (inbound):** `leads` — the convert flow reads the applicant right after creating it. `applicant_journeys` — several flows call `applicants.applicant.list`/`.read` to pick the person a journey belongs to.

## Open questions

- No flow covers duplicate applicants — no merge endpoint exists; a near-name-match warning at create time would be UI-only.
- No photograph flow — do not wireframe an avatar upload.
- No education or test-score panels — those modules aren't built yet.
- Whether passport/date of birth should be Admin-only is unresolved — today any Lead Manager reads and edits them; don't imply a restriction that doesn't exist.
- No flow exists for linking a directly-created applicant to a lead discovered later.
