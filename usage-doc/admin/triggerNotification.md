# triggerNotification — Usage Examples

## Import

```typescript
import { triggerNotification } from '@zetsel/admin';
```

---

## Basic notifications

```typescript
// Success
triggerNotification.success('Profile updated.');

// Error
triggerNotification.error('Could not connect to server.');

// Info
triggerNotification.info('Your export is being prepared.');

// Warning
triggerNotification.warning('Session expires in 5 minutes.');
```

---

## Form submit lifecycle

This is the primary use case. Call these three in sequence inside a form's submit handler:

```typescript
async function handleSubmit(values: FormValues) {
  triggerNotification.form.isLoading();   // synchronous — spinner appears instantly

  try {
    await api.post({ url: '/api/items', body: values });
    triggerNotification.form.isSuccess();
  } catch (err) {
    triggerNotification.form.isError('Failed to save item.');
  }
}
```

In `FormWrapper` (from `@zetsel/admin`), this is wired automatically — you only need it if building a custom submit flow.

---

## Long-running async operation

```typescript
async function exportCSV(ids: number[]) {
  const notifId = triggerNotification.loading('Generating export…');

  const result = await generateExport(ids);

  if (result.ok) {
    triggerNotification.update(notifId, {
      color: 'green',
      loading: false,
      title: 'Export ready',
      message: 'Your file is downloading.',
      autoClose: 4000,
    });
    downloadFile(result.data.url);
  } else {
    triggerNotification.update(notifId, {
      color: 'red',
      loading: false,
      title: 'Export failed',
      message: result.message,
      autoClose: 6000,
    });
  }
}
```

---

## Custom overrides

```typescript
import { CheckCircle } from '@phosphor-icons/react';

triggerNotification.success('Deployment complete.', {
  title: 'Production',
  autoClose: 8000,
  icon: <CheckCircle size={20} aria-label="Success" />,
});
```

---

## Notifications must be mounted

`triggerNotification` is imperative — it calls Mantine's store directly. The `<Notifications />` component must be in your app tree. `AppWrapper` from `@zetsel/ui` mounts it automatically when `withNotifications` is true (default).

```tsx
// app/layout.tsx
import { AppWrapper } from '@zetsel/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
```
