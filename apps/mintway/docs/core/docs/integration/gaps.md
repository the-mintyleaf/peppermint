# Gaps & assumptions

What the backend docs do **not** answer. Each entry is a question for the backend
or an assumption the frontend is making — **ask, don't invent**. Nothing here may
be silently resolved in code without confirmation.

| #   | Gap                                                                                                                                                 | Impact on frontend                                          | Assumption (if any)                                                                                   | Where the assumption lives     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | Whether `/health/` or `/ready/` ever return fields **beyond `{ "status": … }`** (e.g. a timestamp, build/version, or component sub-checks).         | Can't type a richer probe body if one is added later.       | Body is exactly `{ status: string }`; type only `status`. Re-check on a backend version bump.         | `entities/health.md` §2        |
| 2   | The **full set of `status` values** is not formally enumerated — only `ok` (from `/health/`) and `ready` / `not ready` (from `/ready/`) observed.   | A new status value would be unhandled.                      | Treat the three observed literals as the closed set; switch on **HTTP status**, not the string.       | `enums.md` (probe status sets) |
| 3   | Response codes **other than 200 / 503** for the probes are not documented (e.g. behavior under partial degradation).                                | Can't map an unexpected code to a UI/monitoring state.      | Only `200` and `503` occur; treat anything else as "down/unknown".                                    | `flows.md`                     |
| 4   | The exact **`error.details` body shape** for `/api/v1/` `VALIDATION_ERROR` (400) is not enumerated platform-wide (this is a `core`-owned envelope). | Can't reliably map field errors to form fields generically. | Treat `error.details` as an **opaque object**; fall back to `error.message`. Do not hard-map a shape. | api layer error mapper         |
| 5   | Exact **401 / 403 response bodies** are described by `code` only, not shown as literal payloads.                                                    | Can't type the auth-error body precisely.                   | Auth errors follow the standard `error` envelope with a `code`; branch on `code` + HTTP status.       | api client auth handling       |

> When a gap is resolved (backend answers, or a new doc version lands), delete its
> row and fold the truth into the relevant file — don't leave stale assumptions.
