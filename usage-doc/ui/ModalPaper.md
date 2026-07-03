# ModalPaper — Usage Guide

A `Paper` preset for the content surface that sits below a `ModuleHeader`. Fills the remaining viewport height and rounds only its top-left corner.

```ts
import { ModalPaper } from "@peppermint/ui";
```

## Typical usage — as `mainComponent`

```tsx
<ModalTableShell
  // ...
  mainComponent={ModalPaper}
/>
```

`DataTableShell` renders `ModuleHeader` first, then wraps everything else (toolbar, table) in `mainComponent`. Passing `ModalPaper` here gives that content area a card surface sized to fill the rest of the screen, without having to guess a `calc(100vh - Npx)` value.

## Standalone usage

```tsx
<ModalPaper withBorder>
  <MyContent />
</ModalPaper>
```

## Props

`ModalPaperProps` is exactly Mantine's `PaperProps` — no custom props are added. All standard `Paper` props (`withBorder`, `p`, `shadow`, `h`, `style`, ...) pass through.

| Behavior      | Default                                                              | Override                             |
| ------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Height        | `calc(100% - 45px)` (remaining space below a compact `ModuleHeader`) | Pass `h` explicitly                  |
| Corner radius | Top-left only, `var(--mantine-radius-default)`                       | Pass `style={{ borderRadius: ... }}` |

Height assumes `ModalPaper` sits directly under a `ModuleHeader` rendered without `center`, inside a container with a definite height (true anywhere under `AdminShell`). If your `ModuleHeader` uses `center` (60px tall) or sits in a different layout, pass `h` yourself.
