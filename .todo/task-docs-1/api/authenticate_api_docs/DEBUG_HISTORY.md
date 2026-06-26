# Debug History — Authenticate

## 2026-06-22 — MFA login-gate could permanently lock out a mandated-but-unenrolled user

**Endpoint/module:** `authenticate.services.authenticate_login` (the login MFA gate), surfaced while implementing staff-managed MFA reset (`POST /users/<id>/mfa/reset/`).

**Problem:** The login flow's MFA gate was:

```python
if security_state.mfa_required or selectors.is_mfa_enrolled(user):
    challenge_id = ...
    raise MFARequiredError(challenge_id)
```

Any user with `UserSecurityState.mfa_required=True` but **no enrolled TOTP/static device** would have a `challenge_id` issued on every login attempt, but `verify_mfa_challenge` → `_verify_mfa_code` would always return `False` (there is no device to verify a code against). The user could never complete login again — a permanent, self-inflicted lockout with no recovery path through the API.

**Root cause:** The gate conflated two different things: "MFA is policy-mandated for this account" (`mfa_required`) and "MFA verification is actually possible for this account" (a confirmed device exists). The condition allowed the mandate alone to demand a challenge, even when satisfying that challenge was impossible. This state (`mfa_required=True`, not enrolled) is reachable two ways: (1) staff sets `mfa_required=True` on a user who has never set up MFA, or (2) — the case that surfaced this — a staff-managed MFA reset removes a user's device while `mfa_required` stays `True` (by design, so the mandate survives a lost-device recovery).

**Changed files:** `authenticate/services.py` (`authenticate_login`, `_issue_login`, `LoginResult`), `authenticate/views.py` (`_login_result_response`), `authenticate/tests/test_services.py`, `authenticate/tests/test_views_mfa.py`.

**Fix summary:** The gate now keys strictly on `selectors.is_mfa_enrolled(user)` — a challenge is only ever raised when there is a real device to verify against. `mfa_required=True` with no enrollment no longer blocks login; instead, `LoginResult.mfa_setup_recommended` is set to `True` and surfaced on the login response (`data.mfa_setup_recommended`), so the client can prompt the user to complete MFA setup (which works fine post-login, since they now have a valid access token) without ever being locked out pre-login.

**Contract impact:** Additive only — the login/verify success response gained one new boolean field (`mfa_setup_recommended`). No existing field changed shape or meaning. `authenticate/docs/DATA_CONTRACT.md` §7.1 and `authenticate/docs/API.md` §1 updated accordingly.

**Tests added/updated:** `test_services.py::AuthenticateLoginTest::test_mfa_required_without_enrollment_does_not_lock_user_out` (replaces the old test that asserted the buggy behavior), `test_views_mfa.py::StaffMFAResetViewTest::test_user_can_log_in_again_after_staff_reset_without_lockout`.

**Notes for future AI:** If you ever see `mfa_required` referenced as a login-blocking condition again, check whether it's paired with an enrollment check — `mfa_required` alone must never gate a challenge. If a future "staff mandates MFA on next login" enforcement feature is built (forcing setup before full API access, analogous to `password_change_required`), it needs its own mechanism (e.g. a limited-scope token), not a reuse of the challenge*id flow — the challenge_id flow is specifically for \_verifying an already-enrolled* device.
