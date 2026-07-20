# Modern Lines — design language

A technical/editorial visual language where **structure comes from ruled lines,
not from elevation**. First built as the `modernlines` variant of
`SignInPage` in `@peppermint/admin`; captured here so it can be applied to other
surfaces.

Reference implementation:

- `packages/admin/src/pages/SignInPage/components/layouts/SignInLayoutModernLines.tsx`
- `packages/admin/src/pages/SignInPage/components/layouts/SignInLayoutModernLines.module.css`

## Files

| File                                       | What it's for                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| [design-language.md](./design-language.md) | The rules — structure, type, colour, borders, spacing, responsive, states |
| [how-to.md](./how-to.md)                   | Copy-paste recipes and the gotchas that cost real debugging time          |

## The eight principles

1. **Rules, not elevation.** Every region boundary is a 1px line. No shadows, no
   fills, no cards. If you reach for `box-shadow` to separate two things, you've
   left the language.
2. **Square everything.** `border-radius: 0` without exception — inputs,
   buttons, alerts, surfaces.
3. **Mono is for meta, never for content.** Uppercase letterspaced monospace
   marks _what a region is_ (`AUTHENTICATE`, `01/02 — CREDENTIALS`, `SECURE
ACCESS`). Headlines and body stay in the sans.
4. **The frame is the page.** One bordered rectangle, inset from the viewport,
   subdivided into rails and columns. Not a page containing boxes.
5. **Brackets mark the live region.** Four corner L-shapes imply focus where a
   card would otherwise sit. Cheaper visually, and it doesn't compete with the
   frame.
6. **Tokens only.** Every colour is a Mantine variable. The language must render
   correctly in light and dark without a second set of values.
7. **Decoration is `aria-hidden`, and it drops first.** Brackets, rails and the
   accent bar carry no meaning. At narrow widths, hide them rather than let them
   wrap.
8. **One accent bar as the signature.** A single solid brand-coloured bar closes
   the frame. It is the only large area of saturated colour on the page.

## When to use it

Good fit: sign-in and other unauthenticated full-page surfaces, dashboards,
data-dense admin screens, anything where a technical register is appropriate.

Poor fit: marketing pages needing warmth, dense forms with many grouped
sections (the flat border treatment stops reading as hierarchy past ~3 nesting
levels), and any surface already committed to the elevation-based default look —
don't mix the two languages on one screen.
