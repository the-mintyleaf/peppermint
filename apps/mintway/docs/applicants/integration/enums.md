# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here). All are sourced
> from `applicant/constants.py`.

## Applicant

**`lifecycle_stage`** — funnel position (forward-only; see `entities/applicant.md`).

| Value        | UI label   |
| ------------ | ---------- |
| `interested` | Interested |
| `potential`  | Potential  |
| `applicant`  | Applicant  |

**`engagement_status`** — current relationship.

| Value          | UI label     |
| -------------- | ------------ |
| `active`       | Active       |
| `on_hold`      | On hold      |
| `lost`         | Lost         |
| `disqualified` | Disqualified |
| `withdrawn`    | Withdrawn    |
| `archived`     | Archived     |

**`gender`** (admin projection only): `male` · `female` · `other` ·
`undisclosed`.

**`follow_up_priority`** (admin projection only): `low` · `normal` · `high` ·
`urgent`.

## Lead & applicant shared

**`lead_source`** (Applicant + Lead): `walk_in` · `referral` · `online` ·
`phone` · `social_media` · `event` · `agent` · `other`.

**`payment_status`** (Lead + Applicant; admin projection only on the applicant) —
blank `""` when unset.

| Value      | UI label |
| ---------- | -------- |
| `prepaid`  | Pre-pay  |
| `postpaid` | Post-pay |

**`education_level`** (Lead, enquiry-only): `diploma` · `bachelor` ·
`post_graduate` · `masters` · `others`.

## Address

**`address_type`**: `current` · `permanent` · `mailing` · `foreign` · `other`
(default `current`).

## Profile children

**`IdentityDocument.document_type`**: `passport` · `citizenship` · `national_id`
· `birth_certificate` · `driving_licence` · `other`.

**`IdentityDocument.verification_status`**: `unverified` · `pending` · `verified`
· `rejected` (default `unverified`).

**`LanguageTest.test_type`**: `ielts` · `pte` · `toefl` · `duolingo` · `other`.

**`Education.completion_status`**: `completed` · `ongoing` · `incomplete`.

**`Skill.proficiency` / `Language.proficiency`**: `beginner` · `elementary` ·
`intermediate` · `advanced` · `proficient` · `native`.

## Evidence media

**`Media.category`**: `profile_photo` · `passport_photo` · `passport_scan` ·
`citizenship_scan` · `national_id_scan` · `birth_certificate` ·
`academic_document` · `language_certificate` · `financial_evidence` ·
`visa_document` · `application_document` · `other`. The evidence-upload endpoint
(`…/media/`) **excludes `profile_photo`** — that uses the dedicated
`…/profile-image/` endpoint.

**`Media.confidentiality_level`** (read-only): `basic` · `protected` ·
`highly_protected` (default `protected`).

## CRM / compliance children

**`Interaction.interaction_type`**: `inquiry` · `call` · `email` · `message` ·
`office_visit` · `counselling` · `document_request` · `follow_up` · `other`.

**`Interaction.direction`**: `inbound` · `outbound` · `internal`.

**`Sponsor.sponsor_type`**: `self` · `family` · `person` · `employer` ·
`organization` · `other`.

**`Sponsor.verification_status` / `IdentityDocument.verification_status`**:
`unverified` · `pending` · `verified` · `rejected`.

**`VisaHistory.decision`**: `approved` · `refused` · `withdrawn` · `pending`
(default `pending`).

**`Consent.consent_type`**: `data_processing` · `document_preparation` ·
`information_sharing` · `marketing` · `other`.

**`Consent.status`**: `granted` · `withdrawn` · `expired` (default `granted`).

## Qualification assessment

**`eligibility_result`**: `suitable` · `conditionally_suitable` · `unsuitable` ·
`pending` (default `pending`).

## Application case

**`case_status`** — moves only via the transition endpoint, never a raw PATCH.

| Value                     | UI label                |
| ------------------------- | ----------------------- |
| `planning`                | Planning                |
| `document_collection`     | Document collection     |
| `application_preparation` | Application preparation |
| `submitted`               | Submitted               |
| `offer_received`          | Offer received          |
| `visa_preparation`        | Visa preparation        |
| `visa_submitted`          | Visa submitted          |
| `visa_approved`           | Visa approved           |
| `visa_refused`            | Visa refused            |
| `travel_preparation`      | Travel preparation      |
| `completed`               | Completed               |
| `withdrawn`               | Withdrawn               |
| `archived`                | Archived                |

A reason is required into `visa_refused` / `withdrawn` / `archived`; reaching
`completed` / `withdrawn` / `archived` stamps `closed_at`.

## Document

**`Document.status`** — moves only via action endpoints, never a raw PATCH.

| Value        | UI label   | Editable content? |
| ------------ | ---------- | ----------------- |
| `draft`      | Draft      | ✅                |
| `ready`      | Ready      | ✅                |
| `finalized`  | Finalized  | ❌                |
| `submitted`  | Submitted  | ❌                |
| `superseded` | Superseded | ❌                |
| `archived`   | Archived   | ❌                |

**`Document.document_type`**: one of **53** canonical slugs — the
validation-family key. The full list + per-family content schemas live in the
backend's `document-schemas.md`; surface the slugs the UI actually offers in a
picker. Families: `certificate`, `cv`, `woda` (11), `lor` (11), `moi` (5), and
`bank_statement`/`bank_certificate` (11 institutions × 2).

**`PrintEvent.print_status`**: `rendered` · `print_initiated` ·
`artifact_downloaded` · `failed` (default `rendered`). The backend never claims
physical printing.

## Lock / history

**`ApplicantLockHistory.action`**: `locked` · `unlocked`.
