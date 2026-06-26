# Debug History — Organization

## 2026-06-23 — `validate_code_format()` raised a plain `ValueError`, causing an unhandled 500 instead of a 400

**Endpoint/module:** `organization.serializers.OrganizationCreateSerializer.validate_code`, `OrganizationUnitCreateSerializer.validate_code`, `PositionCreateSerializer.validate_code` (all three call `organization.validators.validate_code_format`), surfaced by `organization/tests/test_api_organizations.py::OrganizationApiTest::test_create_invalid_code_format_returns_400` during the initial test-writing pass.

**Problem:** `validate_code_format(code: str) -> None` raises a plain `ValueError` when the code doesn't match the lowercase-slug regex. DRF's `serializer.is_valid(raise_exception=True)` only intercepts `rest_framework.serializers.ValidationError` — a plain `ValueError` propagates straight through the view, past `is_valid()`, and is caught only by `core.exceptions.global_exception_handler`'s catch-all branch, which logs it as an unhandled server error and returns a generic `500 INTERNAL_SERVER_ERROR` instead of the intended `400` with a field-level validation message.

**Root cause:** `validators.py` functions are shared between two call contexts with different exception-handling expectations — services call them and expect plain Python exceptions (which services already handle via their own `OrganizationError` subclasses for the _other_ validators), but serializer `validate_<field>` methods must raise DRF's `ValidationError` specifically for `is_valid()` to produce a 400. `validate_code_format` was the one validator wired directly into a serializer field hook without that translation.

**Changed files:** `organization/serializers.py` (`OrganizationCreateSerializer.validate_code`, `OrganizationUnitCreateSerializer.validate_code`, `PositionCreateSerializer.validate_code` — each now wraps the call in `try/except ValueError as exc: raise serializers.ValidationError(str(exc)) from exc`).

**Fix summary:** All three `validate_code` methods now catch the validator's `ValueError` and re-raise as `serializers.ValidationError`, which DRF's `is_valid(raise_exception=True)` does intercept, producing the correct `400` response with the validator's message in `error.details`.

**Contract impact:** None — the documented behavior (400 on invalid code format) was always the intended contract per `DATA_CONTRACT.md`; this fixes the implementation to match it. No field/shape change.

**Tests added/updated:** `test_api_organizations.py::OrganizationApiTest::test_create_invalid_code_format_returns_400` (this is the test that caught the bug).

**Notes for future AI:** Any validator in `organization/validators.py` that gets called directly from a serializer's `validate_<field>()` hook (as opposed to from a service function) must have its exception translated to `serializers.ValidationError` at the call site — `validators.py` itself stays serializer-agnostic and keeps raising plain exceptions (`ValueError` for `validate_code_format`, the app's own `OrganizationError` subclasses for the rest), since services need those same functions to raise exceptions services already know how to catch.
