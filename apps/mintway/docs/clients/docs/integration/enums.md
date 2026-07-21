# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here). Do not re-list these
> values inline in the entity file.

## Client

**`client_type`** — external-organization classification. Required on create.

| Value                           | UI label                      |
| ------------------------------- | ----------------------------- |
| `company`                       | Company                       |
| `educational_institution`       | Educational institution       |
| `bank`                          | Bank                          |
| `cooperative`                   | Cooperative                   |
| `government_office`             | Government office             |
| `ngo_ingo`                      | NGO / INGO                    |
| `embassy_or_diplomatic_mission` | Embassy or diplomatic mission |
| `vendor`                        | Vendor                        |
| `training_provider`             | Training provider             |
| `other`                         | Other                         |

**`relationship_type`** — how the host organization relates to the client.
Optional (unset serializes as `""`).

| Value                   | UI label              |
| ----------------------- | --------------------- |
| `customer`              | Customer              |
| `partner`               | Partner               |
| `vendor`                | Vendor                |
| `service_provider`      | Service provider      |
| `referral_partner`      | Referral partner      |
| `financial_institution` | Financial institution |
| `document_issuer`       | Document issuer       |
| `regulatory_body`       | Regulatory body       |
| `other`                 | Other                 |

**`status`** — directory lifecycle state (NOT a sales pipeline). Default
`prospective`. `PATCH` changes obey the transition map; `archived` is entered/left
only via the archive/restore endpoints (see `client.md` §4).

| Value         | UI label    |
| ------------- | ----------- |
| `prospective` | Prospective |
| `active`      | Active      |
| `inactive`    | Inactive    |
| `former`      | Former      |
| `archived`    | Archived    |

**`source`** — how the record entered the directory. Default `manual`.

| Value         | UI label    |
| ------------- | ----------- |
| `manual`      | Manual      |
| `import`      | Import      |
| `migration`   | Migration   |
| `integration` | Integration |
| `other`       | Other       |

## Address

**`address_type`** — the kind of postal address. Required on create.

| Value        | UI label   |
| ------------ | ---------- |
| `registered` | Registered |
| `office`     | Office     |
| `branch`     | Branch     |
| `mailing`    | Mailing    |
| `other`      | Other      |

## Alias

**`alias_type`** — the kind of alternate searchable name. Optional (unset
serializes as `""`).

| Value         | UI label    |
| ------------- | ----------- |
| `acronym`     | Acronym     |
| `former_name` | Former name |
| `translation` | Translation |
| `brand`       | Brand       |
| `other`       | Other       |

## Audit

**`event_type`** — the audited client action on an audit-log row. Response-only;
never sent by the client. Surfaced by the admin-only audit trail
`GET /api/v1/clients/{id}/audit-events/` (Phase 4 — see `client.md` §3, the
`AuditEvent` type).

| Value                            | UI label                   |
| -------------------------------- | -------------------------- |
| `client_created`                 | Client created             |
| `client_updated`                 | Client updated             |
| `client_status_changed`          | Client status changed      |
| `client_archived`                | Client archived            |
| `client_restored`                | Client restored            |
| `client_locked`                  | Client locked              |
| `client_unlocked`                | Client unlocked            |
| `client_contact_created`         | Contact created            |
| `client_contact_updated`         | Contact updated            |
| `client_contact_deactivated`     | Contact deactivated        |
| `client_primary_contact_changed` | Primary contact changed    |
| `client_spokesperson_changed`    | Spokesperson changed       |
| `client_address_created`         | Address created            |
| `client_address_updated`         | Address updated            |
| `client_address_deactivated`     | Address deactivated        |
| `client_primary_address_changed` | Primary address changed    |
| `client_alias_added`             | Alias added                |
| `client_alias_removed`           | Alias removed              |
| `client_tag_added`               | Tag added                  |
| `client_tag_removed`             | Tag removed                |
| `client_logo_uploaded`           | Logo uploaded              |
| `client_logo_removed`            | Logo removed               |
| `client_duplicate_flagged`       | Possible duplicate flagged |
| `client_merged`                  | Client merged              |
| `client_imported`                | Clients imported (CSV)     |
| `client_exported`                | Clients exported (CSV)     |
