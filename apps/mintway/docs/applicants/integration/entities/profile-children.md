# `Profile children` — the 11 admin-only generic profile sub-records

**Endpoint base:** `/api/v1/applicants/<applicant_id>/<slug>/` (detail under
`.../<slug>/<child_id>/`), one `<slug>` per resource below.
**Access:** **admin/superadmin only** — staff receive `403` on every method.
Parent archive (409) / lock (423) guarded.
**Owns:** the structured profile of an applicant. These 11 resources share **one
generic CRUD view, one serializer base, and identical access/error/concurrency
behaviour** — they differ only in fields (this file gives each its own table + TS
interface). The slugs:

| Slug                 | Resource          | Special behaviour                                       |
| -------------------- | ----------------- | ------------------------------------------------------- |
| `emergency-contacts` | Emergency contact | —                                                       |
| `family-members`     | Family member     | `date_of_birth_bs`                                      |
| `identity-documents` | Identity document | dedupe on create; `issued_at ≤ expires_at`; media links |
| `educations`         | Education         | `start_date_bs`/`end_date_bs`                           |
| `language-tests`     | Language test     | per-`test_type` score range; decimal scores             |
| `work-experiences`   | Work experience   | `start_date_bs`/`end_date_bs`                           |
| `skills`             | Skill             | —                                                       |
| `trainings`          | Training          | `start_date_bs`/`end_date_bs`                           |
| `languages`          | Language          | —                                                       |
| `references`         | Reference         | —                                                       |
| `academic-gradings`  | Academic grading  | —                                                       |

## 1. Fields (rows)

**Every** resource also carries these three, all **server-set / response-only**
(omitted from the per-resource tables below to avoid repetition): `id` (`string`,
UUID, PK), `created_at` (`string`, ISO 8601), `updated_at` (`string`, ISO 8601).
Every user-facing date field additionally returns a read-only `<field>_bs`
Bikram-Sambat sibling (see the "Special behaviour" column above).

#### `emergency-contacts`

| Field          | TS type   | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes           |
| -------------- | --------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | --------------- |
| `name`         | `string`  | ✓      | ✓      | ✓   | No       | ✗          | —    | ≤200 chars | required        |
| `relationship` | `string`  | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars | `""` when unset |
| `phone`        | `string`  | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤32 chars  |                 |
| `email`        | `string`  | ✓      | ✓      | ✗   | No       | ✗          | —    | email      |                 |
| `address`      | `string`  | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                 |
| `is_primary`   | `boolean` | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                 |

#### `family-members`

| Field                  | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                      |
| ---------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | -------------------------- |
| `name`                 | `string`         | ✓      | ✓      | ✓   | No       | ✗          | —    | ≤200 chars | required                   |
| `relationship`         | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |                            |
| `date_of_birth`        | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `date_of_birth_bs` |
| `age_snapshot`         | `number \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | integer    |                            |
| `occupation`           | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                            |
| `contact`              | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤64 chars  |                            |
| `address`              | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                            |
| `is_financial_sponsor` | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                            |
| `notes`                | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                            |

#### `identity-documents`

| Field                 | TS type              | In req | In res | Req | Nullable | Server-set | Enum                                   | Validation           | Notes                                 |
| --------------------- | -------------------- | ------ | ------ | --- | -------- | ---------- | -------------------------------------- | -------------------- | ------------------------------------- |
| `document_type`       | `IdDocumentType`     | ✓      | ✓      | ✓   | No       | ✗          | `IdentityDocument.document_type`       | required             |                                       |
| `document_number`     | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                                      | ≤100 chars           | Stored, never logged/echoed elsewhere |
| `issuing_country`     | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                                      | ≤100 chars           |                                       |
| `issued_at`           | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                                      | date                 | carries `issued_at_bs`                |
| `expires_at`          | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                                      | date, ≥ issued       | carries `expires_at_bs`               |
| `image_front`         | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                                      | UUID, same applicant | `Media` id (see `media.md`)           |
| `image_back`          | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                                      | UUID, same applicant | `Media` id                            |
| `file`                | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                                      | UUID, same applicant | `Media` id                            |
| `verification_status` | `VerificationStatus` | ✓      | ✓      | ✗   | No       | ✗          | `IdentityDocument.verification_status` | —                    | Default `unverified`                  |
| `verified_at`         | `string \| null`     | ✗      | ✓      | —   | Yes      | ✓          | —                                      | —                    | Service-managed                       |
| `verification_notes`  | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                                      | text                 |                                       |

> `number_fingerprint` and `verified_by` are service-managed and **not** in the
> response.

#### `educations`

| Field                 | TS type            | In req | In res | Req | Nullable | Server-set | Enum                          | Validation | Notes                     |
| --------------------- | ------------------ | ------ | ------ | --- | -------- | ---------- | ----------------------------- | ---------- | ------------------------- |
| `institution`         | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤255 chars |                           |
| `degree`              | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤150 chars |                           |
| `qualification`       | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤150 chars |                           |
| `field_of_study`      | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤150 chars |                           |
| `program`             | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤150 chars |                           |
| `country`             | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤100 chars |                           |
| `start_period`        | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤50 chars  | free-text period label    |
| `end_period`          | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤50 chars  |                           |
| `start_date`          | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                             | date       | carries `start_date_bs`   |
| `end_date`            | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                             | date       | carries `end_date_bs`     |
| `completion_status`   | `CompletionStatus` | ✓      | ✓      | ✗   | No       | ✗          | `Education.completion_status` | —          | `""` when unset           |
| `gpa`                 | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  | free-text                 |
| `grade`               | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤50 chars  |                           |
| `grading_system`      | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤50 chars  |                           |
| `registration_number` | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤100 chars |                           |
| `academic_year_start` | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  |                           |
| `academic_year_end`   | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  |                           |
| `graduation_year`     | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  |                           |
| `year_of_completion`  | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  |                           |
| `completion_year_bs`  | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  | user-entered BS year text |
| `completion_year_ad`  | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤20 chars  |                           |
| `study_duration`      | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤50 chars  |                           |
| `notes`               | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                             | text       |                           |

#### `language-tests`

| Field                | TS type            | In req | In res | Req | Nullable | Server-set | Enum                     | Validation               | Notes                    |
| -------------------- | ------------------ | ------ | ------ | --- | -------- | ---------- | ------------------------ | ------------------------ | ------------------------ |
| `test_type`          | `LanguageTestType` | ✓      | ✓      | ✓   | No       | ✗          | `LanguageTest.test_type` | required                 |                          |
| `test_date`          | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | date                     | carries `test_date_bs`   |
| `overall_score`      | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | in range for `test_type` | **decimal string**       |
| `listening_score`    | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | in range for `test_type` | decimal string           |
| `reading_score`      | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | in range for `test_type` | decimal string           |
| `writing_score`      | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | in range for `test_type` | decimal string           |
| `speaking_score`     | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | in range for `test_type` | decimal string           |
| `certificate_number` | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                        | ≤100 chars               |                          |
| `expiry_date`        | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                        | date                     | carries `expiry_date_bs` |
| `notes`              | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                        | text                     |                          |

> Score ranges: IELTS 0–9, PTE 10–90, TOEFL 0–120, Duolingo 10–160; `other`
> unbounded.

#### `work-experiences`

| Field          | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                   |
| -------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ----------------------- |
| `company`      | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤255 chars |                         |
| `role`         | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                         |
| `start_period` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                         |
| `end_period`   | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                         |
| `start_date`   | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `start_date_bs` |
| `end_date`     | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `end_date_bs`   |
| `is_current`   | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                         |
| `description`  | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                         |
| `country`      | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |                         |

#### `skills`

| Field         | TS type            | In req | In res | Req | Nullable | Server-set | Enum                | Validation | Notes           |
| ------------- | ------------------ | ------ | ------ | --- | -------- | ---------- | ------------------- | ---------- | --------------- |
| `name`        | `string`           | ✓      | ✓      | ✓   | No       | ✗          | —                   | ≤150 chars | required        |
| `proficiency` | `ProficiencyLevel` | ✓      | ✓      | ✗   | No       | ✗          | `Skill.proficiency` | —          | `""` when unset |
| `notes`       | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                   | text       |                 |
| `sort_order`  | `number`           | ✓      | ✓      | ✗   | No       | ✗          | —                   | integer    | Default 0       |

#### `trainings`

| Field                | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                   |
| -------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ----------------------- |
| `course_or_training` | `string`         | ✓      | ✓      | ✓   | No       | ✗          | —    | ≤255 chars | required                |
| `institution`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤255 chars |                         |
| `start_date`         | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `start_date_bs` |
| `end_date`           | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `end_date_bs`   |
| `credential`         | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                         |
| `notes`              | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                         |

#### `languages`

| Field         | TS type            | In req | In res | Req | Nullable | Server-set | Enum                   | Validation | Notes           |
| ------------- | ------------------ | ------ | ------ | --- | -------- | ---------- | ---------------------- | ---------- | --------------- |
| `language`    | `string`           | ✓      | ✓      | ✓   | No       | ✗          | —                      | ≤100 chars | required        |
| `proficiency` | `ProficiencyLevel` | ✓      | ✓      | ✗   | No       | ✗          | `Language.proficiency` | —          | `""` when unset |
| `is_native`   | `boolean`          | ✓      | ✓      | ✗   | No       | ✗          | —                      | —          |                 |

#### `references`

| Field                       | TS type  | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes     |
| --------------------------- | -------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | --------- |
| `reference_order`           | `number` | ✓      | ✓      | ✗   | No       | ✗          | —    | integer    | Default 1 |
| `name`                      | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤200 chars |           |
| `title`                     | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |           |
| `institution`               | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤255 chars |           |
| `address`                   | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |           |
| `email`                     | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | email      |           |
| `contact`                   | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤64 chars  |           |
| `relationship_to_applicant` | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |           |
| `notes`                     | `string` | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |           |

#### `academic-gradings`

| Field                   | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes              |
| ----------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ------------------ |
| `context`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                    |
| `month_or_period`       | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `grammar`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  | free-text mark     |
| `conversation`          | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `composition`           | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `listening`             | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `reading`               | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤50 chars  |                    |
| `total_days`            | `number \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | integer    |                    |
| `class_hours`           | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | decimal    | **decimal string** |
| `present`               | `number \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | integer    |                    |
| `absent`                | `number \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | integer    |                    |
| `attendance_percentage` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤20 chars  | free-text          |

## 2. Types

```ts
import type { BsDate } from "./applicant"; // shared BsDate shape

// Enum unions — values are the registry in enums.md; declared here so the block compiles.
type IdDocumentType =
  | "passport"
  | "citizenship"
  | "national_id"
  | "birth_certificate"
  | "driving_licence"
  | "other";
type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
type LanguageTestType = "ielts" | "pte" | "toefl" | "duolingo" | "other";
type CompletionStatus = "completed" | "ongoing" | "incomplete";
type ProficiencyLevel =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "advanced"
  | "proficient"
  | "native";

// Shared server-set fields present on EVERY child response.
interface ChildBase {
  id: string;
  created_at: string;
  updated_at: string;
}

interface EmergencyContact extends ChildBase {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  is_primary: boolean;
}
interface FamilyMember extends ChildBase {
  name: string;
  relationship: string;
  date_of_birth: string | null;
  date_of_birth_bs: BsDate | null;
  age_snapshot: number | null;
  occupation: string;
  contact: string;
  address: string;
  is_financial_sponsor: boolean;
  notes: string;
}
interface IdentityDocument extends ChildBase {
  document_type: IdDocumentType;
  document_number: string;
  issuing_country: string;
  issued_at: string | null;
  issued_at_bs: BsDate | null;
  expires_at: string | null;
  expires_at_bs: BsDate | null;
  image_front: string | null;
  image_back: string | null;
  file: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verification_notes: string;
}
interface Education extends ChildBase {
  institution: string;
  degree: string;
  qualification: string;
  field_of_study: string;
  program: string;
  country: string;
  start_period: string;
  end_period: string;
  start_date: string | null;
  start_date_bs: BsDate | null;
  end_date: string | null;
  end_date_bs: BsDate | null;
  completion_status: CompletionStatus | "";
  gpa: string;
  grade: string;
  grading_system: string;
  registration_number: string;
  academic_year_start: string;
  academic_year_end: string;
  graduation_year: string;
  year_of_completion: string;
  completion_year_bs: string;
  completion_year_ad: string;
  study_duration: string;
  notes: string;
}
interface LanguageTest extends ChildBase {
  test_type: LanguageTestType;
  test_date: string | null;
  test_date_bs: BsDate | null;
  overall_score: string | null; // decimal string
  listening_score: string | null;
  reading_score: string | null;
  writing_score: string | null;
  speaking_score: string | null;
  certificate_number: string;
  expiry_date: string | null;
  expiry_date_bs: BsDate | null;
  notes: string;
}
interface WorkExperience extends ChildBase {
  company: string;
  role: string;
  start_period: string;
  end_period: string;
  start_date: string | null;
  start_date_bs: BsDate | null;
  end_date: string | null;
  end_date_bs: BsDate | null;
  is_current: boolean;
  description: string;
  country: string;
}
interface Skill extends ChildBase {
  name: string;
  proficiency: ProficiencyLevel | "";
  notes: string;
  sort_order: number;
}
interface Training extends ChildBase {
  course_or_training: string;
  institution: string;
  start_date: string | null;
  start_date_bs: BsDate | null;
  end_date: string | null;
  end_date_bs: BsDate | null;
  credential: string;
  notes: string;
}
interface Language extends ChildBase {
  language: string;
  proficiency: ProficiencyLevel | "";
  is_native: boolean;
}
interface Reference extends ChildBase {
  reference_order: number;
  name: string;
  title: string;
  institution: string;
  address: string;
  email: string;
  contact: string;
  relationship_to_applicant: string;
  notes: string;
}
interface AcademicGrading extends ChildBase {
  context: string;
  month_or_period: string;
  grammar: string;
  conversation: string;
  composition: string;
  listening: string;
  reading: string;
  total_days: number | null;
  class_hours: string | null; // decimal string
  present: number | null;
  absent: number | null;
  attendance_percentage: string;
}

// Create/Update: omit the shared ChildBase server-set fields + any *_bs / *_at
// service-managed field. Each is Partial-able on update; none carries record_version.
type EmergencyContactCreate = Omit<EmergencyContact, keyof ChildBase>;
type FamilyMemberCreate = Omit<
  FamilyMember,
  keyof ChildBase | "date_of_birth_bs"
>;
type IdentityDocumentCreate = Omit<
  IdentityDocument,
  keyof ChildBase | "issued_at_bs" | "expires_at_bs" | "verified_at"
>;
type EducationCreate = Omit<
  Education,
  keyof ChildBase | "start_date_bs" | "end_date_bs"
>;
type LanguageTestCreate = Omit<
  LanguageTest,
  keyof ChildBase | "test_date_bs" | "expiry_date_bs"
>;
type WorkExperienceCreate = Omit<
  WorkExperience,
  keyof ChildBase | "start_date_bs" | "end_date_bs"
>;
type SkillCreate = Omit<Skill, keyof ChildBase>;
type TrainingCreate = Omit<
  Training,
  keyof ChildBase | "start_date_bs" | "end_date_bs"
>;
type LanguageCreate = Omit<Language, keyof ChildBase>;
type ReferenceCreate = Omit<Reference, keyof ChildBase>;
type AcademicGradingCreate = Omit<AcademicGrading, keyof ChildBase>;
// Update is a Partial of the corresponding Create (no record_version on children).
```

## 3. Endpoints

Uniform CRUD, identical across all 11 slugs. Replace `<slug>` and `<Resource>`
accordingly.

### `GET /api/v1/applicants/<applicant_id>/<slug>/`

- **Returns:** `list[<Resource>]`.
- **Policy key:** `applicant.<model>.list`

### `POST /api/v1/applicants/<applicant_id>/<slug>/`

- **Request:** `<Resource>Create`.
- **Returns:** the created `<Resource>`.
- **Side effects:** emits `applicant.child_added`. **`identity-documents`:** when
  the passport/ID number collides with another applicant, `meta` carries
  `possible_duplicate` + masked `matches[]` (each with `identity_match: true`) —
  non-blocking.
- **Policy key:** `applicant.<model>.create` (risk: low; `identity_document` medium)

### `GET /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Returns:** one `<Resource>`.
- **Policy key:** `applicant.<model>.read`

### `PATCH /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Request:** `Partial<<Resource>Create>`. (No `record_version` on children.)
- **Returns:** the updated `<Resource>`.
- **Policy key:** `applicant.<model>.update`

### `DELETE /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Purpose:** hard delete (audit-logged: `applicant.child_removed`).
- **Policy key:** `applicant.<model>.delete` (risk: medium)

Policy `<model>` keys: `emergency_contact`, `family_member`, `identity_document`,
`education`, `language_test`, `work_experience`, `skill`, `training`, `language`,
`reference`, `academic_grading`.

## 4. Validations & business rules

- **Admin/superadmin only** — staff never reach these (403).
- Parent applicant **archive** (409) / **lock** (423, staff — N/A in practice)
  guarded; every mutation emits an `applicant.child_*` audit event.
- **`identity-documents`:** `issued_at ≤ expires_at`; `image_front`/`image_back`/
  `file` must reference `Media` owned by the **same applicant**; passport/ID number
  collisions produce a non-blocking duplicate warning.
- **`language-tests`:** each score must fall within the range for its `test_type`.
- No optimistic-concurrency `record_version` on any child.

## 5. Errors

| Code                                    | HTTP | Trigger                                        | Suggested UI handling              |
| --------------------------------------- | ---- | ---------------------------------------------- | ---------------------------------- |
| `APPLICANT_CHILD_NOT_FOUND`             | 404  | unknown child under the applicant              | refresh the list                   |
| `APPLICANT_ARCHIVED`                    | 409  | mutation on an archived applicant              | show archived state                |
| `APPLICANT_RECORD_LOCKED`               | 423  | staff mutation while locked (N/A — admin-only) | n/a in practice                    |
| `APPLICANT_IDENTITY_DATE_INVALID`       | 400  | identity `issued_at` after `expires_at`        | field error on `expires_at`        |
| `APPLICANT_MEDIA_INVALID`               | 400  | identity media link from another applicant     | clear the media link; re-pick      |
| `APPLICANT_LANGUAGE_TEST_SCORE_INVALID` | 400  | a score outside the `test_type` range          | field error on the offending score |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/language-tests/ — request
{ "test_type": "ielts", "overall_score": "7.5", "listening_score": "8.0", "test_date": "2026-05-01" }

// 201 — response.data
{
  "id": "lt01…",
  "test_type": "ielts",
  "test_date": "2026-05-01",
  "test_date_bs": { "year": 2083, "month": 1, "day": 19, "month_name_en": "Baisakh", "month_name_np": "बैशाख", "display_en": "19 Baisakh 2083", "display_np": "१९ बैशाख २०८३" },
  "overall_score": "7.5",
  "listening_score": "8.0",
  "reading_score": null,
  "writing_score": null,
  "speaking_score": null,
  "certificate_number": "",
  "expiry_date": null,
  "expiry_date_bs": null,
  "notes": "",
  "created_at": "2026-07-19T04:40:00Z",
  "updated_at": "2026-07-19T04:40:00Z",
}

// POST /api/v1/applicants/<id>/identity-documents/ — duplicate warning in meta
{
  "possible_duplicate": true,
  "matches": [{ "applicant_code": "APP-2026-000119", "display_name": "R. Shrestha", "phone_match": false, "email_match": false, "identity_match": true }],
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on any child; last-write-wins.
- **Role projection:** uniform (admin-only surface); staff get 403 — don't render
  these sections for staff.
- **Dates:** date fields carry a `<field>_bs` sibling (see the resource tables);
  send only the AD date.
- **Money/decimals:** language-test scores and `class_hours` are **decimal
  strings** — keep them as strings.
- **Media links:** identity-document `image_front`/`image_back`/`file` take a
  `Media` id (upload via `media.md` first). Send `null` to clear.
- **Server-computed (never send):** `id`, timestamps, all `*_bs` siblings,
  identity `verified_at` / `number_fingerprint`.
