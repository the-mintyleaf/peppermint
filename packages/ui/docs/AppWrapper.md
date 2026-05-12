# AppWrapper

Root layout wrapper for Next.js App Router applications. Composes `MantineProvider`, `ModalsProvider`, and `Notifications` into a single `<html>` shell, so each Next.js app's root layout only needs one import.

## Location

`packages/ui/src/wrappers/AppWrapper/`

## Files

| File | Purpose |
|---|---|
| `AppWrapper.tsx` | Component implementation |
| `AppWrapper.types.ts` | `AppWrapperProps` and `AppWrapperClassNames` interfaces |
| `AppWrapper.module.css` | Base body styles |
| `index.ts` | Barrel export |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Page content rendered inside `<body>` |
| `title` | `string` | `'built to build.'` | `<title>` tag value |
| `theme` | `MantineThemeOverride` | `undefined` | Mantine theme overrides |
| `defaultColorScheme` | `MantineColorScheme` | `'light'` | Initial color scheme before hydration |
| `extraHeadTags` | `ReactNode` | `undefined` | Additional tags injected into `<head>` (meta, link, script) |
| `classNames.body` | `string` | `undefined` | Extra class applied to `<body>` |

## Internals

- `ColorSchemeScript` is rendered in `<head>` to prevent flash-of-wrong-theme on hydration. The `nonce` is hardcoded — replace it with a per-request CSP nonce if you add a strict CSP header.
- `ModalsProvider` wraps children so any component can call `modals.open(...)` from `@zetsel/ui`.
- `Notifications` is mounted once at the root; call `notifications.show(...)` from anywhere.

## Constraints

- Must be used as the root layout component in a Next.js App Router app (`app/layout.tsx`). It renders `<html>` and `<body>` directly, so Next.js must not add its own.
- Marked `'use client'` because `MantineProvider` requires a client context.
