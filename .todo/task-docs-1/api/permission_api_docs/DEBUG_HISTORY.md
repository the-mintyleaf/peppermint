# Debug History — Permissions

## 2026-06-24 — Superuser bypass did not check `is_active`

**Endpoint/module:** `permissions.services._evaluate_permission` (used by both `check_permission()` and `explain_permission()`), found during a post-implementation access-control re-review, not by a failing test.

**Problem:** The superuser-bypass branch checked only `getattr(subject, "is_superuser", False)`. A deactivated superuser account (`is_active=False`, `is_superuser=True`) would still receive `allowed=True` from `check_permission()`.

**Root cause:** Decision-precedence step 1 (superuser bypass) was implemented as a pure `is_superuser` check, independent of step 3 (inactive actor denies). Not exploitable through the actual HTTP API today — `rest_framework_simplejwt.authentication.JWTAuthentication.get_user()` already raises `AuthenticationFailed` for `is_active=False` users before a view ever runs, so `request.user` passed into the views is always active. But `check_permission`/`explain_permission` are public service functions designed for other apps to call directly in-process (per `.docs/permission_concept.txt` §3.1), and a caller passing a stale/cached deactivated-superuser `User` instance outside the HTTP path would get an incorrect allow.

**Changed files:** `permissions/services.py` (`_evaluate_permission` — bypass condition now also requires `is_active`).

**Fix summary:** Bypass condition changed from `is_superuser` to `is_superuser and is_active`. A deactivated superuser now falls through to the existing step 2/3 deny branch ("subject is not authenticated or not active").

**Contract impact:** None — `DATA_CONTRACT.md` §6 already documented "Inactive/unauthenticated subject denies" as step 3; this fixes the implementation to actually apply that to superusers too, rather than letting step 1 short-circuit past it.

**Tests added/updated:** `permissions/tests/test_services.py::CheckPermissionTest::test_inactive_superuser_does_not_bypass`.

**Notes for future AI:** Any future decision-precedence step that "short-circuits" earlier than the active-actor check (e.g. a future break-glass session in Phase 4) must explicitly re-derive whether that exception is meant to survive deactivation — don't assume short-circuit order implies the actor-validity check no longer applies.

---

## 2026-06-24 — N+1 query in `check_permission`'s role-binding match loop

**Endpoint/module:** `permissions.services._evaluate_permission`, found during the same access-control re-review.

**Problem:** The loop matching a subject's active role bindings against the requested `permission_key` called `selectors.get_role_permission(binding.role_id, permission_key)` once per binding — one query per binding instead of one query total. `.docs/permission_concept.txt` §13.1 explicitly requires `check_permission` to stay fast on the hot path; this scaled linearly with how many roles a subject holds.

**Root cause:** The per-binding existence check (`get_role_permission`, used correctly elsewhere for single-binding lookups like `attach_permission_to_role`) was reused inside a loop instead of being replaced with a bulk lookup.

**Changed files:** `permissions/selectors.py` (added `get_role_ids_with_active_permission(role_ids, permission_key) -> set[UUID]`), `permissions/services.py` (`_evaluate_permission` now collects scope-matching candidate bindings first, then does one bulk lookup against all their `role_id`s).

**Fix summary:** Query count for the role-binding match step is now constant (1 query) regardless of how many active bindings a subject has, instead of `1 + N`.

**Contract impact:** None — `matched_role_bindings` output is unchanged; this is a pure performance fix.

**Tests added/updated:** `permissions/tests/test_services.py::CheckPermissionTest::test_role_binding_match_is_per_binding_not_all_or_nothing` (correctness of the bulk-lookup logic) and `test_check_permission_query_count_does_not_scale_with_binding_count` (`assertNumQueries(5)` with 5 bindings present — a regression guard against reintroducing N+1).

**Notes for future AI:** `check_permission`/`explain_permission` are the one place in this app explicitly designated "hot path" by the concept doc. Any future addition to `_evaluate_permission` (Phase 2+ resource-instance scope, Phase 3 delegation/SoD) must keep this query-count-independent-of-binding-count property — add an `assertNumQueries` regression test alongside any such change, not just a correctness test.
