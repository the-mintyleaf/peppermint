# Cache — Work

**Owner app:** `work`
**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-07-17

Redis cache posture for the `work` module. Redis is the already-approved cache backend (`backend/core/docs/DATASTORES.md`, CLAUDE.md §15/§21). This document records a **deliberate no-cache posture for the initial build** and the exact preconditions for enabling a security-sensitive cache later. Derived from REQ §16.7, §16.8.

---

## Change History

| Version | Date       | Author              | Summary                                                                                                      |
| ------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-17 | AI (Claude Fable 5) | Initial cache contract: deliberate no-cache posture + preconditions for future permission/hierarchy caching. |

---

## 1. Cached datasets

**None in the initial build.** The `work` module deliberately caches nothing through Phases 1–5 unless a measured need is separately documented. Authorization (Stage-1 permission via `permissions.services.check_permission`, Stage-2 visibility, hierarchy resolution) is **always recomputed from PostgreSQL** on every request.

**Rationale (REQ §16.7, §16.8; CLAUDE.md §15):** the revision markers a security-sensitive cache key must include — `organization_structure_version`, `permission_revision` — **do not exist in code yet**. `organization` has only a per-`OrganizationUnit` optimistic-concurrency `version` (not an org-wide structure version); `permissions` has no `permission_revision` field and no decision cache (verified 2026-07-17). Introducing a cache keyed on markers that no write path bumps would produce exactly the stale-authorization failure the rulebook forbids ("a cache miss is acceptable; stale authorization is not"). So the correct initial posture is no cache, not an unsafe one.

| Key pattern | Data cached | TTL | Source of truth | Revision markers | Invalidation trigger |
| ----------- | ----------- | --- | --------------- | ---------------- | -------------------- |
| — (none)    | —           | —   | PostgreSQL      | —                | —                    |

## 2. Invalidation rules

N/A while nothing is cached. When a cache is introduced (§4 preconditions), security-sensitive keys must be invalidated on the corresponding write, not by TTL alone, and must include `organization_id`, `actor_id`, `organization_structure_version`, `permission_revision`, `resource_scope` (and `document_version` where document visibility is involved) per REQ §16.8.4.

## 3. Failure behavior

The system already degrades safely because it never depends on a cache: every authorization decision recomputes from PostgreSQL. A Redis outage affects only the Celery broker path (`ASYNC_PROCESSING.md`), never authorization. A cache entry must never authorize an action on its own (REQ §16.8.5).

## 4. Preconditions for enabling a future cache

A security-sensitive cache (permission-decision or hierarchy-resolution reuse) may be added only after **all** of:

1. `organization` exposes an org-wide `organization_structure_version` bumped on every structure/reporting/position/delegation change;
2. `permissions` exposes a `permission_revision` bumped on every role-binding/grant/deny change;
3. write paths in those apps bump the markers (not TTL-only);
4. this `CACHE.md` is updated with the concrete key patterns, TTLs, and invalidation triggers (§1/§2);
5. keys carry short TTLs even with revision markers, and explicit invalidation on write is preferred over blind expiry (REQ §16.8.6).

Introducing that cache is a documentation-and-code change in this app plus the marker-owning apps — it does not need a new §28 datastore approval (Redis is already registered), but it does need this doc filled in first.

## 5. Never cached

Per REQ §16.8.3 and CLAUDE.md §21, the cache must never be the source of truth for: work assignments, work status, work history, event history, notification-delivery records, review decisions, permission grants/denials, hierarchy history, document truth, or audit records. Confidential work text, external-stakeholder contact details, and raw evidence payloads are never written to the cache under any future scheme.
