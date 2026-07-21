# Security — Client Directory

**Owner app:** `clients`
**Version:** 1.5.0
**Status:** Active
**Created:** 2026-07-20

---

## Change History

| Version | Date       | Author      | Summary                                                        |
| ------- | ---------- | ----------- | -------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | AI (Claude) | Initial security notes — Phase 1 foundation                    |
| 1.1.0   | 2026-07-20 | AI (Claude) | Phase 2 — nested contact/address/alias/tag security (§7)       |
| 1.2.0   | 2026-07-20 | AI (Claude) | Phase 2 logo — media handling security (§8)                    |
| 1.3.0   | 2026-07-20 | AI (Claude) | Phase 3 — duplicate-warning privacy & search/lookup notes (§9) |
| 1.4.0   | 2026-07-20 | AI (Claude) | Phase 4 — document-prefill & audit-trail access notes (§10)    |
| 1.5.0   | 2026-07-20 | AI (Claude) | Phase 5 — merge & bulk import/export security (§11)            |

---

## 1. Authorization model

The app uses role-based DRF permission classes (`clients/permissions.py`), a documented deviation from `CLAUDE.md` §9's interim inline `is_staff` snippet — the same deviation `authenticate` and `applicant` carry (§7.5 forbids Django `is_staff` as a business-role signal; these read the application `role`). Every endpoint denies unauthenticated requests (401) and non-staff (403). `IsStaffOrAbove` gates list/read/create/update/archive/restore; `IsAdminOrSuperadmin` (reused from `authenticate`, not redefined) gates lock/unlock. All resources/endpoints are registered with `core.policy_engine` (`clients/registry.py`) as the authoritative access-control metadata; request-path enforcement of policy keys is a separate, not-yet-built platform bridge.

## 2. Field-level protection (`internal_notes`)

`internal_notes` is permission-sensitive operational data. It is enforced at the serializer projection boundary, never by frontend hiding (§13): the staff read serializer omits it entirely, and only the admin write serializer declares it. The service layer additionally re-checks the field whitelist (`STAFF_EDITABLE_CLIENT_FIELDS` vs `ADMIN_EDITABLE_CLIENT_FIELDS`) as defence in depth, raising `CLIENT_FIELD_FORBIDDEN` (403) if a staff actor submits it.

## 3. Mass-assignment protection

Write serializers are explicit field lists (never `__all__`). `client_code`, `record_version`, lock fields (`is_locked`/`locked_by`/`locked_at`/`lock_reason`), archive fields (`archived_at`/`archived_by`), audit stamps, and the search projections are undeclared in write serializers and excluded from the service whitelist — they are only ever set by the server. Ownership cannot be reassigned (no tenant field exists).

## 4. Optimistic concurrency & record lock

`record_version` (required in every `PATCH`/archive/restore body) prevents silent overwrite of newer data — a mismatch returns `409 CLIENT_VERSION_CONFLICT`. An orthogonal admin business lock freezes a record: while `is_locked`, a staff update returns `423 CLIENT_RECORD_LOCKED` (checked before the version comparison so the signal is unambiguous). Lock and unlock both require a reason and are admin/superadmin-only.

## 5. Audit & sensitive-data handling

Every material action appends an immutable `ClientAuditEvent` inside the mutation's transaction. Audit rows store entity IDs and changed **field names**, never sensitive values; `metadata` is sanitized before write (keys containing `password`/`token`/`secret`/`otp`/`tax`/`registration`/`checksum`/`file` are dropped). Audit rows cannot be modified or deleted (`AuditEventImmutableError`). Identifier fields (`registration_number`, `tax_number`) are stored but never logged.

## 6. Non-disclosure & tenancy

`get_client_or_404` returns a generic `CLIENT_NOT_FOUND` for unknown or malformed ids (no distinction leaks existence). The module is standalone and single-tenant by design: there is no cross-organization scope to breach, and archived records are excluded from non-privileged querysets. Media/logo handling, SVG sanitization, and endpoint throttling (concept §17.4–17.6) arrive with the logo/search phases and are out of current scope.

## 7. Phase 2 — nested resource security

Contacts, addresses, aliases, and tags are staff-manageable directory work, nested under a client and scoped to it: every child read/write resolves `id=<child_id>, client_id=<client_id>`, so a child of another client returns a non-disclosing 404 (no insecure direct object reference across clients). Every child mutation locks the parent and applies the same guard as a client update — an **archived** client rejects all child writes (409), and a **locked** client rejects child writes from non-privileged (staff) actors (423). Contact `notes` is permission-sensitive: withheld from the staff contact read serializer and absent from the staff contact write serializer (admin-only), mirroring `internal_notes` (§2). Child write serializers are explicit field lists (no `__all__`); `client`, actor stamps, and normalized/romanized projections are server-set only. Deactivation (contacts/addresses) is a soft `is_active=False` so historical document references survive (concept §15); alias/tag-assignment removal hard-deletes but is audited. All child mutations append a `ClientAuditEvent` with sanitized metadata in the same transaction.

## 8. Logo / media handling

Logos live in a private `FileSystemStorage` rooted at `CLIENTS_PRIVATE_MEDIA_ROOT`, constructed with `base_url=None` so `.url` is unavailable — there is **no permanent public link** (concept §9.8). Files are read only through the authenticated stream endpoints (`GET /logo/`, `GET /logo/thumbnail/`), which resolve the current logo for the client in the URL; internal filesystem paths never appear in API responses. The storage path is opaque (`clients/<client_id>/logo/<uuid>.<ext>`) — the client-supplied filename is never used to build a path. Uploads are validated by **content, not extension**: Pillow decodes and verifies the image, the format must be JPEG/PNG/WebP (spoofed extensions → 415), size is capped at 5 MB (413), and dimensions at 4096×4096 (400); **SVG is disabled** until sanitization exists (§9.2). Logo writes are staff-manageable but inherit the parent lock/archive guard (locked → 423 for staff, archived → 409). Replace and remove are soft (retire `is_current=False`, retain the file) so a logo embedded in a historical document snapshot stays resolvable (§9.7); physical cleanup of orphaned files is a controlled maintenance process, not an immediate request-time delete (§9.9). Uploads/removals append a `ClientAuditEvent` whose metadata carries the logo id and image dimensions but no file bytes.

## 9. Duplicate warnings, search, and lookup

Duplicate detection is **advisory, never blocking** (concept §11.2): a create/update always succeeds, and matches surface only as warnings in `meta`. Match rows are privacy-safe — the peer client's `legal_name` is **masked** to first-initials via `dedup.mask_name` (e.g. `T***** E**********`), and only its public `client_code` plus boolean signal flags are returned, so the endpoint never discloses another client's full details to a user who merely typed a colliding value. Detection reads only non-archived clients. Proceeding despite a warning is auditable: an optional `override_reason` is recorded on the `client_duplicate_flagged` event (with an `overridden` flag), so an intentional duplicate is attributable. The preflight `POST /clients/duplicate-check/` and the `GET /clients/lookup/` endpoints are staff+ like the rest of the app; lookup returns a reduced projection (no `internal_notes`, no lock/version/audit fields) and is capped at 50 rows. Trigram indexes are a performance concern only — they change no authorization or disclosure behavior (the same `__icontains` filter runs with or without them).

## 10. Document prefill & audit trail (Phase 4)

The document-prefill endpoint (`GET /clients/{id}/document-prefill/`, staff+) returns a read-time snapshot of reusable identity/contact/spokesperson/logo fields and **excludes `internal_notes`** and all lock/version/audit internals; archived clients are not prefillable (404). It exposes `registration_number`/`tax_number`, which staff already see in the client detail — no new disclosure. The endpoint reads live values only; the **historical-safety obligation is on the consumer** (it must persist the copied values so a later client edit cannot alter an issued document, §15). The audit-trail endpoint (`GET /clients/{id}/audit-events/`) is **admin/superadmin only** — the audit log names actors and changed fields and is a privileged operational view; its rows remain immutable and its `metadata` was already sanitized at write time (§5), so reading it discloses no credential/identity plaintext. The domain-event outbox (§16.2) is deliberately deferred until a real event consumer exists (no broker-less event infra is shipped this phase).

## 11. Merge & bulk CSV import/export (Phase 5)

**Merge** (`POST /clients/{id}/merge/`) is **admin/superadmin only**, requires a reason, and is fully audited: it writes an immutable `ClientMergeRecord` (source, survivor, applied field resolutions, per-relation transfer counts, actor, reason) plus a `client_merged` event. The duplicate is **retained** (never deleted) and archived pointing at the survivor, preserving stable UUIDs and relationship references (concept §11.3); the operation is one transaction, rejects self-merge / already-merged / archived-survivor, and preserves child "one active primary/current" invariants (the survivor's designations win). Only the `MERGE_RESOLVABLE_CLIENT_FIELDS` scalar set may be resolved from the duplicate — code/lock/version/status/audit fields are never resolvable.

**Export** (`GET /clients/export/`, staff+) honors row- and field-level permissions (concept §17.10): it reuses the same filters as the list (archived excluded unless a privileged actor asks) and emits the role-projected column set — **staff exports never include `internal_notes`**; only privileged actors get that column. **Import** (`POST /clients/import/`) is **admin/superadmin only**, bounded to 1000 rows, and runs each row through the exact same write serializer + `create_client` path as a single create, so per-row validation, normalization, duplicate detection, and the `client_created` audit event all apply identically (§14.14); per-row failures are reported, never silently dropped, and a `client_imported` summary event is recorded. Both endpoints are expensive/abuse-prone and are flagged for per-user throttling in deployment (concept §17.6, documented in `API.md`).
