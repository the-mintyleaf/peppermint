# Lifecycle — Work

**Owner app:** `work`
**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-07-17

Authoritative specification of the work and task state machines, the allowed transitions, closure outcomes, and the service-command catalogue that drives them. Derived from `.docs/work_module_ideation.txt` (REQ) §8, §9, §20. The lifecycle is **strict and deterministic** in *what transitions are allowed*; *who* responds/reviews/escalates is dynamic (`HIERARCHY_RESOLUTION.md`). Statuses change only through named service commands with transition validation — never a generic `PATCH status=` (INV-008, REQ §35 rule 7).

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | AI (Claude Fable 5) | Initial lifecycle contract: work + task state machines, transition tables, closure outcomes, command catalogue, transition-action enum. |
| 1.1.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 3 implementation notes: `resume_changes` is issued by the `start_work` command (`changes_requested → in_progress`), not a separate endpoint (§2); `restore_work` returns work to the `from_status` captured on its `archive` transition; a `review_required` task completes via review approval (task-level `WorkReviewRound`), so `complete_task` on such a task moves it to `review_pending`; a material change (`update_work_details`) on a `closure_pending` work supersedes the approved round and reverts to `in_progress`. No change to the allowed-transition tables. |

---

## 1. Work status set

`WorkStatus` (`work/constants.py`, `DATA_CONTRACT.md` §0): `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `closure_pending`, `closed`, `archived`.

**Initial status (REQ §8.2):**
- Creator remains owner → `accepted`.
- Another actor proposed as owner → `assignment_pending` (creator stays accountable until acceptance).
- A unit is targeted → `assignment_pending` (creator stays accountable until a resolved unit recipient accepts).

## 2. Allowed work transitions

Each row is one named command; the service validates the `from`→`to` legality before writing the `WorkStatusTransition` row (`WORK_INVALID_STATUS_TRANSITION` otherwise).

| From | To | Command | Core requirement |
|---|---|---|---|
| `assignment_pending` | `accepted` | `respond_to_work_assignment` (accept) | recipient eligible + authorized |
| `assignment_pending` | `accepted` | `respond_to_work_assignment` (cancel proposal, retain creator) | creator/authorized manager; history preserved |
| `accepted` | `in_progress` | `start_work` | owner eligible |
| `in_progress` | `blocked` | `report_work_blocker` | blocker type + reason required |
| `blocked` | `in_progress` | `resolve_work_blocker` | resolution note required |
| `in_progress` | `review_pending` | `submit_work_for_review` | required tasks/evidence satisfied |
| `review_pending` | `changes_requested` | `decide_review` (changes_requested) | reviewer decision + comments |
| `changes_requested` | `in_progress` | `resume_changes` (via `update`/owner ack) | owner/assignee acknowledges |
| `review_pending` | `closure_pending` | `decide_review` (approved) | authorized reviewer |
| `in_progress` | `closure_pending` | `submit_work_for_closure` | only when `review_required=False` |
| `closure_pending` | `closed` | `close_work` | authorized closer; closure outcome required |
| `closed` | `in_progress` | `reopen_work` | separate permission + reason |
| any non-archived | `archived` | `archive_work` | separate permission + archive reason |
| `archived` | prior safe status | `restore_work` | separate permission; restoration record |

**Forbidden:** direct `in_progress` → `closed` (must pass `closure_pending`, REQ §8.3).

## 3. Task status set and transitions

`TaskStatus`: `not_started`, `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `completed`, `returned_uncompleted`, `cancelled`, `archived`.

| From | To | Command | Core requirement |
|---|---|---|---|
| `not_started` | `assignment_pending` | `assign_task` (to another actor/unit) | issuer authorized |
| `assignment_pending` | `accepted` | `respond_to_task_assignment` (accept) | recipient eligible |
| `not_started`/`accepted` | `in_progress` | `start_task` | eligible assignee |
| `in_progress` | `blocked` | `report_task_blocker` | blocker type + reason |
| `blocked` | `in_progress` | `resolve_task_blocker` | resolution note |
| `in_progress` | `review_pending` | `complete_task` (when `review_required`) | submits for review |
| `review_pending` | `completed` | `decide_review` (approved) | authorized reviewer completes |
| `review_pending` | `changes_requested` | `decide_review` (changes_requested) | reviewer comments |
| `changes_requested` | `in_progress` | `resume_changes` | assignee acknowledges |
| `in_progress` | `completed` | `complete_task` (when not `review_required`) | eligible assignee |
| `in_progress`/`accepted` | `returned_uncompleted` | `return_task_uncompleted` | reason + report + evidence + hierarchy resolution |
| any active | `cancelled` | `cancel_task` | authorized; reason |
| any non-archived | `archived` | `archive_task` | authorized; no hard delete after activity |

**Rules (REQ §9.4):** a task may be completed only by an eligible current assignee or authorized hierarchy actor; `returned_uncompleted` is never silently reassigned — the owner/resolved hierarchy actor decides revise/reassign/cancel/close; parent completion may require all mandatory children completed or explicitly waived with recorded reason.

## 4. Transition action enum

`TransitionActionType` (`work/constants.py`) — the authoritative closed set written to `WorkStatusTransition.action_type`:

`create`, `accept_assignment`, `cancel_assignment_proposal`, `start`, `block`, `unblock`, `submit_review`, `request_changes`, `resume_changes`, `approve_review`, `submit_closure`, `close`, `reopen`, `archive`, `restore`, `transfer_ownership`, `recover_owner`, `route`, `respond_route`, `assign_task`, `accept_task_assignment`, `start_task`, `block_task`, `unblock_task`, `submit_task_review`, `complete_task`, `return_task`, `cancel_task`, `archive_task`, `extend_deadline`.

## 5. Closure outcomes

`ClosureOutcome` (REQ §8.4) with per-outcome required fields enforced in `close_work` (`WORK_CLOSURE_REQUIREMENTS_UNMET` / `WORK_CLOSURE_OUTCOME_INVALID`):

| Outcome | Required |
|---|---|
| `completed` | completion summary + supporting evidence/activity |
| `partially_completed` | completed scope + unresolved scope + reason |
| `not_completed` | reason + accountability report + unresolved task summary |
| `cancelled` | cancellation authority + reason |
| `duplicate` | canonical work reference |
| `superseded` | replacement work reference |
| `out_of_scope` | routing history + scope explanation |
| `withdrawn` | withdrawing authority + reason |

Closure and successful completion are different concepts (INV-015). A reopened work retains all prior `WorkClosure` rows (`DATA_CONTRACT.md` §15).

## 6. Service-command → transition map

Full catalogue (REQ §20); each obeys the 12-step mandatory service pattern (REQ §20.7, `work_module_implementation_plan.md` §4). Commands and their allocation to build phases are in `work_module_implementation_plan.md` §4.

- **Work:** `create_work`, `update_work_details` (non-lifecycle fields only — never status/owner), `start_work`, `report_work_blocker`, `resolve_work_blocker`, `extend_work_deadline`, `submit_work_for_review`, `submit_work_for_closure`, `close_work`, `reopen_work`, `archive_work`, `restore_work`.
- **Assignment/routing:** `assign_work`, `respond_to_work_assignment`, `request_ownership_transfer`, `respond_to_ownership_transfer`, `route_work`, `respond_to_routing_request`, `recover_ineligible_owner`.
- **Task:** `create_task`, `update_task_details`, `reorder_task`, `assign_task`, `respond_to_task_assignment`, `start_task`, `report_task_blocker`, `resolve_task_blocker`, `complete_task`, `return_task_uncompleted`, `cancel_task`, `archive_task`.
- **Activity/evidence:** `record_activity`, `correct_activity`, `attach_document`, `detach_document`, `submit_evidence`, `verify_evidence`, `reject_evidence`, `supersede_evidence`.
- **Review:** `request_review`, `add_review_comment`, `decide_review`, `invalidate_review_after_material_change`.
- **Participant/stakeholder:** `add_participant`, `end_participation`, `add_external_stakeholder`, `update_external_stakeholder`, `request_external_notification`.

## 7. Invariant cross-reference

The transition rules above enforce, together with the services: INV-004 (ownership only via transfer), INV-005 (transfer needs acceptance), INV-006 (archive not delete), INV-007 (every meaningful mutation writes history), INV-008 (no arbitrary status patch), INV-014 (review-required cannot self-complete), INV-015 (closure ≠ completion). Hierarchy-dependent transitions additionally satisfy INV-009/010/011 via `HIERARCHY_RESOLUTION.md`.
