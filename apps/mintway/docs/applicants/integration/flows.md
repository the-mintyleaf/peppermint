# Flows

End-to-end sequences that span more than one entity. Each step names the endpoint,
the key inputs, and the branches the UI must handle. Field/error detail lives in
the entity files — this is the choreography.

## Staff lead intake → admin conversion (Phase 7)

1. Staff `POST /api/v1/applicants/leads/` `{ first_name, contact_number?, email?,
… }` → returns the lead `id` + `lead_code` (`record_version=1`).
   - Only `first_name` is required — capture whatever the enquiry gives.
2. Staff `PATCH /api/v1/applicants/leads/<lead_id>/` `{ …, record_version? }` —
   refine the enquiry over follow-ups. Send `record_version` (from the last read)
   to catch concurrent edits (`APPLICANT_LEAD_VERSION_CONFLICT`).
3. Admin `POST /api/v1/applicants/leads/<lead_id>/convert/` `{ target_country }` →
   `{ lead, applicant }` (the applicant starts at `lifecycle_stage=interested`).
   - `APPLICANT_LEAD_CONVERT_COUNTRY_REQUIRED` → supply a target country.
   - `APPLICANT_LEAD_ALREADY_CONVERTED` → the lead is already behind an applicant;
     link through `converted_applicant_code`.
   - `meta.possible_duplicate` → show masked matches (non-blocking).
   - Conversion migrates name / contact / email / DOB / `payment_status` /
     `lead_source*`, creates an address (from `address`), an identity document
     (from `passport_number`), and an interest profile seeded with
     `target_country`. Enquiry-only fields stay on the (now frozen) lead.

> Staff can **no longer** create an applicant directly (Phase 7 → 403) — they must
> funnel through a lead. Only admins convert.

## Admin creates an applicant directly

1. Admin `POST /api/v1/applicants/` → returns the applicant `id`
   (`lifecycle_stage=interested`, `record_version=1`). **Admin only** — staff → 403.
   - `meta.possible_duplicate === true` → render the masked `meta.matches[]` and
     let the user confirm "create anyway" or cancel. **Non-blocking.**
2. `POST /api/v1/applicants/<id>/addresses/` → address `id` (optional, staff-ok).
3. `POST /api/v1/applicants/<id>/profile-image/` (multipart `file`) → `media_id`
   (optional, staff-ok).

## Admin qualifies and converts through the funnel

1. `POST /api/v1/applicants/<id>/qualification-assessments/`
   `{ eligibility_result: "suitable" }` → assessment `id`.
2. `POST /api/v1/applicants/<id>/transition/`
   `{ lifecycle_stage: "potential", qualification_assessment_id, record_version }`.
   - `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` → the move to `potential` needs
     either an assessment id **or** an override `reason`; prompt for one.
3. `POST /api/v1/applicants/<id>/transition/`
   `{ lifecycle_stage: "applicant", record_version }` → server stamps
   `converted_at`.
   - `APPLICANT_TRANSITION_INVALID` → target stage is backward/illegal (stage is
     forward-only); refresh and re-derive the allowed next stages.
   - `APPLICANT_VERSION_CONFLICT` → reload the applicant, retry with the new
     `record_version`.

> A single jump `interested → applicant` (skipping `potential`) is allowed but
> **requires a `reason`** — otherwise `APPLICANT_TRANSITION_REASON_REQUIRED`.

## Admin freezes a record during review

1. `POST /api/v1/applicants/<id>/lock/` `{ reason }` (reason mandatory).
2. Staff `PATCH /api/v1/applicants/<id>/` while locked → `APPLICANT_RECORD_LOCKED`
   (**423**). The UI should show the lock state and disable staff edit controls
   rather than let the request 423.
3. `POST /api/v1/applicants/<id>/unlock/` `{ reason }` releases it.

## Open a case and drive its status

1. `POST /api/v1/applicants/<id>/cases/` `{ destination_country, institution, … }`
   → case `id` (`case_status=planning`, `opened_at` set).
2. `POST /api/v1/applicants/<id>/assignments/`
   `{ assigned_to, application_case_id }` → sets the case's `assigned_counsellor`.
3. `POST /api/v1/application-cases/<case_id>/transition/`
   `{ into_status, reason?, record_version }` — a reason is required into
   `visa_refused` / `withdrawn` / `archived`; reaching a closed status stamps
   `closed_at`.

## Prepare and finalize a document

1. `GET /api/v1/applicants/<id>/document-prefill/` → a composed prefill object to
   seed the editor (the persisted document is an **independent snapshot** — later
   applicant edits never rewrite it).
2. `POST /api/v1/applicants/<id>/documents/`
   `{ document_type, document_content, … }` → document `id` (`status=draft`).
3. Edit loop: `PATCH /api/v1/documents/<id>/`
   `{ document_content, record_version }` — each content edit advances
   `current_revision_number` and appends an immutable revision.
4. `POST /api/v1/documents/<id>/ready/` → `POST .../finalize/` →
   `POST .../submit/`. Out-of-order → `APPLICANT_DOCUMENT_STATUS_INVALID` (409).
5. Record a print: `POST /api/v1/documents/<id>/print-events/` with the
   frontend-computed `derived_values_snapshot` (stored verbatim as evidence).

> Certificate documents referencing `instructor_id` / `director_id` require each to
> resolve to an **active** signature (`APPLICANT_SIGNATURE_INVALID`). Create the
> signatory in `/api/v1/signatures/` first.

## Merge a confirmed duplicate

1. `POST /api/v1/applicants/<duplicate_id>/merge/`
   `{ surviving_applicant_id, reason, field_resolutions? }` → transfers every
   related record to the survivor; the duplicate is retained + marked merged (code
   preserved) and drops out of active lists.
   - `APPLICANT_MERGE_SELF` / `APPLICANT_MERGE_ALREADY_MERGED` → refresh; a merged
     record can't be re-merged.
2. `GET /api/v1/applicants/<id>/merge-history/` → audit the merge records.
