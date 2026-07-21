# Document Integration — Work

**Owner app:** `work`
**Version:** 1.1.0
**Status:** Active
**Created:** 2026-07-17

The document/file integration contract for the `work` module. The repository has **no standalone `documents` app**, so file-backed work evidence and upload endpoints are **gated off** until a canonical document/file foundation exists (REQ §12.5, §16.9). Work stores only opaque `document_id` references and its own provenance/linkage records — never raw file paths, blobs, or a hidden file lake (REQ §35 rule 14). Derived from REQ §12, §16.9, §24.8.

---

## Change History

| Version | Date       | Author               | Summary                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-17 | AI (Claude Fable 5)  | Initial document-integration contract: provenance/linkage rules, disabled-upload gate, future document-foundation minimums.                                                                                                                                                                                                                                                        |
| 1.1.0   | 2026-07-18 | AI (Claude Opus 4.8) | Phase 4: text/structured/external/generated/approval/communication evidence is now live (`WorkEvidence`); the §2 gate matrix confirms `document_reference`/`image_reference` and any `document_id` submission stay gated (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`), and `WorkEvidenceLink` remains schema-only until the document foundation exists. No change to the gate itself. |

---

## 1. Ownership split

- **Work owns:** evidence _purpose_, attachment _provenance_, and _linkage_ — `WorkAttachment` (`DATA_CONTRACT.md` §18), `WorkEvidence` (§19), `WorkEvidenceLink` (§20).
- **The future document foundation owns:** file truth — storage zone/path, original + safe filename, MIME + detected MIME, size, SHA-256 checksum, uploaded-by/at, classification, retention, malware-scan status, verification status, source type (REQ §16.9). It must not own work semantics, evidence meaning, review/assignment authority, permissions, hierarchy, or audit interpretation.

Work references documents by **opaque `document_id` / `document_version_id` only**. It never stores storage paths, binary blobs, or an uncontrolled `FileField` (REQ §16.9).

## 2. What is enabled now vs. gated

| Capability                                    | Status in initial build                                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text evidence (`text_statement`)              | Enabled (Phase 4)                                                                                                                                    |
| Structured evidence (`structured_payload`)    | Enabled (Phase 4)                                                                                                                                    |
| External-reference evidence                   | Enabled (Phase 4)                                                                                                                                    |
| File-backed evidence (`document_id` set)      | **Gated** → `WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`                                                                                                  |
| Attachment ledger rows referencing a document | Schema present (Phase 2); creation gated until the foundation exists → `WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` / `WORK_FILE_INTEGRATION_UNAVAILABLE` |
| Upload/download endpoints                     | Not built; disabled until the foundation exists                                                                                                      |

The gate is a documented service-level check, not a silent omission — attempting file-backed evidence returns a stable error code (`DATA_CONTRACT.md` §19/§20, error catalogue in `API.md`).

## 3. Attachment ledger rules (REQ §12.6)

`WorkAttachment` is a **provenance history**, not file storage. Every attach/detach/reference to a work item, task, activity, evidence, review round, or closure creates a history-preserving row answering: which work, which `document_id`/`document_version_id`, who attached/detached, when, why, what role, what visibility class, primary vs. supplementary, and the checksum/MIME/size/source-service snapshot observed at association time. Detaching sets `detached_at` (never deletes); reattaching creates a new row (never reuses old history); the historical link + security snapshot survive even if the document is later revoked/deleted/superseded (REQ §12.7).

## 4. Document-service minimums the foundation must meet (REQ §12.7, §24.8)

Before file-backed evidence/upload is enabled, the document foundation must enforce: authenticated + authorized upload/download; immutable, attributable document versioning; encryption at rest; checksum verification on ingest and retrieval; MIME/content-type validation; malware scan before release; document-level ACL + audit logging; retention + legal-hold; redaction/restricted-view where policy requires; no raw filesystem paths exposed to work or clients; no storage-engine assumptions inside work; no deletion that erases accountability history. Document-level ACLs must be **narrower or equal** to work-level visibility, never broader (REQ §24.8).

## 5. Access-separation rule (REQ §14.4)

Work access does **not** imply document download access. A caller visible on a work item may still be denied a narrower-classified attachment; the attachment carries its own `visibility_classification` and document-service reference, and the document service remains the final authority on raw-file retrieval. Nested attachment/evidence lists are filtered at the query layer by a visibility selector, never serialized-then-filtered in Python (`SECURITY.md` §4).

## 6. When the foundation lands

The foundation may be a standalone `documents` module or a separate local file-foundation service — but exactly one canonical foundation, domain-neutral and project-wide (REQ §16.9), local-first (CLAUDE.md §37). At that point: flip the gate, enable `WorkEvidenceLink`/file-backed `WorkEvidence`, wire attachment creation to validated `document_id`s, and update this doc + `DATA_CONTRACT.md` §18–20. No second file-storage architecture is ever created inside `work` (REQ §35 rule 14).
