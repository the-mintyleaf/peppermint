# Integration — Applicants

**Owner app:** `applicants`
**Version:** 1.3.0
**Status:** Active
**Synced:** 2026-07-27 (from `.backend/backend/applicants/docs/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md`)

> Re-sync with `/sync-api grandway applicants` when the backend's Change History
> moves past DATA_CONTRACT 1.3.0 / API 1.2.0.
>
> **1.3.0 — breaking, English-only names.** The `_np` and `_romanized` columns
> were dropped and the `_en` fields renamed to a bare `full_name` on Applicant,
> FamilyMember and EmergencyContact. A Roman name is an independent identity
> here, not a translation of a Nepali one.

---

## Change History

| Version | Date       | Summary                                    |
| ------- | ---------- | ------------------------------------------ |
| 1.0.0   | 2026-07-23 | Initial integration contract — 6 endpoints |

---

## 1. Module

- **Name:** Applicants — the permanent, authoritative identity record of a
  person the consultancy works with: name, contact, addresses, passport,
  family, emergency contacts, and standing. Owns no study-objective data
  (`applicant_journeys`) and no history table of its own.
- **Base path:** `/api/v1/applicants/`
- **Auth:** Bearer access JWT on every endpoint. `admin` and `lead_manager`
  may use this module — **shared, not owner-scoped**: any Admin or Lead
  Manager reads/edits any applicant (a deliberate reversal of `leads`'
  owner-scoping). A `superadmin` token is rejected with 403
  `APPLICANTS_ACTOR_FORBIDDEN` on **every** endpoint.

## 2. Requires

| Depends on           | Kind                     | Why                                                                                                                                 | What breaks without it                                                                    |
| -------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `authenticate`       | framework/JWT            | Supplies `authority_type`, deciding admin-only-create vs shared-read/edit vs 403.                                                   | Every endpoint 401s; unresolvable authority gets 403.                                     |
| `authenticate`       | FK                       | `created_by` references a user (`PROTECT`).                                                                                         | Applicants couldn't be created.                                                           |
| `audit`              | service call             | Every mutation appends one event; `history` reads it back. Applicants owns no history table itself.                                 | `GET /applicants/<id>/history/` returns empty — record still works, no timeline.          |
| `applicant_journeys` | inbound FK               | `ApplicantJourney.applicant` is a `PROTECT` FK pointing here.                                                                       | N/A — this is an inbound dependency; applicants itself depends on nothing from journeys.  |
| `leads`              | inbound, one-directional | `leads.Lead.converted_applicant` is a `OneToOne` pointing here; `leads` calls `applicants.services.create_applicant` at conversion. | Applicants carries **no** reference back to `leads` — this app has zero dependency on it. |

## 3. Conventions

- **Response:** `{ success: true, message, data, meta }`. Single resource → object; list → array (never nested under `results`).
- **Error:** `{ success: false, error: { code, message, details }, meta: {} }`.
- **Auth failures:** 401 (no/expired/revoked token). 403 `APPLICANTS_ACTOR_FORBIDDEN` — any `superadmin` call; a `lead_manager` calling `POST /applicants/` (create is Admin-only).
- **404 is always genuine.** Unlike `leads`, there is no ownership to hide — `APPLICANTS_APPLICANT_NOT_FOUND` never means "not yours."
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100). `meta`: `count`, `page`, `page_size`, `next`, `previous`.
- **IDs:** UUID strings. **Times:** ISO 8601 UTC. `date_of_birth`, passport `issued_date`/`expiry_date` carry a `<field>_bs` Bikram Sambat sibling; `created_at`/`updated_at` never do.
- **Filter/search params — `GET /applicants/` only:** `status` (`active`/`dormant`/`archived`), `creation_source` (`lead_conversion`/`direct_admin`), `search` (`icontains` on `full_name` and `email`, trigram-indexed), `fiscal_year` (`YYYY/YY`, filters on `created_at`). Newest first, no client-controlled ordering.
- **Nested sub-resources — contact numbers, addresses, passport, family members, emergency contacts — have no standalone endpoints.** All managed inside the applicant payload. `contact_numbers`/`addresses`/`family_members`/`emergency_contacts` **replace the whole set** on update (never a delta); `passport` **upserts** the single record.
- `creation_source` and `created_by` are never accepted from a client on any endpoint.

## 4. Models

**BsDate** — `{ year, month, day, month_name, display }` — never sent by a client.

**UserBrief** — `{ id, username, display_name }`.

**ApplicantContactNumber** — `{ id, number, label: enum, is_primary: bool }`. `number` regex `^\+?[0-9][0-9 ()\-]{4,31}$` (shared validator with `leads`). `(applicant, number)` unique.

**ApplicantAddress** — `{ id, address_type: "permanent"|"current", country?, province?, district?, municipality?, ward?, street_address?, postal_code? }`. Every component optional; at most one row per `address_type`.

**PassportDetail** — `{ id, passport_number, issuing_country?, place_of_issue?, issued_date?, issued_date_bs?, expiry_date?, expiry_date_bs? }`. `expiry_date` must be after `issued_date` when both are present. One per applicant — a renewal overwrites it.

**FamilyMember** — `{ id, relationship: enum, full_name?, occupation?, contact_number? }`. Only `relationship` is required; `full_name` may be blank.

**EmergencyContact** — `{ id, full_name?, relationship (free text), contact_number, email?, address? }`. `contact_number` is required — an emergency contact with no number serves no purpose.

**Applicant — list shape** (`GET /applicants/` rows): `{ id, full_name, date_of_birth?, date_of_birth_bs?: BsDate, gender, nationality, email, status: enum, creation_source: enum, created_by: UserBrief, contact_numbers: ApplicantContactNumber[], destinations: Destination[], created_at, updated_at }`. **`contact_numbers` IS in the list shape** — only the addresses/passport/family/emergency collections are detail-only. `destinations` (added in API 1.1.0) is not yet consumed by this app.

**Applicant — detail shape** (retrieve, create, update, status-change): list shape **plus** `{ addresses: ApplicantAddress[], passport: PassportDetail|null, family_members: FamilyMember[], emergency_contacts: EmergencyContact[], originating_lead_id: string|null }`.

- `originating_lead_id` is read through the reverse accessor `applicant.originating_lead` — `leads.Lead` owns the link; `null` for a directly created applicant.

**HistoryEntry** — `{ id, action: enum, actor_type, actor_id?, actor_label, summary, reason, changes: json, metadata: json, created_at, created_at_bs: BsDate }`. Sourced from the central `audit` log — nested-collection events carry only a **count** in `metadata`, never the replaced values (passport numbers, addresses, family names are never copied into an event).

## 5. Enums

- **`Applicant.status`**: `active` | `dormant` | `archived` — action-only, never writable via `PATCH`.
- **`Applicant.creation_source`**: `lead_conversion` | `direct_admin` — immutable, server-set.
- **`Applicant.gender`**: `male` | `female` | `other` | `undisclosed`.
- **`ApplicantContactNumber.label`**: `mobile` | `home` | `work` | `whatsapp` | `viber` | `other`.
- **`ApplicantAddress.address_type`**: `permanent` | `current`.
- **`FamilyMember.relationship`**: `father` | `mother` | `spouse` | `sibling` | `child` | `guardian` | `other`.
- **`HistoryEntry.action`** (emitted): `applicant_created` | `applicant_updated` | `applicant_contact_changed` | `applicant_address_changed` | `applicant_passport_changed` | `applicant_family_changed` | `applicant_emergency_contact_changed` | `applicant_status_changed`.

## 6. Dependency order

1. An applicant must exist before any journey can reference it.
2. `POST /applicants/` needs nothing but an authenticated Admin.
3. Everything else operates on an existing applicant id.

## 7. Endpoints

| Endpoint                           | Method | Policy key                           | Auth                  | Notes                             |
| ---------------------------------- | ------ | ------------------------------------ | --------------------- | --------------------------------- |
| `/api/v1/applicants/`              | GET    | `applicants.applicant.list`          | Admin or Lead Manager | Every applicant, no owner-scoping |
| `/api/v1/applicants/`              | POST   | `applicants.applicant.create`        | **Admin only**        | 403 for Lead Manager              |
| `/api/v1/applicants/<id>/`         | GET    | `applicants.applicant.read`          | Admin or Lead Manager | 404 always genuine                |
| `/api/v1/applicants/<id>/`         | PATCH  | `applicants.applicant.update`        | Admin or Lead Manager | Collections replace wholesale     |
| `/api/v1/applicants/<id>/status/`  | POST   | `applicants.applicant.change_status` | Admin or Lead Manager | Manual only, never a side effect  |
| `/api/v1/applicants/<id>/history/` | GET    | `applicants.applicant.list_history`  | Admin or Lead Manager | Backed by `audit`                 |

### Request bodies

- **Create:** `{ full_name (required), date_of_birth?, gender?, nationality?, email?, contact_numbers (required, ≥1), addresses? (≤1 per type), passport? (issued_date+expiry_date), family_members?, emergency_contacts? }`. `status` not accepted — always starts `active`.
- **Update:** same shape, every field optional; any nested collection sent replaces the whole set. `status`/`creation_source`/`created_by` silently ignored if sent.
- **Status change:** `{ status: "active"|"dormant"|"archived" }`.

## 8. Error codes

| Code                                 | HTTP | Notes                                               |
| ------------------------------------ | ---- | --------------------------------------------------- |
| `APPLICANTS_ACTOR_FORBIDDEN`         | 403  | Superadmin (any endpoint) or Lead Manager on create |
| `APPLICANTS_APPLICANT_NOT_FOUND`     | 404  | Always genuine — no scoping to hide                 |
| `APPLICANTS_CONTACT_REQUIRED`        | 400  | No contact number survived validation               |
| `APPLICANTS_PASSPORT_EXPIRY_INVALID` | 400  | `expiry_date` not after `issued_date`               |

## 9. Gaps

- **No export/bulk endpoint** — one record per request; a "passports expiring soon" view is not cheaply buildable client-side (list shape excludes passport data entirely).
- **No duplicate detection or merge endpoint.**
- **No object-level permission-key enforcement yet** — inline authority check only, same interim pattern as `leads`.
- **No photograph field** — deliberately deferred to the not-yet-built uploaded-files module.
