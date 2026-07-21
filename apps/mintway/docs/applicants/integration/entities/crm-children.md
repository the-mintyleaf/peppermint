# `CRM children` — the 5 admin-only CRM / compliance sub-records

**Endpoint base:** `/api/v1/applicants/<applicant_id>/<slug>/` (detail under
`.../<slug>/<child_id>/`), one `<slug>` per resource below.
**Access:** **admin/superadmin only** — staff receive `403` on every method.
Parent archive (409) / lock (423) guarded. Sponsor financials, visa refusals, and
consent are protected/highly-protected classes — their numbers are never logged.
**Owns:** counselling contact history, sponsors, travel/visa history, and consent.
Like the profile children, these share **one generic CRUD view + serializer base**
and differ only in fields. The slugs:

| Slug             | Resource      | Special behaviour                                                            |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| `interactions`   | Interaction   | `occurred_at` required; refreshes applicant follow-up projections; case link |
| `sponsors`       | Sponsor       | decimal money; case link                                                     |
| `travel-history` | Travel record | `travelled_from_bs` / `travelled_to_bs`                                      |
| `visa-history`   | Visa record   | `evidence_media` (same-applicant); `application_date_bs`/`decision_date_bs`  |
| `consents`       | Consent       | server-stamps `withdrawn_at` on `status=withdrawn`; `evidence_media`         |

## 1. Fields (rows)

**Every** resource also carries `id` (`string`, UUID, PK), `created_at`,
`updated_at` — all **server-set / response-only**, omitted from the per-resource
tables below. Date/datetime fields return a read-only `<field>_bs` sibling.

#### `interactions`

| Field                | TS type                   | In req | In res | Req | Nullable | Server-set | Enum                           | Validation           | Notes                                  |
| -------------------- | ------------------------- | ------ | ------ | --- | -------- | ---------- | ------------------------------ | -------------------- | -------------------------------------- |
| `application_case`   | `string \| null`          | ✓      | ✓      | ✗   | Yes      | ✗          | —                              | UUID; same applicant | Optional case link                     |
| `interaction_type`   | `InteractionType`         | ✓      | ✓      | ✓   | No       | ✗          | `Interaction.interaction_type` | required             |                                        |
| `direction`          | `InteractionDirection`    | ✓      | ✓      | ✗   | No       | ✗          | `Interaction.direction`        | —                    | `""` when unset                        |
| `occurred_at`        | `string`                  | ✓      | ✓      | ✓   | No       | ✗          | —                              | ISO 8601             | **required**; carries `occurred_at_bs` |
| `summary`            | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —                              | text                 |                                        |
| `outcome`            | `string`                  | ✓      | ✓      | ✗   | No       | ✗          | —                              | text                 |                                        |
| `next_follow_up_at`  | `string \| null`          | ✓      | ✓      | ✗   | Yes      | ✗          | —                              | ISO 8601             | carries `next_follow_up_at_bs`         |
| `follow_up_priority` | `FollowUpPriority`        | ✓      | ✓      | ✗   | No       | ✗          | `follow_up_priority`           | —                    | `""` when unset                        |
| `is_confidential`    | `boolean`                 | ✓      | ✓      | ✗   | No       | ✗          | —                              | —                    | display-only gating (see `gaps.md`)    |
| `metadata`           | `Record<string, unknown>` | ✓      | ✓      | ✗   | No       | ✗          | —                              | JSON object          | `{}` when unset                        |

#### `sponsors`

| Field                       | TS type              | In req | In res | Req | Nullable | Server-set | Enum                          | Validation           | Notes                |
| --------------------------- | -------------------- | ------ | ------ | --- | -------- | ---------- | ----------------------------- | -------------------- | -------------------- |
| `application_case`          | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                             | UUID; same applicant | Optional case link   |
| `sponsor_type`              | `SponsorType`        | ✓      | ✓      | ✓   | No       | ✗          | `Sponsor.sponsor_type`        | required             |                      |
| `name`                      | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤200 chars           |                      |
| `relationship_to_applicant` | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤100 chars           |                      |
| `occupation_or_business`    | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤200 chars           |                      |
| `organization_name`         | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤255 chars           |                      |
| `address`                   | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | text                 |                      |
| `country`                   | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤100 chars           |                      |
| `phone`                     | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤32 chars            |                      |
| `email`                     | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | email                |                      |
| `annual_income`             | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                             | decimal              | **decimal string**   |
| `income_currency`           | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤8 chars             |                      |
| `funding_amount`            | `string \| null`     | ✓      | ✓      | ✗   | Yes      | ✗          | —                             | decimal              | **decimal string**   |
| `funding_currency`          | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤8 chars             |                      |
| `funding_source`            | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | ≤150 chars           |                      |
| `is_primary`                | `boolean`            | ✓      | ✓      | ✗   | No       | ✗          | —                             | —                    |                      |
| `verification_status`       | `VerificationStatus` | ✓      | ✓      | ✗   | No       | ✗          | `Sponsor.verification_status` | —                    | Default `unverified` |
| `verification_notes`        | `string`             | ✓      | ✓      | ✗   | No       | ✗          | —                             | text                 |                      |

#### `travel-history`

| Field            | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                       |
| ---------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | --------------------------- |
| `country`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |                             |
| `purpose`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤150 chars |                             |
| `travelled_from` | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `travelled_from_bs` |
| `travelled_to`   | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       | carries `travelled_to_bs`   |
| `visa_type`      | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | ≤100 chars |                             |
| `notes`          | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —    | text       |                             |

#### `visa-history`

| Field              | TS type          | In req | In res | Req | Nullable | Server-set | Enum                   | Validation           | Notes                         |
| ------------------ | ---------------- | ------ | ------ | --- | -------- | ---------- | ---------------------- | -------------------- | ----------------------------- |
| `country`          | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | ≤100 chars           |                               |
| `visa_type`        | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | ≤100 chars           |                               |
| `application_date` | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | date                 | carries `application_date_bs` |
| `decision_date`    | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | date                 | carries `decision_date_bs`    |
| `decision`         | `VisaDecision`   | ✓      | ✓      | ✗   | No       | ✗          | `VisaHistory.decision` | —                    | Default `pending`             |
| `reference_number` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | ≤100 chars           |                               |
| `refusal_reason`   | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | text                 |                               |
| `notes`            | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | text                 |                               |
| `evidence_media`   | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | UUID; same applicant | `Media` id                    |

#### `consents`

| Field                  | TS type          | In req | In res | Req | Nullable | Server-set | Enum                   | Validation           | Notes                                                               |
| ---------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---------------------- | -------------------- | ------------------------------------------------------------------- |
| `consent_type`         | `ConsentType`    | ✓      | ✓      | ✓   | No       | ✗          | `Consent.consent_type` | required             |                                                                     |
| `status`               | `ConsentStatus`  | ✓      | ✓      | ✗   | No       | ✗          | `Consent.status`       | —                    | Default `granted`                                                   |
| `consent_text_version` | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | ≤50 chars            |                                                                     |
| `captured_at`          | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | ISO 8601             | carries `captured_at_bs`                                            |
| `expires_at`           | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | ISO 8601             | carries `expires_at_bs`                                             |
| `withdrawn_at`         | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —                      | —                    | **server-stamped** on `status=withdrawn`; carries `withdrawn_at_bs` |
| `evidence_media`       | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —                      | UUID; same applicant | `Media` id                                                          |
| `notes`                | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —                      | text                 |                                                                     |

## 2. Types

```ts
import type { FollowUpPriority, BsDate } from "./applicant"; // shared unions/shape

// Enum unions — values are the registry in enums.md; declared here so the block compiles.
type InteractionType =
  | "inquiry"
  | "call"
  | "email"
  | "message"
  | "office_visit"
  | "counselling"
  | "document_request"
  | "follow_up"
  | "other";
type InteractionDirection = "inbound" | "outbound" | "internal";
type SponsorType =
  | "self"
  | "family"
  | "person"
  | "employer"
  | "organization"
  | "other";
type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
type VisaDecision = "approved" | "refused" | "withdrawn" | "pending";
type ConsentType =
  | "data_processing"
  | "document_preparation"
  | "information_sharing"
  | "marketing"
  | "other";
type ConsentStatus = "granted" | "withdrawn" | "expired";

interface ChildBase {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Interaction extends ChildBase {
  application_case: string | null;
  interaction_type: InteractionType;
  direction: InteractionDirection | "";
  occurred_at: string;
  occurred_at_bs: BsDate | null;
  summary: string;
  outcome: string;
  next_follow_up_at: string | null;
  next_follow_up_at_bs: BsDate | null;
  follow_up_priority: FollowUpPriority | "";
  is_confidential: boolean;
  metadata: Record<string, unknown>;
}
interface Sponsor extends ChildBase {
  application_case: string | null;
  sponsor_type: SponsorType;
  name: string;
  relationship_to_applicant: string;
  occupation_or_business: string;
  organization_name: string;
  address: string;
  country: string;
  phone: string;
  email: string;
  annual_income: string | null; // decimal string
  income_currency: string;
  funding_amount: string | null; // decimal string
  funding_currency: string;
  funding_source: string;
  is_primary: boolean;
  verification_status: VerificationStatus;
  verification_notes: string;
}
interface TravelHistory extends ChildBase {
  country: string;
  purpose: string;
  travelled_from: string | null;
  travelled_from_bs: BsDate | null;
  travelled_to: string | null;
  travelled_to_bs: BsDate | null;
  visa_type: string;
  notes: string;
}
interface VisaHistory extends ChildBase {
  country: string;
  visa_type: string;
  application_date: string | null;
  application_date_bs: BsDate | null;
  decision_date: string | null;
  decision_date_bs: BsDate | null;
  decision: VisaDecision;
  reference_number: string;
  refusal_reason: string;
  notes: string;
  evidence_media: string | null;
}
interface Consent extends ChildBase {
  consent_type: ConsentType;
  status: ConsentStatus;
  consent_text_version: string;
  captured_at: string | null;
  captured_at_bs: BsDate | null;
  expires_at: string | null;
  expires_at_bs: BsDate | null;
  withdrawn_at: string | null; // server-stamped
  withdrawn_at_bs: BsDate | null;
  evidence_media: string | null;
  notes: string;
}

// Create/Update: omit ChildBase + all *_bs siblings + service-stamped withdrawn_at.
type InteractionCreate = Omit<
  Interaction,
  keyof ChildBase | "occurred_at_bs" | "next_follow_up_at_bs"
>;
type SponsorCreate = Omit<Sponsor, keyof ChildBase>;
type TravelHistoryCreate = Omit<
  TravelHistory,
  keyof ChildBase | "travelled_from_bs" | "travelled_to_bs"
>;
type VisaHistoryCreate = Omit<
  VisaHistory,
  keyof ChildBase | "application_date_bs" | "decision_date_bs"
>;
type ConsentCreate = Omit<
  Consent,
  | keyof ChildBase
  | "captured_at_bs"
  | "expires_at_bs"
  | "withdrawn_at"
  | "withdrawn_at_bs"
>;
// Update is a Partial of the corresponding Create (no record_version on children).
```

## 3. Endpoints

Uniform CRUD, identical across all 5 slugs. Replace `<slug>` / `<Resource>` /
`<model>`.

### `GET /api/v1/applicants/<applicant_id>/<slug>/`

- **Returns:** `list[<Resource>]`.
- **Policy key:** `applicant.<model>.list`

### `POST /api/v1/applicants/<applicant_id>/<slug>/`

- **Request:** `<Resource>Create`.
- **Returns:** the created `<Resource>`.
- **Side effects:** emits a per-resource audit event (`applicant.interaction_recorded`,
  `applicant.sponsor_added`, `applicant.visa_history_updated`,
  `applicant.consent_changed`, `applicant.child_added`). **interactions** also
  refresh the applicant's `last_contacted_at` / `next_follow_up_at` /
  `follow_up_priority`. **consents** with `status=withdrawn` stamp `withdrawn_at` /
  `withdrawn_by` server-side.
- **Policy key:** `applicant.<model>.create`

### `GET /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Returns:** one `<Resource>`.
- **Policy key:** `applicant.<model>.read`

### `PATCH /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Request:** `Partial<<Resource>Create>`. (No `record_version`.)
- **Returns:** the updated `<Resource>`.
- **Policy key:** `applicant.<model>.update`

### `DELETE /api/v1/applicants/<applicant_id>/<slug>/<child_id>/`

- **Purpose:** hard delete (audit-logged).
- **Policy key:** `applicant.<model>.delete`

Policy `<model>` keys: `interaction`, `sponsor`, `travel_history`,
`visa_history`, `consent`.

## 4. Validations & business rules

- **Admin/superadmin only** (staff → 403); parent archive/lock guarded.
- **interactions:** `occurred_at` is required; a create/update refreshes the
  applicant's follow-up projections.
- **sponsors:** `annual_income` / `funding_amount` are decimal money (strings).
- **visa-history / consents:** `evidence_media` must reference `Media` owned by the
  **same applicant** — else `APPLICANT_MEDIA_INVALID`.
- **consents:** setting `status=withdrawn` stamps `withdrawn_at` / `withdrawn_by`
  server-side — the client cannot backdate or spoof the actor.
- An `application_case` link (interactions/sponsors) must belong to the same
  applicant (`APPLICANT_CASE_APPLICANT_MISMATCH`).
- No optimistic-concurrency `record_version` on any CRM child.

## 5. Errors

| Code                                | HTTP | Trigger                                   | Suggested UI handling         |
| ----------------------------------- | ---- | ----------------------------------------- | ----------------------------- |
| `APPLICANT_CHILD_NOT_FOUND`         | 404  | unknown child under the applicant         | refresh the list              |
| `APPLICANT_ARCHIVED`                | 409  | mutation on an archived applicant         | show archived state           |
| `APPLICANT_MEDIA_INVALID`           | 400  | cross-applicant `evidence_media`          | clear the media link; re-pick |
| `APPLICANT_CASE_APPLICANT_MISMATCH` | 409  | `application_case` from another applicant | clear the case link           |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/interactions/ — request
{ "interaction_type": "call", "direction": "outbound", "occurred_at": "2026-07-19T10:00:00Z", "summary": "Discussed offer letter", "next_follow_up_at": "2026-07-26T10:00:00Z", "follow_up_priority": "high" }

// 201 — response.data (abridged)
{
  "id": "in01…",
  "application_case": null,
  "interaction_type": "call",
  "direction": "outbound",
  "occurred_at": "2026-07-19T10:00:00Z",
  "occurred_at_bs": { "year": 2083, "month": 4, "day": 4, "month_name_en": "Shrawan", "month_name_np": "श्रावण", "display_en": "4 Shrawan 2083", "display_np": "४ श्रावण २०८३" },
  "summary": "Discussed offer letter",
  "outcome": "",
  "next_follow_up_at": "2026-07-26T10:00:00Z",
  "follow_up_priority": "high",
  "is_confidential": false,
  "metadata": {},
  "created_at": "2026-07-19T10:05:00Z",
  "updated_at": "2026-07-19T10:05:00Z",
}

// POST /api/v1/applicants/<id>/consents/ — withdrawing
{ "consent_type": "marketing", "status": "withdrawn" }
// → response.data.withdrawn_at is set server-side (client cannot supply it)
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`; last-write-wins.
- **Role projection:** uniform (admin-only surface); staff → 403.
- **Dates:** date/datetime fields carry `<field>_bs` siblings; send only the AD
  value.
- **Money:** sponsor `annual_income` / `funding_amount` are **decimal strings**.
- **Server-computed (never send):** `id`, timestamps, all `*_bs` siblings, consent
  `withdrawn_at` / `withdrawn_by`.
- **Media / case links:** `evidence_media` and `application_case` take ids owned by
  the same applicant; upload/create those first, send `null` to clear.
- **Confidential interactions:** `is_confidential` is stored but **not yet gated**
  by role (superadmin-only gating is future work — see `gaps.md`); do not rely on
  it to hide rows.
