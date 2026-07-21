# `Client` — the external-organization directory record and aggregate root

**Endpoint base:** `/api/v1/clients/` (collection also serves `GET .../lookup/`,
`POST .../duplicate-check/`, `GET .../export/` and `POST .../import/`; per-record
reads add `GET .../{id}/document-prefill/`, `GET .../{id}/audit-events/`,
`POST .../{id}/merge/` and `GET .../{id}/merge-history/` — see §3).
**Access:** staff and admin/superadmin. **Role-projected** — staff receive a
strict subset of fields (protected fields are absent, not null). List / read /
create / update / archive / restore / **document-prefill** / **CSV export** are
staff-allowed; **lock / unlock, the audit trail (`.../audit-events/`), merge +
merge-history, and CSV import are admin/superadmin only** (staff → 403). An unknown
_or malformed_ id → non-disclosing `404`.
**Owns:** the authoritative external-organization record. Directory `status`
(lifecycle state) changes through a `PATCH` transition map; `archived` is a
soft-delete state reached only via the archive/restore actions — never a raw
status write. **Embeds its Phase-2 children read-only** — every read carries the
active `primary_contact` / `spokesperson`, and the detail read adds the full
`contacts`, `addresses`, `aliases`, and `tags` collections. Those children are
**never written through the client body** — each has its own nested endpoint
(`contact.md`, `address.md`, `alias.md`, `tag.md`).

## 1. Fields (rows)

`Server-set` fields are generated/computed — never send them. Fields marked
**admin-only** are absent from the staff projection entirely. Optional text/enum
fields marked `Nullable=No` come back as `""` when unset (see `overview.md`
"Empty vs null").

| Field                        | TS type               | In req    | In res     | Req | Nullable | Server-set | Enum                | Validation                          | Notes                                                                                   |
| ---------------------------- | --------------------- | --------- | ---------- | --- | -------- | ---------- | ------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| `id`                         | `string`              | ✗         | ✓          | —   | No       | ✓          | —                   | UUID                                | Primary key                                                                             |
| `client_code`                | `string`              | ✗         | ✓          | —   | No       | ✓          | —                   | `^CL-\d{4}-\d{6}$`, ≤20, immutable  | Globally unique; e.g. `CL-2026-000123`                                                  |
| `legal_name`                 | `string`              | ✓         | ✓          | ✓   | No       | ✗          | —                   | required, ≤255; NFC-normalized      | Registered/formal name                                                                  |
| `display_name`               | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | ≤255                                | `""` when unset                                                                         |
| `client_type`                | `ClientType`          | ✓         | ✓          | ✓   | No       | ✗          | `client_type`       | required                            |                                                                                         |
| `relationship_type`          | `RelationshipType`    | ✓         | ✓          | ✗   | No       | ✗          | `relationship_type` | —                                   | `""` when unset                                                                         |
| `status`                     | `ClientStatus`        | ✓         | ✓          | ✗   | No       | ✗          | `status`            | transition-map on PATCH             | Default `prospective`                                                                   |
| `source`                     | `Source`              | ✓         | ✓          | ✗   | No       | ✗          | `source`            | —                                   | Default `manual`                                                                        |
| `website`                    | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | URL                                 | `""` when unset                                                                         |
| `website_domain`             | `string`              | ✗         | ✓          | —   | No       | ✓          | —                   | ≤255                                | Derived hostname (search/dedupe)                                                        |
| `primary_email`              | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | email, ≤254; lowercased             | `""` when unset                                                                         |
| `primary_phone`              | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | ≤32                                 | `""` when unset                                                                         |
| `alternate_phone`            | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | ≤32                                 | `""` when unset                                                                         |
| `registration_number`        | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | ≤255                                | Display form; leading zeros preserved                                                   |
| `tax_number`                 | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | ≤255                                | VAT/PAN display form                                                                    |
| `country_code`               | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | 2 ASCII letters (ISO 3166-1); upper | `""` when unset                                                                         |
| `established_date`           | `string \| null`      | ✓         | ✓          | ✗   | Yes      | ✗          | —                   | date                                | carries `established_date_bs` (admin)                                                   |
| `description`                | `string`              | ✓         | ✓          | ✗   | No       | ✗          | —                   | text                                | `""` when unset                                                                         |
| `relationship_started_on`    | `string \| null`      | ✓         | ✓          | ✗   | Yes      | ✗          | —                   | date                                | carries `_bs` (admin)                                                                   |
| `relationship_ended_on`      | `string \| null`      | ✓         | ✓          | ✗   | Yes      | ✗          | —                   | date, ≥ `relationship_started_on`   | carries `_bs` (admin)                                                                   |
| `is_locked`                  | `boolean`             | ✗         | ✓          | —   | No       | ✓          | —                   | lock-service only                   | Default `false`                                                                         |
| `record_version`             | `number`              | ✓¹        | ✓          | —   | No       | ✓          | —                   | integer ≥ 1                         | ¹ required in PATCH/archive/restore body                                                |
| `created_at`                 | `string`              | ✗         | ✓          | —   | No       | ✓          | —                   | ISO 8601                            |                                                                                         |
| `updated_at`                 | `string`              | ✗         | ✓          | —   | No       | ✓          | —                   | ISO 8601                            |                                                                                         |
| **embedded children ↓**      |                       |           |            |     |          |            |                     |                                     | read-only; both projections; write via nested endpoints                                 |
| `primary_contact`            | `ContactMini \| null` | ✗         | ✓          | —   | Yes      | ✓          | —                   | —                                   | active primary contact, compact; also on list rows                                      |
| `spokesperson`               | `ContactMini \| null` | ✗         | ✓          | —   | Yes      | ✓          | —                   | —                                   | active spokesperson, compact; also on list rows                                         |
| `contacts`                   | `ContactMini[]`       | ✗         | ✓ (detail) | —   | No       | ✓          | —                   | —                                   | active contacts (compact); detail only                                                  |
| `addresses`                  | `Address[]`           | ✗         | ✓ (detail) | —   | No       | ✓          | —                   | —                                   | active addresses (full); detail only                                                    |
| `aliases`                    | `Alias[]`             | ✗         | ✓ (detail) | —   | No       | ✓          | —                   | —                                   | all aliases; detail only                                                                |
| `tags`                       | `TagAssignment[]`     | ✗         | ✓ (detail) | —   | No       | ✓          | —                   | —                                   | tag assignments (tag nested); detail only                                               |
| `logo_url`                   | `string \| null`      | ✗         | ✓          | —   | Yes      | ✓          | —                   | —                                   | authenticated stream URL for the current logo, or `null`; list + detail (see `logo.md`) |
| `logo_thumbnail_url`         | `string \| null`      | ✗         | ✓          | —   | Yes      | ✓          | —                   | —                                   | authenticated stream URL for the logo thumbnail, or `null`; list + detail               |
| **admin-only ↓**             |                       |           |            |     |          |            |                     |                                     | absent from staff projection                                                            |
| `legal_name_romanized`       | `string`              | ✗         | ✓ (admin)  | —   | No       | ✓          | —                   | ≤255; never user-entered            | ASCII search projection                                                                 |
| `display_name_romanized`     | `string`              | ✗         | ✓ (admin)  | —   | No       | ✓          | —                   | ≤255; never user-entered            | ASCII search projection                                                                 |
| `internal_notes`             | `string`              | ✓ (admin) | ✓ (admin)  | ✗   | No       | ✗          | —                   | text                                | protected; `""` when unset                                                              |
| `established_date_bs`        | `BsDate \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | —                                   | BS sibling of `established_date`                                                        |
| `relationship_started_on_bs` | `BsDate \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | —                                   | BS sibling                                                                              |
| `relationship_ended_on_bs`   | `BsDate \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | —                                   | BS sibling                                                                              |
| `locked_at`                  | `string \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | ISO 8601                            | Lock timestamp                                                                          |
| `lock_reason`                | `string`              | ✗         | ✓ (admin)  | —   | No       | ✓          | —                   | —                                   | `""` when not locked                                                                    |
| `archived_at`                | `string \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | ISO 8601                            | Soft-delete stamp                                                                       |
| `merged_into`                | `string \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | UUID                                | Survivor this duplicate was folded into (`null` unless merged); Phase 5                 |
| `merged_at`                  | `string \| null`      | ✗         | ✓ (admin)  | —   | Yes      | ✓          | —                   | ISO 8601                            | Merge timestamp (`null` unless merged)                                                  |

**Staff list projection** is narrower — rows expose only: `id`, `client_code`,
`legal_name`, `display_name`, `client_type`, `relationship_type`, `status`,
`primary_email`, `primary_phone`, `country_code`, `is_locked`, `primary_contact`,
`spokesperson`, `logo_url`, `logo_thumbnail_url`, `created_at`, `updated_at`.
**Admin list** adds `website_domain` and `archived_at`. List rows embed only the
two compact contact projections (`primary_contact` / `spokesperson`) plus the two
logo stream URLs; the full `contacts` / `addresses` / `aliases` / `tags`
collections are **detail-only**.

## 2. Types

```ts
// Embedded Phase-2 children — read-only projections composed server-side.
// Written only through their own nested endpoints, never the client body.
import type { ContactMini } from "./contact";
import type { Address } from "./address";
import type { Alias } from "./alias";
import type { TagAssignment } from "./tag";

type ClientType =
  | "company"
  | "educational_institution"
  | "bank"
  | "cooperative"
  | "government_office"
  | "ngo_ingo"
  | "embassy_or_diplomatic_mission"
  | "vendor"
  | "training_provider"
  | "other"; // see enums.md
type RelationshipType =
  | "customer"
  | "partner"
  | "vendor"
  | "service_provider"
  | "referral_partner"
  | "financial_institution"
  | "document_issuer"
  | "regulatory_body"
  | "other"; // see enums.md
type ClientStatus =
  | "prospective"
  | "active"
  | "inactive"
  | "former"
  | "archived"; // see enums.md
type Source = "manual" | "import" | "migration" | "integration" | "other"; // see enums.md

// Bikram Sambat sibling for admin-projection date fields (see overview.md)
interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

// Response — staff detail projection.
// Optional text/enum fields are Nullable=No → unset serializes as "" (never null);
// only genuinely DB-nullable date/timestamp fields are `| null`.
interface ClientStaff {
  id: string;
  client_code: string;
  legal_name: string;
  display_name: string;
  client_type: ClientType;
  relationship_type: RelationshipType | ""; // "" when unset
  status: ClientStatus;
  source: Source;
  website: string;
  website_domain: string;
  primary_email: string;
  primary_phone: string;
  alternate_phone: string;
  registration_number: string;
  tax_number: string;
  country_code: string;
  established_date: string | null; // Nullable=Yes
  description: string;
  relationship_started_on: string | null; // Nullable=Yes
  relationship_ended_on: string | null; // Nullable=Yes
  is_locked: boolean;
  record_version: number;
  // Embedded children — read-only (detail projection carries the full collections)
  primary_contact: ContactMini | null;
  spokesperson: ContactMini | null;
  contacts: ContactMini[];
  addresses: Address[];
  aliases: Alias[];
  tags: TagAssignment[];
  logo_url: string | null; // authenticated stream URL, or null
  logo_thumbnail_url: string | null; // authenticated stream URL, or null
  created_at: string;
  updated_at: string;
}

// Response — admin detail projection adds protected fields, romanized
// projections, the *_bs date siblings, and lock/archive metadata.
interface ClientAdmin extends ClientStaff {
  legal_name_romanized: string;
  display_name_romanized: string;
  internal_notes: string; // "" when unset
  established_date_bs: BsDate | null;
  relationship_started_on_bs: BsDate | null;
  relationship_ended_on_bs: BsDate | null;
  locked_at: string | null; // Nullable=Yes
  lock_reason: string; // "" when not locked
  archived_at: string | null; // Nullable=Yes
  merged_into: string | null; // Nullable=Yes — survivor UUID, or null (Phase 5)
  merged_at: string | null; // Nullable=Yes
}

// Staff list row — narrower than ClientStaff
interface ClientListRowStaff {
  id: string;
  client_code: string;
  legal_name: string;
  display_name: string;
  client_type: ClientType;
  relationship_type: RelationshipType | ""; // "" when unset
  status: ClientStatus;
  primary_email: string;
  primary_phone: string;
  country_code: string;
  is_locked: boolean;
  primary_contact: ContactMini | null; // active primary contact, compact
  spokesperson: ContactMini | null; // active spokesperson, compact
  logo_url: string | null; // authenticated stream URL, or null
  logo_thumbnail_url: string | null; // authenticated stream URL, or null
  created_at: string;
  updated_at: string;
}

// Admin list row — staff row + website_domain + archived_at
interface ClientListRowAdmin extends ClientListRowStaff {
  website_domain: string;
  archived_at: string | null; // Nullable=Yes
}

// Create payload — staff (server-set fields omitted)
interface ClientCreateStaff {
  legal_name: string;
  client_type: ClientType;
  display_name?: string;
  relationship_type?: RelationshipType;
  status?: ClientStatus;
  source?: Source;
  website?: string;
  primary_email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  registration_number?: string;
  tax_number?: string;
  country_code?: string;
  established_date?: string;
  description?: string;
  relationship_started_on?: string;
  relationship_ended_on?: string;
  // Advisory: send to proceed despite a duplicate warning (audited). Not a
  // stored field — it rides on the create/update request only.
  override_reason?: string;
}

// Create payload — admin adds the protected internal_notes field
interface ClientCreateAdmin extends ClientCreateStaff {
  internal_notes?: string;
}

// Update = partial create + the required record_version, plus an optional
// top-level reason (used when the patch changes status) and an optional
// override_reason (already part of ClientCreateStaff, kept explicit here).
type ClientUpdate = Partial<ClientCreateAdmin> & {
  record_version: number;
  reason?: string;
  override_reason?: string;
};

// Action inputs
interface ClientArchiveInput {
  record_version: number;
  reason?: string;
}
interface ClientRestoreInput {
  record_version: number;
  status?: ClientStatus; // target non-archived status; default "active"
  reason?: string;
}
interface ClientLockInput {
  reason: string; // required, non-blank — also used for unlock
}

// Duplicate-warning match row — privacy-safe (masked name + boolean signal
// flags). Appears in the create/update response `meta.duplicate_matches` and in
// the duplicate-check response `data.matches`.
interface DuplicateMatch {
  client_code: string;
  display_name: string; // masked to first-initials, e.g. "T***** E**********"
  registration_match: boolean;
  tax_match: boolean;
  domain_match: boolean;
  email_match: boolean;
  phone_match: boolean;
  name_match: boolean;
}

// Duplicate-warning meta carried on a create/update success response
// (absent — `{}` — when nothing matched).
interface ClientDuplicateMeta {
  possible_duplicate?: boolean;
  duplicate_matches?: DuplicateMatch[];
}

// Preflight duplicate-check request — any subset (POST /clients/duplicate-check/).
interface DuplicateCheckInput {
  legal_name?: string;
  primary_email?: string;
  primary_phone?: string;
  website?: string;
  registration_number?: string;
  tax_number?: string;
  exclude_id?: string; // exclude this client id (e.g. when checking during an update)
}

// Reduced ranked projection for dropdowns / document-prefill (GET /clients/lookup/).
interface ClientLookupRow {
  id: string;
  client_code: string;
  legal_name: string;
  display_name: string;
  client_type: ClientType;
  primary_email: string;
  primary_phone: string;
  website: string;
  primary_contact: ContactMini | null;
  spokesperson: ContactMini | null;
  logo_thumbnail_url: string | null;
}

// Document-prefill packet (Phase 4) — a read-time SNAPSHOT of a client's reusable
// fields for seeding a document form (GET /clients/{id}/document-prefill/, staff+).
// Excludes internal_notes and all lock/version/audit internals. The consumer MUST
// copy these values at generation time (see §4, §7 — historical-safety contract).
interface DocumentPrefillPacket {
  source_client_id: string;
  client_code: string;
  generated_at: string; // ISO 8601 — read time
  institution_name: string; // = legal_name
  institution_display_name: string; // = display_name ("" when unset)
  client_type: ClientType;
  relationship_type: RelationshipType | ""; // "" when unset
  primary_email: string; // "" when unset
  primary_phone: string; // "" when unset
  alternate_phone: string; // "" when unset
  website: string; // "" when unset
  registration_number: string; // "" when unset
  tax_number: string; // "" when unset
  country_code: string; // "" when unset
  primary_address: Address | null; // active primary (or first active), else null
  primary_contact: ContactMini | null;
  spokesperson: ContactMini | null;
  logo_url: string | null; // authenticated stream URL, or null
  logo_thumbnail_url: string | null; // authenticated stream URL, or null
}

// Audit-trail row (Phase 4) — one immutable event on a client
// (GET /clients/{id}/audit-events/, admin/superadmin only; paginated, newest first).
type AuditEventType = // see enums.md → Audit
  | "client_created"
  | "client_updated"
  | "client_status_changed"
  | "client_archived"
  | "client_restored"
  | "client_locked"
  | "client_unlocked"
  | "client_contact_created"
  | "client_contact_updated"
  | "client_contact_deactivated"
  | "client_primary_contact_changed"
  | "client_spokesperson_changed"
  | "client_address_created"
  | "client_address_updated"
  | "client_address_deactivated"
  | "client_primary_address_changed"
  | "client_alias_added"
  | "client_alias_removed"
  | "client_tag_added"
  | "client_tag_removed"
  | "client_logo_uploaded"
  | "client_logo_removed"
  | "client_duplicate_flagged";

interface AuditEvent {
  id: string;
  event_type: AuditEventType;
  actor: string | null; // acting user UUID, or null (system)
  reason: string; // "" when none recorded
  changed_fields: string[]; // field names only, never values
  metadata: Record<string, unknown>; // sanitized context (e.g. { from, to })
  request_id: string; // correlation id ("" when none)
  created_at: string; // ISO 8601
}

// Merge input (Phase 5) — fold `duplicate_id` into the survivor at the path {id}
// (POST /clients/{id}/merge/, admin/superadmin only).
interface MergeInput {
  duplicate_id: string; // the duplicate to fold in (must differ from {id})
  reason: string; // required, non-blank — audited
  // Optional per-field resolution: take that scalar field's value from the
  // duplicate. Only merge-resolvable fields apply (see §4); the map value is
  // always the literal "duplicate".
  field_resolutions?: Record<string, "duplicate">;
}

// Merge record (Phase 5) — one immutable duplicate→survivor merge
// (rows of GET /clients/{id}/merge-history/, admin/superadmin only; paginated).
interface MergeRecord {
  id: string;
  source_client: string; // the folded duplicate (UUID)
  surviving_client: string; // the survivor (UUID)
  field_resolutions: Record<string, "duplicate">; // resolutions applied ({} when none)
  transferred_counts: Record<string, number>; // per-relation counts moved (e.g. { contacts, addresses, aliases, tag_assignments, logos })
  reason: string;
  performed_by: string | null; // acting user UUID, or null (system)
  request_id: string; // correlation id ("" when none)
  created_at: string; // ISO 8601
}

// CSV import result (Phase 5) — the summary body of POST /clients/import/
// (admin/superadmin only; multipart).
interface ImportRowError {
  row: number; // 1-based data row index
  errors: Record<string, unknown>; // per-field serializer errors for that row
}
interface ImportResult {
  created: number;
  failed: number;
  created_ids: string[]; // UUIDs of the created clients
  errors: ImportRowError[]; // one entry per failed row (never fatal)
}
```

## 3. Endpoints

### `GET /api/v1/clients/`

- **Purpose:** list / search clients for the directory table.
- **Request:** query params only.
- **Returns:** `list[ClientListRowStaff]` (staff) or `list[ClientListRowAdmin]`
  (admin). Each row embeds the compact `primary_contact` / `spokesperson` plus the
  `logo_url` / `logo_thumbnail_url` stream URLs (or `null`).
- **Query params (list):** `search`, `status`, `client_type`,
  `relationship_type`, `country` (alias `country_code`), `tag` (normalized tag
  name), `has_spokesperson` (bool), `has_logo` (bool), `is_locked`, `ordering`,
  `page`, `page_size`.
  Privileged actors additionally get `include_archived`,
  `created_from`/`created_to`, `updated_from`/`updated_to`. `ordering` ∈
  `{legal_name, display_name, client_code, created_at, updated_at,
relationship_started_on}`, prefix `-` for desc. Archived rows are excluded
  unless a privileged actor passes `include_archived=true`. `search` now also
  matches aliases, active contact names, active address localities, and tag names
  (`.distinct()`).
- **Ranked search:** when `search` is present **and no explicit `ordering` is
  given**, rows come back **ranked by match priority** (exact code → exact
  registration/tax → exact name → exact alias → exact email/phone/domain → name
  prefix → contact-name → fuzzy). Passing an explicit `ordering` overrides the
  ranking. Trigram GIN indexes accelerate the match on PostgreSQL (no shape
  change).
- **Side effects:** none.
- **Policy key:** `clients.client.list`

### `POST /api/v1/clients/`

- **Request:** `ClientCreateStaff` (staff) or `ClientCreateAdmin` (admin). Fields
  outside the actor's whitelist are rejected — they are simply not declared in the
  write serializer. May also carry an optional top-level `override_reason`
  (recorded if the create trips a duplicate warning).
- **Returns:** the created `Client` (role projection), `201`. On a duplicate
  collision the response `meta` carries `ClientDuplicateMeta`
  (`possible_duplicate` + `duplicate_matches`) — **non-blocking**, the record is
  already created (see §6, §7).
- **Side effects:** generates `client_code` from a per-year locked counter;
  `record_version=1`; normalizes text and derives `*_romanized` / `normalized_*` /
  `website_domain`; appends a `client_created` audit event; appends a
  `client_duplicate_flagged` audit event when matches fire (with `override_reason`
  if supplied).
- **Policy key:** `clients.client.create`

### `GET /api/v1/clients/{id}/`

- **Returns:** `ClientStaff` or `ClientAdmin` by role — the detail projection
  embeds `primary_contact`, `spokesperson`, the full `contacts`, `addresses`,
  `aliases`, `tags` collections (active children; prefetched, no N+1), and the
  `logo_url` / `logo_thumbnail_url` stream URLs (or `null`).
- **Side effects:** none.
- **Policy key:** `clients.client.read`

### `PATCH /api/v1/clients/{id}/`

- **Request:** `ClientUpdate` — any subset of the editable create fields **+ the
  mandatory `record_version`**, plus an optional top-level `reason` (used when the
  patch changes `status`) and an optional `override_reason` (recorded if the update
  trips a duplicate warning). `client_code`, lock/archive/version/audit fields, and
  the search projections are never writable here; staff cannot send
  `internal_notes`.
- **Returns:** the updated `Client` (role projection); the response `meta` carries
  `ClientDuplicateMeta` when the updated values collide with another client
  (non-blocking, same as create).
- **Side effects:** guard order archived → lock (staff) → field whitelist →
  version → date order → status transition. Always bumps `record_version` and
  appends `client_updated`; a status change also appends `client_status_changed`
  (with `from`/`to` metadata); a duplicate collision appends
  `client_duplicate_flagged`.
- **Policy key:** `clients.client.update`

### `POST /api/v1/clients/{id}/archive/`

- **Purpose:** soft-delete the record. Staff-allowed.
- **Request:** `ClientArchiveInput` — `record_version` (required), optional
  `reason`.
- **Returns:** the archived `Client` (`status` → `archived`, `archived_at` set).
- **Side effects:** never a physical delete; appends `client_archived`.
- **Policy key:** `clients.client.archive`

### `POST /api/v1/clients/{id}/restore/`

- **Purpose:** bring an archived record back. Staff-allowed.
- **Request:** `ClientRestoreInput` — `record_version` (required), optional
  `status` (target non-archived status, default `active`), optional `reason`.
- **Returns:** the restored `Client`.
- **Side effects:** clears `archived_at` / `archived_by`, sets the chosen status;
  appends `client_restored`.
- **Policy key:** `clients.client.restore`

### `POST /api/v1/clients/{id}/lock/` · `.../unlock/`

- **Purpose:** freeze / release the record against staff edits. **Admin/superadmin
  only.**
- **Request:** `ClientLockInput` — `{ reason }` (required, non-blank, both
  directions). **No `record_version`.**
- **Returns:** the locked / unlocked `ClientAdmin`.
- **Side effects:** lock sets flag/actor/timestamp/reason and appends
  `client_locked`; unlock clears the lock fields and appends `client_unlocked`.
  While locked, a staff `PATCH` is rejected with `423`.
- **Policy keys:** `clients.client.lock` / `clients.client.unlock`

### `GET /api/v1/clients/lookup/`

- **Purpose:** a lightweight, ranked lookup for dropdowns and document-prefill
  forms — **not** the full directory table.
- **Request:** optional `search` query param only. **Not paginated**; the result
  is **capped at 50** rows. Archived clients are excluded.
- **Returns:** `list[ClientLookupRow]` — a reduced projection (identity + contact
  essentials + embedded `primary_contact` / `spokesperson` + `logo_thumbnail_url`;
  no `internal_notes`, lock, version, or audit fields). Ranked by the same match
  priority as the list search.
- **Side effects:** none.
- **Policy key:** `clients.client.lookup`

### `POST /api/v1/clients/duplicate-check/`

- **Purpose:** a **preflight** duplicate analysis so the UI can warn **before**
  submitting a create/update. Never creates or mutates anything.
- **Request:** `DuplicateCheckInput` — any subset of `legal_name`,
  `primary_email`, `primary_phone`, `website`, `registration_number`,
  `tax_number`, `exclude_id` (exclude the client being edited on an update check).
- **Returns:** `{ matches: DuplicateMatch[] }` under `data` — the same
  privacy-safe (masked) match rows carried in create/update `meta`. Empty array
  when nothing matches. Advisory only.
- **Side effects:** none.
- **Policy key:** `clients.client.duplicate_check`

### `GET /api/v1/clients/{id}/document-prefill/`

- **Purpose:** fetch a **read-time snapshot packet** of a client's reusable
  identity / contact / spokesperson / logo fields to seed a document form. **Staff+.**
- **Request:** none (path id only). Not paginated.
- **Returns:** `DocumentPrefillPacket` — a flat projection carrying `generated_at`
  (the read time), the client identity fields (`institution_name` = `legal_name`,
  `institution_display_name` = `display_name`), contact essentials, the active
  `primary_address` / `primary_contact` / `spokesperson`, and the `logo_url` /
  `logo_thumbnail_url` stream URLs. **Excludes** `internal_notes` and all
  lock/version/audit internals. Only a **non-archived** client is prefillable — an
  archived or unknown id → `404 CLIENT_NOT_FOUND`.
- **Side effects:** none (pure read; no audit event).
- **Policy key:** `clients.client.document_prefill`

### `GET /api/v1/clients/{id}/audit-events/`

- **Purpose:** the immutable audit trail for one client — the "history / activity"
  view. **Admin/superadmin only** (staff → `403`).
- **Request:** query params only — `page`, `page_size` (**max 100**).
- **Returns:** `list[AuditEvent]` — **paginated** (standard `meta`
  `{ count, page, page_size, next, previous }`), **newest first**. Rows are
  read-only and immutable; `event_type` is the `Audit` enum in `enums.md`.
- **Side effects:** none.
- **Policy key:** `clients.audit_event.list`

### `POST /api/v1/clients/{id}/merge/`

- **Purpose:** fold a duplicate client into a survivor. **Admin/superadmin only**
  (staff → `403`). `{id}` in the path is the **survivor**.
- **Request:** `MergeInput` — `duplicate_id` (required), `reason` (required,
  non-blank), optional `field_resolutions` (`{field: "duplicate"}` — take that
  scalar field from the duplicate; only merge-resolvable fields, see §4). **No
  `record_version`.**
- **Returns:** the surviving `ClientAdmin` (200). The response `meta` carries
  `{ merge_record_id, transferred }` — `transferred` is the per-relation move
  counts (`Record<string, number>`).
- **Side effects:** one transaction — children (contacts, addresses, aliases, tag
  assignments, logos) transfer to the survivor with the survivor's "one active
  primary/current" designations winning; the **duplicate is retained** (never
  deleted) and archived (`status=archived`, `merged_into`/`merged_at`/`merged_by`
  set) pointing at the survivor; an immutable `ClientMergeRecord` is written; a
  `client_merged` audit event is appended.
- **Policy key:** `clients.client.merge`

### `GET /api/v1/clients/{id}/merge-history/`

- **Purpose:** the merge trail for one client — merges where it is the survivor or
  the folded duplicate. **Admin/superadmin only** (staff → `403`).
- **Request:** query params only — `page`, `page_size` (**max 100**).
- **Returns:** `list[MergeRecord]` — **paginated** (standard `meta`
  `{ count, page, page_size, next, previous }`), newest first. Rows are immutable.
- **Side effects:** none.
- **Policy key:** `clients.merge_record.list`

### `GET /api/v1/clients/export/`

- **Purpose:** a streamed CSV download of the filtered directory — **not** a JSON
  list. **Staff+.**
- **Request:** the **same query params as the list** (`GET /api/v1/clients/`) —
  `search`, `status`, `client_type`, filters, `ordering`; privileged actors add
  `include_archived` and the date filters. **Not paginated** (streams all matched
  rows).
- **Returns:** `text/csv` with `Content-Disposition: attachment` — **not** the JSON
  envelope. One header row + one row per client. The column set is
  **role-projected**: staff exports **omit** `internal_notes`; privileged actors
  get it (and may include archived rows). See §4 for the column list.
- **Side effects:** none to client data (a `client_exported` audit context may be
  recorded server-side). **Throttle-flagged** (see `overview.md`).
- **Policy key:** `clients.client.export`

### `POST /api/v1/clients/import/`

- **Purpose:** bulk-create clients from a CSV file. **Admin/superadmin only**
  (staff → `403`).
- **Request:** `multipart/form-data` with a single `file` part (a CSV). **Max 1000
  data rows.** Recognized headers map to create fields (`legal_name` + `client_type`
  required; see §4); `source` is forced to `import`.
- **Returns:** `ImportResult` — `{ created, failed, created_ids, errors }`. Each row
  runs through the **same** admin write serializer + create path as a single create
  (identical validation, normalization, duplicate detection, and `client_created`
  audit). Per-row failures land in `errors` (never fatal); a `client_imported`
  summary audit event is recorded.
- **Side effects:** creates 0..N clients; appends `client_created` per created row
  - one `client_imported` summary event.
- **Policy key:** `clients.client.import`

## 4. Validations & business rules

- `client_type` and `legal_name` are **required** on create; `legal_name` is
  non-blank, whitespace-collapsed, and NFC-normalized.
- `relationship_ended_on` cannot precede `relationship_started_on`
  (`CLIENT_DATE_ORDER_INVALID`).
- **Status is a transition map, not free-set:** `prospective → active`;
  `active → {inactive, former}`; `inactive → {active, former}`;
  `former → active`. An illegal move → `CLIENT_STATUS_TRANSITION_INVALID` (422).
- **Reason required** when entering `former` **or** reactivating a `former` client
  (`former → active`) — omitting it → `CLIENT_STATUS_REASON_REQUIRED` (400). Send
  the top-level `reason` on the `PATCH`.
- `archived` is **not** a PATCH target — enter it via `archive/`, leave it via
  `restore/`. Restore may only target `prospective` / `active` / `inactive` /
  `former` (default `active`); anything else → `CLIENT_RESTORE_STATUS_INVALID`.
- Every `PATCH` / `archive` / `restore` requires the last-read `record_version`.
- Staff writes are checked **lock first (423), then version (409)** — a locked
  record surfaces the specific lock error, not a generic conflict.
- `internal_notes` is settable/readable by admin/superadmin only; a staff actor
  submitting it → `CLIENT_FIELD_FORBIDDEN` (403).
- Lock and unlock require a non-blank `reason` and are admin/superadmin only.
- **Duplicate detection is advisory, never blocking.** A colliding create/update
  still succeeds; matches ride in `meta.duplicate_matches` (masked). To proceed
  deliberately, resend with an `override_reason` (recorded on the
  `client_duplicate_flagged` audit event). Detection reads only non-archived
  clients and returns **no error code** — it is a warning, not a rejection.
- **Document prefill is a live snapshot with a historical-safety obligation on the
  consumer.** `GET .../document-prefill/` returns the client's **current** values.
  The consumer (a document module) **must copy these values into the document at
  generation/print time and store them** — document rendering must **never** depend
  on the live client record, so a later client edit can never mutate an
  already-issued document. `clients` owns the contract and serves live values; it
  stores no document itself (there is no document module in this standalone app).
  Prefill is available for **non-archived** clients only (archived / unknown →
  `404 CLIENT_NOT_FOUND`) and never exposes `internal_notes`.
- **Audit trail is admin-only and paginated.** `GET .../audit-events/` is
  restricted to admin/superadmin (staff → `403`), returns immutable events newest
  first, and is paginated with the standard `meta`. Rows cannot be created,
  edited, or deleted through the API.
- **Merge is a destructive, admin-only, single-transaction dedup.**
  `POST .../{id}/merge/` folds `duplicate_id` into the survivor at `{id}`. It
  **rejects self-merge** (`CLIENT_MERGE_SELF`), a **missing/blank reason**
  (`CLIENT_MERGE_REASON_REQUIRED`), an **unknown duplicate or survivor**
  (`CLIENT_MERGE_TARGET_NOT_FOUND`), a client **already merged**
  (`CLIENT_MERGE_ALREADY_MERGED`), and an **archived survivor**
  (`CLIENT_MERGE_ARCHIVED`). The survivor's own values and its "one active
  primary/current" designations **win** by default; only fields named in
  `field_resolutions` (value `"duplicate"`) are taken from the duplicate, and only
  the **merge-resolvable scalar set** is eligible — `client_code`, lock, version,
  `status`, and audit fields are **never** resolvable. The duplicate is
  **retained** (never deleted) and archived pointing at the survivor via
  `merged_into`; children transfer, and alias/tag rows already on the survivor are
  dropped rather than duplicated.
- **Export is role- and filter-projected.** `GET .../export/` reuses the list
  filters (archived excluded unless a privileged actor asks) and emits the
  role-projected columns. **Staff exports never include `internal_notes`**; only
  privileged actors get that column. Column order (staff): `client_code`,
  `legal_name`, `display_name`, `client_type`, `relationship_type`, `status`,
  `primary_email`, `primary_phone`, `alternate_phone`, `website`,
  `registration_number`, `tax_number`, `country_code`, `created_at`, `updated_at`
  — privileged actors get a trailing `internal_notes` column.
- **Import reuses the create rules row-by-row, bounded to 1000 rows.**
  `POST .../import/` validates each row through the admin write serializer and
  `create_client`, so **every create rule above applies per row** (required
  `legal_name` + `client_type`, date order, normalization, duplicate detection).
  `source` is forced to `import`. A missing/non-CSV file → `CLIENT_IMPORT_INVALID`;
  more than 1000 data rows → `CLIENT_IMPORT_TOO_LARGE`. Per-row validation failures
  are collected in the result's `errors` array (with the 1-based `row` and the
  field errors) — they do **not** abort the whole import.

## 5. Errors

**Phase 5 adds the merge + import error codes** (last seven rows). `document-prefill`,
`audit-events`, `export`, and `merge-history` add no error codes — they return only
success envelopes (plus the standard auth `401/403`; the admin-only surfaces give a
staff token `403`). A prefill request for an archived or unknown client reuses the
non-disclosing `CLIENT_NOT_FOUND` (404). (Phases 3 and 4 added none — duplicate
detection produces non-blocking `meta` warnings, not errors.) The full set:

| Code                               | HTTP | Trigger                                                                   | Suggested UI handling                                    |
| ---------------------------------- | ---- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| `CLIENT_NOT_FOUND`                 | 404  | unknown / malformed id (non-disclosing)                                   | not-found state                                          |
| `CLIENT_VALIDATION_FAILED`         | 400  | generic serializer field validation failure                               | map `error.details` to fields; fall back to `message`    |
| `CLIENT_DATE_ORDER_INVALID`        | 400  | `relationship_ended_on` precedes `relationship_started_on`                | field error on the end-date field                        |
| `CLIENT_VERSION_CONFLICT`          | 409  | stale `record_version`                                                    | toast "record changed", reload + retry                   |
| `CLIENT_RECORD_LOCKED`             | 423  | staff mutation on a locked client                                         | show lock banner; disable staff edit controls            |
| `CLIENT_FIELD_FORBIDDEN`           | 403  | field outside the actor's whitelist (e.g. staff sending `internal_notes`) | log; shouldn't happen if the form respects the whitelist |
| `CLIENT_ARCHIVED`                  | 409  | mutation on an archived client / archive when already archived            | show archived state; offer restore path                  |
| `CLIENT_STATUS_TRANSITION_INVALID` | 422  | status change not allowed from the current status                         | refresh allowed transitions from the current status      |
| `CLIENT_STATUS_REASON_REQUIRED`    | 400  | entering `former` / reactivating `former` without a reason                | require a reason field                                   |
| `CLIENT_NOT_ARCHIVED`              | 409  | restore on a client that is not archived                                  | reconcile state; hide restore action                     |
| `CLIENT_RESTORE_STATUS_INVALID`    | 400  | restore target is `archived` or otherwise invalid                         | field error on the target-status picker                  |
| `CLIENT_ALREADY_LOCKED`            | 409  | lock requested on an already-locked client                                | reconcile the lock toggle with server state              |
| `CLIENT_NOT_LOCKED`                | 409  | unlock requested on a client that is not locked                           | reconcile the lock toggle with server state              |
| `CLIENT_LOCK_REASON_REQUIRED`      | 400  | lock/unlock without a non-blank reason                                    | require a reason field                                   |
| `CLIENT_CODE_INVALID`              | 400  | client code fails the `CL-YYYY-NNNNNN` format                             | should not occur via the UI (code is server-set)         |
| `CLIENT_MERGE_SELF`                | 400  | `duplicate_id` equals the survivor `{id}`                                 | field error on the duplicate picker; block submit        |
| `CLIENT_MERGE_REASON_REQUIRED`     | 400  | merge `reason` missing or blank                                           | require a reason field                                   |
| `CLIENT_MERGE_TARGET_NOT_FOUND`    | 404  | duplicate or surviving client not found                                   | not-found state; re-pick the duplicate                   |
| `CLIENT_MERGE_ALREADY_MERGED`      | 409  | survivor or duplicate is already merged                                   | reconcile UI; refetch both clients                       |
| `CLIENT_MERGE_ARCHIVED`            | 409  | surviving client is archived                                              | restore the survivor first, or pick a live survivor      |
| `CLIENT_IMPORT_INVALID`            | 400  | import file missing or not valid CSV                                      | field error on the file input; re-upload a valid CSV     |
| `CLIENT_IMPORT_TOO_LARGE`          | 400  | import file exceeds the 1000-row limit                                    | prompt to split the file into ≤1000-row batches          |

## 6. Examples

```jsonc
// POST /api/v1/clients/  (staff) — request
{
  "legal_name": "Tribeni Educational Consultancy Pvt. Ltd.",
  "display_name": "Tribeni",
  "client_type": "educational_institution",
  "relationship_type": "partner",
  "website": "https://www.tribeni.edu.np/about",
  "primary_email": "info@tribeni.edu.np",
  "primary_phone": "+977-1-4444444",
  "country_code": "NP",
}

// 201 — response.data (staff projection)
{
  "id": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
  "client_code": "CL-2026-000123",
  "legal_name": "Tribeni Educational Consultancy Pvt. Ltd.",
  "display_name": "Tribeni",
  "client_type": "educational_institution",
  "relationship_type": "partner",
  "status": "prospective",
  "source": "manual",
  "website": "https://www.tribeni.edu.np/about",
  "website_domain": "tribeni.edu.np",
  "primary_email": "info@tribeni.edu.np",
  "primary_phone": "+977-1-4444444",
  "alternate_phone": "",
  "registration_number": "",
  "tax_number": "",
  "country_code": "NP",
  "established_date": null,
  "description": "",
  "relationship_started_on": null,
  "relationship_ended_on": null,
  "is_locked": false,
  "record_version": 1,
  "primary_contact": null,
  "spokesperson": null,
  "contacts": [],
  "addresses": [],
  "aliases": [],
  "tags": [],
  "logo_url": null,
  "logo_thumbnail_url": null,
  "created_at": "2026-07-20T12:00:00+05:45",
  "updated_at": "2026-07-20T12:00:00+05:45",
}

// PATCH /api/v1/clients/6f1c…/  — status change to `former` (reason required)
{
  "status": "former",
  "reason": "Contract concluded",
  "record_version": 1,
}

// admin GET — the *_bs sibling shape on an admin-only date field
{
  "established_date": "1998-04-14",
  "established_date_bs": {
    "year": 2055,
    "month": 1,
    "day": 1,
    "month_name_en": "Baisakh",
    "month_name_np": "बैशाख",
    "display_en": "2055 Baisakh 1",
    "display_np": "२०५५ बैशाख १",
  },
}

// …when a create/update trips a duplicate, the SAME success response (201/200)
// also carries response.meta (masked, non-blocking):
{
  "possible_duplicate": true,
  "duplicate_matches": [
    {
      "client_code": "CL-2026-000042",
      "display_name": "T***** E**********",
      "registration_match": true,
      "tax_match": false,
      "domain_match": false,
      "email_match": false,
      "phone_match": false,
      "name_match": false,
    },
  ],
}

// To proceed anyway, resubmit the same body with:
{ "override_reason": "Confirmed distinct entity — different branch" }

// POST /api/v1/clients/duplicate-check/ — request (preflight; any subset)
{ "legal_name": "Tribeni Educational Consultancy", "primary_email": "info@tribeni.edu.np" }
// 200 — response.data (matches is [] when nothing collided)
{
  "matches": [
    {
      "client_code": "CL-2026-000042",
      "display_name": "T***** E**********",
      "registration_match": false,
      "tax_match": false,
      "domain_match": true,
      "email_match": true,
      "phone_match": false,
      "name_match": true,
    },
  ],
}

// GET /api/v1/clients/lookup/?search=tribeni — response.data (not paginated, ≤50)
[
  {
    "id": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
    "client_code": "CL-2026-000123",
    "legal_name": "Tribeni Educational Consultancy Pvt. Ltd.",
    "display_name": "Tribeni",
    "client_type": "educational_institution",
    "primary_email": "info@tribeni.edu.np",
    "primary_phone": "+977-1-4444444",
    "website": "https://www.tribeni.edu.np/about",
    "primary_contact": null,
    "spokesperson": null,
    "logo_thumbnail_url": null,
  },
]

// GET /api/v1/clients/6f1c…/document-prefill/  (staff+) — response.data
// A read-time snapshot; the consumer must COPY these into the document (see §7).
{
  "source_client_id": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
  "client_code": "CL-2026-000123",
  "generated_at": "2026-07-20T12:30:00+05:45",
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
  "primary_address": {
    "id": "a1b2…",
    "address_type": "registered",
    "line_1": "Putalisadak",
    "locality": "Kathmandu",
    "country_code": "NP",
    "is_primary": true,
  },
  "primary_contact": {
    "id": "c3d4…",
    "full_name": "Sita Sharma",
    "honorific": "Ms.",
    "designation": "Director",
    "department": "",
  },
  "spokesperson": {
    "id": "c9e0…",
    "full_name": "Hari Thapa",
    "honorific": "Mr.",
    "designation": "Branch Manager",
    "department": "",
  },
  "logo_url": "/api/v1/clients/6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10/logo/",
  "logo_thumbnail_url": "/api/v1/clients/6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10/logo/thumbnail/",
}

// GET /api/v1/clients/6f1c…/audit-events/?page=1  (admin only) — response.data
// (paginated: response.meta = { count, page, page_size, next, previous })
[
  {
    "id": "e1f2…",
    "event_type": "client_status_changed",
    "actor": "9a8b…",
    "reason": "Contract concluded",
    "changed_fields": [],
    "metadata": { "from": "active", "to": "former" },
    "request_id": "e8a851cd-3d25-4909-a6f6-14c482cc6a94",
    "created_at": "2026-07-20T12:10:00+05:45",
  },
  {
    "id": "d0c9…",
    "event_type": "client_created",
    "actor": "9a8b…",
    "reason": "",
    "changed_fields": [],
    "metadata": {},
    "request_id": "1b2c3d4e-…",
    "created_at": "2026-07-20T12:00:00+05:45",
  },
]

// POST /api/v1/clients/6f1c…/merge/  (admin only) — request
// {id} is the SURVIVOR; duplicate_id is folded in.
{
  "duplicate_id": "b2a1c0d9-7e6f-4a3b-8c2d-1e0f9a8b7c6d",
  "reason": "Same institution, two records created by different staff",
  "field_resolutions": { "website": "duplicate", "registration_number": "duplicate" },
}

// 200 — response.data is the survivor (admin projection); response.meta:
{
  "merge_record_id": "9f8e7d6c-5b4a-3c2d-1e0f-a9b8c7d6e5f4",
  "transferred": {
    "contacts": 2,
    "addresses": 1,
    "aliases": 3,
    "tag_assignments": 2,
    "logos": 1,
  },
}

// GET /api/v1/clients/6f1c…/merge-history/?page=1  (admin only) — response.data
// (paginated: response.meta = { count, page, page_size, next, previous })
[
  {
    "id": "9f8e7d6c-5b4a-3c2d-1e0f-a9b8c7d6e5f4",
    "source_client": "b2a1c0d9-7e6f-4a3b-8c2d-1e0f9a8b7c6d",
    "surviving_client": "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
    "field_resolutions": { "website": "duplicate" },
    "transferred_counts": { "contacts": 2, "addresses": 1, "aliases": 3, "tag_assignments": 2, "logos": 1 },
    "reason": "Same institution, two records created by different staff",
    "performed_by": "9a8b…",
    "request_id": "e8a851cd-3d25-4909-a6f6-14c482cc6a94",
    "created_at": "2026-07-20T13:00:00+05:45",
  },
]

// GET /api/v1/clients/export/?status=active&ordering=legal_name  (staff+)
// NOT the JSON envelope — a streamed text/csv download (Content-Disposition:
// attachment). Header row + one row per client; staff omit the internal_notes
// column, privileged actors get it. Example (staff):
//
//   client_code,legal_name,display_name,client_type,relationship_type,status,primary_email,primary_phone,alternate_phone,website,registration_number,tax_number,country_code,created_at,updated_at
//   CL-2026-000123,Tribeni Educational Consultancy Pvt. Ltd.,Tribeni,educational_institution,partner,active,info@tribeni.edu.np,+977-1-4444444,,https://www.tribeni.edu.np/about,,,NP,2026-07-20T12:00:00+05:45,2026-07-20T12:00:00+05:45

// POST /api/v1/clients/import/  (admin only) — multipart body: file=<clients.csv>
// (build FormData at the api layer; ≤1000 data rows). 200 — response.data:
{
  "created": 2,
  "failed": 1,
  "created_ids": [
    "6f1c2e2a-8b7d-4a1e-9c33-2f2b9a5e1d10",
    "7a2d3e4b-9c8d-4b1e-8f22-3d4c5e6f7a8b",
  ],
  "errors": [
    {
      "row": 3,
      "errors": { "client_type": ["This field is required."] },
    },
  ],
}
```

## 7. UI / integration notes

- **Concurrency:** keep the last-read `record_version` in the form/query cache;
  echo it on `PATCH` / `archive` / `restore`; on `409 CLIENT_VERSION_CONFLICT`
  refetch and retry. Lock/unlock take **no** version — only a `reason`.
- **Role projection:** use `ClientStaff` vs `ClientAdmin` by role — do **not**
  assume protected fields are `null` for staff; they are **absent**
  (`internal_notes`, `legal_name_romanized`, `display_name_romanized`,
  `locked_at`, `lock_reason`, `archived_at`, and the `*_bs` siblings). Pick the
  type by the current role, not by presence checks.
- **Dates:** in the admin projection, `established_date`,
  `relationship_started_on`, and `relationship_ended_on` each carry a `*_bs`
  Bikram-Sambat sibling — render `display_en` / `display_np`, send only the AD
  field. Staff never see the `*_bs` fields.
- **Server-computed (never send):** `id`, `client_code`, `website_domain`, the
  `*_romanized` projections, `normalized_email` / `normalized_phone` /
  `normalized_registration_number` / `normalized_tax_number` (not serialized at
  all), `record_version`, `is_locked`, lock/archive stamps, `created_at`,
  `updated_at`, every `*_bs` object, the embedded `primary_contact` /
  `spokesperson` / `contacts` / `addresses` / `aliases` / `tags`, and
  `logo_url` / `logo_thumbnail_url`.
- **Embedded children (read-only):** `primary_contact` / `spokesperson` (compact,
  or `null`) ride on every read incl. list rows; `contacts` / `addresses` /
  `aliases` / `tags` ride on the **detail** read only. Never send them in a
  client create/update body — mutate each through its nested endpoint
  (`contact.md`, `address.md`, `alias.md`, `tag.md`) and refetch, or invalidate
  the client detail query, to see the change reflected here.
- **Status vs archive:** drive `status` transitions through the `PATCH` map;
  drive archive/restore through their own action endpoints. Never PATCH `status`
  to/from `archived`.
- **Lock is admin-only:** hide lock/unlock controls for staff (they get 403);
  when a record `is_locked`, disable staff edit controls rather than letting the
  `PATCH` 423.
- **Media / streaming:** `logo_url` / `logo_thumbnail_url` ride read-only on every
  read (list + detail); they are authenticated stream URLs (or `null`), never
  public links. Fetch them with the bearer token — a bare `<img src>` only works if
  the app forwards auth. Mutate the logo through its own nested endpoint
  (`logo.md`), then invalidate the client query to refresh these URLs.
- **State mapping:** `423 CLIENT_RECORD_LOCKED` → read-only lock banner;
  `409 CLIENT_VERSION_CONFLICT` → reload+retry toast; `404 CLIENT_NOT_FOUND` →
  not-found (treat as "not available", not necessarily "deleted");
  `422 CLIENT_STATUS_TRANSITION_INVALID` → re-derive allowed next statuses;
  `400 CLIENT_STATUS_REASON_REQUIRED` → reveal a reason field.
- **Duplicate warnings (never send `override_reason` blindly):** create/update
  succeed even on a collision; read `meta.possible_duplicate` — if `true`, render
  the masked `meta.duplicate_matches` (public `client_code`, first-initials
  `display_name`, and the boolean signal flags telling the user _why_ it matched)
  and let the user cancel or resubmit with an `override_reason`. The record from a
  flagged create **already exists** — a resubmit updates it, it does not create a
  duplicate. For an even smoother form, call `POST /clients/duplicate-check/`
  **before** submitting (debounced on the key identity fields) and surface the
  warning inline; pass `exclude_id` when checking during an edit so the record
  doesn't match itself.
- **Ranked search:** on the list, omit `ordering` while a `search` term is active
  to get best-match-first ranking; add an explicit `ordering` only when the user
  picks a column sort (it overrides the ranking). Trigram acceleration is
  invisible to the client.
- **Lookup vs list:** use `GET /clients/lookup/` for typeaheads / dropdowns /
  document-prefill — it is a **reduced** row (`ClientLookupRow`), **not paginated**,
  **capped at 50**, and ranked. Do not page it or expect protected fields; use the
  full `GET /clients/` (paginated `ClientListRow*`) for the directory table.
- **Document prefill drives document forms (snapshot, don't bind live):** call
  `GET /clients/{id}/document-prefill/` (staff+) to seed a document editor with the
  client's identity/contact/spokesperson/logo fields. The response is a **live
  snapshot** — the returned `generated_at` marks the read time. **Copy the values
  into the document and persist them** (optionally alongside `source_client_id` for
  traceability); a rendered/issued document must **never** re-read the live client,
  so a later client edit cannot change what was already issued. This is a hard
  contract, not a suggestion. `logo_url` / `logo_thumbnail_url` here are the same
  authenticated stream URLs as on the client read — fetch with the bearer token.
  Prefill is unavailable for an archived client (`404 CLIENT_NOT_FOUND`) and never
  includes `internal_notes`. Use `lookup` to _pick_ a client, then `document-prefill`
  to _seed the form_ from the chosen one.
- **Audit trail is an admin-only history view:** `GET /clients/{id}/audit-events/`
  powers a per-client "activity / history" panel — **admin/superadmin only** (hide
  the panel for staff; they get `403`). It is **paginated** (standard `meta`) and
  **newest first**; render `event_type` via the `Audit` enum labels (`enums.md`),
  show `reason` / `changed_fields` / `metadata` for context, and resolve `actor`
  (a user UUID, or `null` for a system action) against your user directory. Rows
  are immutable — there is no create/edit/delete.
- **Merge is a destructive admin action — confirm first:**
  `POST /clients/{id}/merge/` is **admin/superadmin only** (hide the control for
  staff; they get `403`). `{id}` is the **survivor**; the picked `duplicate_id` is
  folded in and **archived** (its UUID keeps resolving via `merged_into`, but the
  record is retained, not deleted). Always show a confirm dialog — collect the
  mandatory `reason` and any `field_resolutions` (which scalar fields to take from
  the duplicate) there. Merge takes **no `record_version`**. On success, read
  `meta.merge_record_id` + `meta.transferred` to show a "merged N contacts / M
  addresses…" summary, then **invalidate both clients' queries** and the list —
  the duplicate now reads as archived pointing at the survivor. Surface the merge
  errors as: `CLIENT_MERGE_SELF` / `CLIENT_MERGE_REASON_REQUIRED` → form errors;
  `CLIENT_MERGE_TARGET_NOT_FOUND` → not-found; `CLIENT_MERGE_ALREADY_MERGED` /
  `CLIENT_MERGE_ARCHIVED` → reconcile state (refetch, or restore the survivor
  first).
- **Merge history is an admin-only paginated read:**
  `GET /clients/{id}/merge-history/` returns immutable `MergeRecord[]` for merges
  where the client is survivor or folded duplicate — pair it with the audit panel
  in the admin history view. `transferred_counts` is the per-relation move count;
  `field_resolutions` records which fields were taken from the duplicate.
- **Export is a file download, not a data fetch:** `GET /clients/export/` (staff+)
  returns **`text/csv`** with `Content-Disposition: attachment`, **not** the JSON
  envelope — trigger it as a browser download (fetch with the bearer token, read
  the blob, save it), not through your JSON api layer. It reuses the **same list
  filters**, so wire it to the current table filter/search/ordering state. Staff
  CSVs **omit `internal_notes`**; only privileged actors get that column and may
  pass `include_archived`. It is **throttle-flagged** — a `429` under load is
  expected; back off.
- **Import shows a per-row error report:** `POST /clients/import/` is
  **admin/superadmin only** (hide for staff; they get `403`). Build the `FormData`
  with a single `file` part at the api layer; enforce **≤1000 rows** client-side to
  pre-empt `CLIENT_IMPORT_TOO_LARGE`, and validate it is a CSV to pre-empt
  `CLIENT_IMPORT_INVALID`. The `200` result is a **summary, not a failure** even
  when `failed > 0`: render `created` / `failed` counts and iterate `errors[]`
  ({`row`, `errors`}) into a per-row error table so the user can fix and re-upload
  just the failed rows. `created_ids` lets you deep-link the newly created clients.
  It is **throttle-flagged** like export.
