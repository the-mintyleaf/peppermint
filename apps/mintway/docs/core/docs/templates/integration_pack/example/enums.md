# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here).

## Applicant

**`lifecycle_stage`** — funnel position (forward-only; see `applicant.md`).

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

**`lead_source`**: `walk_in` · `referral` · `online` · `phone` · `social_media`
· `event` · `agent` · `other`.

**`follow_up_priority`** (admin projection only): `low` · `normal` · `high` ·
`urgent`.

## Address

**`address_type`**: `current` · `permanent` · `mailing` · `foreign` · `other`
(default `current`).

## Qualification assessment

**`eligibility_result`**: `suitable` · `conditionally_suitable` · `unsuitable` ·
`pending`.

## Document

**`status`** — moves only via action endpoints, never a raw PATCH.

| Value        | UI label   | Editable content? |
| ------------ | ---------- | ----------------- |
| `draft`      | Draft      | ✅                |
| `ready`      | Ready      | ✅                |
| `finalized`  | Finalized  | ❌                |
| `submitted`  | Submitted  | ❌                |
| `superseded` | Superseded | ❌                |
| `archived`   | Archived   | ❌                |

**`document_type`**: one of 53 canonical slugs — the validation-family key. The
full list + per-family content schemas live in the backend's
`document-schemas.md`; surface the slugs the UI actually offers in a picker.

**`print_status`** (print events): `rendered` · `print_initiated` ·
`artifact_downloaded` · `failed`. The backend never claims physical printing.

## Lock / history

**`ApplicantLockHistory.action`**: `locked` · `unlocked`.

## Other entity enums (not in this slice)

The full module also defines enums for `IdentityDocument.document_type` /
`verification_status`, `LanguageTest.test_type`, `Skill`/`Language.proficiency`,
`Education.completion_status`, `Media.category`, `Interaction.interaction_type` /
`direction`, `Sponsor.sponsor_type`, `VisaHistory.decision`, `Consent`
`consent_type` / `status`, and `ApplicationCase.case_status`. When those entities
are integrated, add their sets here so this file stays the one enum registry.
