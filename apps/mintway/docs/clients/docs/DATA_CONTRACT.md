# Data Contract — Client Directory

**Owner app:** `clients`
**Version:** 1.5.0
**Status:** Active
**Created:** 2026-07-20
**Purpose:** Owns the authoritative directory of external organizations the company deals with (companies, schools, banks, government offices, NGOs, vendors, embassies, referral/training partners), their contact persons, addresses, aliases, tags, and logos, plus its immutable audit trail. It is a standalone master-data module — it does NOT own applicants (owned by `applicant`), authentication/roles (owned by `authenticate`), or access-control metadata (owned by `core.policy_engine`). It has no cross-app model dependencies.

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                           |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | AI (Claude) | Initial contract — Phase 1 foundation: `Client`, `ClientCodeCounter`, `ClientAuditEvent`                                                          |
| 1.1.0   | 2026-07-20 | AI (Claude) | Phase 2 directory detail — `ClientContactPerson`, `ClientAddress`, `ClientAlias`, `ClientTag`, `ClientTagAssignment`; new child audit event types |
| 1.2.0   | 2026-07-20 | AI (Claude) | Phase 2 logo — `ClientLogo` (private storage + thumbnail); logo audit event types                                                                 |
| 1.3.0   | 2026-07-20 | AI (Claude) | Phase 3 search & integrity — trigram indexes, duplicate detection (`client_duplicate_flagged` + DuplicateMatch payload), lookup projection        |
| 1.4.0   | 2026-07-20 | AI (Claude) | Phase 4 integration — document-prefill packet contract + audit-trail read projection (domain-event outbox deferred)                               |
| 1.5.0   | 2026-07-20 | AI (Claude) | Phase 5 operational — merge columns on `Client` + `ClientMergeRecord`; CSV import/export; merge/import/export audit events                        |

---

## Deliberate Deviations

The concept doc ([.concept/client_app_idea.md](../../../../.concept/client_app_idea.md)) is the source; this Phase-1 implementation deviates deliberately:

- **No `organization_id` / tenant scoping** — the platform has no Organization model and the module is intentionally standalone (owner decision); `client_code` is globally unique rather than per-organization. Multi-tenant scoping would be a future Organization module + backfill migration.
- **Plain-name naming, not §39.1 bilingual pairs** — `legal_name`/`display_name` are stored as entered (Unicode preserved) with auto-populated `*_romanized` ASCII search projections, the same owner-approved §39.1 deviation the `applicant` app carries. Institutions have one legal identity, not `_np`/`_en` pairs.
- **`client_type`/`relationship_type` are `TextChoices` enums**, not reference tables (concept §7.6 permits either; enums chosen for Phase 1, convertible later).
- **Phase 1 scope only** — contacts, addresses, aliases, tags, logo/media, smart trigram search, duplicate detection, lookup endpoint, document-prefill, domain events, import/export, and merge are later phases (concept §24) and are **not** in this contract.

---

## 1. Client

**Purpose:** The authoritative external-organization directory record and aggregate root.
**Table:** `clients_client`
**`client_type` choices:** `company`, `educational_institution`, `bank`, `cooperative`, `government_office`, `ngo_ingo`, `embassy_or_diplomatic_mission`, `vendor`, `training_provider`, `other`
**`relationship_type` choices:** `customer`, `partner`, `vendor`, `service_provider`, `referral_partner`, `financial_institution`, `document_issuer`, `regulatory_body`, `other`
**`status` choices:** `prospective`, `active`, `inactive`, `former`, `archived`
**`source` choices:** `manual`, `import`, `migration`, `integration`, `other`

| Field                          | Type          | Required | Nullable | Generated | Description                                                           |
| ------------------------------ | ------------- | -------- | -------- | --------- | --------------------------------------------------------------------- |
| id                             | UUID          | —        | No       | Yes       | Primary key                                                           |
| client_code                    | String(20)    | —        | No       | Yes       | Immutable public code `CL-YYYY-NNNNNN` (globally unique)              |
| legal_name                     | String(255)   | Yes      | No       | No        | Registered/formal organization name (Unicode preserved)               |
| display_name                   | String(255)   | No       | No       | No        | Commonly used / shortened name                                        |
| legal_name_romanized           | String(255)   | No       | No       | Yes       | ASCII search projection of `legal_name` (§39.3)                       |
| display_name_romanized         | String(255)   | No       | No       | Yes       | ASCII search projection of `display_name` (§39.3)                     |
| client_type                    | Enum          | Yes      | No       | No        | Organization classification (see choices)                             |
| relationship_type              | Enum          | No       | No       | No        | How the company relates to the client                                 |
| status                         | Enum          | Yes      | No       | No        | Directory lifecycle state; default `prospective`                      |
| source                         | Enum          | No       | No       | No        | How the record entered the directory; default `manual`                |
| website                        | URL           | No       | No       | No        | Canonical organization website                                        |
| website_domain                 | String(255)   | No       | No       | Yes       | Normalized hostname for search/dedupe                                 |
| primary_email                  | Email         | No       | No       | No        | General institutional email                                           |
| primary_phone                  | String(32)    | No       | No       | No        | General/switchboard number                                            |
| alternate_phone                | String(32)    | No       | No       | No        | Secondary institutional number                                        |
| normalized_email               | String(254)   | No       | No       | Yes       | Lowercased email search/dedupe projection                             |
| normalized_phone               | String(32)    | No       | No       | Yes       | Digits(+prefix) phone search/dedupe projection                        |
| registration_number            | String(255)   | No       | No       | No        | Legal registration identifier (display form, leading zeros preserved) |
| tax_number                     | String(255)   | No       | No       | No        | VAT/PAN/tax identifier (display form)                                 |
| normalized_registration_number | String(255)   | No       | No       | Yes       | Comparison projection of `registration_number`                        |
| normalized_tax_number          | String(255)   | No       | No       | Yes       | Comparison projection of `tax_number`                                 |
| country_code                   | String(2)     | No       | No       | No        | ISO 3166-1 alpha-2 (uppercased)                                       |
| established_date               | Date          | No       | Yes      | No        | Founding date when known                                              |
| description                    | Text          | No       | No       | No        | Neutral public description                                            |
| internal_notes                 | Text          | No       | No       | No        | **Protected** — admin/superadmin only (§17.2)                         |
| relationship_started_on        | Date          | No       | Yes      | No        | Date the association began                                            |
| relationship_ended_on          | Date          | No       | Yes      | No        | Date the relationship ended (≥ `relationship_started_on`)             |
| is_locked                      | Boolean       | —        | No       | No        | Business lock flag; default `false`                                   |
| locked_by                      | UUID FK(User) | No       | Yes      | No        | Actor who locked the record                                           |
| locked_at                      | DateTime      | No       | Yes      | No        | Lock timestamp                                                        |
| lock_reason                    | Text          | No       | No       | No        | Reason recorded at lock time                                          |
| record_version                 | PositiveInt   | —        | No       | Yes       | Optimistic-concurrency version; starts 1, bumped per write            |
| archived_at                    | DateTime      | No       | Yes      | No        | Soft-delete timestamp (the archive flag)                              |
| archived_by                    | UUID FK(User) | No       | Yes      | No        | Actor who archived the record                                         |
| merged_into                    | UUID FK(self) | No       | Yes      | No        | Survivor this duplicate was folded into (concept §11.3; Phase 5)      |
| merged_at                      | DateTime      | No       | Yes      | No        | Merge timestamp                                                       |
| merged_by                      | UUID FK(User) | No       | Yes      | No        | Actor who performed the merge                                         |
| created_by                     | UUID FK(User) | No       | Yes      | No        | Creator actor stamp                                                   |
| updated_by                     | UUID FK(User) | No       | Yes      | No        | Last-updater actor stamp                                              |
| created_at                     | DateTime      | —        | No       | Yes       | Server-generated                                                      |
| updated_at                     | DateTime      | —        | No       | Yes       | Server-generated                                                      |

**Validation Rules:**

- `legal_name` required and non-blank; collapsed-whitespace, NFC-normalized (§39.2), original case preserved.
- `client_code` immutable, ASCII, matches `CL-YYYY-NNNNNN`; server-generated, never client-supplied.
- `country_code` must be 2 ASCII letters (ISO 3166-1 alpha-2), stored uppercase.
- `relationship_ended_on` cannot precede `relationship_started_on`.
- Directory `status` changes obey the transition map (§ below); entering `former` (or reactivating a `former` client) requires a reason.
- `record_version` ≥ 1 (DB `CheckConstraint client_record_version_positive`).
- `internal_notes` is only settable/readable by admin/superadmin.
- Ownership never changes (no tenant); the owning company is implicit.

**Status transitions:** `prospective → active`; `active → {inactive, former}`; `inactive → {active, former}`; `former → active` (reason required). `archived` is entered only via the archive endpoint and left only via the restore endpoint (restore targets any of `prospective`/`active`/`inactive`/`former`, default `active`).

**Indexes:** single-column on `legal_name`, `legal_name_romanized`, `display_name_romanized`, `website_domain`, `normalized_email`, `normalized_phone`, `normalized_registration_number`, `normalized_tax_number`, `is_locked`, `archived_at`; `Meta.indexes` on `status`, `client_type`, `relationship_type`, `country_code`, `updated_at`.

**Soft Delete:** `archived_at` (nullable timestamp) is the soft-delete flag with `archived_by` actor; `is_archived` is a property (`archived_at is not None`). The default selector queryset excludes archived rows; only privileged actors may include them (`include_archived`). Records are never physically deleted through the API (concept §12.3).

**Example:**

```json
{
  "id": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
  "client_code": "CL-2026-000123",
  "legal_name": "Tribeni Educational Consultancy Pvt. Ltd.",
  "display_name": "Tribeni",
  "client_type": "educational_institution",
  "relationship_type": "partner",
  "status": "active",
  "website": "https://www.tribeni.edu.np/about",
  "website_domain": "tribeni.edu.np",
  "primary_email": "info@tribeni.edu.np",
  "primary_phone": "+977-1-4444444",
  "country_code": "NP",
  "record_version": 1,
  "is_locked": false,
  "created_at": "2026-07-20T12:00:00+05:45",
  "updated_at": "2026-07-20T12:00:00+05:45"
}
```

**Security Notes:** `internal_notes`, `lock_reason`, and lock actor/timestamp are excluded from the staff read projection. Mass assignment of `client_code`, lock/archive/version/audit fields is blocked (undeclared in write serializers + service whitelist).

---

## 2. ClientAuditEvent

**Purpose:** Immutable, append-only record of every material client action (create, update, status change, archive, restore, lock, unlock) and Phase-2 child changes (contact/address/alias/tag mutations, primary-contact/spokesperson/primary-address changes). The clean, ID-referencing shape is the integration hook for a future global event ledger/outbox.
**Table:** `clients_clientauditevent`
**`event_type` choices:** `client_created`, `client_updated`, `client_status_changed`, `client_archived`, `client_restored`, `client_locked`, `client_unlocked`, `client_contact_created`, `client_contact_updated`, `client_contact_deactivated`, `client_primary_contact_changed`, `client_spokesperson_changed`, `client_address_created`, `client_address_updated`, `client_address_deactivated`, `client_primary_address_changed`, `client_alias_added`, `client_alias_removed`, `client_tag_added`, `client_tag_removed`, `client_logo_uploaded`, `client_logo_removed`, `client_duplicate_flagged`, `client_merged`, `client_imported`, `client_exported`

| Field          | Type            | Required | Nullable | Generated | Description                                                     |
| -------------- | --------------- | -------- | -------- | --------- | --------------------------------------------------------------- |
| id             | UUID            | —        | No       | Yes       | Primary key                                                     |
| event_type     | Enum            | Yes      | No       | No        | The audited action (see choices)                                |
| actor          | UUID FK(User)   | No       | Yes      | No        | Who performed the action                                        |
| client         | UUID FK(Client) | No       | Yes      | No        | The subject client (`related_name=audit_events`)                |
| reason         | Text            | No       | No       | No        | Optional reason recorded with the event                         |
| changed_fields | JSON(list)      | —        | No       | No        | Names of fields changed (never values)                          |
| metadata       | JSON(dict)      | —        | No       | No        | Sanitized context (e.g. status from/to); sensitive keys dropped |
| request_id     | String(64)      | No       | No       | No        | Correlation identifier                                          |
| created_at     | DateTime        | —        | No       | Yes       | Server-generated                                                |
| updated_at     | DateTime        | —        | No       | Yes       | Server-generated (unused; rows never update)                    |

**Validation Rules:**

- Append-only: `save()` on an existing row and `delete()` both raise `AuditEventImmutableError`.
- `metadata` is sanitized before write — keys containing credential/identity substrings (`password`, `token`, `secret`, `otp`, `tax`, `registration`, `checksum`, `file`) are dropped (§17.7).
- Written only inside the mutating service's transaction.

**Indexes:** `(event_type, -created_at)`, `(client, -created_at)`.

**Soft Delete:** N/A — audit events are append-only and never deleted or archived.

**Example:**

```json
{
  "event_type": "client_status_changed",
  "client": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
  "changed_fields": [],
  "metadata": { "from": "active", "to": "former" },
  "reason": "Contract concluded",
  "request_id": "e8a851cd-3d25-4909-a6f6-14c482cc6a94"
}
```

---

## 3. ClientCodeCounter

**Purpose:** Internal per-year monotonic counter backing `CL-YYYY-NNNNNN` code generation. Not exposed via any API.
**Table:** `clients_clientcodecounter`

| Field       | Type        | Required | Nullable | Generated | Description                              |
| ----------- | ----------- | -------- | -------- | --------- | ---------------------------------------- |
| year        | PositiveInt | Yes      | No       | No        | Primary key (calendar year, Nepal time)  |
| last_number | PositiveInt | —        | No       | Yes       | Last sequence number issued for the year |

**Validation Rules:** Locked with `select_for_update` inside the create transaction so concurrent creates never collide.

**Soft Delete:** N/A — internal bookkeeping row.

---

## 4. ClientContactPerson

**Purpose:** A natural person associated with a client (spokesperson, director, account officer, general point of contact). Phase 2.
**Table:** `clients_clientcontactperson`

| Field                               | Type            | Required | Nullable | Generated | Description                                     |
| ----------------------------------- | --------------- | -------- | -------- | --------- | ----------------------------------------------- |
| id                                  | UUID            | —        | No       | Yes       | Primary key                                     |
| client                              | UUID FK(Client) | Yes      | No       | No        | Owning client (`related_name=contacts`)         |
| full_name                           | String(255)     | Yes      | No       | No        | Person's name (Unicode preserved)               |
| full_name_romanized                 | String(255)     | No       | No       | Yes       | ASCII search projection                         |
| honorific                           | String(32)      | No       | No       | No        | Mr./Ms./Dr./Prof.                               |
| designation                         | String(255)     | No       | No       | No        | Job title / official post                       |
| department                          | String(255)     | No       | No       | No        | Department or unit                              |
| email                               | Email           | No       | No       | No        | Person-specific email                           |
| phone                               | String(32)      | No       | No       | No        | Person-specific phone                           |
| alternate_phone                     | String(32)      | No       | No       | No        | Secondary phone                                 |
| normalized_email / normalized_phone | String          | No       | No       | Yes       | Search/dedupe projections                       |
| is_primary_contact                  | Boolean         | —        | No       | No        | Preferred contact; ≤1 active per client         |
| is_spokesperson                     | Boolean         | —        | No       | No        | Designated representative; ≤1 active per client |
| is_active                           | Boolean         | —        | No       | No        | Default `true`; deactivation clears both roles  |
| valid_from                          | Date            | No       | Yes      | No        | Association start                               |
| valid_until                         | Date            | No       | Yes      | No        | Association end (≥ `valid_from`)                |
| notes                               | Text            | No       | No       | No        | **Protected** — admin/superadmin only (§17.2)   |
| created_by/updated_by               | UUID FK(User)   | No       | Yes      | No        | Actor stamps                                    |
| created_at/updated_at               | DateTime        | —        | No       | Yes       | Server-generated                                |

**Validation Rules:** at least one of email/phone/designation/department required; `valid_until ≥ valid_from`; an inactive contact cannot be primary or spokesperson. Text NFC-normalized; romanized/normalized projections auto-populated by the service.

**Indexes:** `(client, is_active)`, `(full_name)`, plus `full_name_romanized`/`normalized_email`/`normalized_phone`.

**Soft Delete:** `is_active=False` (deactivate) — contacts are never hard-deleted via the API (concept §17.11 retention).

**Cross-App Dependencies:** none beyond `authenticate.User`.
**Security Notes:** `notes` is withheld from the staff read serializer and only settable via the admin write serializer.

---

## 5. ClientAddress

**Purpose:** A postal address for a client (registered/office/branch/mailing/other). Phase 2.
**Table:** `clients_clientaddress`
**`address_type` choices:** `registered`, `office`, `branch`, `mailing`, `other`

| Field                 | Type            | Required | Nullable | Generated | Description                              |
| --------------------- | --------------- | -------- | -------- | --------- | ---------------------------------------- |
| id                    | UUID            | —        | No       | Yes       | Primary key                              |
| client                | UUID FK(Client) | Yes      | No       | No        | Owning client (`related_name=addresses`) |
| address_type          | Enum            | Yes      | No       | No        | See choices                              |
| label                 | String(255)     | No       | No       | No        | E.g. "Head Office"                       |
| line_1                | String(255)     | Yes      | No       | No        | Address line 1                           |
| line_2                | String(255)     | No       | No       | No        | Address line 2                           |
| locality              | String(255)     | No       | No       | No        | City/municipality (indexed for search)   |
| district_or_state     | String(255)     | No       | No       | No        | District/state                           |
| postal_code           | String(32)      | No       | No       | No        | Stored as string                         |
| country_code          | String(2)       | No       | No       | No        | ISO 3166-1 alpha-2 (uppercased)          |
| latitude/longitude    | Decimal(9,6)    | No       | Yes      | No        | Optional mapping support                 |
| is_primary            | Boolean         | —        | No       | No        | ≤1 active primary per client             |
| is_active             | Boolean         | —        | No       | No        | Default `true`                           |
| created_by/updated_by | UUID FK(User)   | No       | Yes      | No        | Actor stamps                             |
| created_at/updated_at | DateTime        | —        | No       | Yes       | Server-generated                         |

**Validation Rules:** `line_1` required; country code validated to 2 letters; text NFC-normalized by the service.

**Indexes:** `(client, address_type)`, `(client, is_active)`, `locality`, `country_code`.

**Soft Delete:** `is_active=False` (deactivate) so historical document references remain resolvable (concept §15). Backed by the DB partial-unique constraint `client_one_active_primary_address`.

---

## 6. ClientAlias

**Purpose:** Alternate searchable names (former name, acronym, brand, local-language name). Phase 2.
**Table:** `clients_clientalias`
**`alias_type` choices:** `acronym`, `former_name`, `translation`, `brand`, `other`

| Field            | Type            | Required | Nullable | Generated | Description                             |
| ---------------- | --------------- | -------- | -------- | --------- | --------------------------------------- |
| id               | UUID            | —        | No       | Yes       | Primary key                             |
| client           | UUID FK(Client) | Yes      | No       | No        | Owning client (`related_name=aliases`)  |
| alias            | String(200)     | Yes      | No       | No        | The alternate name                      |
| alias_type       | Enum            | No       | No       | No        | See choices                             |
| normalized_alias | String(200)     | No       | No       | Yes       | Romanized+lowercased dedupe/search form |
| created_by       | UUID FK(User)   | No       | Yes      | No        | Actor stamp                             |
| created_at       | DateTime        | —        | No       | Yes       | Server-generated                        |

**Validation Rules:** duplicate `normalized_alias` for the same client is rejected (concept §7.2).

**Indexes:** `normalized_alias`; DB unique constraint `client_unique_normalized_alias` on `(client, normalized_alias)`.

**Soft Delete:** N/A — aliases are add/remove only (hard delete).

---

## 7. ClientTag

**Purpose:** Company-wide controlled vocabulary for client classification/filtering. Phase 2.
**Table:** `clients_clienttag`

| Field                 | Type          | Required | Nullable | Generated | Description                                 |
| --------------------- | ------------- | -------- | -------- | --------- | ------------------------------------------- |
| id                    | UUID          | —        | No       | Yes       | Primary key                                 |
| name                  | String(100)   | Yes      | No       | No        | Display name (Unicode preserved)            |
| normalized_name       | String(100)   | Yes      | No       | Yes       | Case/whitespace-normalized; globally unique |
| created_by/updated_by | UUID FK(User) | No       | Yes      | No        | Actor stamps                                |
| created_at/updated_at | DateTime      | —        | No       | Yes       | Server-generated                            |

**Validation Rules:** `normalized_name` unique company-wide (concept §7.5); resolved-or-created on assignment.

**Indexes:** unique `normalized_name`.

**Soft Delete:** N/A — catalog rows persist (unassignment removes the link, not the tag).

---

## 8. ClientTagAssignment

**Purpose:** Links a client to a tag (many-to-many). Phase 2.
**Table:** `clients_clienttagassignment`

| Field                 | Type               | Required | Nullable | Generated | Description                                    |
| --------------------- | ------------------ | -------- | -------- | --------- | ---------------------------------------------- |
| id                    | UUID               | —        | No       | Yes       | Primary key                                    |
| client                | UUID FK(Client)    | Yes      | No       | No        | Owning client (`related_name=tag_assignments`) |
| tag                   | UUID FK(ClientTag) | Yes      | No       | No        | Assigned tag (`related_name=assignments`)      |
| created_by            | UUID FK(User)      | No       | Yes      | No        | Actor stamp                                    |
| created_at/updated_at | DateTime           | —        | No       | Yes       | Server-generated                               |

**Validation Rules:** unique `(client, tag)` — a tag may be assigned to a client only once (concept §7.5).

**Indexes:** DB unique constraint `client_unique_tag_assignment` on `(client, tag)`.

**Soft Delete:** N/A — unassignment hard-deletes the link row (audited).

---

## 9. ClientLogo

**Purpose:** Organization logo image + generated thumbnail for a client, stored in private on-prem media. Phase 2. Replacing retires the prior row (`is_current=False`) so a logo used in a historical document snapshot remains resolvable (concept §9.7).
**Table:** `clients_clientlogo`
**Storage:** private `FileSystemStorage` at `CLIENTS_PRIVATE_MEDIA_ROOT` with `base_url=None` — no public URL; served only via authenticated streaming endpoints.

| Field                     | Type                     | Required | Nullable | Generated | Description                                              |
| ------------------------- | ------------------------ | -------- | -------- | --------- | -------------------------------------------------------- |
| id                        | UUID                     | —        | No       | Yes       | Primary key                                              |
| client                    | UUID FK(Client)          | Yes      | No       | No        | Owning client (`related_name=logos`)                     |
| file                      | File                     | Yes      | No       | No        | Original image at an opaque per-client path              |
| thumbnail                 | File                     | No       | Yes      | Yes       | Generated PNG display thumbnail (≤256×256)               |
| original_filename         | String(255)              | No       | No       | No        | Client-supplied name (never trusted for storage)         |
| mime_type                 | String(128)              | No       | No       | Yes       | Derived from content (image/jpeg, image/png, image/webp) |
| size_bytes                | PositiveInt              | —        | No       | Yes       | Byte size of the original                                |
| width / height            | PositiveInt              | —        | No       | Yes       | Original pixel dimensions                                |
| checksum                  | String(64)               | No       | No       | Yes       | SHA-256 hex of the original (indexed)                    |
| is_current                | Boolean                  | —        | No       | Yes       | Exactly one current logo per client                      |
| uploaded_by               | UUID FK(User)            | No       | Yes      | No        | Uploader                                                 |
| archived_by / archived_at | UUID FK(User) / DateTime | No       | Yes      | Yes       | Set when retired/removed                                 |
| metadata                  | JSON(dict)               | —        | No       | No        | Reserved                                                 |
| created_at / updated_at   | DateTime                 | —        | No       | Yes       | Server-generated                                         |

**Validation Rules:** image only — JPEG/PNG/WebP validated from content via Pillow (spoofed extension rejected); `size ≤ 5 MB`; dimensions `≤ 4096×4096`; SVG disabled until sanitization exists (§9.2). Filename is never used as the storage path.

**Indexes:** `(client, is_current)`, `checksum`; DB partial-unique constraint `client_one_current_logo` on `(client)` where `is_current=True`.

**Soft Delete:** `is_current=False` + `archived_at`/`archived_by` — the file is retained, never physically deleted at request time (orphan cleanup is a controlled maintenance process, §9.9).

**Cross-App Dependencies:** none beyond `authenticate.User`.
**Security Notes:** no public URL; served only through authenticated stream endpoints (`GET /logo/`, `GET /logo/thumbnail/`). Internal filesystem paths are never exposed in API responses (§9.8).

---

## 10. ClientMergeRecord

**Purpose:** Immutable, append-only record of a duplicate → surviving client merge (concept §11.3). Phase 5.
**Table:** `clients_clientmergerecord`

| Field                   | Type            | Required | Nullable | Generated | Description                                                                      |
| ----------------------- | --------------- | -------- | -------- | --------- | -------------------------------------------------------------------------------- |
| id                      | UUID            | —        | No       | Yes       | Primary key                                                                      |
| source_client           | UUID FK(Client) | Yes      | No       | No        | The duplicate that was folded in (`related_name=merges_as_source`)               |
| surviving_client        | UUID FK(Client) | Yes      | No       | No        | The survivor (`related_name=merges_as_survivor`)                                 |
| field_resolutions       | JSON(dict)      | —        | No       | No        | `{field: "duplicate"}` values copied from the duplicate                          |
| transferred_counts      | JSON(dict)      | —        | No       | No        | Per-relation counts moved (contacts, addresses, aliases, tag_assignments, logos) |
| reason                  | Text            | Yes      | No       | No        | Mandatory merge reason                                                           |
| performed_by            | UUID FK(User)   | No       | Yes      | No        | Actor who performed the merge                                                    |
| request_id              | String(64)      | No       | No       | No        | Correlation identifier                                                           |
| created_at / updated_at | DateTime        | —        | No       | Yes       | Server-generated (rows never update)                                             |

**Validation Rules:** append-only (`save` on an existing row and `delete` raise). A merge requires a reason, rejects self-merge and already-merged clients, and rejects an archived survivor.

**Indexes:** `(surviving_client, -created_at)`, `(source_client)`.

**Soft Delete:** N/A — append-only audit record.

**Merge semantics:** the duplicate is **retained** (never deleted) — `merged_into`/`merged_at`/`merged_by`/`archived_at` set and `status=archived`. Child rows transfer to the survivor; the survivor's "one active primary/current" designations win (the duplicate's are demoted before transfer); alias/tag rows already on the survivor are dropped rather than duplicated. Admin-only.

---

## Request/Response Payload Contracts

### DuplicateMatch (Phase 3, concept §11.2)

**Purpose:** A privacy-safe, non-blocking duplicate warning. Returned by the preflight `POST /clients/duplicate-check/` and surfaced in `meta.duplicate_matches` on create/update when signals fire.
**Shape:**

```json
{
  "client_code": "CL-2026-000042",
  "display_name": "T***** E**********",
  "registration_match": true,
  "tax_match": false,
  "domain_match": false,
  "email_match": false,
  "phone_match": false,
  "name_match": false
}
```

`display_name` is masked to first-initials (never the full legal name). **Produced by:** `clients.services.dedup.find_duplicate_matches` / `matches_from_raw`. **Consumed by:** create/update `meta` + the duplicate-check endpoint. Warnings never block; an authorized user proceeds by passing `override_reason` (audited via `client_duplicate_flagged`).

### Lookup row (Phase 3, FR-013)

**Purpose:** Reduced client projection for dropdowns / document-prefill.
**Shape:** `{ id, client_code, legal_name, display_name, client_type, primary_email, primary_phone, website, primary_contact, spokesperson, logo_thumbnail_url }`. **Produced by:** `clients.selectors.lookup_clients` + `ClientLookupSerializer`. Non-archived only; ranked by match priority; capped at 50.

### Document-prefill packet (Phase 4, concept §15)

**Purpose:** A read-time snapshot of a client's reusable identity/contact fields for document forms. **Historical-safety contract (mandatory):** the consuming document module MUST copy these values into the document at generation/print time and store them (optionally alongside `source_client_id` for traceability); document rendering must NOT depend on the live client record, so a later client edit never mutates an already-issued document. The `clients` app owns the packet and this contract; the snapshot itself lives in the consumer (there is no document module in this standalone app yet).
**Shape:**

```json
{
  "source_client_id": "uuid",
  "client_code": "CL-2026-000123",
  "generated_at": "2026-07-20T12:00:00+05:45",
  "institution_name": "Tribeni Educational Consultancy Pvt. Ltd.",
  "institution_display_name": "Tribeni",
  "client_type": "educational_institution",
  "relationship_type": "partner",
  "primary_email": "info@tribeni.edu.np",
  "primary_phone": "+977-1-4444444",
  "alternate_phone": "",
  "website": "https://www.tribeni.edu.np/about",
  "registration_number": "REG-123",
  "tax_number": "PAN-456",
  "country_code": "NP",
  "primary_address": { "…ClientAddress projection…": "…" },
  "primary_contact": { "id": "…", "full_name": "…", "designation": "…" },
  "spokesperson": {
    "id": "…",
    "full_name": "…",
    "designation": "Branch Manager"
  },
  "logo_url": "/api/v1/clients/<id>/logo/",
  "logo_thumbnail_url": "/api/v1/clients/<id>/logo/thumbnail/"
}
```

**Produced by:** `ClientDocumentPrefillSerializer` (`clients.selectors.get_client_for_prefill`). Excludes `internal_notes`. Non-archived clients only.

### CSV export / import (Phase 5, concept §14.14)

**Export:** `GET /clients/export/` streams `text/csv`. Columns: `client_code, legal_name, display_name, client_type, relationship_type, status, primary_email, primary_phone, alternate_phone, website, registration_number, tax_number, country_code, created_at, updated_at` — privileged actors additionally get `internal_notes`. Honors the same filters as the list; non-archived unless a privileged actor requests archived. **Produced by:** `clients.services.io.export_clients_csv`.

**Import:** `POST /clients/import/` (multipart `file`, admin+). Recognized headers → create fields: `legal_name` (required), `client_type` (required), `display_name, relationship_type, website, primary_email, primary_phone, alternate_phone, registration_number, tax_number, country_code, description`; `source` is forced to `import`. Each row is validated through the admin write serializer and created via `create_client` — identical per-row validation/normalization/audit as a single create (§14.14). Max 1000 rows. **Result shape:** `{ "created": <int>, "failed": <int>, "created_ids": [uuid…], "errors": [{ "row": <int>, "errors": {…} }] }`. **Produced by:** `clients.services.io.import_clients_csv`.

---

## Search Indexes (Phase 3)

Trigram (`pg_trgm`) GIN indexes accelerate `__icontains` smart search on PostgreSQL (migration `0004`, Postgres-only; a no-op on the sqlite test backend). Covered columns: `clients_client`(`legal_name`, `legal_name_romanized`, `display_name`, `display_name_romanized`, `normalized_email`, `website_domain`, `normalized_registration_number`, `normalized_tax_number`), `clients_clientalias`(`normalized_alias`), `clients_clientcontactperson`(`full_name`, `full_name_romanized`), `clients_clientaddress`(`locality`), `clients_clienttag`(`name`). These are declared only in the migration (not model `Meta`) so `makemigrations --check` stays clean on sqlite.

---

## Cross-App Dependencies

- **References:** `authenticate.User` via FK (actor stamps, lock/archive actors) — the only external model reference. No import of another business app's models, services, or selectors.
- **Referenced by:** none. All endpoints/resources register with `core.policy_engine` (metadata only, not a data dependency).

---

## Soft Delete

`Client` uses timestamp soft-delete via `archived_at`/`archived_by` (see §1). `ClientContactPerson` and `ClientAddress` use `is_active=False` deactivation (see §4, §5) so historical references survive. `ClientLogo` uses `is_current=False` + `archived_at` retirement (see §9), retaining the file. `ClientAlias` and `ClientTagAssignment` are hard-deleted on removal (audited). A merged duplicate `Client` is retained and archived (never deleted), pointing at its survivor via `merged_into` (§10). `ClientAuditEvent`, `ClientMergeRecord`, `ClientCodeCounter`, and `ClientTag` (catalog) do not use soft delete.
