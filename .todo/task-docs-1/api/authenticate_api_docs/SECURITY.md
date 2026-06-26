# Security — Authenticate

**Owner app:** `authenticate`
**Version:** 1.1.0
**Status:** Active
**Created:** 2026-06-22

This document is mandatory per project rulebook §23 — authentication is not considered complete without it.

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                                                      |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-06-22 | AI (Claude) | Initial security documentation                                                                                                                                                                               |
| 1.1.0   | 2026-06-22 | AI (Claude) | Adds §14 password history, §15 service account authentication, expands §12 with the superuser bypass contract and §8 with staff MFA reset; documents the MFA login-gate lockout fix (see `DEBUG_HISTORY.md`) |

---

## 1. Password hashing

- **Hasher:** `django.contrib.auth.hashers.Argon2PasswordHasher` (primary), algorithm Argon2id.
- **Import path:** `django.contrib.auth.hashers.Argon2PasswordHasher`.
- **Memory-hard:** Yes — this is the reason Argon2 was chosen over PBKDF2 (CPU-hard only) for a ministry-grade target. Requires `argon2-cffi==25.1.0` (see `backend/core/docs/THIRD_PARTY_LIBRARIES.md`).
- **`PASSWORD_HASHERS` order** (`backend/core/settings/base.py`):
  ```python
  PASSWORD_HASHERS = [
      "django.contrib.auth.hashers.Argon2PasswordHasher",
      "django.contrib.auth.hashers.PBKDF2PasswordHasher",
      "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
      "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
  ]
  ```
  The first hasher in the list is used for all new hashes; the rest are retained purely so any hash created under a different hasher (e.g. during a future migration) can still be verified.
- **Legacy hashers:** Retained for verification only, as above. No hashes pre-date this app (fresh DB), so this is forward-looking, not currently exercised.
- **Upgrade-on-login:** Django's built-in behavior — if a user's stored hash was produced by a non-primary hasher, a successful login transparently re-hashes the password with the primary hasher. No custom code required or written.
- **Why Argon2:** OWASP's current recommended default for new applications; memory-hardness specifically defends against GPU/ASIC-accelerated offline cracking, which matters for the "ministry-grade" threat model this app targets.
- **Test verification:** `test_models.py` asserts `user.password.startswith("argon2")` after `create_user()`.
- **Migration/rollback:** N/A for this build (fresh database). If `PASSWORD_HASHERS` order is ever changed, existing hashes remain verifiable as long as their hasher stays in the list — removing a hasher from the list invalidates any password still hashed with it.
- **Production hardware sizing:** Argon2's default time/memory cost parameters in this build are Django's defaults. Before production deployment, benchmark `Argon2PasswordHasher`'s cost parameters against actual server hardware and tune via Django's hasher subclassing if login latency becomes noticeable under load.

## 2. Password validators

```python
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
```

Minimum length raised from Django's default (8) to 12 per the concept doc's password policy. No global frequent password expiry is enforced — password resets are risk-based (staff reset, compromise, incident response), matching the doc's explicit guidance against forced periodic rotation.

## 3. JWT settings

`SIMPLE_JWT` (`backend/core/settings/base.py`, unchanged from prior setup): `ACCESS_TOKEN_LIFETIME=60min` (overridden to 24h in `development.py` for convenience), `REFRESH_TOKEN_LIFETIME=7 days`, `ROTATE_REFRESH_TOKENS=True`, `ALGORITHM=HS256`.

**`BLACKLIST_AFTER_ROTATION` stays `False`, and `rest_framework_simplejwt.token_blacklist` is intentionally NOT installed.** Refresh-token revocation is enforced entirely through `authenticate.UserSession`: each refresh token's JTI is stored on a `UserSession` row; the custom refresh view/service checks `is_active`/`revoked_at`/`expires_at` on that row before issuing new tokens, and rotates the JTI on the **same row** rather than creating a blacklist entry. This avoids running two parallel revocation mechanisms for the same concern.

Access tokens are **Bearer-header-only in all environments** (never a cookie) — the simpler of the two options the concept doc allowed ("memory only"). Only the **refresh** token becomes an `HttpOnly` cookie in production/staging.

## 4. Cookie flags / CSRF strategy

`AUTH_COOKIE_STRATEGY` (`body` in dev/test, `cookie` in staging/production):

- **`body` (development/testing):** access + refresh both returned in the JSON response body, for ease of local/automated testing. Documented as dev-only behavior.
- **`cookie` (staging/production):** refresh token set via `Set-Cookie` with `HttpOnly=True`, `Secure=True`, `SameSite=Lax` (configurable via `AUTH_REFRESH_COOKIE_SAMESITE`), `Path=/api/v1/auth/`. Access token remains in the JSON body / Authorization header — never a cookie. CSRF protection (Django's `CsrfViewMiddleware`, already enabled) applies to the cookie-based refresh/logout endpoints in this mode.

## 5. Throttle rules

| Scope             | Rate      | Applies to                         |
| ----------------- | --------- | ---------------------------------- |
| `anon`            | 100/hour  | Default DRF anonymous throttle     |
| `user`            | 1000/hour | Default DRF authenticated throttle |
| `auth_login`      | 10/min    | `POST /login/`                     |
| `auth_refresh`    | 30/min    | `POST /refresh/`                   |
| `auth_mfa_verify` | 5/min     | `POST /mfa/totp/verify/`           |

## 6. Lockout rules — single source of truth per layer

Two independent mechanisms exist, deliberately not merged into one:

- **django-axes** (`AXES_FAILURE_LIMIT=5`, `AXES_COOLOFF_TIME=15min`, `AXES_LOCKOUT_PARAMETERS=["username", "ip_address"]`, `AXES_RESET_ON_SUCCESS=True`) is the **sole engine for brute-force failed-attempt counting and auto-lockout**. It hooks into `django.contrib.auth.authenticate()` via `AUTHENTICATION_BACKENDS`, so it protects every Django auth entry point including `/admin/login/` — which `authenticate`'s own service-layer login flow never touches. `authenticate_login()` calls `django.contrib.auth.authenticate(request=request, username=identifier, password=password)` specifically so axes can observe and count the attempt; calling `user.check_password()` directly would bypass axes entirely.
- **`UserSecurityState.locked_until`/`lock_reason`** is **manual/staff-lock only** (`lock_user()`/`unlock_user()` services) — a business-state field surfaced through `/users/<id>/lock/` and `/unlock/`, tied to its own `AuthEvent` records. It has no overlap with axes' counting; axes has no concept of an administrator deliberately locking an account.
- A second-tier business rule — "10 cumulative failed attempts → flag for staff review" (`AUTH_STAFF_REVIEW_FAILED_LOGIN_THRESHOLD`) — is implemented as a **read-time query against axes' own attempt data**, not a second stored counter. No notification mechanism is built in this version (doc's own "admin alert hook later" — explicitly deferred).
- If axes itself blocks an attempt, `authenticate()` raises an axes-specific `PermissionDenied` subclass. The service catches this and returns the same generic public failure as every other pre-auth rejection, while `AuthEvent.failure_reason=axes_locked` preserves the specific internal reason.

## 7. Account enumeration defense

Pre-authentication failures (unknown user, wrong password, inactive, login-disabled, account-status not active, manually locked, axes-locked) all return the identical generic envelope:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid credentials or account is not allowed to sign in.",
    "details": {}
  },
  "meta": {}
}
```

The internal `AuthEvent.failure_reason` records the specific cause. `AUTH_DEVICE_LIMIT_REACHED` is the one deliberate exception — it is only ever returned _after_ password and MFA have already succeeded, so it cannot be used to enumerate accounts or credentials.

## 8. MFA status

Implemented in this build: TOTP via `django_otp.plugins.otp_totp.models.TOTPDevice`, recovery/backup codes via `django_otp.plugins.otp_static.models.StaticDevice`/`StaticToken`. No custom OTP code or custom MFA models were written (per project rule: never invent custom OTP generation).

`UserSecurityState.mfa_required` is the only stored MFA-related flag (a business policy decision — e.g. staff can force MFA onto an account). MFA _enrollment_ status is **not stored** — `is_mfa_enrolled(user)` derives it live from `TOTPDevice.objects.filter(user=user, confirmed=True).exists()`, avoiding drift if a device is ever removed outside the app's own `disable_mfa()` path.

**Staff-managed MFA reset** (`POST /users/<id>/mfa/reset/`) removes a lost/compromised device on a different actor's behalf. It deliberately does **not** clear `mfa_required` — the policy survives, the user just needs to re-enroll. Self-service disable (`POST /mfa/disable/`) is **blocked outright** (`AUTH_MFA_DISABLE_BLOCKED_BY_POLICY`) whenever `mfa_required=True`, regardless of whether a device is currently enrolled — this closes a loophole where a user could call disable pre-emptively (a no-op on devices, since none exist yet) purely to clear the policy flag before ever enrolling. Only a staff actor (`actor.pk != user.pk`) can touch a policy-mandated account's MFA state.

## 9. Session revocation behavior

Refresh-token revocation uses `UserSession` exclusively (see §3). Logout sets `is_active=False`, `revoked_at=now()`, `revoked_reason=logout`. Staff-initiated revocation uses `revoked_reason=staff_revoked`. Maximum **3 active sessions per user** (`AUTH_MAX_ACTIVE_SESSIONS_PER_USER`) — a 4th successful login while at the limit is rejected with `AUTH_DEVICE_LIMIT_REACHED`; the user must revoke an existing session first (no silent auto-eviction of the oldest session, per explicit product decision).

Session data captured: raw `ip_address`, and a `device_label` parsed from the User-Agent header via a small local regex parser (`authenticate/ua_parser.py`) — e.g. "Chrome on macOS". The raw User-Agent string is **never persisted**; only its sha256 (`user_agent_hash`) is stored, for fingerprint-style comparison. No GeoIP/city/country resolution is performed (explicitly out of scope — local-first posture, avoids an extra dependency and an operational data-file maintenance burden).

## 10. Sensitive logging policy

Never logged, anywhere in this app: passwords, JWT access/refresh tokens, OTP codes, TOTP secrets, recovery codes, password-reset tokens, raw User-Agent strings, `Authorization` headers. `AuthEvent.metadata` must never carry any of the above. Cross-references project rulebook §17.

## 11. AuthEvent retention notes

`AuthEvent` is append-only (enforced via a local `save()` override, not a shared base class with `core.policy_engine.PolicyChangeLog` — see DATA_CONTRACT.md's "Deliberate deviations" section for why these stay independent). No deletion path exists in this build. A formal retention/archival policy is not yet decided — flagged as a future item, not blocking this build.

## 12. Admin/superuser protection rules

- No endpoint in this build can grant or revoke `is_staff`/`is_superuser` — that remains a Django-admin/shell-only operation until the dedicated `permissions` app exists. The only way to create one is `python manage.py bootstrap_superadmin` (idempotent; see §16).
- `AUTH_CANNOT_DISABLE_SELF` / `AUTH_CANNOT_DELETE_SELF`: a staff actor cannot disable their own login or lock their own account through the staff endpoints (prevents accidental self-lockout with no other admin available).
- Django admin login (`/admin/login/`) is protected by django-axes exactly like the API login endpoint (see §6).
- **`is_superuser` is the platform-wide bypass-all-permission-checks flag.** `authenticate.views._require_staff()` checks `request.user.is_superuser` first and short-circuits to allow access — a superuser passes every staff gate in this app even without `is_staff` also set. This is the documented contract every future authorization system (RBAC/ABAC/HBAC in the eventual `permissions` app) **must** honor: a superuser bypasses _all_ permission checks platform-wide, mirroring Django's own built-in convention (`ModelBackend.has_perm`/`has_module_perms` already do this for Django's native permission system). The rationale: the very first actor on a fresh deployment has no roles/permissions to be granted yet (none exist), so a hard-coded bypass is what makes initial setup possible at all (e.g. creating the first admin role once the `permissions` app exists). Treat this as a narrow, audited escape hatch — not a general-purpose role — and grant it sparingly.

## 13. Production deployment warnings

- `AUTH_COOKIE_STRATEGY` **must** be `"cookie"` in production/staging — the `"body"` mode is for local development convenience only.
- `SECRET_KEY` must be a real, secret, environment-provided value in production (already enforced by existing `core/settings` pattern via `python-decouple`).
- Review `AXES_FAILURE_LIMIT`/`AXES_COOLOFF_TIME` against the actual deployment's risk profile before go-live — the defaults here (5 attempts / 15 min) are a starting point, not a final tuned value.
- Review Argon2's cost parameters against production hardware (see §1).

## 14. Password history / reuse blocking

`AUTH_PASSWORD_HISTORY_DEPTH` (default 5, `backend/core/settings/base.py`) — `change_password` rejects a new password matching the current password or any of the retained `UserPasswordHistory` entries, via `AUTH_PASSWORD_REUSE_BLOCKED`. The check (`django.contrib.auth.hashers.check_password`) runs against `[User.password] + selectors.list_recent_password_hashes(user, limit=depth-1)` — the current password counts as 1 of the depth, so depth=5 means "last 5 distinct passwords including the current one." `_record_password_history()` prunes anything beyond `depth-1` retained rows on every change; pruning is normal, expected behavior (unlike `AuthEvent`, `UserPasswordHistory` is **not** append-only).

`set_temporary_password` (staff override) records history but does **not** gate on reuse — a staff-assigned temporary password is expected to be replaced again immediately (`password_change_required=True`), so blocking it would just add friction to an already-forced flow.

Only hashes are ever stored or compared; plaintext passwords never touch this table.

## 15. Service account authentication

Non-human actors (`actor_type` `system`/`ai`/`external`) never use the password+MFA login flow — `User.objects.create_user(password=None, ...)` gives them Django's "unusable password" marker (`check_password()` always returns `False`), and `create_user(...)` rejects `password=None` for `actor_type=human`.

Instead, staff issue a `ServiceAccountCredential` (`POST /users/<id>/service-account-credentials/`), which returns a `f"{key_id}.{secret}"` token **exactly once**. The credential's `secret_hash` (sha256) is the only thing persisted — never the plaintext.

`authenticate.authentication.ServiceAccountAuthentication` is registered alongside `JWTAuthentication` in `DEFAULT_AUTHENTICATION_CLASSES`. It activates only on `Authorization: ApiKey <key_id>.<secret>` (a distinct scheme from `Bearer <jwt>`, so both coexist without conflict on the same endpoints) and returns `None` for any other scheme, letting `JWTAuthentication` handle it instead. Secret verification uses `hmac.compare_digest` — never `==` — to avoid timing side-channels on the hash comparison. Expired (`expires_at`) or revoked (`is_active=False`) credentials are rejected.

Failed verification attempts create `AuthEvent(service_account_auth_failed)` for audit visibility. Successful authentications only update `last_used_at` — they are **not** logged per-request, since a busy service account could otherwise generate an unbounded number of `AuthEvent` rows for what is routine, expected traffic.

## 16. Known Policy Engine validation finding (accepted, not fixed)

`python manage.py validate_policy_engine --strict` reports exactly one finding:
`ERROR: Endpoint 'authenticate.user.login' has no dependency metadata.` This is
Policy Engine validation rule 3 ("high/critical-risk endpoints must declare at
least one outgoing dependency"), and it is a structural consequence of `login`
being this app's true entry point: every other `authenticate` endpoint already
declares a forward `requires` dependency back to `authenticate.user.login`
(directly or transitively), so any outgoing edge _from_ `login` to another
`authenticate` endpoint would be circular (confirmed via
`core.policy_engine.dependency_resolver.detect_circular_dependencies`), and a
`backward`-direction edge (which bypasses the cycle check) cannot be added
either, because `login` is registered first and its only pre-existing targets
at that point are `core.policy_engine`'s own unrelated endpoints — fabricating
a dependency edge to one of those would pollute the dependency graph with a
relationship that does not actually exist, which is worse for the audit trail
than a documented gap.

`login`'s `risk_level` stays `high`, matching the concept doc, rather than
being lowered to dodge this rule. No `core.policy_engine` code was changed to
work around this — the finding is accepted and documented here instead.

## 17. Deferred / not implemented in this version

`TrustedDevice` (skip-MFA-on-trusted-device), device-fingerprinting (`device_fingerprint_hash` was dropped from the model), public self-registration, GeoIP/location resolution, SSO/external identity providers, staff endpoint to mandate MFA (`mfa_required` is settable only via Django admin/shell — no API endpoint sets it). None of these are silently dropped — each is an explicit, documented scope boundary for this build.

`UserPasswordHistory`, `ServiceAccountCredential`, and staff-managed MFA reset — listed as deferred in version 1.0.0 of this document — are now implemented (§14, §15, §8 respectively).
