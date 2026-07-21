# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each set below as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here).

## Core domain enums

**`core` defines no `TextChoices` / `IntegerChoices` domain enums** — it owns no
business data (per the pack convention, the heading is kept and the absence stated
explicitly). The platform's real enums (`lifecycle_stage`, `document.status`,
etc.) live in their owning apps' packs.

The only closed value sets `core` itself produces are the fixed **status literals**
of the health/readiness probes, registered below so this file stays the single
enum registry the `entities/*.md` tables reference by name.

## Health / readiness probes

**`health_status`** — the `/health/` liveness body. Single value.

| Value | UI label     |
| ----- | ------------ |
| `ok`  | Healthy / up |

**`ready_status`** — the `/ready/` readiness body. Which value returns is tied to
the HTTP status: `ready` → 200, `not ready` → 503.

| Value       | UI label  | HTTP |
| ----------- | --------- | ---- |
| `ready`     | Ready     | 200  |
| `not ready` | Not ready | 503  |
