# ModalPaper

Wraps Mantine `Paper` for use as the content surface below a `ModuleHeader` — most commonly passed as `mainComponent` to `DataTableShell` / `ModalTableShell`. Solves two problems that kept getting reimplemented ad hoc: sizing the surface to the remaining viewport height, and giving it a single rounded corner instead of Mantine's uniform `radius`.

## Location

`packages/ui/src/components/ModalPaper/`

## Files

| File                  | Purpose                            |
| --------------------- | ---------------------------------- |
| `ModalPaper.tsx`      | Component implementation           |
| `ModalPaper.types.ts` | `ModalPaperProps` (= `PaperProps`) |
| `index.ts`            | Barrel export                      |

## Behavior

- **Height** — defaults to `calc(100% - ${MODULE_HEADER_HEIGHT}px)` (`MODULE_HEADER_HEIGHT` is exported from `ModuleHeader`, currently `45`). This assumes the nearest positioned ancestor has a definite height (true under `AdminShell`, where the content `Box` is a stretched flex item) and that `ModalPaper` sits as a sibling directly below a `ModuleHeader` rendered without `center` (the 60px-tall variant). Pass an explicit `h` prop to override for other layouts.
- **Radius** — hardcodes `border-radius: var(--mantine-radius-default) 0 0 0` via inline `style` (top-left only, other corners square) plus `overflow: hidden` so content clips to the rounded corner. This intentionally bypasses Mantine's `radius` prop, which only supports uniform corners.
- Any `style` passed by the consumer is merged on top of these defaults (consumer wins on conflicting keys), and any other `PaperProps` (`withBorder`, `p`, `h`, etc.) pass straight through to `Paper`.

## Constraints

- `'use client'` — depends on Mantine's `Paper`.
- Keep the height formula in sync with `ModuleHeader`: if `ModuleHeader`'s compact-mode height ever changes, update `MODULE_HEADER_HEIGHT` there rather than hardcoding a new number here.
