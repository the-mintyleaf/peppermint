# Flows

End-to-end sequences that span more than one entity. Each step names the
endpoint, the key inputs, and the branches the UI must handle. Field/error detail
lives in the entity files — this is the choreography.

## Staff intake of a new lead

1. `POST /api/v1/applicants/` → returns the applicant `id`
   (`lifecycle_stage=interested`, `record_version=1`).
   - `APPLICANT_CONTACT_REQUIRED` → the form needs at least one of
     `primary_email` / `primary_phone`; block submit until one is present.
   - `meta.possible_duplicate === true` → render the masked `meta.matches[]`
     (name + partial phone/email) and let the user confirm "create anyway" or
     cancel. **Non-blocking** — creation already succeeded; this is a warning.
2. `POST /api/v1/applicants/<id>/addresses/` → address `id` (optional, staff-ok).
3. `POST /api/v1/applicants/<id>/profile-image/` (multipart `file`) → `media_id`
   (optional, staff-ok).

## Admin qualifies and converts

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
2. Staff `PATCH /api/v1/applicants/<id>/` while locked →
   `APPLICANT_RECORD_LOCKED` (**423**). The UI should show the lock state and
   disable staff edit controls rather than let the request 423.
3. `POST /api/v1/applicants/<id>/unlock/` `{ reason }` releases it.

## Prepare and finalize a document

1. `GET /api/v1/applicants/<id>/document-prefill/` → a composed prefill object to
   seed the editor (the persisted document is an **independent snapshot** — later
   applicant edits never rewrite it).
2. `POST /api/v1/applicants/<id>/documents/`
   `{ document_type, document_content, ... }` → document `id` (`status=draft`).
3. Edit loop: `PATCH /api/v1/documents/<id>/`
   `{ document_content, record_version }` — each content edit advances
   `current_revision_number` and appends an immutable revision.
4. `POST /api/v1/documents/<id>/ready/` → `POST .../finalize/` →
   `POST .../submit/`. Out-of-order → `APPLICANT_DOCUMENT_STATUS_INVALID` (409).
5. Record a print: `POST /api/v1/documents/<id>/print-events/` with the
   frontend-computed `derived_values_snapshot` (stored verbatim as evidence).
