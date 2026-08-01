# AdminShell

The admin chrome: fixed icon rail (main nav) + collapsible sub-nav + main content
area, driven entirely by one `AdminShellConfig` object.

```tsx
<AdminShell
  config={config}
  mainNavHeader={IdentificationCardIcon}
  pathname={pathname}
>
  {children}
</AdminShell>
```

| Prop            | Type               | Required | Notes                                             |
| --------------- | ------------------ | -------- | ------------------------------------------------- |
| `config`        | `AdminShellConfig` | yes      | Nav, user menu, buttons, global search            |
| `mainNavHeader` | `Icon`             | yes      | Phosphor icon shown at the top of the icon rail   |
| `pathname`      | `string`           | no       | Drives the active nav item — pass `usePathname()` |
| `children`      | `ReactNode`        | yes      | Main content                                      |

## `AdminShellConfig`

| Field            | Type                            | Notes                                                                    |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `brand`          | `AdminShellBrand`               | Icon + optional href                                                     |
| `mainNav`        | `AdminShellMainNavItem[]`       | `kind: "page"` (direct href) or `kind: "module"` (owns a sub-nav)        |
| `additional`     | `AdminShellMainNavAdditional[]` | Rail items below the divider (bell, etc.) — `href` **or** `onClick`      |
| `aiButton`       | `AdminShellAiButton`            | Footer AI entry point                                                    |
| `settingsButton` | `AdminShellSettingsButton`      | Footer settings entry point                                              |
| `userMenu`       | `UserInfoPopoverProps`          | Footer avatar popover                                                    |
| `globalSearch`   | `AdminShellGlobalSearch`        | Turns the spotlight into a record search — see below                     |
| `linkComponent`  | `ElementType`                   | `next/link` — used for anchor-based nav items                            |
| `onNavigate`     | `(href: string) => void`        | **Required for spotlight/bookmark navigation** (they fire via `onClick`) |

## Spotlight / global search

The rail's magnifier button and `mod + K` both open the spotlight. With no
`globalSearch` it searches navigation targets only (previous behaviour). Supply
`globalSearch` and the same list also carries backend records.

```ts
export interface AdminShellGlobalSearch {
  search: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<AdminShellSearchResult[]>;
  scopeKey?: string; // who is searching (role/user id) — partitions the result cache
  minQueryLength?: number; // default 2
  debounceMs?: number; // default 250
  staleTime?: number; // default 30_000
  placeholder?: string;
  navResultLimit?: number; // default 4 — nav matches kept alongside records
}

export interface AdminShellSearchResult {
  id: string;
  label: string;
  description?: string;
  group: string; // result group heading, e.g. "Applicants"
  href?: string; // navigated via config.onNavigate
  onClick?: () => void; // takes precedence over href
  icon?: Icon;
  hint?: string; // right-aligned secondary text (status, match reason)
}
```

**Division of labour.** The shell owns the input, the debounce, the request
lifecycle (abort on supersede, cache partitioned by `scopeKey`) and the
loading / empty / short-query / failed states. The app owns _what_ is searched:
one function that fans out to whatever the current role may read, maps rows onto
`AdminShellSearchResult`, and swallows per-domain failures it wants to treat as
"no results".

```tsx
const config = {
  ...buildAdminConfig({ ... }),
  onNavigate: (href) => router.push(href),
  globalSearch: {
    search: (query, signal) => searchEverything(query, { signal, isAdmin }),
    scopeKey: authorityType,
    placeholder: "Search applicants, leads, clients...",
  },
};
```

**Notes**

- Results keep provider order inside a group and group order across groups —
  rank them in the provider, not by relying on the spotlight.
- Nav matches are filtered in-memory against the live query and always render
  first; records render below, capped only by the provider.
- Results are **not** carried over between queries: while a new query resolves
  the list shows "Searching...", so a row matching the previous query can never
  be one Enter away from navigating somewhere the user didn't ask for.
- Pass `scopeKey` whenever results depend on the viewer — without it a role
  change that doesn't remount the shell can serve the previous role's records.
- Record results are **not** re-filtered client-side: a row matched on a field
  the label doesn't show (email, passport number) still survives.
- A rejected `search` promise renders "Search is unavailable right now" with a
  **Try again** action. Nav matches remain usable throughout.
- Permission gating is the provider's job — the shell never inspects roles.
