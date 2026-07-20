# Events — Work

**Owner app:** `work`
**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-07-17

The domain-event contract for the `work` module. `WorkOutboxEvent` (`DATA_CONTRACT.md` §17) is the **durable domain-event envelope for authoritative work mutations in this build** — not a future-only optimization (REQ §16.3, §19.15). A standalone `events` ledger is deferred (`work_module_implementation_plan.md` §1); when it exists, the outbox becomes transport/publication state and the ledger becomes the long-term store (REQ §16.5). Until then, the outbox is the authoritative envelope. Derived from REQ §16.

---

## Change History

| Version | Date       | Author               | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-17 | AI (Claude Fable 5)  | Initial events contract: outbox envelope, 24 work event types, states, transactional-outbox rule, retry/sweeper semantics, deferred-events-ledger projection note.                                                                                                                                                                                                                                                                                                                       |
| 1.1.0   | 2026-07-17 | AI (Claude Fable 5)  | Phase 1: `WorkOutboxEvent` model implemented; `work_created` and `work_started` rows are written synchronously in the mutation transaction. The Celery consumer + beat sweeper (`tasks.py`) are deferred to Phase 2 — Phase 1 rows accumulate durably as `pending` (the outbox is the durable contract, not the dispatch).                                                                                                                                                               |
| 1.2.0   | 2026-07-17 | AI (Claude Opus 4.8) | Phase 2: the consumer (`work.tasks.dispatch_outbox_event`), sweeper, and overdue detector are live; `transaction.on_commit()` now schedules dispatch after every mutation. Retry/backoff (max 5, exponential) → `failed`, then `dead_lettered`; the sweeper requeues stale-locked/pending rows. Many more event types are now emitted (assignment/transfer/routing/blocker/deadline). The consumer performs a structured log-only side effect until a `notifications` consumer attaches. |
| 1.3.0   | 2026-07-18 | AI (Claude Opus 4.8) | Phase 3: the review/closure/external event types are now emitted — `work_review_requested`, `work_changes_requested`, `work_review_approved`, `work_closure_submitted`, `work_closed`, `work_reopened`, `work_archived`, `work_restored`, and `external_notification_required`. The `external_notification_required` payload carries only a curated template reference + ids, never internal content (REQ §15.3).                                                                        |

---

## 1. Domain boundary

`work` owns _what a work event means_. A future `events` module would own _how durable event history is stored and published_ (REQ §16.5, §16.6.3). `WorkStatusTransition` (`DATA_CONTRACT.md` §12) remains the authoritative **domain history**; a `WorkOutboxEvent` is the integration-grade **event envelope** derived from the same mutation. They are intentionally different models — both required, solving different problems. No downstream consumer (notifications, search, analytics, audit, AI) may redefine an event's business meaning (REQ §16.6.9).

## 2. Event types (REQ §16.2)

`WorkEventType` (`work/constants.py`) — the 24 mandatory work events:

`work_created`, `work_assignment_requested`, `work_assignment_accepted`, `work_assignment_rejected`, `work_clarification_requested`, `work_routing_requested`, `work_routing_escalated`, `work_ownership_transfer_requested`, `work_ownership_transfer_accepted`, `work_ownership_transfer_rejected`, `work_started`, `work_blocked`, `work_unblocked`, `work_deadline_approaching`, `work_deadline_missed`, `work_review_requested`, `work_changes_requested`, `work_review_approved`, `work_closure_submitted`, `work_closed`, `work_reopened`, `work_archived`, `work_restored`, `external_notification_required`.

Task-equivalent events are emitted where applicable (e.g. task assignment/blocker/completion) with `aggregate_type=work_task`.

## 3. Envelope schema

`WorkOutboxEvent` (`DATA_CONTRACT.md` §17) carries the minimum envelope REQ §16.6.4 requires: `id` (event id), `event_type`, `schema_version`, `aggregate_type`, `aggregate_id`, `aggregate_version`, `organization`, `organization_unit`, `actor`, `payload` (JSON, documented + schema-versioned), `idempotency_key` (unique), `status`, `attempts`, `available_at`, `locked_at`, `processed_at`, `last_error_code`, `last_error_message`, `created_at`. Payloads carry no confidential work text, contact details, tokens, or raw files (REQ §29); they carry ids + safe metadata that a consumer re-reads from source under its own authorization.

**Payload versioning:** every payload is `schema_version`-tagged so future projections evolve safely (REQ §16.6.6). A payload shape change bumps `schema_version`; consumers branch on it.

## 4. States (REQ §19.15 / §16.6.5)

`OutboxStatus`: `pending` → `processing` → `processed`, with `failed` and `dead_lettered` terminal-ish branches. Events are append-only; a failed publish never erases the row; dead-lettered rows stay queryable and inspectable (REQ §16.6.6).

## 5. Transactional-outbox rule (REQ §16.3, §27.4)

Every important work mutation atomically creates, in **one PostgreSQL transaction**: the work-state change + the work-history record (`WorkStatusTransition`) + the hierarchy snapshot (when hierarchy-driven) + the `WorkOutboxEvent` row. The database transaction is the authority boundary:

- transaction rolls back → none of the rows exist;
- transaction commits → the durable envelope exists even if downstream delivery is delayed or unavailable.

**No external network call — email, SMS, HTTP, OCR, or AI — occurs inside the work transaction** (REQ §27.4, CLAUDE.md §15). Dispatch is scheduled via `transaction.on_commit()`, which is a **dispatch trigger only, never the source of durability** (REQ §16.4). Redis Pub/Sub is forbidden for authoritative events (at-most-once loses messages) — the durable path is the PostgreSQL outbox + idempotent consumer (REQ §16.7).

## 6. Consumption & retry (REQ §16.4, §16.6.8)

Consumer and sweeper are Celery tasks (`work/tasks.py`, introduced Phase 2 — see `ASYNC_PROCESSING.md`):

- a worker consumes committed `pending` rows idempotently, sets `processing` + `locked_at`, performs only retryable side effects/projections, then `processed`;
- the worker **never mutates authoritative work state** (REQ §19.15, §16.6.8) — only publish/retry/project/reconcile;
- on failure: increment `attempts`, set `available_at` with backoff, `failed`; past a max-attempt threshold → `dead_lettered`;
- a scheduled sweeper requeues rows stuck in `processing` past a stale-lock timeout, or `pending` past `available_at`, that were abandoned by a crashed worker/broker outage. The sweeper is idempotent and authoritative-state-read-only.

## 7. Deferred events-ledger projection

When a standalone `events` module is built (its own requirement doc + session, REQ §16.6): every important work mutation additionally writes a durable `DomainEvent` row in `events` in the same transaction, and `WorkOutboxEvent` demotes to transport/publication state (REQ §16.5, §16.6.7). The projection preserves correlation/causation ids and schema versions. Until then, this contract governs; no half-built `events` FK is added prematurely (REQ §24.9-style rule).

## 8. Downstream consumers (REQ §16.6.9)

The committed event stream may later feed notifications, search, analytics, projection stores, audit interpretation, and AI reasoning. Each consumes read-only and re-authorizes independently; none redefines event meaning. `external_notification_required` in particular carries only an approved-template/curated-message reference — never internal logs, hierarchy, or review content (REQ §15.3).
