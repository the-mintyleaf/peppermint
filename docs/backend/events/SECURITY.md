# Security — Events

**Owner app:** `events`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-07-07

This document is required per project rulebook §19 because `events` makes non-trivial security-relevant decisions beyond the project's standard auth pattern: it is the first app with no public write endpoint at all, and the first app to gate its own endpoints with `permissions.services.check_permission()` directly rather than the interim `_require_staff` helper.

## Change History

| Version | Date       | Author      | Summary                         |
| ------- | ---------- | ----------- | ------------------------------- |
| 1.0.0   | 2026-07-07 | AI (Claude) | Initial security documentation. |

---

## 1. No Public Write Endpoint

`EventLedger` has no create/update/delete API endpoint. The only write path is `events.services.emit_event()`, callable only from Python — in practice, from another app's own `services.py`. This is deliberate: exposing event creation over HTTP would let any authenticated caller forge audit history, undermining the ISO 15489 authenticity property (`.docs/work_implementation.md` §3.3) the whole ledger exists to provide. If a genuine need for externally-sourced events emerges (e.g. an external system posting audit events), that requires a new, separately-approved, authenticated service-account-scoped endpoint — never a relaxation of this rule.

## 2. Append-Only Enforcement

`EventLedger.save()` on an existing row and `.delete()` (both instance- and queryset-level, via a local `AppendOnlyManager`/`AppendOnlyQuerySet`) raise `events.exceptions.EventImmutabilityError`. This mirrors `organization.OrganizationEventLog` and `authenticate.AuthEvent`'s established pattern. The Django admin additionally disables add/change/delete entirely (`events/admin.py`) so a superuser cannot bypass immutability through `/admin/`.

## 3. `check_permission()` as the Endpoint Gate

Both endpoints (`events.event.list`, `events.event.read`) call `permissions.services.check_permission(request.user, permission_key)` directly, rather than the `_require_staff` interim pattern duplicated in `organization`/`authenticate`/`permissions`. `check_permission()` already applies the superuser bypass and `is_active` check (`permissions/services.py:379`); the view only adds the `NotAuthenticated`/`PermissionDenied` split DRF expects (401 vs. 403). Until an explicit role/grant is bound for `events.event.list`/`events.event.read`, only superusers can reach these endpoints — this is the correct default-deny posture for a platform-wide audit trail, not a bug to "fix" by relaxing to `is_staff`.

## 4. Actor Snapshot Denormalization

`actor_snapshot` (display name, username, actor type) is captured at emit time and stored on the event row, independent of the live `actor` FK. If the referenced user account is later renamed or deleted, the historical event still reads correctly — this is intentional per the ISO 15489 reliability property, not data duplication to be "cleaned up."

## 5. No Sensitive Data Filtering on `previous_state`/`new_state`

These JSON fields store whatever the calling app passes in `emit_event()`. This app performs no redaction — **the calling app is responsible for not passing secrets, tokens, passwords, or other sensitive raw content into these fields**, per CLAUDE.md §17 (Logging), which applies here by the same rationale. This is called out explicitly because it is easy for a future app's `services.py` to accidentally snapshot more than it should when building `previous_state`/`new_state` dicts.
