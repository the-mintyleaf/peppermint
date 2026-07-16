# API Documentation — Applicant CRM & Documents

**App:** `applicant`
**Version:** 1.6.0
**Base prefix:** `/api/v1/applicants/` (cases under `/api/v1/application-cases/`, documents under `/api/v1/documents/`, signatures under `/api/v1/signatures/`)
**Auth:** JWT bearer / session (`authenticate.authentication.SessionJWTAuthentication`). Role-based access via `applicant.permissions` (see `SECURITY.md`).
**Throttle:** project defaults (`anon` 100/h, `user` 1000/h). No custom scopes.
**Access level:** Mixed — staff get restricted applicant list/create/read/update + addresses + profile image; **every profile child, interest profile, and evidence-media endpoint is admin/superadmin-only**; admin/superadmin also get transition, lock, history.

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                    |
| ------- | ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-15 | AI (Claude) | Initial API — applicant CRUD, lifecycle, lock, addresses, profile image.                                                                                                   |
| 1.1.0   | 2026-07-15 | AI (Claude) | Phase 2a — 11 admin-only profile-child resources, interest profile, general evidence media, identity fingerprint dedupe.                                                   |
| 1.2.0   | 2026-07-15 | AI (Claude) | Phase 2b — CRM/compliance children (interactions, sponsors, travel, visa, consent), qualification assessments (supersede), assessment↔lifecycle coupling on `→ potential`. |
| 1.3.0   | 2026-07-15 | AI (Claude) | Phase 3 — application cases (CRUD + transition-only status + history), assignments, `application_case` linking on media/sponsor/interaction.                               |
| 1.4.0   | 2026-07-15 | AI (Claude) | Phase 4 — documents (53-type registry, validated content, status lifecycle), prefill, workspaces (all admin-only, staff 404).                                              |
| 1.5.0   | 2026-07-15 | AI (Claude) | Phase 5 — revisions, print events, signatures, document search; certificate signature resolution.                                                                          |
| 1.6.0   | 2026-07-15 | AI (Claude) | Phase 6 — admin duplicate merge + merge history.                                                                                                                           |

---

## Generic envelopes (referenced throughout)

**Success:** `{ "success": true, "message": "...", "data": { ... }, "meta": {} }`
**Error:** `{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }`
**Lists:** paginated via `StandardPagination` — `meta` = `{count, page, page_size, next, previous}`; `?page`, `?page_size` (max 100).

**AI debugging notes (app-wide):** All responses are role-projected — a staff token and an admin token calling the same GET receive **different field sets** by design (§9.4). IDs are strings; timestamps ISO 8601; protected user-facing dates carry a `*_bs` Bikram Sambat sibling. `record_version` is mandatory on `PATCH`/`DELETE`/`transition`; a mismatch is `409`.

---

## 1. Applicants

### 1.1 List / search — `GET /api/v1/applicants/`

**Policy key:** `applicant.applicant.list` (risk: medium)
**Request:** query params — `search`, `lifecycle_stage`, `engagement_status`, `nationality`, `ordering` (staff subset); admin adds `is_locked`, `follow_up_priority`, `include_archived`, `created_from/to`, `updated_from/to`, `next_follow_up_from/to`. `ordering` is a comma list over `{full_name, created_at, updated_at, next_follow_up_at, lifecycle_stage, applicant_code}` with `-` for descending.
**Response:** paginated `ApplicantListStaffSerializer` (staff) or `ApplicantListAdminSerializer` (admin).
**Query access pattern:** `selectors.search_applicants` — `__icontains` OR across name/romanized/native/code/normalized email+phone/alias; PostgreSQL GIN trigram indexes accelerate it (§39.6). Archived excluded unless `include_archived` (admin).

### 1.2 Create — `POST /api/v1/applicants/`

**Policy key:** `applicant.applicant.create` (risk: medium)
**Request:** staff → `ApplicantWriteStaffSerializer` (whitelist only; forced `interested`/`active`); admin → `ApplicantWriteAdminSerializer` (adds DOB/gender/religion/summary/follow-up).
**Response:** role detail projection (`201`). `meta.possible_duplicate` + masked `matches[]` when an exact email/phone match exists (non-blocking, §11.2).
**Validation:** `first_name` required; staff must supply email or phone (`APPLICANT_CONTACT_REQUIRED`); text NFC-normalized.
**Business rules:** generates `applicant_code`; `record_version=1`; emits `applicant.created` (+`applicant.duplicate_flagged`) audit.

### 1.3 Read — `GET /api/v1/applicants/{applicant_id}/`

**Policy key:** `applicant.applicant.read` (risk: medium)
**Response:** `ApplicantDetailStaffSerializer` or `ApplicantDetailAdminSerializer` (`DATA_CONTRACT.md §1`). Staff projection omits `date_of_birth`, `religion`, `counselling_notes`, follow-up, lock/convert metadata.
**Error codes:** `APPLICANT_NOT_FOUND` (404 — also for malformed UUID, non-disclosing).

### 1.4 Update — `PATCH /api/v1/applicants/{applicant_id}/`

**Policy key:** `applicant.applicant.update` (risk: medium)
**Request:** partial role write serializer + mandatory `record_version`.
**Error codes:** `APPLICANT_RECORD_LOCKED` (423 — staff write to a locked record), `APPLICANT_VERSION_CONFLICT` (409), `APPLICANT_FIELD_FORBIDDEN` (403 — staff non-whitelist field at the service layer), `APPLICANT_ARCHIVED` (409).
**Business rules:** lock checked before version so staff get 423 not 409; version increments; recomputes normalized/romanized projections; emits `applicant.updated`.

### 1.5 Archive — `DELETE /api/v1/applicants/{applicant_id}/`

**Policy key:** `applicant.applicant.archive` (risk: high) — admin/superadmin only.
**Request:** `record_version` (+ optional `reason`) in body or query.
**Business rules:** soft delete — sets `archived_at/by`, `engagement_status=archived`; emits `applicant.archived`. Never a physical delete.

### 1.6 Transition lifecycle — `POST /api/v1/applicants/{applicant_id}/transition/`

**Policy key:** `applicant.applicant.transition` (risk: high) — admin/superadmin only.
**Request:** `{ lifecycle_stage?, engagement_status?, reason?, notes?, record_version }` (at least one of stage/engagement).
**Error codes:** `APPLICANT_TRANSITION_INVALID` (409 — backward/illegal stage), `APPLICANT_TRANSITION_REASON_REQUIRED` (400 — direct interested→applicant), `APPLICANT_ENGAGEMENT_REASON_REQUIRED` (400 — lost/disqualified/withdrawn/archived), `APPLICANT_VERSION_CONFLICT` (409).
**Business rules:** forward-only stage (`interested→potential→applicant`); the sole jump interested→applicant needs a reason; stage→applicant stamps `converted_at/by`; appends `ApplicantLifecycleHistory`; emits `applicant.lifecycle_changed`/`applicant.engagement_changed`.

### 1.7 Lifecycle history — `GET /api/v1/applicants/{applicant_id}/lifecycle-history/`

**Policy key:** `applicant.applicant.lifecycle_history` (risk: low) — admin/superadmin only. Paginated, newest first.

---

## 2. Locking

### 2.1 Lock — `POST /api/v1/applicants/{applicant_id}/lock/`

**Policy key:** `applicant.applicant.lock` (risk: high) — admin/superadmin only.
**Request:** `{ reason }` (mandatory).
**Error codes:** `APPLICANT_LOCK_REASON_REQUIRED` (400), `APPLICANT_ALREADY_LOCKED` (409), `APPLICANT_ARCHIVED` (409).
**Business rules:** appends `ApplicantLockHistory(locked)`; emits `applicant.locked`.

### 2.2 Unlock — `POST /api/v1/applicants/{applicant_id}/unlock/`

**Policy key:** `applicant.applicant.unlock` (risk: high) — admin/superadmin only.
**Request:** `{ reason }` (mandatory). **Error codes:** `APPLICANT_NOT_LOCKED` (409), `APPLICANT_LOCK_REASON_REQUIRED` (400).

### 2.3 Lock history — `GET /api/v1/applicants/{applicant_id}/lock-history/`

**Policy key:** `applicant.applicant.lock_history` (risk: low) — admin/superadmin only. Paginated, newest first.

---

## 3. Addresses

### 3.1 List — `GET /api/v1/applicants/{applicant_id}/addresses/`

**Policy key:** `applicant.address.list` (risk: low). Staff+.

### 3.2 Create — `POST /api/v1/applicants/{applicant_id}/addresses/`

**Policy key:** `applicant.address.create` (risk: low). Staff+.
**Business rules:** setting `is_primary` demotes the existing primary; honours applicant lock for staff (423) and archive (409); emits `applicant.address_changed`.

### 3.3 Update — `PATCH /api/v1/applicants/{applicant_id}/addresses/{address_id}/`

**Policy key:** `applicant.address.update` (risk: low). **Error codes:** `APPLICANT_ADDRESS_NOT_FOUND` (404), `APPLICANT_RECORD_LOCKED` (423, staff).

### 3.4 Delete — `DELETE /api/v1/applicants/{applicant_id}/addresses/{address_id}/`

**Policy key:** `applicant.address.delete` (risk: medium). Hard delete + `applicant.address_changed` audit; lock/archive guarded.

---

## 4. Profile image (private media)

### 4.1 Read — `GET /api/v1/applicants/{applicant_id}/profile-image/`

**Policy key:** `applicant.media.read_profile_image` (risk: low). Staff+. Streams the current profile photo from private storage (`FileResponse`, `Content-Disposition: inline`); `404` `APPLICANT_MEDIA_INVALID` if none. No public URL exists (§5.6).

### 4.2 Upload — `POST /api/v1/applicants/{applicant_id}/profile-image/`

**Policy key:** `applicant.media.upload_profile_image` (risk: medium). Staff+. Multipart `file`.
**Validation:** ≤5 MB; JPEG/PNG/WEBP verified by decoded content (shared `authenticate.validators.validate_profile_image`); MIME derived from content; SHA-256 checksum stored.
**Business rules:** retires the prior current profile photo; honours applicant lock for staff (423); emits `applicant.media_uploaded`. **Error codes:** `APPLICANT_MEDIA_INVALID` (400).

---

## 5. Profile children (Phase 2a) — admin/superadmin only

Eleven list-style child resources hang off an applicant, all with an identical shape and all `IsAdminOrSuperadmin`. Staff receive `403` on every method. Each is driven by the generic `ChildListCreateView`/`ChildDetailView`; specifics differ only in fields (see `DATA_CONTRACT.md §9`).

**Resources & policy keys** (`<slug>` → `applicant.<model>.{list,create,read,update,delete}`):
`emergency-contacts` (`emergency_contact`), `family-members` (`family_member`), `identity-documents` (`identity_document`), `educations` (`education`), `language-tests` (`language_test`), `work-experiences` (`work_experience`), `skills` (`skill`), `trainings` (`training`), `languages` (`language`), `references` (`reference`), `academic-gradings` (`academic_grading`).

### 5.1 CRUD — `<METHOD> /api/v1/applicants/{applicant_id}/{slug}/[{child_id}/]`

- `GET  …/{slug}/` — list (risk: low).
- `POST …/{slug}/` — create (risk: low; `identity_document` medium).
- `GET  …/{slug}/{child_id}/` — read (risk: low).
- `PATCH …/{slug}/{child_id}/` — update.
- `DELETE …/{slug}/{child_id}/` — hard delete (risk: medium).
  **Response:** the per-model serializer (`DATA_CONTRACT.md §9`); user-facing dates include a `<field>_bs` sibling.
  **Business rules:** parent archive/lock guarded; every mutation emits `applicant.child_added/updated/removed`.
  **Error codes:** `APPLICANT_CHILD_NOT_FOUND` (404), `APPLICANT_ARCHIVED` (409), `APPLICANT_RECORD_LOCKED` (423 — N/A in practice since staff never reach these).

### 5.2 Identity documents — extra behaviour

**Validation:** `issued_at ≤ expires_at` (`APPLICANT_IDENTITY_DATE_INVALID`-class 400); attached `image_front`/`image_back`/`file` media must belong to the same applicant (`APPLICANT_MEDIA_INVALID` 400).
**Dedupe:** on create, a keyed `number_fingerprint` is computed; if another applicant shares it, the response `meta` carries `possible_duplicate` + masked `matches[]` with `identity_match: true` (§11.1). The raw number is never logged.

### 5.3 Language tests — `POST/PATCH …/language-tests/`

**Validation:** each score must be within the range for its `test_type` (IELTS 0–9, PTE 10–90, TOEFL 0–120, Duolingo 10–160; `other` unbounded) — else `400`.

## 6. Interest profile (OneToOne) — `…/interest-profile/`

**Policy keys:** `applicant.interest_profile.{read,create,update,delete}`. Admin/superadmin only. One profile per applicant.

- `GET` — retrieve (404 `APPLICANT_CHILD_NOT_FOUND` if unset).
- `POST` — create (409 `APPLICANT_INTEREST_PROFILE_EXISTS` if one exists).
- `PATCH` — update (404 if unset). `DELETE` — remove.
  Money field `estimated_budget` is Decimal; multi-value preferences are JSON arrays.

## 7. Evidence media — `…/media/` (Phase 2a) — admin/superadmin only

**Policy keys:** `applicant.media.{list,upload,read,archive}` (upload/read/archive risk: high).

- `GET …/media/` — list metadata (`?include_archived=true` to include retired).
- `POST …/media/` — multipart `category` + `file`; images (Pillow-verified, ≤5 MB) or PDF (`%PDF-`, ≤10 MB); `profile_photo` category excluded (use §4). Content-sniffed; SHA-256 checksum stored; opaque private storage name.
- `GET …/media/{media_id}/` — stream bytes from private storage (`inline`); no public URL.
- `DELETE …/media/{media_id}/` — soft archive (files never cascade-deleted).
  **Error codes:** `APPLICANT_MEDIA_TYPE_UNSUPPORTED` (400), `APPLICANT_MEDIA_TOO_LARGE` (400), `APPLICANT_MEDIA_INVALID` (400), `APPLICANT_MEDIA_NOT_FOUND` (404).

## 8. CRM / compliance children (Phase 2b) — admin/superadmin only

Five more nested resources follow the identical generic-CRUD shape as §5 (all `IsAdminOrSuperadmin`, staff `403`): `interactions`, `sponsors`, `travel-history`, `visa-history`, `consents`. Fields in `DATA_CONTRACT.md §10`.

### 8.1 CRUD — `<METHOD> /api/v1/applicants/{applicant_id}/{slug}/[{child_id}/]`

Same five verbs (list/create/read/update/delete) and guards as §5.1. Notables:

- **interactions**: `occurred_at` required; create/update refresh the applicant's `last_contacted_at`/`next_follow_up_at`/`follow_up_priority`; emits `applicant.interaction_recorded`.
- **sponsors**: `annual_income`/`funding_amount` are Decimal; emits `applicant.sponsor_added`.
- **visa-history**: `evidence_media` must be the applicant's own media; emits `applicant.visa_history_updated`.
- **consents**: setting `status=withdrawn` stamps `withdrawn_at`/`withdrawn_by` server-side; `captured_by` defaults to the actor; emits `applicant.consent_changed`.

## 9. Qualification assessments — `…/qualification-assessments/` (supersede)

**Policy keys:** `applicant.qualification_assessment.{list,create,read}` (risk: medium). Admin/superadmin only.

- `GET  …/qualification-assessments/` — list (history preserved).
- `POST …/qualification-assessments/` — record a new assessment; **retires the prior current** (`is_current=false`); emits `applicant.qualification_assessed`.
- `GET  …/qualification-assessments/{assessment_id}/` — read.
- **No update/delete** (returns `405`) — assessments are append-only history.

### 9.1 Assessment ↔ lifecycle coupling (§6.2)

The transition endpoint (§1.6) accepts an optional `qualification_assessment_id`. A move **into `potential`** requires **either** a valid `qualification_assessment_id` (of this applicant) **or** a non-empty `reason` (admin override) — otherwise `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED` (400). An unknown assessment id → `APPLICANT_ASSESSMENT_NOT_FOUND` (404).

## 10. Application cases (Phase 3) — admin/superadmin only

### 10.1 List / create — `/api/v1/applicants/{applicant_id}/cases/`

- `GET` — list the applicant's cases (`applicant.application_case.list`).
- `POST` — open a case (`applicant.application_case.create`); generates `case_code`, status `planning`, `opened_at` set, `record_version=1`; emits `application_case.created`.

### 10.2 Read / update — `/api/v1/application-cases/{case_id}/`

- `GET` — read (`applicant.application_case.read`).
- `PATCH` — update non-status fields + mandatory `record_version` (`applicant.application_case.update`). `case_status`/`case_code`/`record_version` are **not** patchable. Stale version → `APPLICANT_CASE_VERSION_CONFLICT` (409); archived → `APPLICANT_CASE_ARCHIVED` (409).

### 10.3 Transition — `POST /api/v1/application-cases/{case_id}/transition/`

`applicant.application_case.transition`. Body `{ into_status, reason?, notes?, record_version }`. A reason is required into `visa_refused`/`withdrawn`/`archived` (`APPLICANT_CASE_REASON_REQUIRED` 400); same-status → `APPLICANT_CASE_TRANSITION_INVALID` (409); reaching `completed`/`withdrawn`/`archived` stamps `closed_at`; appends `ApplicationCaseStatusHistory`; emits `application_case.status_changed`.

### 10.4 Status history — `GET /api/v1/application-cases/{case_id}/status-history/`

`applicant.application_case.status_history`. Paginated, newest first.

## 11. Assignments (Phase 3) — admin/superadmin only

### 11.1 List / assign — `/api/v1/applicants/{applicant_id}/assignments/`

- `GET` — assignment history (`applicant.assignment.list`).
- `POST` — assign (`applicant.assignment.create`), body `{ assigned_to, application_case_id?, reason? }`. Ends the prior current assignment at that scope; a case-scoped assign sets `ApplicationCase.assigned_counsellor`; emits `applicant.assigned`. Invalid/inactive assignee → `APPLICANT_ASSIGNEE_INVALID` (400); a case from another applicant → `APPLICANT_CASE_APPLICANT_MISMATCH` (409).

### 11.2 End — `POST /api/v1/applicants/{applicant_id}/assignments/{assignment_id}/end/`

`applicant.assignment.end`. Body `{ reason? }`. Sets `ended_at`/`is_current=false`; emits `applicant.unassigned`. `APPLICANT_ASSIGNMENT_NOT_FOUND` (404) if unknown.

**Case linking:** `media`, `sponsors`, and `interactions` accept an optional `application_case`/`application_case_id`; it must belong to the same applicant (`APPLICANT_CASE_APPLICANT_MISMATCH` 409 / `APPLICANT_MEDIA_INVALID`).

## 12. Documents (Phase 4) — admin/superadmin only

**Access:** all document endpoints return a **non-disclosing `404`** to non-privileged (staff) actors — never `403` — so staff cannot infer documents exist (§9.5). Unauthenticated → `401`. Document types + content families are specified in `document-schemas.md`.

### 12.1 List / create — `/api/v1/applicants/{applicant_id}/documents/`

- `GET` — list (`applicant.document.list`).
- `POST` — create (`applicant.document.create`); body `{ document_type, label?, application_case_id?, document_content?, schema_version?, template_key?, template_version? }`. Content is validated by the type's family; status defaults to `draft`. Errors: `APPLICANT_DOCUMENT_TYPE_INVALID` (400), `APPLICANT_DOCUMENT_CONTENT_INVALID` (400), `APPLICANT_CASE_APPLICANT_MISMATCH` (409).

### 12.2 Read / update / delete — `/api/v1/documents/{document_id}/`

- `GET` — read (`applicant.document.read`).
- `PATCH` — update `label`/`document_content`/`schema_version` + mandatory `record_version` (`applicant.document.update`). Editable only in `draft`/`ready` (`APPLICANT_DOCUMENT_NOT_EDITABLE` 409); stale version → `APPLICANT_DOCUMENT_VERSION_CONFLICT` (409). A content edit advances `current_revision_number`.
- `DELETE` — soft-archive (`applicant.document.delete`).

### 12.3 Status actions — `POST /api/v1/documents/{document_id}/{action}/`

`ready` (draft→ready; content must be non-empty), `finalize` (draft|ready→finalized), `submit` (finalized→submitted), `archive` (→archived). An out-of-order action → `APPLICANT_DOCUMENT_STATUS_INVALID` (409). Keys `applicant.document.{ready,finalize,submit,archive}`.

### 12.4 Prefill — `GET /api/v1/applicants/{applicant_id}/document-prefill/`

`applicant.document.prefill`. Composes reusable applicant data (see `document-schemas.md §3`); the document is persisted as an independent snapshot.

### 12.5 Workspaces — `GET /api/v1/documents/workspaces/`

`applicant.document.workspaces`. Documents grouped by applicant with per-status counts and `last_updated` (`latest_print_at` arrives in Phase 5).

## 13. Revisions, print, signatures, search (Phase 5) — admin/superadmin only (staff 404)

### 13.1 Revisions — `/api/v1/documents/{document_id}/revisions/`

- `GET` — list revisions (`applicant.document.revision_list`), paginated newest first.
- `GET …/{revision_number}/` — read one revision (`applicant.document.revision_read`).
- `POST …/{revision_number}/restore/` — restore a revision **as a new revision** (`applicant.document.revision_restore`); never mutates the old one. A revision is auto-appended on every persisted document content edit.

### 13.2 Print events — `/api/v1/documents/{document_id}/print-events/`

- `GET` — list (`applicant.document.print_list`); retained even after the document is archived (§16.6).
- `POST` — record a print/render (`applicant.document.print_create`); multipart or JSON `{ revision_number?, content_snapshot?, resolved_applicant_data_snapshot?, derived_values_snapshot?, render_config_snapshot?, template_key?, template_version?, renderer_version?, print_status?, client_metadata?, artifact? }`. Derived values (running balances, interest/tax, amount-in-words, USD) are supplied by the frontend and stored verbatim (§16.4). `print_status` ∈ `rendered|print_initiated|artifact_downloaded|failed`.
- `GET …/{print_event_id}/` — read one (`applicant.document.print_read`).

### 13.3 Document search — `GET /api/v1/documents/search/`

`applicant.document.search`. Query params: `document_type`, `status`, `label`, `applicant` (code/name), `template_version`, `application_case_id`, `created_from/to`, `updated_from/to`. Paginated.

### 13.4 Signatures — `/api/v1/signatures/`

- `GET` — list (`applicant.signature.list`); `?active=true` filters to active.
- `POST` — create (`applicant.signature.create`), multipart `{ name (required), title?, organization?, email?, phone?, is_active?, valid_from?, valid_to?, signature_image? }`.
- `GET …/{signature_id}/` — read (`applicant.signature.read`).
- `PATCH …/{signature_id}/` — update / replace image (`applicant.signature.update`).
- `DELETE …/{signature_id}/` — **deactivate/archive**, never delete (`applicant.signature.delete`).
- `GET …/{signature_id}/image/` — stream the image from private storage (`applicant.signature.read_image`).

**Certificate signature resolution:** creating/updating an `applicant-certificate` whose content carries `instructor_id`/`director_id` requires each to resolve to an active signature (`APPLICANT_SIGNATURE_INVALID` 400).

## 14. Duplicate merge (Phase 6) — admin/superadmin only

### 14.1 Merge — `POST /api/v1/applicants/{duplicate_id}/merge/`

`applicant.applicant.merge` (risk: critical). Body `{ surviving_applicant_id, reason, field_resolutions? }`. `field_resolutions` is a `{ field: "duplicate" }` map naming which of a whitelisted set of scalar fields (names, contact, DOB, gender, nationality, religion, summaries, …) to pull from the duplicate onto the survivor. Transfers every related record to the survivor, marks the duplicate merged (retained, code preserved, archived), writes an immutable `ApplicantMergeRecord`, and emits `applicant.merged`. **Response:** `{ surviving_applicant, merge }`.
**Errors:** `APPLICANT_MERGE_SELF` (400), `APPLICANT_MERGE_REASON_REQUIRED` (400 — serializer requires `reason`), `APPLICANT_MERGE_SURVIVING_NOT_FOUND` (404), `APPLICANT_MERGE_ALREADY_MERGED` (409 — either applicant already merged), `APPLICANT_NOT_FOUND` (404 — unknown duplicate).

### 14.2 Merge history — `GET /api/v1/applicants/{applicant_id}/merge-history/`

`applicant.applicant.merge_history`. Merge records where this applicant is the survivor or the merged source.

## Error code reference

All codes are defined in `applicant/constants.py` (`ApplicantErrorCode`). See `SECURITY.md` for the non-disclosing 404 rationale.

| Code                                                | HTTP | Notes                                                           |
| --------------------------------------------------- | ---- | --------------------------------------------------------------- |
| `APPLICANT_NOT_FOUND`                               | 404  | Unknown/malformed applicant id (non-disclosing)                 |
| `APPLICANT_ADDRESS_NOT_FOUND`                       | 404  | Unknown address under the applicant                             |
| `APPLICANT_VERSION_CONFLICT`                        | 409  | Stale `record_version`                                          |
| `APPLICANT_RECORD_LOCKED`                           | 423  | Staff mutation on a locked applicant/child                      |
| `APPLICANT_FIELD_FORBIDDEN`                         | 403  | Staff submitted a non-whitelisted field / archived by non-admin |
| `APPLICANT_TRANSITION_INVALID`                      | 409  | Backward/illegal lifecycle transition                           |
| `APPLICANT_TRANSITION_REASON_REQUIRED`              | 400  | Direct interested→applicant without reason                      |
| `APPLICANT_ENGAGEMENT_REASON_REQUIRED`              | 400  | lost/disqualified/withdrawn/archived without reason             |
| `APPLICANT_ALREADY_LOCKED` / `APPLICANT_NOT_LOCKED` | 409  | Lock/unlock state conflict                                      |
| `APPLICANT_LOCK_REASON_REQUIRED`                    | 400  | Lock/unlock without a reason                                    |
| `APPLICANT_ARCHIVED`                                | 409  | Mutation on an archived applicant                               |
| `APPLICANT_CONTACT_REQUIRED`                        | 400  | Staff create with no email/phone                                |
| `APPLICANT_MEDIA_INVALID`                           | 400  | Corrupt file / cross-applicant media reference                  |
| `APPLICANT_MEDIA_TYPE_UNSUPPORTED`                  | 400  | Extension/content not an allowed image or PDF                   |
| `APPLICANT_MEDIA_TOO_LARGE`                         | 400  | File exceeds the per-kind size limit                            |
| `APPLICANT_MEDIA_NOT_FOUND`                         | 404  | Unknown media under the applicant                               |
| `APPLICANT_CHILD_NOT_FOUND`                         | 404  | Unknown profile child / interest profile                        |
| `APPLICANT_ASSESSMENT_NOT_FOUND`                    | 404  | Unknown qualification assessment                                |
| `APPLICANT_TRANSITION_ASSESSMENT_REQUIRED`          | 400  | `→ potential` without an assessment ref or override reason      |
| `APPLICANT_CASE_NOT_FOUND`                          | 404  | Unknown application case                                        |
| `APPLICANT_CASE_VERSION_CONFLICT`                   | 409  | Stale case `record_version`                                     |
| `APPLICANT_CASE_TRANSITION_INVALID`                 | 409  | Same-status / invalid case transition                           |
| `APPLICANT_CASE_REASON_REQUIRED`                    | 400  | Case `→ visa_refused/withdrawn/archived` without reason         |
| `APPLICANT_CASE_ARCHIVED`                           | 409  | Mutation on an archived case                                    |
| `APPLICANT_CASE_APPLICANT_MISMATCH`                 | 409  | Case referenced from the wrong applicant                        |
| `APPLICANT_ASSIGNMENT_NOT_FOUND`                    | 404  | Unknown assignment                                              |
| `APPLICANT_ASSIGNEE_INVALID`                        | 400  | Assignee is not a valid active account                          |
| `APPLICANT_DOCUMENT_NOT_FOUND`                      | 404  | Unknown document / staff (non-disclosing)                       |
| `APPLICANT_DOCUMENT_TYPE_INVALID`                   | 400  | Unknown document type                                           |
| `APPLICANT_DOCUMENT_CONTENT_INVALID`                | 400  | Content failed family/JSON-safety validation                    |
| `APPLICANT_DOCUMENT_VERSION_CONFLICT`               | 409  | Stale document `record_version`                                 |
| `APPLICANT_DOCUMENT_NOT_EDITABLE`                   | 409  | Edit attempted outside draft/ready                              |
| `APPLICANT_DOCUMENT_STATUS_INVALID`                 | 409  | Out-of-order status action                                      |
| `APPLICANT_DOCUMENT_ARCHIVED`                       | 409  | Action on an archived document                                  |
| `APPLICANT_REVISION_NOT_FOUND`                      | 404  | Unknown document revision                                       |
| `APPLICANT_PRINT_EVENT_NOT_FOUND`                   | 404  | Unknown print event                                             |
| `APPLICANT_SIGNATURE_NOT_FOUND`                     | 404  | Unknown signature / staff (non-disclosing)                      |
| `APPLICANT_SIGNATURE_INVALID`                       | 400  | Certificate references an unknown/inactive signature            |
| `APPLICANT_MERGE_SELF`                              | 400  | Merge target equals the duplicate                               |
| `APPLICANT_MERGE_REASON_REQUIRED`                   | 400  | Merge without a reason                                          |
| `APPLICANT_MERGE_SURVIVING_NOT_FOUND`               | 404  | Unknown surviving applicant                                     |
| `APPLICANT_MERGE_ALREADY_MERGED`                    | 409  | Either applicant is already merged                              |
| `APPLICANT_IDENTITY_DATE_INVALID`                   | 400  | Identity issue date after expiry                                |
| `APPLICANT_LANGUAGE_TEST_SCORE_INVALID`             | 400  | Score outside the test-type range                               |
| `APPLICANT_INTEREST_PROFILE_EXISTS`                 | 409  | Second interest profile attempted                               |
