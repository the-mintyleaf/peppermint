# Document Schemas — Applicant Documents

**Owner app:** `applicant`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-07-15
**Purpose:** The canonical 53-type document registry, the content-validation families, and the document-prefill field↔source mapping (concept §12–§14). The runtime source of truth is `applicant/constants.py:DOCUMENT_TYPE_FAMILY` and the validators in `applicant/validators/`.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Phase 4 — 53-type registry, 6 validator families, prefill mapping. |

---

## 1. Document type registry (53 canonical types)

Each `document_type` slug maps to a validation family. Legacy `student-*` slugs are **not** accepted by the backend (frontend adapts; §31 decision).

| Family | Count | Types |
|---|---|---|
| `certificate` | 1 | `applicant-certificate` |
| `cv` | 3 | `applicant-cv`, `applicant-cv-standard`, `applicant-cv-extended` |
| `woda` | 11 | `woda-address`, `woda-dob`, `woda-fiscal`, `woda-income`, `woda-migration`, `woda-occupation`, `woda-relationship`, `woda-surname`, `woda-tax-clearance`, `woda-agriculture-income`, `woda-affidavit-financial` |
| `lor` | 11 | `lor-janajagriti`, `lor-bageshwari-chief`, `lor-bageshwari-hod`, `lor-shiva`, `lor-kcmit`, `lor-tri-chandra`, `lor-monastic`, `lor-om-health`, `lor-atlantic`, `lor-model-technical`, `lor-nepalgunj` |
| `moi` | 5 | `moi-global-college`, `moi-janajagriti`, `moi-vinayak`, `moi-reliance`, `moi-bheri-nursing` |
| `bank_statement` | 11 | `bank-<inst>-statement` for `<inst>` ∈ {bigyalaxmi, birendranagar, himchuli, janautthan, karnali, mata-bageshwori, narayan, shahabhagi, sumnima, tribeni, vyas} |
| `bank_certificate` | 11 | `bank-<inst>-certificate` for the same 11 institutions |

**Total: 53.** Enforced by an `assert` in `constants.py` and a test.

## 2. Content validation (concept §12.5, §21.4)

Every content payload passes a shared JSON-safety gate before its family validator:
- Must be a JSON object; reject `NaN`/`Infinity`; only JSON scalar/array/object types.
- Limits: ≤256 KB serialized, ≤12 nesting depth, ≤2000 total keys.

Family rules (fields are stored verbatim; the frontend computes derived values and must not send them, §12.5):
- **certificate** — `study_type` is **required** and must be `0` (studying) or `1` (completed); `course_hours` numeric; `marking` a list of objects; `batch` an object.
- **cv** — `experiences`/`educations`/`family_members`/`gradings` are lists of objects; `contact_detail`/`batch_detail` objects.
- **bank_statement** — `transactions[]` each need a `date` + `description`, `debit`/`credit` non-negative numbers, at least one non-zero side; `statement_opening_balance` numeric ≥0.
- **bank_certificate** — `statement_total_balance`/`statement_usdrate` numeric ≥0.
- **woda / lor / moi** — open schema: unknown keys preserved; container fields (`details`/`header_props`) must be objects.

**Signature resolution** (Phase 5): `instructor_id`/`director_id` on `applicant-certificate` content must resolve to an active, non-archived `Signature` at create/update (`APPLICANT_SIGNATURE_INVALID` otherwise). Each persisted content edit appends an immutable `DocumentRevision`; print events capture the rendered/derived snapshot (see `API.md §13`).

## 3. Document-prefill field ↔ source mapping (concept §14)

`GET /api/v1/applicants/{id}/document-prefill/` composes reusable applicant data (admin-only). The document is then persisted as an **independent snapshot** — later applicant edits never rewrite it (§12.5).

| Prefill key | Source |
|---|---|
| `applicant_code`, names, `gender`, `nationality`, `date_of_birth`(+`_bs`), `primary_email`, `primary_phone`, `summary`, `eligibility_summary`, `registered_at` (created_at), `converted_at` | `Applicant` |
| `current_address` | primary (else first) `ApplicantAddress` |
| `emergency_contact` | primary (else first) `ApplicantEmergencyContact` |
| `passport` (number/issue/expiry) | `ApplicantIdentityDocument` where `document_type=passport` |
| `educations`, `language_tests`, `work_experiences`, `skills`, `references`, `family_members` | the corresponding profile children |
| `interest_profile` | `ApplicantInterestProfile` |
| `father` (name/relationship) | `ApplicantFamilyMember` where relationship contains "father" — **derived, not a column** |
| `cases` | `ApplicationCase` list |

**Document-JSON-only fields** (no profile column — supplied per-document by the template/operator): `teaching_semesters`, `teaching_subjects`, `*_pronoun`, recommender/signatory identity, all bank `statement_*` financial inputs, `header_props`, `details`, `batch`/`batch_detail`. Content `image` fields must reference `ApplicantMedia`, never a base64 blob (§5.6).
