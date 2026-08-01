# AdminShell — implementation notes

Consumer-facing props live in `usage-doc/admin/AdminShell.md`. This file covers
internals and the decisions behind them.

## Layout

`AdminShell.tsx` renders a Mantine `AppShell` in `mode="static"` — the navbar
width is a grid column, not padding, so the sub-nav collapse animates via a
registered `@property --app-shell-navbar-width`. Sub-nav collapse state lives in
`useSubNavStore` (`@peppermint/ui`), not local state, so other surfaces can read
it. `resolveActiveMainNavItem` (`nav.utils.ts`) picks the active rail item from
`pathname` by longest-prefix match; the first matching `page` item wins, which is
why two rail entries must never share an href.

## Spotlight (`components/Navbar/MainNav/MainNavSpotlight.tsx`)

One list, two sources filtered differently:

| Source     | Query used         | Filtering                          |
| ---------- | ------------------ | ---------------------------------- |
| Navigation | live (undebounced) | in-memory, `filterNavActions`      |
| Records    | debounced, trimmed | none — the backend already matched |

**Why `filter` is a pass-through.** Mantine's `Spotlight` runs `filter(query,
actions)` over everything it is given. Letting the default filter touch remote
results would drop rows that matched server-side on a field the label doesn't
render (email, contact number, passport number) — the applicants `?search=`
endpoint matches all four. So the final list is assembled in the component and
`filter` returns it untouched.

**Why nav filtering is reimplemented.** `defaultSpotlightFilter` is not exported
from `@mantine/spotlight`'s entry point. `filterNavActions` reproduces it
exactly — label matches first, then description/keyword matches, regrouped by the
action's `group` field, first-seen order preserved. `SpotlightActions` (the
`ActionData | ActionGroupData` union) is not exported either and is declared
locally.

**Request lifecycle.** `useQuery` keyed on `["admin-shell", "global-search",
debouncedQuery]`, `enabled` only at/above `minQueryLength`, `retry: false` (a
search must fail fast — it is re-issued on the next keystroke),
`placeholderData: keepPreviousData` so the list does not flash empty between
keystrokes, and the query's `signal` is handed to the provider so a superseded
request can be aborted. React Query dedupes/caches per query string, so
backspacing to a previous query is free within `staleTime`.

**Ids** are namespaced `global-search:<group>:<id>` — an app-supplied record id
can never collide with a nav target id (which is derived from nav ids/hrefs).

**Limits.** Mantine's own `limit` prop counts across groups and would silently
truncate the last result group, so it is left at `Infinity` and `limitFlat` caps
the nav half instead (`navResultLimit`, default 4; 10 when there are no records
to compete with). Record count is the provider's call.

### Output contract states

| State             | Handling                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Empty             | "No modules or records found..." (nav-only wording without a provider)                                    |
| Loading / partial | Loader in the input's right section; "Searching..." when the list is empty; previous results stay visible |
| Request failed    | Inline message + **Try again** (`refetch`); nav matches still usable                                      |
| Short query       | "Keep typing — N characters minimum to search records."                                                   |
| Permission denied | N/A at this layer — the provider decides which domains it may query                                       |
| Read-only         | N/A — the spotlight only navigates                                                                        |

## Files

```
AdminShell.tsx              layout + AppShell wiring
AdminShell.types.ts         config, nav, and global-search types
nav.utils.ts                active-item resolution
navSpotlight.utils.ts       nav config → spotlight targets
shell.constants.ts          widths, insets, shared card style
components/Navbar/
  AdminShell.Navbar.tsx     splits config across MainNav / SubNav
  MainNav/MainNav.tsx       icon rail; magnifier calls `spotlight.open()`
  MainNav/MainNavSpotlight.tsx  the spotlight instance (nav + records)
```
