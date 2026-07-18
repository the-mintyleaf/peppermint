# Async Processing — Work

**Owner app:** `work`
**Version:** 1.2.0
**Status:** Active
**Created:** 2026-07-17

Celery/beat contract for the `work` module. Celery + Redis are the already-approved async stack (`backend/core/docs/DATASTORES.md`, CLAUDE.md §1/§21) — using them needs no new §28 approval, but this doc is mandatory. **No task exists yet in Phase 0**; the tasks below are the Phase 2 contract (the project's first `tasks.py`). Derived from REQ §16.4, §16.6.8. Every task obeys the CLAUDE.md §15 Celery contract: idempotent; attributable system/service actor + permission context when it acts; never mutates authoritative state or bypasses the synchronous service + PostgreSQL transaction; no external network call inside a DB transaction.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | AI (Claude Fable 5) | Initial async contract (Phase 0 — pre-code): planned outbox-consumer + sweeper tasks, beat jobs, failure/recovery. Tasks land in Phase 2. |
| 1.1.0 | 2026-07-17 | AI (Claude Fable 5) | Phase 1: the `WorkOutboxEvent` model now exists and is written synchronously; no `tasks.py` yet (still Phase 2), so no `DATASTORES.md` consumer row and no Celery/cache usage added this phase. The task table below remains the Phase 2 contract. |
| 1.2.0 | 2026-07-17 | AI (Claude Opus 4.8) | Phase 2: `work/tasks.py` implemented (`dispatch_outbox_event`, `sweep_stalled_outbox`, `detect_overdue_work`); `_emit_outbox` now schedules dispatch via `transaction.on_commit()`. Beat schedules created by the idempotent `bootstrap_work_beat_schedules` command. `work` appended to the `DATASTORES.md` Store-consumers ledger (Redis broker `/0`). Retry/backoff (max 5, exponential) + dead-letter path live and tested. |

---

## 1. Tasks

Planned for Phase 2 (`work_module_implementation_plan.md` §7). All are retryable, non-authoritative follow-up only (REQ §16.4). Celery may process notification dispatch, deadline reminders, overdue detection, escalation, attachment/evidence inspection, integrity validation, derived-visibility refresh, search/analytics projection, and outbox consumption; it may **never** process ownership-transfer/assignment-acceptance/review-approval/closure authority or any direct authoritative state mutation (REQ §16.4).

| Task | Purpose | Trigger | Idempotency key | Retry policy | Timeout | Actor / permission |
|------|---------|---------|-----------------|--------------|---------|--------------------|
| `work.tasks.dispatch_outbox_event` | Consume one committed `WorkOutboxEvent`, perform side-effect/projection, mark `processed` | `transaction.on_commit()` after a mutation | `WorkOutboxEvent.idempotency_key` | max 5, exponential backoff via `available_at` | soft 30s / hard 60s | system actor; no authoritative write |
| `work.tasks.sweep_stalled_outbox` | Requeue `pending` past `available_at` or `processing` past stale-lock timeout | beat (see §2) | per-row `idempotency_key` (re-dispatch is idempotent) | n/a (idempotent sweep) | soft 60s | system actor; read-only on authoritative state |
| `work.tasks.detect_overdue_work` | Emit `work_deadline_approaching`/`work_deadline_missed` outbox rows for due/overdue work | beat | `(work_id, deadline_marker, date)` in payload | idempotent (dedup on key) | soft 120s | system actor |

Exact signatures/decorators are fixed in Phase 2; no task returns a result to a result backend (`CELERY_RESULT_BACKEND` is off — the outbox is the durable contract, `core/settings/base.py`).

## 2. Scheduled (beat) jobs

Registered with `django-celery-beat` (schedules stored in PostgreSQL; scheduler = `DatabaseScheduler`).

| Job | Task | Schedule | Purpose | Idempotency / catch-up behavior |
|-----|------|----------|---------|---------------------------------|
| `work-outbox-sweeper` | `work.tasks.sweep_stalled_outbox` | every ~1 min | recover abandoned outbox rows | idempotent; missed runs harmless — next run picks up the same rows |
| `work-overdue-detector` | `work.tasks.detect_overdue_work` | hourly | deadline events | dedup on payload key; a missed hour is caught the next run |

## 3. Outbox integration

Reliable domain events use the transactional-outbox pattern (`EVENTS.md` §5): the `WorkOutboxEvent` row is written inside the same PostgreSQL transaction as the state change; dispatch is triggered via `transaction.on_commit()` — a dispatch trigger only, never the source of durability. Outbox model/table: `WorkOutboxEvent` / `work_workoutboxevent` (`DATA_CONTRACT.md` §17). Consuming task: `work.tasks.dispatch_outbox_event`. Redis Pub/Sub is never used for authoritative events (REQ §16.7).

## 4. Failure & recovery

- **Retry/backoff:** `attempts` incremented, `available_at` pushed out with exponential backoff, status `failed`; past the max-attempt threshold → `dead_lettered` (retained, queryable, REQ §16.6.6).
- **Sweeper:** `work.tasks.sweep_stalled_outbox` requeues `pending` rows past `available_at` and `processing` rows past a stale-lock timeout (crash/broker-outage recovery), staying idempotent via the unique `idempotency_key`.
- **Authoritative-state guarantee:** recovery/consumer tasks never mutate authoritative work state — they only publish, retry, project, or reconcile delivery state (REQ §16.6.8). If Redis/broker is unavailable, committed outbox rows remain in PostgreSQL and are dispatched once the broker returns — no event is lost (`DATASTORES.md` Redis entry).

## 5. Datastore registry

When `work/tasks.py` lands (Phase 2), append a `work` row to the "Store consumers" ledger in `backend/core/docs/DATASTORES.md` (Redis broker `/0` — Celery; no new cache use — see `CACHE.md`), per CLAUDE.md §21. No new store engine is introduced.
