# Bookmarks — Usage Guide

Reusable bookmark toggle and hover menu from `@peppermint/ui`. Bookmarks are stored in `localStorage` under `peppermint:bookmarks` as a JSON array of `{ id, label, href, createdAt }`.

Saved links use **pathname only** (no filter/search query params).

```ts
import { BookmarkButton, BookmarksMenu, useBookmarks } from '@peppermint/ui';
```

---

## BookmarkButton

Toggle bookmark for the current page or module.

```tsx
<BookmarkButton
  id="/admin/organization/accounts"
  label="Accounts"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Stable bookmark key (usually `basePath` or pathname) |
| `label` | `string` | Display name in the bookmarks menu |
| `href` | `string` | Optional; defaults to `window.location.pathname` |
| `size` | Mantine `ActionIcon` size | Default `md` |
| `addTooltip` | `string` | Default `"Bookmark page"` |
| `removeTooltip` | `string` | Default `"Remove bookmark"` |

`DataTableShell` renders this in the module header automatically (`id` = `basePath ?? moduleInfo.name`).

---

## BookmarksMenu

Hover-triggered menu listing all saved bookmarks. Used in AdminShell `MainNav` below Search.

```tsx
<BookmarksMenu variant="sidenav" onNavigate={(href) => router.push(href)} />
```

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'default' \| 'sidenav'` | `sidenav` matches dark main-nav icon styling |
| `onNavigate` | `(href: string) => void` | Optional; default uses `<a href>` |
| `emptyLabel` | `string` | Shown when no bookmarks exist |
| `label` | `string` | Tooltip / aria label for trigger |

Opens on **hover** (not click), positioned to the right of the trigger.

---

## useBookmarks

```tsx
const { bookmarks, isBookmarked, toggle, remove } = useBookmarks();
```

- `toggle({ id, label, href? })` — add or remove a bookmark
- `remove(id)` — remove by id
- Listens for `peppermint:bookmarks-changed` and `storage` events for sync across components/tabs

---

## Re-export from `@peppermint/admin`

```ts
import { BookmarkButton, BookmarksMenu, useBookmarks } from '@peppermint/admin';
```
