# @peppermint/utils — API Reference

Pure hooks and utility functions. No monorepo dependencies. React is a peer dependency.

---

## Hooks

### `useDebounce<T>(value: T, delay: number): T`

Debounces any value. Updates the returned value only after `delay` milliseconds of inactivity.

| Param   | Type     | Description                    |
| ------- | -------- | ------------------------------ |
| `value` | `T`      | Value to debounce              |
| `delay` | `number` | Debounce delay in milliseconds |

---

### `useLocalStorage<T>(key: string, initial: T): [T, setter]`

Persistent state backed by `localStorage`. Syncs across tabs via the `storage` event.

| Param     | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `key`     | `string` | localStorage key               |
| `initial` | `T`      | Initial value if key is absent |

**Returns:** `[storedValue, setValue]` — `setValue` accepts either a new value or an updater function `(prev: T) => T`.

SSR-safe: returns `initial` when `window` is not defined.

---

### `usePrevious<T>(value: T): T | undefined`

Returns the value from the previous render. Returns `undefined` on the first render.

---

### `useWindowSize(): WindowSize`

Reactive viewport dimensions. Updates on `resize`. Returns `{ width: 0, height: 0 }` during SSR.

```typescript
interface WindowSize {
  width: number;
  height: number;
}
```

---

## Formatting

All formatters are pure functions — no side effects.

### `formatDate(date, template?): string`

Formats a date using dayjs. Default template: `'DD MMM YYYY'`.

### `formatDateTime(date, template?): string`

Formats a date+time. Default template: `'DD MMM YYYY HH:mm'`.

### `formatRelative(date): string`

Returns a relative time string, e.g. `"2 hours ago"`, using dayjs `relativeTime` plugin.

### `formatNumber(value, options?, locale?): string`

Wraps `Intl.NumberFormat`. Default locale: `'en-US'`.

### `formatCurrency(value, currency?, locale?): string`

Currency formatting via `Intl.NumberFormat`. Default: `USD`, `en-US`.

### `truncate(str, length): string`

Truncates a string to `length` characters, appending `…` if truncated.

### `capitalize(str): string`

Uppercases the first character of a string.

### `slugify(str): string`

Converts a string to a URL-safe slug: lowercase, spaces to hyphens, strips non-alphanumeric characters.

---

## Validation

### `zodResolver<T>(schema: ZodSchema<T>): MantineValidateRecord`

Adapts a Zod schema to Mantine `useForm`'s `validate` object. Works with flat and nested field paths (dot-notation).

Pass the result directly to `useForm({ validate: zodResolver(schema) })`.

Runs `schema.safeParse(values)` on each field validation and maps the first matching Zod issue to Mantine's `string | null` error format.

### `parseOrNull<T>(schema: ZodSchema<T>, data: unknown): T | null`

Returns the parsed value on success, or `null` on failure. Never throws.
