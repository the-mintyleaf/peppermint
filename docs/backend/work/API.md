# API Documentation — Work

**App:** `work`
**Version:** 1.5.0 (Phase 5 — 60 endpoints live: + dashboards. **Module complete.**)
**Base prefix:** `/api/v1/work/`
**Auth:** JWT (SimpleJWT) + service-account auth (`core`). Every endpoint is protected and denies by default. Authorization is two-stage (Stage-1 `permissions.check_permission` in the service + Stage-2 work visibility) — see `SECURITY.md` §1. No endpoint is public.
**Throttle:** DRF defaults (`user 1000/hour`, `anon 100/hour`). Expensive list/timeline endpoints (unit queue, hierarchy overview, activity timeline) declare a tighter scoped throttle when implemented — noted per endpoint.
**Access level:** Staff/authorized-actor only (no public endpoints). Health/readiness live in `core`, not here.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | AI (Claude Fable 5) | Initial planned API surface (Phase 0 — pre-code): full endpoint catalogue with permission keys, per-phase status, error codes. No endpoint implemented this session; none registered in the policy engine yet. |
| 1.1.0 | 2026-07-17 | AI (Claude Fable 5) | Phase 1: 11 endpoints implemented + registered in the policy engine (`work.work_item.{create,list,read,update_details,start,preview_hierarchy}`, `work.task.{create,list,read,update_details,reorder}`). Added `POST /items/{id}/tasks/reorder/` (`work.task.reorder`) beyond spec §22 (non-breaking); spelled `/tasks/{id}/unblock/` verbatim; added `WORK_VISIBILITY_MODE_UNSUPPORTED` (P1 visibility narrowing). |
| 1.2.0 | 2026-07-17 | AI (Claude Opus 4.8) | Phase 2: 26 execution endpoints implemented + registered (assignment/respond, ownership-transfer request/respond, route/respond, recover-owner, work block/unblock/deadline-extend, task assign/respond/start/block/unblock/complete/return-uncompleted/archive, activity create/list/correct, attachment create/list/detach). Route additions beyond spec §22 (non-breaking): `POST /items/{id}/recover-owner/`, `POST /tasks/{id}/dependencies/`, `POST /task-dependencies/{id}/end/`. Attachment creation is gated (`503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`). |
| 1.3.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 3: 14 endpoints implemented + registered (review submit/list/comment/decide, closure submit/close/reopen/archive/restore, participant add/end, stakeholder create/update/notify). Participant additions beyond spec §22 (non-breaking): `POST /items/{id}/participants/`, `POST /participants/{id}/end/`. **Behavior changes:** `POST /items/{id}/start/` now also resumes `changes_requested` work; `POST /tasks/{id}/complete/` on a `review_required` task returns `review_pending` (200) instead of `409 WORK_REVIEW_REQUIRED`. Stakeholder reads hide contact/consent fields from non-owner/creator readers (REQ §29). |
| 1.4.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 4: 4 evidence endpoints implemented + registered (`work.evidence.{create,list,verify,reject}`). Text/structured/external/generated/approval/communication evidence is accepted directly; `document_reference`/`image_reference` or any `document_id` → `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`. Supersession is done via `submit` with a `supersedes` reference (no separate endpoint); a submitter cannot verify/reject their own evidence (`WORK_EVIDENCE_INVALID`, 422). |
| 1.5.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 5 (**final**): 5 dashboard endpoints implemented + registered (`work.work_item.list_my`, `work.assignment.list_my_pending`, `work.review.list_my_pending`, `work.work_item.list_unit_queue`, `work.work_item.list_hierarchy_overview`). Added `?overdue=true` filter to `GET /items/`. Unit-scope endpoints require leadership visibility (non-leader → generic 404) and carry a `work_dashboard` scoped throttle (60/min). Neutral metrics-source facts are a documented selector (`get_work_metrics_facts`, no endpoint — feeds the future `evaluation` app, INV-018). **All 60 work endpoints are now implemented — the module is complete.** |

---

## Generic envelopes (referenced throughout)

**Success:**
```json
{ "success": true, "message": "...", "data": { ... }, "meta": {} }
```

**Error:**
```json
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

**AI debugging notes (app-wide):** Every endpoint returns the standard envelope (`core.responses`). Every mutation is a **named command** (no generic `PATCH status=`/`current_owner=` — INV-004/008). Read shapes reference `DATA_CONTRACT.md`. Every user-facing date field is paired with a `*_bs` object (`DATA_CONTRACT.md` Request/Response Contracts). Invisible resources return `404 WORK_ITEM_NOT_FOUND` (anti-enumeration, `SECURITY.md` §3). Optimistic concurrency: mutations accept an expected `aggregate_version`; stale → `409 WORK_VERSION_CONFLICT`. **Status markers below:** `P1`–`P5` = build phase (`work_module_implementation_plan.md`). **All 60 endpoints (every row below) are implemented, routed under `/api/v1/work/`, and registered in the policy engine as of v1.5.0 — the module is complete.** Task `dependencies` endpoints are listed under §3 business rules; participant endpoints (`/items/{id}/participants/`, `/participants/{id}/end/`) were added beyond spec §22. `GET /items/` accepts `?status`, `?priority`, `?responsible_unit`, `?fiscal_year=YYYY/YY`, and `?overdue=true`.

---

## 1. Work items

### 1.1 Create work — `POST /items/` — P1
**Policy key:** `work.work_item.create` (risk: medium)
**Request:** `{ organization, responsible_unit, title_np (required), title_en?, objective (required), description?, priority?, visibility_mode?, sensitivity_level?, review_required?, due_at?, proposed_owner?, target_unit?, idempotency_key }`
**Response:** `DATA_CONTRACT.md §1` (the `WorkItem`).
**Business rules:** creator becomes owner (status `accepted`) unless `proposed_owner`/`target_unit` given (status `assignment_pending`, REQ §8.2); `reference_number` generated via `WorkReferenceSequence` under `select_for_update`; auto-populates `title_romanized`; writes `create` transition + `work_created` outbox row.
**Error codes:** `WORK_PERMISSION_DENIED` (403), `WORK_OWNER_INELIGIBLE` (422), `WORK_IDEMPOTENCY_CONFLICT` (409).

### 1.2 List visible work — `GET /items/` — P1
**Policy key:** `work.work_item.list` (risk: low)
**Response:** paginated list of `WorkItem` filtered by the visibility selector (`SECURITY.md` §1/§4).
**Query access pattern:** visibility-aware selector with `select_related(organization, responsible_unit, current_owner)`; filters `?status=`, `?priority=`, `?responsible_unit=`, `?fiscal_year=YYYY/YY` (BS, via `core.nepal.calendar.fiscal_year_gregorian_range`); stable ordering `-updated_at`.

### 1.3 Read work — `GET /items/{id}/` — P1
**Policy key:** `work.work_item.read` (risk: low)
**Response:** `WorkItem` detail. Invisible → `404 WORK_ITEM_NOT_FOUND` (anti-enumeration).

### 1.4 Update non-lifecycle details — `PATCH /items/{id}/details/` — P1
**Policy key:** `work.work_item.update_details` (risk: low)
**Business rules:** descriptive fields only (title/objective/description/priority/due-fields per rule); never status/owner/unit (`SECURITY.md` §5).

### 1.5 Start / block / unblock / extend-deadline — P1 (start) / P2
- `POST /items/{id}/start/` → `work.work_item.start` (medium) — P1
- `POST /items/{id}/block/` → `work.work_item.block` (low) — P2 — body: blocker type + reason (`WorkBlockerRecord`)
- `POST /items/{id}/unblock/` → `work.work_item.unblock` (low) — P2 — resolution note required
- `POST /items/{id}/deadline/extend/` → `work.work_item.extend_deadline` (low) — P2 — reason + old/new due history (`WORK_DEADLINE_EXTENSION_REASON_REQUIRED`)

### 1.6 Review / closure lifecycle — P3 (P1 for `start`)
- `POST /items/{id}/review/submit/` → `work.work_item.request_review` (medium) — P3
- `POST /items/{id}/closure/submit/` → `work.work_item.submit_closure` (medium) — P3
- `POST /items/{id}/close/` → `work.work_item.close` (high) — P3 — closure outcome required (`WORK_CLOSURE_REQUIREMENTS_UNMET`)
- `POST /items/{id}/reopen/` → `work.work_item.reopen` (high) — P3 — separate permission + reason
- `POST /items/{id}/archive/` → `work.work_item.archive` (high) — P3
- `POST /items/{id}/restore/` → `work.work_item.restore` (high) — P3

## 2. Assignment & routing — P2 (hierarchy-preview P1)

| Action | Route | Policy key | Risk |
|---|---|---|---|
| Assign work | `POST /items/{id}/assignments/` | `work.work_item.assign` | medium |
| Respond to assignment | `POST /assignments/{id}/respond/` | `work.work_item.respond_assignment` | medium |
| Request ownership transfer | `POST /items/{id}/ownership-transfers/` | `work.work_item.transfer_ownership` | high |
| Respond to transfer | `POST /ownership-transfers/{id}/respond/` | `work.work_item.respond_ownership_transfer` | high |
| Route work | `POST /items/{id}/routes/` | `work.work_item.route` | medium |
| Respond to route | `POST /routes/{id}/respond/` | `work.work_item.respond_route` | medium |
| Recover ineligible owner | `POST /items/{id}/recover-owner/` | `work.work_item.recover_owner` | high |
| Preview hierarchy | `GET /items/{id}/hierarchy-preview/` | `work.work_item.preview_hierarchy` | low (P1) |

**Business rules:** transfer acceptance is atomic + idempotent (REQ §10.5); routing detects loops/hop-limit — an immediate-reverse route needs an `override_reason` (`WORK_ROUTING_LOOP_DETECTED`); past `WORK_MAX_ROUTING_HOPS` a route **escalates** to the nearest common ancestor head (status `escalated`, `HIERARCHY_RESOLUTION.md` §9); unresolved target → `WORK_HIERARCHY_TARGET_UNRESOLVED`. `recover-owner` is valid only when the current owner is ineligible (`WORK_OWNER_REQUIRED` otherwise). `recover-owner` route added beyond spec §22 (non-breaking). `hierarchy-preview` returns `HierarchyPreview` (`DATA_CONTRACT.md` Request/Response Contracts), no mutation.

## 3. Tasks — P1 (create/read/list/details) / P2 (execution)

| Action | Route | Policy key | Risk | Phase |
|---|---|---|---|---|
| Create task | `POST /items/{id}/tasks/` | `work.task.create` | medium | P1 |
| List tasks (tree) | `GET /items/{id}/tasks/` | `work.task.list` | low | P1 |
| Read task | `GET /tasks/{id}/` | `work.task.read` | low | P1 |
| Update details | `PATCH /tasks/{id}/details/` | `work.task.update_details` | low | P1 |
| Reorder task | `POST /items/{id}/tasks/reorder/` | `work.task.reorder` | medium | P1 |
| Assign task | `POST /tasks/{id}/assignments/` | `work.task.assign` | medium | P2 |
| Respond assignment | `POST /task-assignments/{id}/respond/` | `work.task.respond_assignment` | medium | P2 |
| Start task | `POST /tasks/{id}/start/` | `work.task.start` | low | P2 |
| Block task | `POST /tasks/{id}/block/` | `work.task.block` | low | P2 |
| Unblock task | `POST /tasks/{id}/unblock/` | `work.task.unblock` | low | P2 |
| Complete task | `POST /tasks/{id}/complete/` | `work.task.complete` | medium | P2 |
| Return uncompleted | `POST /tasks/{id}/return-uncompleted/` | `work.task.return_uncompleted` | medium | P2 |
| Archive task | `POST /tasks/{id}/archive/` | `work.task.archive` | medium | P2 |

**Task dependencies (P2, added beyond spec §22):** `POST /tasks/{id}/dependencies/` → `work.task.add_dependency` (medium; body `{ source_task, target_task, dependency_type, reason? }`, cycle-checked → `WORK_TASK_DEPENDENCY_CYCLE`); `POST /task-dependencies/{id}/end/` → `work.task.end_dependency` (low; soft-removes via `is_active=False`, never hard-deleted).

**Business rules:** parent/child same work; no cycle (`WORK_TASK_CYCLE_DETECTED`); depth ≤ 5 (`WORK_TASK_DEPTH_EXCEEDED`); create auto-assigns `sequence = max sibling + 10` when omitted; `reorder` (body: `{ "task": <uuid>, "new_sequence": <int>, "expected_version"? }`) locks the sibling group and maintains stable `(work, parent_task, sequence)` ordering; a `review_required` task cannot self-complete in P2 (`WORK_REVIEW_REQUIRED`, until P3 review rounds exist); return-uncompleted requires reason + report + hierarchy resolution (REQ §9.4).
**Query access pattern (tree):** single tree selector with `prefetch_related` on children, ordered by `sequence`; no N+1 (REQ §21).

## 4. Activity, attachments, evidence, review, stakeholders

| Action | Route | Policy key | Risk | Phase |
|---|---|---|---|---|
| Record activity | `POST /items/{id}/activities/` | `work.activity.create` | low | P2 |
| List activities | `GET /items/{id}/activities/` | `work.activity.list` | low | P2 |
| Correct activity | `POST /activities/{id}/corrections/` | `work.activity.correct` | low | P2 |
| Attach document | `POST /items/{id}/attachments/` | `work.attachment.create` | medium | P2 (gated) |
| List attachments | `GET /items/{id}/attachments/` | `work.attachment.list` | low | P2 |
| Detach document | `POST /attachments/{id}/detach/` | `work.attachment.detach` | medium | P2 |
| Submit evidence | `POST /items/{id}/evidence/` | `work.evidence.create` | medium | P4 |
| List evidence | `GET /items/{id}/evidence/` | `work.evidence.list` | low | P4 |
| Verify evidence | `POST /evidence/{id}/verify/` | `work.evidence.verify` | medium | P4 |
| Reject evidence | `POST /evidence/{id}/reject/` | `work.evidence.reject` | medium | P4 |
| List reviews | `GET /items/{id}/reviews/` | `work.review.list` | low | P3 |
| Add review comment | `POST /reviews/{id}/comments/` | `work.review.comment` | low | P3 |
| Decide review | `POST /reviews/{id}/decide/` | `work.review.decide` | high | P3 |
| List reviews | `GET /items/{id}/reviews/` | `work.review.list` | low | P3 |
| Add stakeholder | `POST /items/{id}/stakeholders/` | `work.stakeholder.create` | medium | P3 |
| Update stakeholder | `PATCH /stakeholders/{id}/` | `work.stakeholder.update` | medium | P3 |
| Notify stakeholder | `POST /stakeholders/{id}/notify/` | `work.stakeholder.notify` | high | P3 |
| Add participant | `POST /items/{id}/participants/` | `work.participant.add` | medium | P3 (added beyond spec §22) |
| End participation | `POST /participants/{id}/end/` | `work.participant.end` | low | P3 (added beyond spec §22) |

**Business rules:** activities immutable after submission (`WORK_ACTIVITY_IMMUTABLE`) — corrections create new entries; **evidence** — text/structured/external/generated/approval/communication types accepted directly, `document_reference`/`image_reference` (or any `document_id`) gated (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`); supersede via `submit` with a `supersedes` id (flips the prior row to `superseded`, `WORK_EVIDENCE_ALREADY_RESOLVED` if already retired); verify/reject only from `submitted`/`pending_verification` (`WORK_EVIDENCE_ALREADY_RESOLVED`), and a submitter cannot verify/reject their own evidence (`WORK_EVIDENCE_INVALID`); verification accepts the submission, it does not approve the work (REQ §12.3); file-backed attachments gated (`DOCUMENT_INTEGRATION.md` §2); review decisions apply only to the frozen snapshot (`WORK_REVIEW_SNAPSHOT_STALE`), self-review forbidden (`WORK_SELF_REVIEW_FORBIDDEN`); reviewer resolution = explicit → reviewer-role participant → hierarchy; stakeholder notify sends approved templates only (`WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED`, REQ §15.3) and stakeholder contact/consent fields are hidden from non-owner/creator readers (REQ §29); **participation establishes visibility relevance but never permission (INV-016)** — a participant still needs the Stage-1 permission to read via the API.
**Query access pattern:** activity/attachment/evidence lists filter nested records by `visibility_classification` **at the query layer** (`SECURITY.md` §4) — never post-filter in Python; timeline lists use stable ordering and switch to cursor pagination past the REQ §30 threshold.

## 5. Query / dashboard — P5 (live)

| Action | Route | Policy key | Risk |
|---|---|---|---|
| My active work | `GET /my/active/` | `work.work_item.list_my` | low |
| My pending assignments | `GET /my/pending-assignments/` | `work.assignment.list_my_pending` | low |
| My pending reviews | `GET /my/pending-reviews/` | `work.review.list_my_pending` | low |
| Unit queue | `GET /units/{unit_id}/queue/` | `work.work_item.list_unit_queue` | low (scoped throttle) |
| Unit hierarchy overview | `GET /units/{unit_id}/hierarchy-overview/` | `work.work_item.list_hierarchy_overview` | low (scoped throttle) |

**Business rules:** the three `/my/` endpoints are self-scoped (the actor is the filter — Stage-2 is inherent). The two `/units/{id}/` endpoints require the caller to have leadership visibility over the unit (`_leadership_unit_ids`) or be a superuser — otherwise the generic `404 WORK_ITEM_NOT_FOUND` (anti-enumeration), never a distinguishing 403; both carry a `work_dashboard` scoped throttle (`60/min`). Unit queue returns `{ "pending_assignments": [...], "pending_routes": [...] }` (unpaginated, unit-bounded). Neutral metrics facts are exposed as a selector `get_work_metrics_facts(work)` — no endpoint — and feed the future `evaluation` app; the module computes durations/counts only and never labels an actor/unit (INV-018, `DATA_CONTRACT.md` Request/Response Contracts).
**Query access pattern:** hierarchy overview reuses `organization.get_unit_descendants` (closure table) — one closure query + one work query, zero per-work hierarchy lookups (REQ §30); unit queue exposes pending unit-targeted assignments + pending/escalated routes to authorized unit leadership (REQ §6.7).

---

## Error code reference

All codes are defined in `work/constants.py`. See `SECURITY.md` §3 for the anti-enumeration rationale (invisible resources use the generic not-found code, not a specific "denied" code).

| Code | HTTP | Notes |
|---|---|---|
| `WORK_ITEM_NOT_FOUND` | 404 | Unknown or invisible work (anti-enumeration) |
| `WORK_TASK_NOT_FOUND` | 404 | Unknown/invisible task |
| `WORK_ASSIGNMENT_NOT_FOUND` | 404 | — |
| `WORK_REVIEW_NOT_FOUND` | 404 | — |
| `WORK_EVIDENCE_NOT_FOUND` | 404 | — |
| `WORK_STAKEHOLDER_NOT_FOUND` | 404 | — |
| `WORK_ATTACHMENT_NOT_FOUND` | 404 | — |
| `WORK_PERMISSION_DENIED` | 403 | Stage-1 permission denied |
| `WORK_RESOURCE_NOT_VISIBLE` | 403/404 | Stage-2 visibility (defaults to 404 per anti-enumeration) |
| `WORK_SENSITIVITY_ACCESS_DENIED` | 403 | Sensitivity axis failed |
| `WORK_INVALID_STATUS_TRANSITION` | 409 | Illegal lifecycle transition |
| `WORK_VERSION_CONFLICT` | 409 | Stale `aggregate_version` |
| `WORK_IDEMPOTENCY_CONFLICT` | 409 | Same key, different payload |
| `WORK_OWNER_REQUIRED` | 422 | Active work would be ownerless |
| `WORK_OWNER_INELIGIBLE` | 422 | Proposed/current owner not eligible |
| `WORK_ASSIGNMENT_ALREADY_RESOLVED` | 409 | Double response |
| `WORK_ASSIGNMENT_TARGET_INVALID` | 422 | Bad actor/unit/position target combo |
| `WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED` | 409 | — |
| `WORK_ROUTING_LOOP_DETECTED` | 409 | Immediate reverse / repeated route |
| `WORK_ROUTING_HOP_LIMIT_EXCEEDED` | 409 | Past `WORK_MAX_ROUTING_HOPS` |
| `WORK_HIERARCHY_TARGET_UNRESOLVED` | 409 | No eligible hierarchy target |
| `WORK_HIERARCHY_CONTEXT_INVALID` | 422 | Bad org/unit context |
| `WORK_TASK_PARENT_INVALID` | 422 | Parent outside work |
| `WORK_TASK_CYCLE_DETECTED` | 409 | Task ancestry cycle |
| `WORK_TASK_DEPTH_EXCEEDED` | 422 | Past `WORK_MAX_TASK_DEPTH` |
| `WORK_TASK_DEPENDENCY_CYCLE` | 409 | Circular blocking dependency |
| `WORK_REVIEW_REQUIRED` | 409 | Review-required work cannot self-complete |
| `WORK_REVIEWER_INELIGIBLE` | 422 | Resolved reviewer not eligible |
| `WORK_SELF_REVIEW_FORBIDDEN` | 403 | Reviewer authored the submission |
| `WORK_REVIEW_SNAPSHOT_STALE` | 409 | Material change after snapshot |
| `WORK_CLOSURE_REQUIREMENTS_UNMET` | 422 | Outcome-specific fields missing |
| `WORK_CLOSURE_OUTCOME_INVALID` | 422 | Unknown/invalid outcome |
| `WORK_ARCHIVED` | 409 | Action on archived work |
| `WORK_EVIDENCE_INVALID` | 422 | — |
| `WORK_EVIDENCE_ALREADY_RESOLVED` | 409 | Re-verify resolved evidence |
| `WORK_ATTACHMENT_INVALID` | 422 | — |
| `WORK_ATTACHMENT_ALREADY_DETACHED` | 409 | — |
| `WORK_ACTIVITY_IMMUTABLE` | 409 | Edit submitted activity |
| `WORK_DEADLINE_EXTENSION_REASON_REQUIRED` | 422 | — |
| `WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED` | 403 | Notify without approved template |
| `WORK_FILE_INTEGRATION_UNAVAILABLE` | 503 | File path pre-document-foundation |
| `WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` | 503 | File-backed evidence/attachment gated |
| `WORK_VISIBILITY_MODE_UNSUPPORTED` | 422 | Create with `restricted`/`confidential`/`explicit` visibility (P1 narrowing; added beyond spec §28) |
