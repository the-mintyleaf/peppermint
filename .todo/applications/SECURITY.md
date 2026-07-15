# Security — Applicant CRM & Documents

**Owner app:** `applicant`
**Version:** 1.6.0
**Status:** Active
**Created:** 2026-07-15

This document is required per project rulebook §19 (Documentation Requirements) because `applicant` makes its own security-relevant decisions beyond the project's standard auth pattern — role-based access with a staff/admin split, a staff-editable field whitelist, business-record locking, protected-field disclosure control, non-disclosing not-found behaviour, and private media storage.

> **Build status:** Phase 1 (applicant core) complete. Documents/revisions/print/signatures and their document-specific access rules (staff must see no document surface, §9.5) arrive in later phases.

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Phase 1: access model, staff whitelist, disclosure projections, locking, concurrency, private media, audit. |
| 1.1.0 | 2026-07-15 | AI (Claude) | Phase 2a: admin-only profile children, identity fingerprint, general evidence media (image/PDF sniff), cross-applicant media rejection. |
| 1.2.0 | 2026-07-15 | AI (Claude) | Phase 2b: CRM/compliance children (protected financial/visa/consent data), assessment supersede, assessment↔lifecycle coupling. |
| 1.3.0 | 2026-07-15 | AI (Claude) | Phase 3: application cases (transition-only status, own record_version), assignments, cross-applicant case-reference rejection. |
| 1.4.0 | 2026-07-15 | AI (Claude) | Phase 4: documents — non-disclosing 404 for staff (§9.5), polymorphic content validation + JSON-safety, status lifecycle. |
| 1.5.0 | 2026-07-15 | AI (Claude) | Phase 5: immutable revisions + print evidence (retained on archive), signatures, certificate signature resolution. |
| 1.6.0 | 2026-07-15 | AI (Claude) | Phase 6: admin duplicate merge — safe transfer, retain-not-delete, immutable merge record, circular/repeat rejection. |

---

## §1 Access-control model (documented §9 deviation)

CLAUDE.md §9's interim pattern keys on Django `is_staff`, which requirement §7.5 forbids as a business-role signal. This app therefore reuses the same documented deviation the `authenticate` app already carries: DRF permission classes read only the application `role`.

- `applicant.permissions.IsStaffOrAbove` — any authenticated `staff`/`admin`/`superadmin`.
- `authenticate.permissions.IsAdminOrSuperadmin` / `IsSuperadmin` — reused, not redefined (§4).

Route-level classes are coarse (which roles may reach an endpoint). All **object-level** rules live in the service/serializer layers, never in the permission class or the frontend:

- Staff-editable field whitelist (`constants.STAFF_EDITABLE_APPLICANT_FIELDS`) — enforced twice: the staff write serializer only declares whitelisted fields (mass-assignment safe, §22.4), and `services.applicant.update_applicant` re-rejects any non-whitelisted key (`APPLICANT_FIELD_FORBIDDEN`).
- Lock, archive, `record_version`, protected-field stripping — all service/serializer enforced.

This is **not** the future policy-engine enforcement bridge. All 16 endpoints are registered in `core.policy_engine` as the authoritative access metadata, but views still use interim role classes; wiring `check_permission()` into the request path is separate, later work.

## §2 Disclosure control — staff vs admin projections

Protected data is never serialized to staff and we never rely on the frontend to hide it (§2.3, §9.4). Separate serializers are the boundary:

- Staff read: `ApplicantListStaffSerializer` / `ApplicantDetailStaffSerializer` — basic identity/contact only.
- Admin read: `ApplicantList/DetailAdminSerializer` — adds protected fields.

Protected fields (§22.1): `date_of_birth`, `religion`, `counselling_notes`, `summary`/`eligibility_summary`, follow-up fields, convert/lock metadata, `full_name_romanized`. A staff token and an admin token calling the same `GET` receive different field sets by construction.

## §3 Non-disclosing not-found

`selectors.get_applicant_or_404` raises `APPLICANT_NOT_FOUND` (404) for both a genuinely absent record and a malformed UUID, so an unauthorized probe cannot distinguish "exists" from "does not exist" (§24). Later document endpoints will extend this to a queryset-scoped 404 for staff (§9.5).

## §4 Business-record locking + concurrency

- Lock is an application-level record lock (not a DB lock). While `is_locked`, staff cannot mutate the applicant or its staff-editable children (`services.profile` re-checks the parent lock, §10.6). Admin/superadmin may continue.
- Staff update order inside one `transaction.atomic()` + `select_for_update()`: **lock check first → 423**, then version check → 409. This gives staff the specific `APPLICANT_RECORD_LOCKED` signal rather than a generic conflict, and closes the read-unlocked/lock/write-stale race.
- Optimistic concurrency: every mutation requires the last-read `record_version`; a mismatch is `409 APPLICANT_VERSION_CONFLICT`. No silent last-write-wins.
- Lock/unlock, transitions, updates, archive, and media upload are each transactional bundles (mutation + history/audit).

## §5 Private media (§5.6)

Profile images are stored under `APPLICANT_PRIVATE_MEDIA_ROOT`, outside the public `MEDIA_URL` tree. The `FileSystemStorage` is built with `base_url=None`, so `.url` is unavailable — there is no permanent public link. Files are served only via the authenticated streaming endpoint (`FileResponse`). Uploads are content-sniffed (Pillow, shared `validate_profile_image`), size-limited (5 MB), stored under an opaque UUID name (the client filename is never trusted), and a SHA-256 checksum is recorded. Phase 1 is image-only; content-based MIME detection for non-image evidence (`python-magic`) is deferred to the phase that introduces document/evidence uploads.

## §6 Audit + sensitive-data handling

- Every mutation appends an immutable `AuditEvent` (append-only; `save`/`delete` on an existing row raise). History tables (`ApplicantLifecycleHistory`, `ApplicantLockHistory`) are likewise append-only.
- `services.audit.sanitize_metadata` drops any key matching credential/identity substrings (`password`, `token`, `passport`, `account_no`, `checksum`, `file`, `signature`, …). Audit rows reference entity IDs and changed field **names**, never sensitive values (§22.2).
- The audit model is the clean integration hook for the future global event ledger.

## §8 Phase 2a — profile children, identity, evidence media

- **All 11 profile-child resources + interest profile + evidence media are admin/superadmin-only** (`IsAdminOrSuperadmin`). Staff receive `403` on every method — asserted by a test that loops over every child slug. Staff access stays limited to the basic applicant + addresses + profile photo (§9.1).
- **Identity numbers** are stored in plaintext on `ApplicantIdentityDocument.document_number` but **never logged** (the audit sanitizer drops `passport`/identity-substring keys, §22.2) and never returned in a search projection. Exact duplicate detection uses a **keyed SHA-256 `number_fingerprint`** (namespaced by document type) rather than indexing the plaintext (§11.1) — the blind-index posture the concept calls for, ready to become a true keyed fingerprint if app-level encryption lands.
- **Cross-applicant media reference is rejected:** an identity document's `image_front`/`image_back`/`file` must belong to the same applicant, verified in the service before save (`APPLICANT_MEDIA_INVALID`) — an `applicantId`/`mediaId` in the body is never trusted (§22.3).
- **Evidence media content-sniffing (no libmagic):** images are Pillow-decoded and PDFs matched on the `%PDF-` signature; the extension allow-list AND the decoded content must agree, so a spoofed extension is rejected (§21.2). Size is capped per kind (image 5 MB / document 10 MB). Files land in the same private storage as Phase 1 (no public URL; authenticated stream only) with a SHA-256 checksum and opaque name.
- **Duplicate-detection expansion** (email/phone → + name+DOB + alias + identity fingerprint) remains a privacy-safe **warning** with masked display names, never a block — a shared family phone or address must not reject a legitimate applicant (§11.1).

## §9 Phase 2b — CRM / compliance

- **All CRM children (interactions, sponsors, travel, visa, consent) + qualification assessments are admin/superadmin-only** (staff `403`, asserted by a loop). Sponsor financials, visa refusals, and consent records are the protected/highly-protected classes (§22.1); their numbers are never logged (§22.2).
- **`is_confidential` interactions** are stored and shown to admin; staff never reach interactions at all. Superadmin-only gating of confidential interactions is a future refinement (documented, not yet enforced).
- **Cross-applicant `evidence_media` is rejected** on visa/consent (same reusable ownership check as identity documents, §22.3).
- **Consent withdrawal is server-authoritative:** the client sends `status=withdrawn`; the service stamps `withdrawn_at`/`withdrawn_by` — the client cannot backdate or spoof the actor.
- **Qualification assessments are append-only/supersede** (no update/delete) — an assessment record can never be silently rewritten; a new one retires the prior current and history is preserved.
- **Assessment↔lifecycle coupling:** a move to `potential` must cite a qualification assessment *of that applicant* or carry an admin override reason — the assessment reference is verified server-side (an id from another applicant is a `404`, never honoured).

## §10 Phase 3 — application cases & assignments

- **Application cases, status transitions, history, and assignments are admin/superadmin-only** (staff `403`, asserted). A case is a distinct aggregate with its **own** `record_version` — a stale case update is a `409`, independent of the applicant's version.
- **Case status is transition-only:** a raw `PATCH` cannot change `case_status` (the field is absent from the write serializer); status moves only through the transition service, which appends immutable history and requires a reason for adverse/terminal statuses. Archived cases reject further transitions/updates.
- **Cross-applicant references are rejected server-side:** an `application_case` linked from media/sponsor/interaction, or supplied to an assignment, must belong to the same applicant (`APPLICANT_CASE_APPLICANT_MISMATCH`) — an id from the request body is never trusted (§22.3).
- **Assignee validation:** the assignment target must be an existing *active* `authenticate.User` (`APPLICANT_ASSIGNEE_INVALID`); assignment is history (new ends prior current), not a silently mutated pointer.

## §11 Phase 4 — documents

- **Staff see no document surface (§9.5):** every document endpoint (list, detail, actions, prefill, workspaces) returns a uniform **`404` — not `403`** — to any non-privileged actor, so staff cannot even infer that documents exist. Implemented by a view-level `_require_document_access` that raises the not-found error; `IsStaffOrAbove` still yields `401` for the unauthenticated.
- **Polymorphic content is validated, never trusted:** every create/update runs a JSON-safety gate (reject `NaN`/`Infinity`, non-JSON types, >256 KB / depth 12 / 2000 keys) then a per-type family validator (§12.5, §21.4). Open families (WODA/LOR/MOI/Bank) preserve unknown keys but still pass the safety gate — no executable/binary content is stored.
- **Documents are independent snapshots:** prefill composes applicant data but a persisted document is its own copy; later applicant edits never rewrite it (§12.5). Content edits advance `current_revision_number` (the immutable Phase-5 revision rows will key off it).
- **Optimistic concurrency + status integrity:** documents carry their own `record_version` (stale → `409`); `case_status`-style direct field edits are impossible because `status` is absent from the write serializer — status moves only through the ready/finalize/submit/archive actions.
- **`DELETE` archives**, never physically deletes; revision/print retention is enforced in Phase 5.

## §12 Phase 5 — revisions, print, signatures

- **The document surface's non-disclosing 404 extends to revisions, print events, signatures, and document search** — every Phase-5 endpoint returns `404` (not `403`) to staff.
- **Immutable audit trail:** `DocumentRevision` and `DocumentPrintEvent` are append-only (`save` on an existing row and `delete` both raise). A revision is snapshotted **in the same transaction** as each persisted content edit, so history can't diverge from the document. Restore replays a snapshot as a *new* revision — an old revision is never rewritten.
- **Print = evidence, not a claim:** `print_status` is limited to `rendered`/`print_initiated`/`artifact_downloaded`/`failed` — the backend never asserts physical printing (§16.2). The frontend-computed derived values (running balances, interest/tax, amount-in-words, USD) are stored verbatim so a later formula/template change can't retro-alter what was printed (§16.4).
- **Retention:** print and revision records are retained when a document/applicant is archived (§16.6) — archival is a status change, never a cascade delete. `content_checksum`/`artifact_checksum` (sha-256) fix each snapshot.
- **Signatures are archived, never deleted** (`DELETE` → `is_active=False`), so historical revisions/prints keep resolving the signatory. The image is private media (no public URL). Certificate `instructor_id`/`director_id` are verified to resolve to an **active, non-archived** signature at create/update (`APPLICANT_SIGNATURE_INVALID`) — a stale/inactive reference is rejected.

## §13 Phase 6 — duplicate merge

- **Admin/superadmin-only, reason-mandatory, one transaction:** `POST /applicants/{duplicate_id}/merge/` transfers every related record to the survivor atomically; a partial failure rolls the whole merge back.
- **Retain, never delete:** the duplicate is marked merged (`merged_into`/`merged_at`/`merged_by`, archived) with its `applicant_code` preserved — no record or history is destroyed. Document **revisions and print events survive** the merge (they move with their documents / by applicant FK). The duplicate's own lifecycle/lock history + audit trail stay attached to it.
- **Circular / repeated merges rejected:** a self-merge (`APPLICANT_MERGE_SELF`) and merging when either party is already merged (`APPLICANT_MERGE_ALREADY_MERGED`) are refused, so merge chains can't loop or double-apply.
- **Full accountability:** an immutable `ApplicantMergeRecord` captures source/dest ids, the applied field resolutions, per-relation transfer counts, actor, and reason; an `applicant.merged` audit event is emitted. Field resolutions are limited to a whitelist of scalar applicant fields — merge cannot rewrite generated/lifecycle/lock/merge columns.
- **Merged duplicates drop from active lists** (archived), so they can't be re-surfaced or re-merged accidentally, and are excluded from duplicate-detection candidates.

## §14 Deferred / out-of-scope

- Policy-engine request-path enforcement (`check_permission()` bridge).
- Malware-scan hook and app-level encryption of identity numbers; superadmin-gating of confidential interactions.
- A rigid case-status transition graph (documented deviation).

**The applicant app's planned scope (Phases 1–6) is now complete.**
