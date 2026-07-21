<!-- Copy to `<app>/docs/integration/enums.md` and fill in. This is the ONE place
     every enum value lives. Entity field tables reference a set by name (the
     `Enum` column); they never re-list values inline. Values are the WIRE values
     (send/receive verbatim); "UI label" is a suggested display string the
     frontend owns — the backend never sends a label. -->

# Enums

Every enum value the module returns or accepts, in one place.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here).

## `<Entity or grouping>`

**`<enum_name>`** — `<one-line meaning; note if forward-only / transition-only>`.

| Value     | UI label  |
| --------- | --------- |
| `<value>` | `<Label>` |

<!-- For a short enum you may inline it: **`<enum_name>`**: `a` · `b` · `c`
     (default `a`). For a status enum with per-value behavior, add extra columns
     (e.g. "Editable content?"). Add a section per entity that owns enums. If a
     value set is defined elsewhere and not yet enumerable, say so and link the
     source rather than guessing — unknown value sets belong in gaps.md. -->
