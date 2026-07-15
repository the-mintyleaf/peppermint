## 1. Module
- **Name:** Applicant CRM & Documents (`applicant`)
- **Base path:** `/api/v1/applicants/`
- **Auth:** JWT bearer / session (`Authorization: Bearer <access>`); all endpoints require an authenticated consultancy account.

## 2. Conventions  (extracted from the doc — not assumed)
- **Response:** `{ success, message, data, meta }` wrapper.
- **Error:** `{ success: false, error: { code, message, details }, meta }`.
- **Auth failures:** `401` when unauthenticated; `403` when the role is insufficient (staff hitting admin-only actions). Bodies use the error wrapper; exact 401/403 payloads not shown → Gaps.
- **Pagination:** `?page`, `?page_size` (max 100); list `meta` = `{ count, page, page_size, next, previous }`.
- **IDs:** string UUIDs. **Times:** ISO 8601; protected user-facing dates add a `*_bs` Bikram Sambat object (`{ year, month, day, month_name_en, month_name_np, display_en, display_np }`).
- **List/search/filter/order params:** `search`, `lifecycle_stage`, `engagement_status`, `nationality`, `ordering` (staff); admin adds `is_locked`, `follow_up_priority`, `include_archived`, `created_from`, `created_to`, `updated_from`, `updated_to`, `next_follow_up_from`, `next_follow_up_to`. `ordering` = comma list over `full_name`, `created_at`, `updated_at`, `next_follow_up_at`, `lifecycle_stage`, `applicant_code` (prefix `-` for descending).

## 3. Models

**Applicant** (role-projected — staff receive a strict subset)
`{ id, applicant_code, first_name, middle_name?, last_name?, full_name, name_native?, preferred_display_name?, nationality?, primary_email?, alternate_email?, primary_phone?, alternate_phone?, lead_source?[enum], lead_source_detail?, initial_interest?, lifecycle_stage[enum], engagement_status[enum], is_locked, record_version, profile_image_url?, created_at, updated_at }`
- admin-only extra fields: `date_of_birth?`, `date_of_birth_bs?:json`, `gender?[enum]`, `religion?`, `full_name_romanized`, `summary?`, `eligibility_summary?`, `counselling_notes?`, `last_contacted_at?`, `next_follow_up_at?`, `follow_up_priority?[enum]`, `converted_at?`, `locked_at?`, `lock_reason?`, `archived_at?`
- staff list rows expose only: `id, applicant_code, full_name, primary_email, primary_phone, lifecycle_stage, engagement_status, is_locked, created_at, updated_at`

**Address**
`{ id, address_type[enum], country?, province_or_state?, district?, municipality?, ward?, locality?, street?, postal_code?, address_text?, is_primary, valid_from?, valid_to?, created_at, updated_at }`
- at most one `is_primary` per applicant (setting it demotes the previous)

**LifecycleHistory** (read-only, append-only)
`{ id, from_stage?[enum], into_stage?[enum], from_engagement_status?[enum], into_engagement_status?[enum], reason?, notes?, changed_by?, request_id?, created_at }`

**LockHistory** (read-only, append-only)
`{ id, action[enum], reason, performed_by?, previous_lock_actor?, request_id?, created_at }`

**DuplicateMatch** (in create `meta` only)
`{ applicant_code, display_name, phone_match, email_match }`

## 4. Enums
- `Applicant.lifecycle_stage: interested | potential | applicant`
- `Applicant.engagement_status: active | on_hold | lost | disqualified | withdrawn | archived`
- `Applicant.gender: male | female | other | undisclosed`
- `Applicant.lead_source: walk_in | referral | online | phone | social_media | event | agent | other`
- `Applicant.follow_up_priority: low | normal | high | urgent`
- `Address.address_type: current | permanent | mailing | foreign | other`
- `LockHistory.action: locked | unlocked`
- `IdentityDocument.document_type: passport | citizenship | national_id | birth_certificate | driving_licence | other`
- `IdentityDocument.verification_status: unverified | pending | verified | rejected`
- `LanguageTest.test_type: ielts | pte | toefl | duolingo | other`
- `Skill.proficiency / Language.proficiency: beginner | elementary | intermediate | advanced | proficient | native`
- `Education.completion_status: completed | ongoing | incomplete`
- `Media.category: profile_photo | passport_photo | passport_scan | citizenship_scan | national_id_scan | birth_certificate | academic_document | language_certificate | financial_evidence | visa_document | application_document | other`
- `Interaction.interaction_type: inquiry | call | email | message | office_visit | counselling | document_request | follow_up | other`
- `Interaction.direction: inbound | outbound | internal`
- `QualificationAssessment.eligibility_result: suitable | conditionally_suitable | unsuitable | pending`
- `Sponsor.sponsor_type: self | family | person | employer | organization | other`
- `VisaHistory.decision: approved | refused | withdrawn | pending`
- `Consent.consent_type: data_processing | document_preparation | information_sharing | marketing | other`
- `Consent.status: granted | withdrawn | expired`
- `ApplicationCase.case_status: planning | document_collection | application_preparation | submitted | offer_received | visa_preparation | visa_submitted | visa_approved | visa_refused | travel_preparation | completed | withdrawn | archived`
- `Document.status: draft | ready | finalized | submitted | superseded | archived`
- `Document.document_type: one of 53 canonical slugs (see backend document-schemas.md)`
- `PrintEvent.print_status: rendered | print_initiated | artifact_downloaded | failed`

## 5. Dependency order
- `Address` needs `Applicant` (create the applicant first).
- Profile image / evidence media / every profile child / interest profile need `Applicant` and an admin/superadmin actor (profile image + addresses also allow staff).
- Identity-document media references (`image_front`/`image_back`/`file`) need an evidence `Media` upload first, owned by the same applicant.
- Transition / lock / history need `Applicant` and an admin/superadmin actor.
- Authentication `(external module)` — an account/token must exist before any call.
- **Start here:** `Applicant`.

## 6. Endpoints

### Applicant — `/api/v1/applicants/`
**Use it when:** listing/searching applicants, creating a lead, viewing or editing an applicant.

**Methods:**
- `GET /api/v1/applicants/`
- `POST /api/v1/applicants/`
- `GET /api/v1/applicants/<applicant_id>/`
- `PATCH /api/v1/applicants/<applicant_id>/`
- `DELETE /api/v1/applicants/<applicant_id>/`

**Send (create):**
- staff: `{ first_name (required), middle_name?, last_name?, full_name?, preferred_display_name?, name_native?, primary_email?, alternate_email?, primary_phone?, alternate_phone?, nationality?, lead_source?, lead_source_detail?, initial_interest? }`
- admin: staff fields plus `{ date_of_birth?, gender?, religion?, summary?, eligibility_summary?, counselling_notes?, last_contacted_at?, next_follow_up_at?, follow_up_priority? }`

**Send (update):**
- same as create for the role, plus `record_version (required)`

**Send (delete):**
- `{ record_version (required), reason? }`

**Returns:** Applicant (role-projected). List → list[Applicant]. Create → Applicant with `meta.possible_duplicate` + `meta.matches[]:DuplicateMatch` when a duplicate is detected.

**Notes:**
- Staff create always yields `lifecycle_stage=interested`, `engagement_status=active`; non-whitelisted fields in the body are ignored.
- `applicant_code`, `lifecycle_stage`, `engagement_status`, lock fields, `record_version` are never writable here.
- `DELETE` archives (soft delete); admin/superadmin only.
- Staff must send at least one of `primary_email`/`primary_phone` on create.

**Errors:**
- `APPLICANT_NOT_FOUND` (404) — unknown/malformed id
- `APPLICANT_VERSION_CONFLICT` (409) — stale `record_version`
- `APPLICANT_RECORD_LOCKED` (423) — staff update on a locked applicant
- `APPLICANT_FIELD_FORBIDDEN` (403) — staff non-whitelist field, or non-admin archive
- `APPLICANT_CONTACT_REQUIRED` (400) — staff create without email/phone
- `APPLICANT_ARCHIVED` (409) — update on an archived applicant

### Applicant transition — `/api/v1/applicants/<applicant_id>/transition/`
**Use it when:** moving an applicant through the funnel or changing engagement status. Admin/superadmin only.

**Methods:**
- `POST /api/v1/applicants/<applicant_id>/transition/`

**Send:**
- `{ lifecycle_stage?, engagement_status?, reason?, notes?, qualification_assessment_id?, record_version (required) }` (at least one of `lifecycle_stage`/`engagement_status`)

**Returns:** Applicant (admin projection).

**Notes:**
- Stage is forward-only (`interested→potential→applicant`); the single jump `interested→applicant` requires `reason`.
- Moving **to `potential`** requires either a `qualification_assessment_id` (of this applicant) or a `reason` (override).
- `lost`/`disqualified`/`withdrawn`/`archived` engagement requires `reason`.
- Reaching `applicant` stamps `converted_at`.

**Errors:**
- `APPLICANT_TRANSITION_INVALID` (409)
- `APPLICANT_TRANSITION_REASON_REQUIRED` (400)
- `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` (400)
- `APPLICANT_ASSESSMENT_NOT_FOUND` (404)
- `APPLICANT_ENGAGEMENT_REASON_REQUIRED` (400)
- `APPLICANT_VERSION_CONFLICT` (409)

### Applicant lock — `/api/v1/applicants/<applicant_id>/lock/` and `/unlock/`
**Use it when:** freezing an applicant against staff edits, or releasing that freeze. Admin/superadmin only.

**Methods:**
- `POST /api/v1/applicants/<applicant_id>/lock/`
- `POST /api/v1/applicants/<applicant_id>/unlock/`

**Send:**
- `{ reason (required) }`

**Returns:** Applicant (admin projection).

**Errors:**
- `APPLICANT_LOCK_REASON_REQUIRED` (400)
- `APPLICANT_ALREADY_LOCKED` (409)
- `APPLICANT_NOT_LOCKED` (409)

### Applicant history — `/api/v1/applicants/<applicant_id>/lifecycle-history/` and `/lock-history/`
**Use it when:** showing the audit timeline of funnel or lock changes. Admin/superadmin only.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/lifecycle-history/`
- `GET /api/v1/applicants/<applicant_id>/lock-history/`

**Returns:** list[LifecycleHistory] / list[LockHistory] (paginated, newest first).

**Errors:** none

### Address — `/api/v1/applicants/<applicant_id>/addresses/`
**Use it when:** managing an applicant's addresses. Staff and above.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/addresses/`
- `POST /api/v1/applicants/<applicant_id>/addresses/`
- `PATCH /api/v1/applicants/<applicant_id>/addresses/<address_id>/`
- `DELETE /api/v1/applicants/<applicant_id>/addresses/<address_id>/`

**Send (create/update):**
- `{ address_type?, country?, province_or_state?, district?, municipality?, ward?, locality?, street?, postal_code?, address_text?, is_primary?, valid_from?, valid_to? }`

**Returns:** Address | list[Address].

**Notes:**
- Setting `is_primary` demotes the current primary.
- Honours the applicant lock for staff and the applicant archive state.

**Errors:**
- `APPLICANT_ADDRESS_NOT_FOUND` (404)
- `APPLICANT_RECORD_LOCKED` (423) — staff, locked applicant
- `APPLICANT_ARCHIVED` (409)

### Profile image — `/api/v1/applicants/<applicant_id>/profile-image/`
**Use it when:** showing or replacing an applicant's photo. Staff and above.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/profile-image/`
- `POST /api/v1/applicants/<applicant_id>/profile-image/`

**Send (upload):**
- multipart `file` (required) — JPEG/PNG/WEBP, ≤5 MB

**Returns:**
- `GET` streams the image bytes (`Content-Disposition: inline`), not a JSON body
- `POST` → `{ media_id, checksum, mime_type }`

**Notes:**
- Served only through this endpoint; there is no public file URL.
- Upload retires the previous current photo; honours the applicant lock for staff.

**Errors:**
- `APPLICANT_MEDIA_INVALID` (400) — invalid/oversized/unsupported file; also `404` on `GET` when no photo is set

### Profile children — `/api/v1/applicants/<applicant_id>/<resource>/`
**Use it when:** managing an applicant's structured profile (identity, education, languages, work, skills, references, family, emergency contacts, trainings, academic grading). Admin/superadmin only; staff get `403`.

**Resources (`<resource>`):**
- `emergency-contacts`
- `family-members`
- `identity-documents`
- `educations`
- `language-tests`
- `work-experiences`
- `skills`
- `trainings`
- `languages`
- `references`
- `academic-gradings`

**Methods (each resource, uniform CRUD):**
- `GET /…/<resource>/`
- `POST /…/<resource>/`
- `GET /…/<resource>/<child_id>/`
- `PATCH /…/<resource>/<child_id>/`
- `DELETE /…/<resource>/<child_id>/`

**Send (create/update):** the resource's fields (see backend `DATA_CONTRACT §9`); user-entered text is normalized, and read responses add a `<field>_bs` sibling for date fields.

**Returns:** the resource object | list of them.

**Notes:**
- All admin/superadmin only; parent archive/lock guarded.
- `identity-documents`: `document_number` is write-only-ish (stored, never echoed as plaintext elsewhere); `image_front`/`image_back`/`file` take a `Media` id owned by the same applicant; `issued_at ≤ expires_at`. On create, `meta.possible_duplicate` + `matches[]` (with `identity_match`) appears when the passport/ID number collides with another applicant.
- `language-tests`: scores are range-checked per `test_type`.

**Errors:**
- `APPLICANT_CHILD_NOT_FOUND` (404)
- `APPLICANT_IDENTITY_DATE_INVALID` (400) — identity issue after expiry
- `APPLICANT_LANGUAGE_TEST_SCORE_INVALID` (400)
- `APPLICANT_MEDIA_INVALID` (400) — cross-applicant media reference

### Interest profile — `/api/v1/applicants/<applicant_id>/interest-profile/`
**Use it when:** capturing the applicant's migration preferences. Admin/superadmin only. One per applicant.

**Methods:**
- `GET /…/interest-profile/`
- `POST /…/interest-profile/`
- `PATCH /…/interest-profile/`
- `DELETE /…/interest-profile/`

**Send (create/update):** `{ preferred_countries?:[], preferred_study_levels?:[], …, estimated_budget?, budget_currency?, target_program?, … }`.

**Returns:** InterestProfile.

**Errors:**
- `APPLICANT_CHILD_NOT_FOUND` (404) — `GET`/`PATCH` before creation
- `APPLICANT_INTEREST_PROFILE_EXISTS` (409) — second `POST`

### Evidence media — `/api/v1/applicants/<applicant_id>/media/`
**Use it when:** uploading/viewing identity scans and other evidence. Admin/superadmin only.

**Methods:**
- `GET /…/media/`
- `POST /…/media/`
- `GET /…/media/<media_id>/`
- `DELETE /…/media/<media_id>/`

**Send (upload):**
- multipart `category` (any non-`profile_photo` category) + `file` — image (≤5 MB) or PDF (≤10 MB)

**Returns:**
- list/`POST` → Media metadata `{ id, category, mime_type, size_bytes, checksum, is_current, … }`
- `GET …/<media_id>/` streams the bytes (`inline`), not JSON

**Notes:**
- Content-sniffed (image via decode, PDF via signature); no public URL; `DELETE` soft-archives (file retained).

**Errors:**
- `APPLICANT_MEDIA_TYPE_UNSUPPORTED` (400)
- `APPLICANT_MEDIA_TOO_LARGE` (400)
- `APPLICANT_MEDIA_INVALID` (400)
- `APPLICANT_MEDIA_NOT_FOUND` (404)

### CRM / compliance children — `/api/v1/applicants/<applicant_id>/<resource>/`
**Use it when:** recording counselling contact, sponsors, travel/visa history, and consent. Admin/superadmin only; staff get `403`.

**Resources (`<resource>`):**
- `interactions`
- `sponsors`
- `travel-history`
- `visa-history`
- `consents`

**Methods (each, uniform CRUD):**
- `GET/POST /…/<resource>/`
- `GET/PATCH/DELETE /…/<resource>/<child_id>/`

**Send (create/update):** the resource's fields (backend `DATA_CONTRACT §10`).

**Returns:** the resource object | list.

**Notes:**
- `interactions`: `occurred_at` required; a create/update updates the applicant's follow-up projections.
- `sponsors`: `annual_income`/`funding_amount` are decimal strings.
- `visa-history` / `consents`: `evidence_media` takes a `Media` id owned by the same applicant.
- `consents`: sending `status: "withdrawn"` server-stamps `withdrawn_at`.

**Errors:**
- `APPLICANT_CHILD_NOT_FOUND` (404)
- `APPLICANT_MEDIA_INVALID` (400) — cross-applicant `evidence_media`

### Qualification assessments — `/api/v1/applicants/<applicant_id>/qualification-assessments/`
**Use it when:** recording an eligibility assessment (backs the move to `potential`). Admin/superadmin only.

**Methods:**
- `GET /…/qualification-assessments/`
- `POST /…/qualification-assessments/`
- `GET /…/qualification-assessments/<assessment_id>/`

**Send (create):** `{ eligibility_result?, assessment_date?, preferred_destination?, recommendation?, … }`.

**Returns:** QualificationAssessment (`is_current` server-managed).

**Notes:**
- A new assessment supersedes the prior current one; there is **no** update or delete (`PATCH`/`DELETE` → `405`). History is preserved.
- Use the returned `id` as `qualification_assessment_id` on the transition to `potential`.

**Errors:**
- `APPLICANT_ASSESSMENT_NOT_FOUND` (404)

### Application cases — list/create nested, detail top-level
**Use it when:** managing an applicant's destination/institution/program pathways. Admin/superadmin only.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/cases/`
- `POST /api/v1/applicants/<applicant_id>/cases/`
- `GET /api/v1/application-cases/<case_id>/`
- `PATCH /api/v1/application-cases/<case_id>/`
- `POST /api/v1/application-cases/<case_id>/transition/`
- `GET /api/v1/application-cases/<case_id>/status-history/`

**Send (create/update):** pathway fields `{ destination_country?, institution?, program?, intake?, study_level?, … }`; `PATCH` also needs `record_version`. `case_status`/`case_code` are not writable here.

**Send (transition):** `{ into_status, reason?, notes?, record_version }`.

**Returns:** ApplicationCase (`case_code`, `case_status`, `record_version`, `opened_at`/`closed_at` + `*_bs`).

**Notes:**
- Create sets `planning` + `opened_at` + `case_code`.
- Status changes only through `transition`; `visa_refused`/`withdrawn`/`archived` need a `reason`; a closed status stamps `closed_at`.

**Errors:**
- `APPLICANT_CASE_NOT_FOUND` (404)
- `APPLICANT_CASE_VERSION_CONFLICT` (409)
- `APPLICANT_CASE_TRANSITION_INVALID` (409)
- `APPLICANT_CASE_REASON_REQUIRED` (400)
- `APPLICANT_CASE_ARCHIVED` (409)

### Assignments — `/api/v1/applicants/<applicant_id>/assignments/`
**Use it when:** assigning an applicant/case to a counsellor. Admin/superadmin only.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/assignments/`
- `POST /api/v1/applicants/<applicant_id>/assignments/`
- `POST /api/v1/applicants/<applicant_id>/assignments/<assignment_id>/end/`

**Send (assign):** `{ assigned_to (user id), application_case_id?, reason? }`.
**Send (end):** `{ reason? }`.

**Returns:** Assignment `{ id, application_case?, assigned_to, assigned_at, ended_at?, is_current }`.

**Notes:**
- A new assignment ends the prior current one at the same scope; a case-scoped assign sets the case's `assigned_counsellor`.

**Errors:**
- `APPLICANT_ASSIGNEE_INVALID` (400)
- `APPLICANT_CASE_APPLICANT_MISMATCH` (409)
- `APPLICANT_ASSIGNMENT_NOT_FOUND` (404)

### Applicant merge — `/api/v1/applicants/<duplicate_id>/merge/`
**Use it when:** folding a confirmed duplicate into a surviving applicant. Admin/superadmin only.

**Methods:**
- `POST /api/v1/applicants/<duplicate_id>/merge/`
- `GET /api/v1/applicants/<applicant_id>/merge-history/`

**Send (merge):** `{ surviving_applicant_id, reason, field_resolutions? }` — `field_resolutions` is `{ field: "duplicate" }` for the scalar fields to copy from the duplicate.

**Returns:** `{ surviving_applicant, merge }` (the merge record has `transferred_counts`, `field_resolutions`).

**Notes:**
- Transfers all related records (children, media, cases, documents, revisions, print) to the survivor; the duplicate is retained + marked merged (code preserved) and drops out of active lists.

**Errors:**
- `APPLICANT_MERGE_SELF` (400)
- `APPLICANT_MERGE_SURVIVING_NOT_FOUND` (404)
- `APPLICANT_MERGE_ALREADY_MERGED` (409)

### Documents — list/create nested, detail + actions top-level
**Use it when:** preparing an applicant's documents (CV, certificate, WODA/LOR/MOI, bank). Admin/superadmin only — **staff get `404`, not `403`**.

**Methods:**
- `GET /api/v1/applicants/<applicant_id>/documents/`
- `POST /api/v1/applicants/<applicant_id>/documents/`
- `GET /api/v1/documents/<document_id>/`
- `PATCH /api/v1/documents/<document_id>/`
- `DELETE /api/v1/documents/<document_id>/`
- `POST /api/v1/documents/<document_id>/ready/`
- `POST /api/v1/documents/<document_id>/finalize/`
- `POST /api/v1/documents/<document_id>/submit/`
- `POST /api/v1/documents/<document_id>/archive/`
- `GET /api/v1/applicants/<applicant_id>/document-prefill/`
- `GET /api/v1/documents/workspaces/`

**Send (create):** `{ document_type, label?, application_case_id?, document_content?, schema_version?, template_key?, template_version? }`.
**Send (update):** `{ label?, document_content?, schema_version?, record_version (required) }`.

**Returns:** Document `{ id, document_type, status, document_content, schema_version, current_revision_number, record_version, … }`; prefill returns a composed object; workspaces returns a list of `{ applicant_id, applicant_code, applicant_name, document_count, draft_count, finalized_count, submitted_count, last_updated }`.

**Notes:**
- `document_content` is validated by the type's family (see `document-schemas.md`); derived values are computed by the frontend and must not be sent.
- Editable only in `draft`/`ready`; a content edit advances `current_revision_number`.
- Status moves only via the action endpoints (`ready`→`finalize`→`submit`; `archive` any time).

**Errors:**
- `APPLICANT_DOCUMENT_NOT_FOUND` (404 — includes staff)
- `APPLICANT_DOCUMENT_TYPE_INVALID` (400)
- `APPLICANT_DOCUMENT_CONTENT_INVALID` (400)
- `APPLICANT_DOCUMENT_VERSION_CONFLICT` (409)
- `APPLICANT_DOCUMENT_NOT_EDITABLE` (409)
- `APPLICANT_DOCUMENT_STATUS_INVALID` (409)
- `APPLICANT_SIGNATURE_INVALID` (400 — certificate `instructor_id`/`director_id` must resolve to an active signature)

### Document revisions + print events — under `/api/v1/documents/<document_id>/`
**Use it when:** showing edit history, restoring a prior version, or recording a print. Admin-only; staff `404`.

**Methods:**
- `GET /…/revisions/`
- `GET /…/revisions/<revision_number>/`
- `POST /…/revisions/<revision_number>/restore/`
- `GET /…/print-events/`
- `POST /…/print-events/`
- `GET /…/print-events/<print_event_id>/`

**Send (print create):** `{ revision_number?, content_snapshot?, resolved_applicant_data_snapshot?, derived_values_snapshot?, render_config_snapshot?, template_key?, template_version?, renderer_version?, print_status?, client_metadata?, artifact? }` (multipart if `artifact`).

**Returns:** Revision / PrintEvent objects.

**Notes:**
- A revision is auto-created on every persisted content edit; restore appends a new revision (never mutates history).
- Print events store the frontend-computed derived values verbatim and are retained after archival.

### Document search — `GET /api/v1/documents/search/`
**Use it when:** finding documents across applicants. Admin-only.
**Params:** `document_type`, `status`, `label`, `applicant`, `template_version`, `application_case_id`, `created_from/to`, `updated_from/to`. Paginated.

### Signatures — `/api/v1/signatures/`
**Use it when:** managing signatories for certificates. Admin-only; staff `404`.

**Methods:**
- `GET /api/v1/signatures/` (`?active=true`)
- `POST /api/v1/signatures/`
- `GET /api/v1/signatures/<signature_id>/`
- `PATCH /api/v1/signatures/<signature_id>/`
- `DELETE /api/v1/signatures/<signature_id>/`
- `GET /api/v1/signatures/<signature_id>/image/`

**Send (create/update):** multipart `{ name (required), title?, organization?, email?, phone?, is_active?, valid_from?, valid_to?, signature_image? }`.

**Returns:** Signature `{ id, name, title, organization, is_active, has_image, image_checksum, … }`; the image endpoint streams bytes.

**Notes:**
- `DELETE` deactivates (retained for history); the image is private (no public URL).

**Errors:**
- `APPLICANT_SIGNATURE_NOT_FOUND` (404)
- `APPLICANT_REVISION_NOT_FOUND` / `APPLICANT_PRINT_EVENT_NOT_FOUND` (404)

## 7. Flows

**Staff intake of a new lead**
1. `POST /api/v1/applicants/` → `id` (`lifecycle_stage=interested`)
   - `APPLICANT_CONTACT_REQUIRED` → collect an email or phone first
   - `meta.possible_duplicate` → show masked matches, let the user confirm or cancel
2. `POST /api/v1/applicants/<id>/addresses/` → address `id`
3. `POST /api/v1/applicants/<id>/profile-image/` → `media_id`

**Admin qualifies and converts**
1. `POST /api/v1/applicants/<id>/qualification-assessments/` `{ eligibility_result: "suitable" }` → assessment `id`
2. `POST /api/v1/applicants/<id>/transition/` `{ lifecycle_stage: "potential", qualification_assessment_id, record_version }` (or a `reason` override)
   - `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` → provide an assessment id or a reason
3. `POST /api/v1/applicants/<id>/transition/` `{ lifecycle_stage: "applicant", record_version }` → `converted_at` set
   - `APPLICANT_TRANSITION_INVALID` → the target stage is backward/illegal
   - `APPLICANT_VERSION_CONFLICT` → reload the applicant and retry with the new `record_version`

**Admin freezes a record during review**
1. `POST /api/v1/applicants/<id>/lock/` `{ reason }`
2. staff `PATCH /api/v1/applicants/<id>/`
   - `APPLICANT_RECORD_LOCKED` → staff cannot edit until unlocked
3. `POST /api/v1/applicants/<id>/unlock/` `{ reason }`

## 8. Gaps
- Exact `401`/`403` response bodies are not shown in the source docs (only status codes).
- Full validation-error body shape for serializer failures (DRF `VALIDATION_ERROR`) is not enumerated per field.
- Application cases, full profile subrecords, documents, revisions, print events, and signatures are out of scope for Phase 1 (later phases) — no endpoints yet.
- Whether staff may read another staff member's created applicants beyond the restricted projection is governed by role only; finer per-record scoping is future permission-app work.
