# Security — Work

**Owner app:** `work`
**Version:** 1.2.0
**Status:** Active
**Created:** 2026-07-17

This document is required per project rulebook §19 because `work` makes its own non-trivial security-relevant decisions beyond the project's standard auth pattern: a two-stage authorization model, five resource visibility modes, an anti-enumeration rule, query-layer data-level filtering, and mass-assignment protection on authority fields. Derived from REQ §14, §29.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | AI (Claude Fable 5) | Initial security contract: two-stage authorization, visibility modes, anti-enumeration, data-level filtering, mass-assignment protection, logging rules. |
| 1.1.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 3: active `WorkParticipant` rows now feed Stage-2 visibility (both the list query and detail check) — participation grants visibility relevance, never permission (INV-016), so a participant without the Stage-1 permission still gets `403` on a protected read, not `200`. External-stakeholder contact/consent fields (`approved_contact_channels`, `consent_metadata`, `notification_preference`) are serialized only for the work owner/creator/superuser; other readers receive the non-privileged shape (field-level access control, REQ §29). External notifications carry only a curated template reference + ids (REQ §15.3). |
| 1.2.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 5: the two unit-scope dashboard endpoints (`/units/{id}/queue/`, `/units/{id}/hierarchy-overview/`) require the caller to hold leadership visibility over the unit (`selectors.actor_leads_unit`) or be a superuser — a non-leader receives the generic `404` (anti-enumeration, §3), never a distinguishing 403, and both carry a `work_dashboard` scoped throttle. The three `/my/` endpoints are self-scoped (the actor is the query filter). Evidence separation-of-duties (a submitter cannot verify/reject their own evidence) is a resource rule enforced even for superusers. |

---

## 1. Two-stage authorization (REQ §14.1)

Access to any work resource requires **both** stages to pass; deny by default (REQ §29).

**Stage 1 — Action authority.** The work **service** calls `permissions.services.check_permission(subject, permission_key, context={"organization_id": …, "organization_unit_id": …})` and proceeds only on `allowed=True`. This is the user-approved §28 consumption of the permissions decision engine, scoped to `work` (`work_module_implementation_plan.md` §1; mirrored in `permissions/docs/DATA_CONTRACT.md`). Scope ids come from the resolved work item / target unit, never from client-supplied ids without authoritative lookup (REQ §29). `work` writes no roles/grants/denials and re-implements no decision logic.

**Stage 2 — Resource visibility & lifecycle authority.** The work module then verifies the specific work item is visible/actionable via a visibility-aware selector: ownership, assignment, participation, hierarchy relationship, sensitivity, and lifecycle preconditions (REQ §14.5). Relationship establishes relevance, **not** permission (INV-016); broad permission does **not** expose every row (INV-017).

Authorization order (REQ §14.5): authenticate → resolve org/unit context → Stage-1 permission → load via visibility-aware selector → sensitivity check → relationship/hierarchy check → lifecycle precondition → execute service transaction. Failures map to `403` (permission/sensitivity/authority), `404`/`403` (visibility, per §3), `409` (lifecycle conflict).

## 2. Visibility modes (REQ §14.3)

`VisibilityMode` on `WorkItem` (`DATA_CONTRACT.md` §1):

| Mode | Behavior |
|---|---|
| `organizational` | Eligible participants, responsible-unit heads, and ancestor heads per permission scope |
| `participants_only` | Direct participants + specifically authorized hierarchy/audit actors |
| `restricted` | Relationship **plus** elevated restricted-work permission |
| `confidential` | Confidential-work permission **and** need-to-know relationship; hierarchy alone is insufficient |
| `explicit` | Requires a future explicit resource-access contract; **not improvised in phase 1** — gated |

Sensitivity (`SensitivityLevel`) is an independent axis; a sensitivity check can deny even a visible resource (`WORK_SENSITIVITY_ACCESS_DENIED`).

## 3. Anti-enumeration (REQ §14.6, §29)

For a work resource not visible to the caller, return the **same not-found response** used for an unknown UUID (`WORK_ITEM_NOT_FOUND`, `404`) — list and detail must not differ in a way that reveals existence — **unless** the caller holds a specific audit/debug permission that permits visibility into denial reasons. This is one consistent documented behavior across every work endpoint.

## 4. Data-level visibility filtering (REQ §14.4)

Evidence, activity, attachments, and review comments may be **more restrictive** than the parent work item. Each such record stores its own `visibility_classification`. A response serializer must filter nested records through a visibility selector **at the query layer** — never serialize all related objects and filter afterward in Python (REQ §14.4, §29). Parent work access never auto-exposes a confidential attachment/note; document download remains gated by the document service (`DOCUMENT_INTEGRATION.md` §5).

## 5. Mass-assignment protection (REQ §29)

Serializers use explicit read/write fields. The following are never client-writable via generic create/update — they change only through named services: `created_by`, `current_owner`, `responsible_unit`, `status`, `reference_number`, `aggregate_version`, `is_reassignment_required`, closure `outcome`, review `decision`, evidence `verification_status`, and all audit/history fields. Generic `PATCH status=`/`current_owner=` is forbidden (INV-004, INV-008).

## 6. Concurrency & idempotency as integrity controls (REQ §27)

`aggregate_version` optimistic concurrency (stale mutation → `409 WORK_VERSION_CONFLICT`); `select_for_update` row locks on acceptance/transfer/routing response/status transition/review decision/closure/reopen/archive/restore/task-reorder; idempotency keys (persisted in PostgreSQL) mandatory for create-work, assignment/transfer acceptance, review decision, closure, external-notification request, and outbox processing (same key + same payload → replay; different payload → `WORK_IDEMPOTENCY_CONFLICT`).

## 7. Logging & privacy (REQ §29, CLAUDE.md §17)

Never log confidential work text, evidence content, external-stakeholder contact details, tokens, or raw files. Log request id, actor id, action key, work id, result code, and safe metadata only. Outbox `last_error_message`/`last_error_code` carry no sensitive data. External stakeholders never automatically receive internal activity logs, hierarchy info, review comments, internal evidence, personnel info, or authorization explanations (REQ §15.3) — only approved templates/curated messages.

## 8. Background-task authority (REQ §29, CLAUDE.md §15)

No Celery/background task mutates authoritative work state or bypasses the synchronous service + PostgreSQL transaction (`ASYNC_PROCESSING.md`, `EVENTS.md` §6). A task that acts carries an attributable system/service actor (`authenticate.User.actor_type` in `system`/`ai`) and permission context; it never makes an external network call inside a DB transaction.

## 9. Participant visibility & stakeholder field-level protection (Phase 3, REQ §14/§15/§29)

**Participants feed Stage-2 visibility, not permission (INV-016).** An active
`WorkParticipant` (row with `active_to IS NULL`) makes the work item visible to
that actor — both the visible-work list query (`selectors._direct_relationship_q`)
and the detail check (`selectors._is_work_visible`) include it. This is Stage-2
relevance only: the actor still needs the Stage-1 permission key to act. A
participant without `work.work_item.read` therefore receives `403` on the detail
endpoint (permission failed) — never `200` — while a wholly unrelated actor
receives `404` (visibility failed, anti-enumeration). Ending a participation
(`active_to` set) immediately revokes the visibility.

**External-stakeholder contact/consent data is field-level access-controlled.**
`approved_contact_channels`, `consent_metadata`, and `notification_preference`
are serialized only for the work owner, creator, or a superuser
(`WorkStakeholderPrivilegedReadSerializer`); every other reader receives
`WorkStakeholderReadSerializer`, which omits those fields entirely. External
notifications never carry internal content: the `external_notification_required`
outbox payload holds only a curated `template_reference`, the stakeholder id, and
the approver id (REQ §15.3), and `notify` is refused unless the stakeholder is
`is_notification_eligible` with an approved template + approver
(`WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED`).
