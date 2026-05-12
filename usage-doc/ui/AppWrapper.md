# Usage: AppWrapper

`AppWrapper` is the root layout shell for any Next.js app in this monorepo. Drop it into `app/layout.tsx` — it handles `<html>`, `<head>`, Mantine theming, modals, and notifications.

## Installation

`AppWrapper` is exported from `@zetsel/ui`. No additional setup needed.

## Basic usage

```tsx
// app/layout.tsx
import { AppWrapper } from '@zetsel/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper>
      {children}
    </AppWrapper>
  );
}
```

> Do **not** add your own `<html>` or `<body>` tags — `AppWrapper` renders both.

## With a custom theme

```tsx
// app/layout.tsx
import { AppWrapper } from '@zetsel/ui';
import type { MantineThemeOverride } from '@zetsel/ui';

const theme: MantineThemeOverride = {
  primaryColor: 'violet',
  fontFamily: 'Inter, sans-serif',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper theme={theme} title="My App">
      {children}
    </AppWrapper>
  );
}
```

## With dark mode default

```tsx
<AppWrapper defaultColorScheme="dark">
  {children}
</AppWrapper>
```

## With extra head tags

```tsx
<AppWrapper
  extraHeadTags={
    <>
      <meta name="description" content="My application" />
      <link rel="icon" href="/favicon.ico" />
    </>
  }
>
  {children}
</AppWrapper>
```

## With a custom body class

```tsx
<AppWrapper classNames={{ body: 'my-custom-body' }}>
  {children}
</AppWrapper>
```

## Using modals (anywhere in the tree)

```tsx
import { modals } from '@zetsel/ui';

modals.openConfirmModal({
  title: 'Confirm action',
  children: <p>Are you sure?</p>,
  onConfirm: () => doSomething(),
});
```

## Using notifications (anywhere in the tree)

```tsx
import { notifications } from '@zetsel/ui';

notifications.show({
  title: 'Saved',
  message: 'Your changes have been saved.',
  color: 'green',
});
```

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Page content |
| `title` | `string` | `'built to build.'` | Browser tab title |
| `theme` | `MantineThemeOverride` | — | Mantine theme overrides |
| `defaultColorScheme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Initial color scheme |
| `extraHeadTags` | `ReactNode` | — | Additional `<head>` content |
| `classNames.body` | `string` | — | Extra CSS class on `<body>` |
