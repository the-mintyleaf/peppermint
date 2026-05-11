# triggerNotification — API Reference

Imperative notification helper for `@zetsel/admin`. Wraps `@mantine/notifications` with pre-set colours, timeouts, and form-lifecycle variants.

**Prerequisite:** `Notifications` from `@mantine/notifications` must be mounted in your app tree (already included via `@zetsel/ui`'s `AppWrapper`).

---

## `triggerNotification.success(message, options?)`

Green notification, auto-closes after 4s.

```typescript
triggerNotification.success('User saved successfully.');
```

## `triggerNotification.error(message, options?)`

Red notification, auto-closes after 6s.

```typescript
triggerNotification.error('Failed to delete record.');
```

## `triggerNotification.info(message, options?)`

Blue notification, auto-closes after 4s.

```typescript
triggerNotification.info('Sync started in the background.');
```

## `triggerNotification.warning(message, options?)`

Yellow notification, auto-closes after 5s.

```typescript
triggerNotification.warning('You have unsaved changes.');
```

## `triggerNotification.loading(message): string`

Persistent blue spinner notification. Returns a notification `id` for later update.

```typescript
const id = triggerNotification.loading('Uploading file…');
// later:
triggerNotification.update(id, { color: 'green', loading: false, message: 'Done!' });
```

## `triggerNotification.update(id, data)`

Updates an existing notification by id. Accepts any `Partial<NotificationData>`.

---

## `triggerNotification.form`

Lifecycle helpers for form submission. Uses a fixed id `'form-submit'` so the same notification is reused across states.

### `triggerNotification.form.isLoading()`

Shows a persistent spinner: `"Saving…"`. Call this synchronously at the start of `handleSubmit`.

### `triggerNotification.form.isSuccess()`

Updates to green: `"Your changes have been saved."` Auto-closes after 3s.

### `triggerNotification.form.isError(error?)`

Updates to red with an optional custom error message. Auto-closes after 6s.

---

## Options passthrough

All methods except `form.*` accept a `Partial<NotificationData>` second argument to override defaults:

```typescript
triggerNotification.success('Saved.', {
  title: 'All done',
  autoClose: 2000,
  icon: <CheckIcon />,
});
```

`NotificationData` is re-exported from `@mantine/notifications` — see Mantine docs for the full shape.
