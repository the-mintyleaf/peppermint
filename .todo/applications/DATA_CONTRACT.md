# Data Contract — Applicant CRM & Documents

**Owner app:** `applicant`
**Version:** 1.6.0
**Status:** Active
**Created:** 2026-07-15
**Purpose:** Owns the applicant (person) master record and its aggregate: lifecycle/engagement state and history, business locking, staff-editable addresses, the full profile subrecords (identity, education, language, work, references, family, interests, …), private evidence media, search aliases, and an app-local audit trail. Does NOT own authentication/accounts (`authenticate`), the access-control metadata registry (`core.policy_engine`), or — yet — application cases, documents, revisions, print events, or signatures (later phases).

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Initial contract — Phase 1 applicant core (aggregate, lifecycle, lock, media, audit, addresses). |
| 1.1.0 | 2026-07-15 | AI (Claude) | Phase 2a — 12 admin-only profile children, extended media categories + general evidence pipeline, identity fingerprint, duplicate-detection expansion. |
| 1.2.0 | 2026-07-15 | AI (Claude) | Phase 2b — 6 CRM/compliance children (interaction, qualification assessment, sponsor, travel, visa, consent), interaction follow-up projections, assessment supersede + lifecycle coupling. |
| 1.3.0 | 2026-07-15 | AI (Claude) | Phase 3 — ApplicationCase (transition-only status + history), ApplicantAssignment, `application_case` FK on media/sponsor/interaction. |
| 1.4.0 | 2026-07-15 | AI (Claude) | Phase 4 — ApplicantDocument (53-type registry, polymorphic validated content, status lifecycle), document prefill + workspaces. See `document-schemas.md`. |
| 1.5.0 | 2026-07-15 | AI (Claude) | Phase 5 — DocumentRevision (immutable, auto-per-edit), DocumentPrintEvent (immutable evidence), Signature; document search + certificate signature resolution. |
| 1.6.0 | 2026-07-15 | AI (Claude) | Phase 6 — duplicate merge: `Applicant.merged_into`/`merged_at`/`merged_by` + immutable `ApplicantMergeRecord`. |

---

## Deliberate Deviations

Baseline is `.concept/applicant.md`; where it and CLAUDE.md conflict, CLAUDE.md wins (owner decision).

- **Name modelling stays flat (concept shape, not §39.1 per-component `_np/_en/_romanized`).** Owner-approved. `full_name` / `first_name` / `middle_name` / `last_name` / `name_native` plus an auto-populated `full_name_romanized` search projection. §39.2 normalization, §39.3 romanization, §39.4 BS output, §39.6 trigram search still apply in full.
- **Response envelope + casing follow CLAUDE.md §7/§1** (snake_case, `success/message/data/meta`), not the concept's camelCase `{data, meta:{total,...}}`. The frontend owns the compatibility adapter.
- **Packages instead of flat files** (`models/`, `validators/`, `services/`) — scale-justified deviation from §2.

---

## 1. Applicant

**Purpose:** Permanent person record and aggregate root. Lifecycle stage (funnel position) and engagement status (current relationship) are separate fields (§2.2) and change only through the transition service, never a raw PATCH.
**Table:** `applicant_applicant`
**`lifecycle_stage` choices:** `interested`, `potential`, `applicant`
**`engagement_status` choices:** `active`, `on_hold`, `lost`, `disqualified`, `withdrawn`, `archived`
**`gender` choices:** `male`, `female`, `other`, `undisclosed`
**`lead_source` choices:** `walk_in`, `referral`, `online`, `phone`, `social_media`, `event`, `agent`, `other`
**`follow_up_priority` choices:** `low`, `normal`, `high`, `urgent`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Public primary key |
| applicant_code | string(20) | Yes | No | Yes | Immutable `APP-YYYY-NNNNNN`, unique, ASCII |
| first_name | string(150) | Yes | No | No | Given name |
| middle_name | string(150) | No | No | No | — |
| last_name | string(150) | No | No | No | — |
| full_name | string(300) | No | No | Yes | Composed from components if not supplied; indexed |
| name_native | string(300) | No | No | No | Devanagari/native-script name |
| full_name_romanized | string(300) | No | No | Yes | ASCII search projection; never user-entered (§39.3) |
| preferred_display_name | string(150) | No | No | No | Manual display override |
| date_of_birth | date | No | Yes | No | Protected; cannot be future |
| gender | enum | No | No | No | See choices |
| nationality | string(100) | No | No | No | — |
| religion | string(100) | No | No | No | Protected (§22.1) |
| primary_email / alternate_email | email | No | No | No | Stored lowercased/normalized |
| primary_phone / alternate_phone | string(32) | No | No | No | Original display form |
| normalized_email | string(254) | No | No | Yes | Exact-dedupe projection; indexed |
| normalized_phone | string(32) | No | No | Yes | Digits(+prefix) dedupe projection; indexed |
| lifecycle_stage | enum | No | No | No | Default `interested`; transition-only |
| engagement_status | enum | No | No | No | Default `active`; transition-only |
| lead_source / lead_source_detail | enum / string(255) | No | No | No | — |
| initial_interest / summary / eligibility_summary | text | No | No | No | — |
| counselling_notes | text | No | No | No | Protected (§22.1) |
| last_contacted_at / next_follow_up_at | datetime | No | Yes | No | Follow-up projections |
| converted_at | datetime | No | Yes | Yes | Set when stage → `applicant` |
| converted_by | FK→User | No | Yes | Yes | — |
| is_locked / locked_at / lock_reason | bool / datetime / text | No | No/Yes | Yes | Lock state (lock service only) |
| locked_by | FK→User | No | Yes | Yes | — |
| record_version | positive int | No | No | Yes | Optimistic concurrency; starts at 1 |
| created_at / updated_at | datetime | — | No | Yes | Audit timestamps |
| created_by / updated_by | FK→User | No | Yes | No | Actor stamps |
| archived_at / archived_by | datetime / FK→User | No | Yes | Yes | Soft-delete stamp |

**Validation Rules:**
- `applicant_code` matches `^APP-\d{4}-\d{6}$`, immutable after create.
- At least one of `primary_email`/`primary_phone` for staff-created records; admin may bypass (imported).
- `date_of_birth` not in the future (evaluated in NPT via `nepal_today`).
- All user-entered text NFC-normalized (§39.2); emails lowercased.
- `lifecycle_stage`/`engagement_status`/lock/`record_version`/`applicant_code` never accepted on the PATCH path.

**Indexes:** `full_name`, `full_name_romanized`, `normalized_email`, `normalized_phone`, `lifecycle_stage`, `engagement_status`, `is_locked`, `archived_at`; composite `(lifecycle_stage, engagement_status)`, `(next_follow_up_at)`, `(created_at)`, `(updated_at)`; **PostgreSQL-only GIN trigram** on `full_name`, `full_name_romanized`, `name_native`, `normalized_email` (migration 0002; no-op on sqlite).

**Constraints:** `CheckConstraint record_version >= 1`.

**Soft Delete:** Archive via `archived_at`/`archived_by` set by `services.applicant.archive_applicant`; also sets `engagement_status=archived`. `DELETE` maps to archive — never a physical delete. Default querysets exclude archived unless `include_archived` (admin only).

**Example:**
```json
{ "id": "…", "applicant_code": "APP-2026-000142", "full_name": "Ramesh Shrestha", "lifecycle_stage": "interested", "engagement_status": "active", "is_locked": false, "record_version": 1 }
```

**Cross-App Dependencies:** actor FKs → `authenticate.User` (`settings.AUTH_USER_MODEL`, `on_delete=PROTECT`).
**Security Notes:** `religion`, `counselling_notes`, `date_of_birth` are protected and never serialized to staff (§9.4).

---

## 2. ApplicantSearchAlias

**Purpose:** Alternative spellings, previous/native names, transliterations for smart search (§7.2).
**Table:** `applicant_applicantsearchalias`
**`alias_type` choices:** `alternate_spelling`, `previous_name`, `native_script`, `transliteration`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Parent |
| alias | string(200) | Yes | No | No | — |
| alias_type | enum | Yes | No | No | See choices |
| normalized_alias | string(200) | No | No | Yes | Search projection; indexed (GIN trgm on PG) |
| created_by | FK→User | No | Yes | No | — |

**Soft Delete:** N/A — aliases are hard-deletable reference data with no independent retention requirement.

---

## 3. ApplicantAddress

**Purpose:** Structured + free-text address; the only Phase-1 staff-editable profile child (§9.1).
**Table:** `applicant_applicantaddress`
**`address_type` choices:** `current`, `permanent`, `mailing`, `foreign`, `other`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Parent |
| address_type | enum | No | No | No | Default `current` |
| country … postal_code | string | No | No | No | Structured components |
| address_text | text | No | No | No | Undecomposable fallback (§7.3) |
| is_primary | bool | No | No | No | Partial-unique: one primary per applicant |
| valid_from / valid_to | date | No | Yes | No | — |
| created_at/updated_at/created_by/updated_by | — | — | — | — | Actor stamps |

**Constraints:** partial `UniqueConstraint(applicant) WHERE is_primary` — at most one primary address.
**Soft Delete:** N/A — addresses are hard-deleted; the change is recorded via `AuditEvent applicant.address_changed`. Lock/archive of the parent applies (§10.6).

---

## 4. ApplicantLifecycleHistory

**Purpose:** Append-only record of each lifecycle/engagement change (§6.4).
**Table:** `applicant_applicantlifecyclehistory`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Parent |
| from_stage / into_stage | enum(str) | No | No | No | Blank when only engagement changed |
| from_engagement_status / into_engagement_status | enum(str) | No | No | No | Blank when only stage changed |
| reason / notes | text | No | No | No | — |
| changed_by | FK→User | No | Yes | No | — |
| request_id | string(64) | No | No | No | Correlation |
| created_at | datetime | — | No | Yes | — |

**Indexes:** `(applicant, -created_at)`.
**Soft Delete:** N/A — append-only; `save()` on an existing row and `delete()` both raise `HistoryImmutableError`.

---

## 5. ApplicantLockHistory

**Purpose:** Append-only lock/unlock actions (§10.3).
**Table:** `applicant_applicantlockhistory`
**`action` choices:** `locked`, `unlocked`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Parent |
| action | enum | Yes | No | No | See choices |
| reason | text | Yes | No | No | Mandatory both directions |
| performed_by | FK→User | No | Yes | No | — |
| previous_lock_actor | FK→User | No | Yes | No | Who held the prior lock (on unlock) |
| request_id | string(64) | No | No | No | — |

**Indexes:** `(applicant, -created_at)`.
**Soft Delete:** N/A — append-only (`HistoryImmutableError`).

---

## 6. ApplicantMedia

**Purpose:** Private profile/evidence media metadata + file (§5.6). Phase 1: `profile_photo` only.
**Table:** `applicant_applicantmedia`
**`category` choices:** `profile_photo`, `other`
**`confidentiality_level` choices:** `basic`, `protected`, `highly_protected`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Parent |
| category | enum | Yes | No | No | See choices |
| file | private FileField | Yes | No | No | Stored under `APPLICANT_PRIVATE_MEDIA_ROOT`; **no public URL** |
| original_filename | string(255) | No | No | No | Not trusted for storage path |
| mime_type | string(128) | No | No | Yes | Derived from decoded image, not client |
| size_bytes | int | No | No | Yes | — |
| checksum | string(64) | No | No | Yes | SHA-256 hex; indexed |
| confidentiality_level | enum | No | No | No | Default `protected` |
| is_current | bool | No | No | Yes | Prior current photo retired on new upload |
| uploaded_by / archived_by | FK→User | No | Yes | — | — |
| archived_at | datetime | No | Yes | — | — |
| metadata | JSON | No | No | No | — |

**Indexes:** `(applicant, category, is_current)`, `checksum`.
**Soft Delete:** `archived_at`/`archived_by` retire a media row; files are never cascade-deleted through ordinary applicant deletes (concept §16.6 spirit).
**Security Notes:** served only via the authenticated streaming endpoint; storage constructed with `base_url=None` so `.url` is unavailable.

---

## 7. AuditEvent

**Purpose:** App-local append-only audit trail; integration hook for the future global ledger (§23).
**Table:** `applicant_auditevent`
**`event_type` choices:** `applicant.created`, `applicant.updated`, `applicant.archived`, `applicant.lifecycle_changed`, `applicant.engagement_changed`, `applicant.locked`, `applicant.unlocked`, `applicant.duplicate_flagged`, `applicant.media_uploaded`, `applicant.address_changed`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | PK |
| event_type | enum | Yes | No | No | Indexed |
| actor | FK→User | No | Yes | No | — |
| applicant | FK→Applicant | No | Yes | No | — |
| reason | text | No | No | No | — |
| changed_fields | JSON(list) | No | No | No | Field *names* only |
| metadata | JSON(dict) | No | No | Yes | Sanitized — never sensitive plaintext (§22.2) |
| request_id | string(64) | No | No | No | — |

**Indexes:** `(event_type, -created_at)`, `(applicant, -created_at)`.
**Soft Delete:** N/A — append-only (`AuditEventImmutableError`).

---

## 8. ApplicantCodeCounter

**Purpose:** Internal per-year monotonic counter backing `APP-YYYY-NNNNNN` generation (§5.1). Not exposed via any API.
**Table:** `applicant_applicantcodecounter`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| year | positive int | Yes | No | No | PK |
| last_number | positive int | No | No | Yes | Last issued sequence; locked via `select_for_update` |

**Soft Delete:** N/A — internal counter.

---

## 9. Profile children (Phase 2a)

**Shared conventions (all 12 models below).** Each inherits `ActorStampedModel` (UUID pk + timestamps + `created_by`/`updated_by`), FKs `Applicant` `on_delete=PROTECT`, is **admin/superadmin-only**, and is subject to the parent applicant's archive/lock guard (§10.6). **Soft Delete:** N/A — these are hard-deletable profile records; every create/update/delete emits an `applicant.child_*` `AuditEvent` (the accountability record). User-facing date fields carry a read-only `<field>_bs` Bikram Sambat sibling (§39.4); user-entered text is NFC-normalized (§39.2).

- **9.1 `ApplicantEmergencyContact`** (`applicant_applicantemergencycontact`) — `name`, `relationship`, `phone`, `email`, `address`, `is_primary`.
- **9.2 `ApplicantFamilyMember`** (`…familymember`) — `name`, `relationship`, `date_of_birth`, `age_snapshot`, `occupation`, `contact`, `address`, `is_financial_sponsor`, `notes`.
- **9.3 `ApplicantIdentityDocument`** (`…identitydocument`) — **highly protected**. `document_type` [`passport`,`citizenship`,`national_id`,`birth_certificate`,`driving_licence`,`other`], `document_number` (stored, never logged), `number_fingerprint` (keyed SHA-256, indexed — powers exact dedupe without indexing plaintext, §11.1), `issuing_country`, `issued_at`, `expires_at`, `image_front`/`image_back`/`file` (FK→`ApplicantMedia`, `SET_NULL`, must belong to the same applicant), `verification_status` [`unverified`,`pending`,`verified`,`rejected`], `verified_by`/`verified_at`/`verification_notes`, `archived_at`. **Validation:** `issued_at ≤ expires_at`.
- **9.4 `ApplicantEducation`** (`…education`) — institution/degree/qualification/field/program/country, `start_period`/`end_period` + `start_date`/`end_date`, `completion_status` [`completed`,`ongoing`,`incomplete`], `gpa`, `grade`, `grading_system`, `registration_number`, `academic_year_*`, `graduation_year`, `year_of_completion`, `completion_year_bs`/`_ad`, `study_duration`, `notes`. Covers all CV/LOR/MOI education fields.
- **9.5 `ApplicantLanguageTest`** (`…languagetest`) — `test_type` [`ielts`,`pte`,`toefl`,`duolingo`,`other`], `test_date`, `overall`/`listening`/`reading`/`writing`/`speaking_score` (Decimal), `certificate_number`, `expiry_date`, `notes`. **Validation:** scores within the per-`test_type` range.
- **9.6 `ApplicantWorkExperience`** (`…workexperience`) — company/role, periods + dates, `is_current`, `description`, `country`.
- **9.7 `ApplicantSkill`** (`…skill`) — `name`, `proficiency` [`beginner`…`native`], `notes`, `sort_order`.
- **9.8 `ApplicantTraining`** (`…training`) — `course_or_training`, `institution`, dates, `credential`, `notes`.
- **9.9 `ApplicantLanguage`** (`…language`) — `language`, `proficiency`, `is_native`.
- **9.10 `ApplicantReference`** (`…reference`) — `reference_order`, `name`, `title`, `institution`, `address`, `email`, `contact`, `relationship_to_applicant`, `notes`. Maps `ref1_*`/`ref2_*`.
- **9.11 `ApplicantAcademicGrading`** (`…academicgrading`) — `context`, `month_or_period`, grammar/conversation/composition/listening/reading, `total_days`, `class_hours` (Decimal), `present`, `absent`, `attendance_percentage`. Serves CV gradings + certificate marking.
- **9.12 `ApplicantInterestProfile`** (`…interestprofile`) — **OneToOne** (one per applicant). `preferred_countries/study_levels/fields/programs/cities` (JSON lists), `preferred_intake`, `preferred_year`, `estimated_budget` (Decimal, §8), `budget_currency`, `funding_method`, `study_gap_summary`, `travel_history_summary`, `visa_refusal_history_summary`, `interests`, `qualification_summary`, `target_program`, `notes`.

**`ApplicantMedia` (extended, §6).** `category` now also covers `passport_photo`, `passport_scan`, `citizenship_scan`, `national_id_scan`, `birth_certificate`, `academic_document`, `language_certificate`, `financial_evidence`, `visa_document`, `application_document`. General evidence upload accepts images (Pillow-verified) and PDF (`%PDF-` signature); images ≤5 MB, documents ≤10 MB. Evidence media is admin-only; the profile photo remains the one staff-permitted category.

---

## 10. CRM / compliance children (Phase 2b)

**Shared conventions.** Same as §9 (admin/superadmin-only, `ActorStampedModel`, archive/lock guarded, hard-deletable + audited, `*_bs` dates, NFC text). Financial/identity numbers never logged (§22.2).

- **10.1 `ApplicantInteraction`** (`applicant_applicantinteraction`) — `interaction_type` [`inquiry`,`call`,`email`,`message`,`office_visit`,`counselling`,`document_request`,`follow_up`,`other`], `direction` [`inbound`,`outbound`,`internal`], `occurred_at` (required), `summary`, `outcome`, `next_follow_up_at`, `follow_up_priority`, `performed_by` (defaults to actor), `is_confidential`, `metadata`. **Side effect:** create/update refresh `Applicant.last_contacted_at`/`next_follow_up_at`/`follow_up_priority` projections. Audit `applicant.interaction_recorded`.
- **10.2 `ApplicantQualificationAssessment`** (`…qualificationassessment`) — `assessment_date`, `assessed_by`, `preferred_destination`, `preferred_program_or_field`, education/study-gap/language/financial/funding/visa-risk summaries, `eligibility_result` [`suitable`,`conditionally_suitable`,`unsuitable`,`pending`], `conditions`, `recommendation`, `notes`, `valid_until`, `is_current`. **Supersede semantics:** a new assessment retires the prior `is_current`; **no update/delete** (history preserved). Audit `applicant.qualification_assessed`. Backs the `→ potential` transition (§6.2).
- **10.3 `ApplicantSponsor`** (`…sponsor`) — **highly protected**. `sponsor_type` [`self`,`family`,`person`,`employer`,`organization`,`other`], name/relationship/occupation/organization/address/country/phone/email, `annual_income` + `funding_amount` (**Decimal**, §8) with currencies, `funding_source`, `is_primary`, `verification_status`, `verification_notes`. Audit `applicant.sponsor_added`.
- **10.4 `ApplicantTravelHistory`** (`…travelhistory`) — `country`, `purpose`, `travelled_from`, `travelled_to`, `visa_type`, `notes`.
- **10.5 `ApplicantVisaHistory`** (`…visahistory`) — **protected refusals**. `country`, `visa_type`, `application_date`, `decision_date`, `decision` [`approved`,`refused`,`withdrawn`,`pending`], `reference_number`, `refusal_reason`, `notes`, `evidence_media` (FK→`ApplicantMedia`, same-applicant). Audit `applicant.visa_history_updated`.
- **10.6 `ApplicantConsent`** (`…consent`) — `consent_type` [`data_processing`,`document_preparation`,`information_sharing`,`marketing`,`other`], `status` [`granted`,`withdrawn`,`expired`], `consent_text_version`, `captured_at`, `captured_by` (defaults to actor), `expires_at`, `withdrawn_at`/`withdrawn_by` (**service-stamped** when status→withdrawn), `evidence_media` (same-applicant), `notes`. Audit `applicant.consent_changed`.

**Soft Delete:** N/A for all — hard-deletable + audited; the qualification assessment has no delete path (append/supersede only).

---

## 11. Application cases (Phase 3)

**11.1 `ApplicationCase`** (`applicant_applicationcase`) — one destination/institution/program pathway for an applicant, distinct from the person record (§2.1). Admin/superadmin-only.
**`case_status` choices:** `planning`, `document_collection`, `application_preparation`, `submitted`, `offer_received`, `visa_preparation`, `visa_submitted`, `visa_approved`, `visa_refused`, `travel_preparation`, `completed`, `withdrawn`, `archived`

| Field | Type | Req | Null | Gen | Description |
|---|---|---|---|---|---|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Owner |
| case_code | string(20) | Yes | No | Yes | Immutable `CASE-YYYY-NNNNNN`, unique, ASCII |
| destination_country … application_reference | string | No | No | No | Pathway fields (concept §8.1) |
| case_status | enum | No | No | No | Default `planning`; **transition-only** |
| assigned_counsellor | FK→User | No | Yes | Yes | Current (set by assignment service) |
| opened_at / closed_at | datetime | No | Yes | Yes | `opened_at` on create; `closed_at` on a closed status |
| outcome / outcome_reason / notes | str/text | No | No | No | — |
| record_version | positive int | No | No | Yes | Optimistic concurrency (§5.4); `>= 1` check |
| archived_at / archived_by | datetime / FK | No | Yes | Yes | Soft delete |
| created_at/updated_at/created_by/updated_by | — | — | — | — | Actor stamps |

**Validation:** `case_code` matches `^CASE-\d{4}-\d{6}$`, immutable. Status changes only via `services.case.transition_case`; a reason is required into `visa_refused`/`withdrawn`/`archived`; reaching `completed`/`withdrawn`/`archived` stamps `closed_at`. Status graph is not rigidly encoded (concept lists statuses, not edges) — documented deviation.
**Indexes:** `(applicant, case_status)`, `destination_country`, `intake`, `case_status`, `archived_at`.
**Soft Delete:** `archived_at`/`archived_by`; archived cases reject transitions/updates.

**11.2 `ApplicationCaseStatusHistory`** (`…applicationcasestatushistory`) — append-only (`from_status`, `into_status`, `reason`, `notes`, `changed_by`, `request_id`, `created_at`). **Soft Delete:** N/A — append-only (`HistoryImmutableError`).

**11.3 `ApplicantAssignment`** (`applicant_applicantassignment`) — assignment history (concept §8.3). `applicant`, `application_case` (nullable — applicant- or case-scoped), `assigned_to`, `assigned_by`, `assigned_at`, `ended_at`, `assignment_reason`, `unassignment_reason`, `is_current`. A new assignment at a scope ends the prior current one; case-scoped assignment updates `ApplicationCase.assigned_counsellor`. **Soft Delete:** N/A — history rows are ended (`is_current=False`, `ended_at`), never deleted.

**11.4 `CaseCodeCounter`** (`applicant_casecodecounter`) — internal per-year counter for `CASE-YYYY-NNNNNN`. **Soft Delete:** N/A.

**Wiring:** `ApplicantMedia`, `ApplicantSponsor`, and `ApplicantInteraction` gain a nullable `application_case` FK (`SET_NULL`); a referenced case must belong to the same applicant (verified in the service, `APPLICANT_CASE_APPLICANT_MISMATCH`).

---

## 12. Documents (Phase 4)

**`ApplicantDocument`** (`applicant_applicantdocument`) — a polymorphic prepared document (concept §12.1). Admin/superadmin-only.
**`status` choices:** `draft`, `ready`, `finalized`, `submitted`, `superseded`, `archived`
**`document_type` choices:** one of the 53 canonical slugs (see `document-schemas.md §1`).

| Field | Type | Req | Null | Gen | Description |
|---|---|---|---|---|---|
| id | UUID | — | No | Yes | PK |
| applicant | FK→Applicant | Yes | No | No | Owner |
| application_case | FK→ApplicationCase | No | Yes | No | Optional case link (`SET_NULL`, same applicant) |
| document_type | enum(53) | Yes | No | No | Validation family key |
| label | string(255) | No | No | No | — |
| status | enum | No | No | No | Default `draft`; transition-only via ready/finalize/submit/archive |
| document_content | JSON | No | No | No | Validated by type+`schema_version` (§12.5); derived values never stored |
| schema_version | positive int | No | No | No | Default 1 |
| template_key / template_version | string | No | No | No | Renderer template metadata |
| current_revision_number | positive int | No | No | Yes | Advances on each content edit (Phase-5 revisions key off it) |
| record_version | positive int | No | No | Yes | Optimistic concurrency; `>= 1` check |
| finalized_at/by, submitted_at/by, archived_at/by | datetime / FK | No | Yes | Yes | Lifecycle stamps |
| created_at/updated_at/created_by/updated_by | — | — | — | — | Actor stamps |

**Validation:** content passes JSON-safety (no NaN/Infinity, ≤256 KB / depth 12 / 2000 keys) + a family validator on every create/update (`APPLICANT_DOCUMENT_CONTENT_INVALID`); unknown type → `APPLICANT_DOCUMENT_TYPE_INVALID`. Editable only in `draft`/`ready` (`APPLICANT_DOCUMENT_NOT_EDITABLE`); status changes only through the action endpoints.
**Indexes:** `(applicant, status)`, `document_type`, `application_case`, `archived_at`.
**Soft Delete:** `archived_at`/`archived_by`; `DELETE` and the archive action both soft-archive — never a physical delete (§5.3). Revision/print history retention is Phase 5.
**Security Notes:** admin/superadmin-only; staff receive a non-disclosing `404` on every document surface (§9.5).

---

## 13. Revisions, print events, signatures (Phase 5)

**`DocumentRevision`** (`applicant_documentrevision`) — an immutable content snapshot appended on every persisted document content change (concept §15.1). Fields: `document`, `revision_number`, `content_snapshot`, `label_snapshot`, `status_snapshot`, `document_type_snapshot`, `schema_version`, `template_key/version`, `change_reason`, `changed_fields`, `previous_revision` (self FK), `changed_by`, `request_id`, `content_checksum` (sha-256). **Unique** `(document, revision_number)`. **Soft Delete:** N/A — append-only (`HistoryImmutableError`); restore creates a new revision, never mutates an old one (§15.2).

**`DocumentPrintEvent`** (`applicant_documentprintevent`) — an immutable evidentiary snapshot of a print/render (concept §16.2). Fields: `document`, `document_revision` (nullable), `applicant`, `application_case` (nullable), `document_type`, `content_snapshot`, `resolved_applicant_data_snapshot`, `derived_values_snapshot`, `render_config_snapshot`, `template_key/version`, `renderer_version`, `printed_by`, `print_initiated_at`, `artifact_file` (private, nullable) + `artifact_checksum` + `artifact_mime_type`, `print_status`, `client_metadata`, `request_id`.
**`print_status` choices:** `rendered`, `print_initiated`, `artifact_downloaded`, `failed` (never claims physical printing, §16.2). Derived bank values are supplied by the frontend renderer and stored verbatim (§16.4). **Soft Delete:** N/A — append-only; retained even when the document/applicant is archived (§16.6).

**`Signature`** (`applicant_signature`) — a global signatory referenced by certificates (concept §17.1). Fields: `name`, `signature_image` (private FileField, image-only) + `image_checksum` + `image_mime_type`, `is_active`, `title`, `organization`, `email`, `phone`, `valid_from`, `valid_to`, `archived_at`/`archived_by`, actor stamps. **Soft Delete:** `DELETE` deactivates (`is_active=False`, `archived_at`) — never removes it, so historical revisions/prints keep resolving the signatory (§17.2). Certificate `instructor_id`/`director_id` must resolve to an **active, non-archived** signature (§21.4).

---

## 14. Duplicate merge (Phase 6)

**`Applicant` (extended).** `merged_into` (self FK, nullable), `merged_at`, `merged_by` — a merged duplicate is retained (not deleted), its `applicant_code` preserved, and it points at the survivor it was folded into. Merging also sets `archived_at`/`engagement_status=archived`, so a merged applicant drops out of active lists. `is_merged` is a derived property.

**`ApplicantMergeRecord`** (`applicant_applicantmergerecord`) — immutable record of one merge (concept §11.3). Fields: `source_applicant` (the duplicate), `surviving_applicant`, `field_resolutions` (which fields were pulled from the duplicate), `transferred_counts` (per-relation counts moved), `reason`, `performed_by`, `request_id`, `created_at`. **Soft Delete:** N/A — append-only (`HistoryImmutableError`).

**Merge transfer.** All applicant-scoped relations are reassigned to the survivor in one transaction — search aliases, addresses, emergency contacts, family, identity documents, education, language tests, work, skills, trainings, languages, references, academic grading, media, interactions, qualification assessments, sponsors, travel, visa, consents, **cases, documents, assignments, print events**. Document **revisions** move with their documents (document FK). The OneToOne interest profile moves only if the survivor lacks one. The duplicate's own lifecycle/lock history and audit events are **left on the duplicate** (they describe its own record). Duplicate primary addresses are demoted before transfer to respect the survivor's one-primary constraint.

---

## Cross-App Dependencies

- **→ `authenticate`:** every actor FK targets `settings.AUTH_USER_MODEL` (`authenticate.User`), `on_delete=PROTECT`. Reuses `authenticate.permissions.IsAdminOrSuperadmin`/`IsSuperadmin`, `authenticate.constants.UserRole`, and `authenticate.validators.validate_profile_image`. Assignment validates the assignee is an active `authenticate.User`.
- **→ `core`:** `BaseModel`, response envelope, `StandardPagination`, `core.nepal.*` (text/calendar).
- **→ `core.policy_engine`:** all endpoints registered in `applicant/registry.py` (16 Phase-1 + Phase-2a children/interest/media).
- No app imports `applicant.models` directly (no reverse coupling yet).

---

## Soft Delete

Applicants and media use soft delete/archive (`archived_at`/`archived_by`); history and audit tables are append-only and immutable. Addresses, aliases, and the Phase-2a profile children are hard-deletable records whose every change is audit-logged (`applicant.child_*`). No physical purge path exists yet (a privileged retention workflow is future work).
