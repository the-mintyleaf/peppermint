# Data Contract — Events

**Owner app:** `events`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-07-07
**Purpose:** Owns the foundational, cross-app, append-only event ledger — the historical record of "what happened" across the platform. Does NOT own current-state data for any domain (that stays in each owning app's own tables), does NOT replay events to reconstruct state, and does NOT provide push delivery/notifications (an outbox consumer is deferred — see `.docs/work_implementation.md` §3.4 and §7). `organization.OrganizationEventLog` and `authenticate.AuthEvent` remain separate, app-scoped logs and are not superseded or migrated by this app.

---

## Change History

| Version | Date       | Author      | Summary                                                               |
| ------- | ---------- | ----------- | --------------------------------------------------------------------- |
| 1.0.0   | 2026-07-07 | AI (Claude) | Initial contract — `EventLedger` model and `emit_event()` write path. |

---

## Deliberate Deviations

This app has no prior concept/prompt document to deviate from — it is the first slice of `.docs/work_implementation.md`'s phased build plan (§6, slice 1). Two decisions worth calling out explicitly since they depart from the nearest precedent (`organization.OrganizationEventLog`, `authenticate.AuthEvent`):

- **`event_type` is a free string, not a `TextChoices` enum.** Both precedent models use a closed, single-app enum of event types. This ledger is foundational and must accept new event types from apps that don't exist yet (`intake`, `cases`, `work`) without a code change here. Format (`app.resource.action`, lowercase dotted snake_case) and the `source_app` prefix match are validated in `events.services.emit_event()` at write time, not by the database.
- **No `case_id`/`work_item_id`/`task_id` columns.** The original external requirement draft's event payload spec included these. They were deliberately omitted per CLAUDE.md §32 (Minimalism Rule) — those domains don't exist yet, and adding columns for unbuilt apps is speculative schema. `resource_type`/`resource_id` (generic) plus `correlation_id` (an app-supplied grouping key) cover the same need once `cases`/`work` are built, without any migration to this app.

---

## 1. EventLedger

**Purpose:** One append-only row per meaningful state change anywhere in the platform. Event-augmented CRUD, not event sourcing — see `.docs/work_implementation.md` §3.4.
**Table:** `events_eventledger`

| Field             | Type                             | Required | Nullable | Generated | Description                                                                                                                                                                                                                                        |
| ----------------- | -------------------------------- | -------- | -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | UUID                             | —        | No       | Yes       | Primary key                                                                                                                                                                                                                                        |
| event_type        | string(100)                      | Yes      | No       | No        | Dotted `app.resource.action` string, e.g. `intake.intake_item.created`. Validated, not enum-constrained — see Deliberate Deviations.                                                                                                               |
| source_app        | string(50)                       | Yes      | No       | No        | Django app label of the emitting app. Must equal `event_type`'s leading segment.                                                                                                                                                                   |
| actor             | FK → `settings.AUTH_USER_MODEL`  | No       | Yes      | No        | The user who performed the action, if any. `SET_NULL` on user deletion — history is preserved even if the account is later removed.                                                                                                                |
| actor_snapshot    | JSON                             | No       | No       | Yes       | `{id, display_name, username, actor_type}` captured at emit time by `emit_event()`. Denormalized on purpose — a later change to the user's display name must not rewrite history (ISO 15489 reliability, see `.docs/work_implementation.md` §3.3). |
| organization      | FK → `organization.Organization` | No       | Yes      | No        | Tenant scope, if applicable. `SET_NULL` on organization deletion.                                                                                                                                                                                  |
| resource_type     | string(100)                      | No       | No       | No        | What the event is about, e.g. `cases.Case`. Blank for events with no single resource.                                                                                                                                                              |
| resource_id       | UUID                             | No       | Yes      | No        | Paired with `resource_type`.                                                                                                                                                                                                                       |
| summary           | string(500)                      | No       | No       | No        | One-line human-readable description.                                                                                                                                                                                                               |
| detail            | text                             | No       | No       | No        | Longer free-text detail, if any.                                                                                                                                                                                                                   |
| reason            | text                             | No       | No       | No        | Why the action happened — required by the calling app's own validation where its business rules demand it; not enforced here.                                                                                                                      |
| authority_context | JSON                             | No       | No       | No        | Snapshot of the authority the actor acted under (e.g. role/delegation), if applicable.                                                                                                                                                             |
| permission_key    | string(255)                      | No       | No       | No        | The Core Policy Engine `permission_key` the action was authorized under, if any.                                                                                                                                                                   |
| previous_state    | JSON                             | No       | No       | No        | Before-snapshot for diffing.                                                                                                                                                                                                                       |
| new_state         | JSON                             | No       | No       | No        | After-snapshot for diffing.                                                                                                                                                                                                                        |
| request_id        | string(64)                       | No       | No       | No        | Correlates to the originating HTTP request, if any.                                                                                                                                                                                                |
| correlation_id    | string(64)                       | No       | No       | No        | Caller-supplied key grouping related events across resource types (e.g. all events under one future `Case`).                                                                                                                                       |
| causation_id      | string(64)                       | No       | No       | No        | The event (if any) that directly caused this one.                                                                                                                                                                                                  |
| occurred_at       | datetime                         | Yes      | No       | No        | When the business event actually happened. Defaults to `emit_event()` call time if not supplied.                                                                                                                                                   |
| recorded_at       | datetime                         | —        | No       | Yes       | When the row was persisted (`auto_now_add`).                                                                                                                                                                                                       |

**Validation Rules:**

- `event_type` must match `^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$` (mirrors `core.policy_engine`'s `permission_key` regex).
- `event_type`'s leading dotted segment must equal `source_app`.
- Both are enforced in `events.services.emit_event()`, the only public write path — see Deliberate Deviations.

**Indexes:** `(source_app, event_type)`, `(resource_type, resource_id)`, `(organization, event_type)`, `actor`, `recorded_at`, `correlation_id`.

**Soft Delete:** N/A — records are append-only (immutable once written) rather than soft-deletable. `save()` on an existing row and `delete()` (both instance- and queryset-level, via a local `AppendOnlyManager`/`AppendOnlyQuerySet` pair) raise `events.exceptions.EventImmutabilityError`. This mirrors `organization.OrganizationEventLog`/`authenticate.AuthEvent`'s established append-only pattern rather than sharing a base class with them (per this codebase's existing per-app-duplication precedent for small infra).

**Example:**

```json
{
  "id": "b6b0b4b0-1e3a-4b3a-9c1a-0f1e2d3c4b5a",
  "event_type": "cases.case.closed",
  "source_app": "cases",
  "actor": "9f1e2d3c-4b5a-6b7c-8d9e-0f1a2b3c4d5e",
  "actor_snapshot": {
    "id": "9f1e2d3c-...",
    "display_name": "Anita Sharma",
    "username": "asharma",
    "actor_type": "human"
  },
  "organization": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "resource_type": "cases.Case",
  "resource_id": "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "summary": "Case closed",
  "reason": "All work items completed and reviewed.",
  "permission_key": "cases.case.close",
  "previous_state": { "current_status": "under_review" },
  "new_state": { "current_status": "closed" },
  "correlation_id": "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "occurred_at": "2026-07-07T14:10:00+00:00",
  "recorded_at": "2026-07-07T14:10:00.123456+00:00"
}
```

**Cross-App Dependencies:** References `settings.AUTH_USER_MODEL` (string, `authenticate.User`) and `organization.Organization` (string FK). Every future domain app (`intake`, `cases`, `work`) will depend on `events.services.emit_event()` — those apps' own `DATA_CONTRACT.md` files must declare that dependency explicitly per CLAUDE.md §4 when built.
**Security Notes:** No public create/update/delete endpoint exists — the only write path is the Python-level `emit_event()` service, callable only from other apps' `services.py`. This is intentional: allowing event creation over the API would let a caller forge audit history. See `docs/API.md`.

---

## Cross-App Dependencies

`events` depends on `organization` (Organization FK) and `settings.AUTH_USER_MODEL` (`authenticate.User`, string reference only — this module never imports `authenticate.models`). `events` does not depend on `permissions` at the model layer, but `events.views` calls `permissions.services.check_permission()` for endpoint authorization (see `docs/API.md`). No app currently depends on `events` for reads; `events.services.emit_event()` is the write dependency every future domain app will take.

---

## Soft Delete

N/A — see `EventLedger`'s per-model Soft Delete note above. The whole app has exactly one model, and it is immutable/append-only rather than soft-deletable.
