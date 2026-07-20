# mintplayground — design system

The app is built in **Modern Lines**. The language itself is defined in
`inspos/design-system/` (README → `design-language.md` → `how-to.md`) — read that
first; it is the source of truth for the eight principles, the type ramp, the
colour rules and the responsive collapse order.

This file records only what is specific to mintplayground: where the tokens live,
the two extensions this app adds to the language, and the surfaces already built
in it.

## Where the language lives in code

| Thing                       | Where                                                    |
| --------------------------- | -------------------------------------------------------- |
| Line tokens (`--ml-*`)      | `public/styles/global.css` (`:root`)                     |
| Meta ink (`--ml-meta-ink`)  | `public/styles/global.css` — NOT `dimmed`, see below     |
| Junction mark               | `components/CrossMark/`                                  |
| Mono meta text              | `components/MonoText/`, `components/SectionLabel/`       |
| Reference surface — shell   | `layouts/app-shell/`                                     |
| Reference surface — sign-in | `SignInPage` `modernlines` variant (`@peppermint/admin`) |

Never hardcode a hairline. `var(--ml-line)` or one of the `--ml-rule-*` shorthands,
always. Never hardcode a mono stack — `var(--ml-mono)`, which resolves to the
theme's JetBrains Mono.

**Meta text uses `var(--ml-meta-ink)`, never Mantine's `dimmed`.** `dimmed` is
gray.6, ~3.2:1 on this theme's near-white body — under the AA floor, and this
language puts its most load-bearing labels at 9–10px, which is the worst place to
be short on contrast. `--ml-meta-ink` is gray.7 / gray.4 and clears it in both
schemes. The junction mark shares the token: it has to read _darker_ than the
hairlines it joins, or it resolves nothing.

`config/design/tokens.ts` predates this language and still carries the mintflow
brand values (warm paper, dark tile, radii, shadows). **The shell no longer uses
them.** Treat `tokens` as legacy: fine inside a module that has not been converted,
wrong for anything new. Radii and shadows in particular contradict principles 1
and 2 — a converted surface uses neither.

## Extension 1 — rule rank

The base language names two rules: solid for structure, dashed for the terminal
boundary. A shell has a third need — subdividing a region that is already inside a
solid boundary (nav groups inside the nav column, the footer cluster above the
account row). Promoting those to solid would flatten the hierarchy; leaving them
undrawn loses the language.

So there are three ranks, and each one means exactly one thing:

| Rule         | Token              | Means                                     |
| ------------ | ------------------ | ----------------------------------------- |
| `1px solid`  | `--ml-rule-solid`  | Boundary **between** two regions          |
| `1px dotted` | `--ml-rule-dotted` | Subdivision **within** one region         |
| `1px dashed` | `--ml-rule-dashed` | **End** of the content — once per surface |

Reading the shell top to bottom: the top rail closes with solid (new region), the
nav column's brand / search / groups / footer blocks separate with dotted (same
region, subdivided), the status rail opens with dashed (nothing follows but the
accent bar).

The dashed rule keeps the base language's "exactly once per surface" rule. Dotted
has no such limit — but if a region needs more than about four dotted subdivisions,
it is more than one region and should be split with a solid rule instead.

## Extension 2 — junction marks

Wherever two rules meet, draw a `+` centred on the crossing (`CrossMark`).

Two hairlines meeting at a T or a cross are genuinely ambiguous at 1px — the eye
reads one bent line rather than two lines meeting. The mark resolves the crossing
and, as a side effect, gives the language the drafting-table register it is
reaching for anyway.

Rules for using it:

- **Every junction, or none in that region.** A half-marked grid looks like a bug.
- **One size, everywhere.** `--ml-cross`, and `CrossMark` takes no size prop. The
  mark is punctuation, not hierarchy — the rules already carry the rank, and
  varying the mark to restate it just makes the grid look inconsistent. If a
  junction seems to need a bigger mark, the rule ranks are wrong, not the mark.
- **Never on a free end.** A rule that stops in open space gets nothing; the mark
  means _two lines meet here_, and using it as a terminator destroys that.
- **Decoration.** Always `aria-hidden`, never interactive, never stateful. It drops
  with the rest of the decoration at narrow widths (principle 7).

The parent positions it. `CrossMark` centres itself on whatever `top`/`left`/
`right`/`bottom` coordinate it is given, so the positioning class lives in the
consuming component's `.module.css` next to the border it is marking.

```css
.navCol {
  position: relative;
  border-right: var(--ml-rule-solid);
}
/* where the nav column's right edge meets the top rail's bottom rule */
.navColTopJunction {
  top: 0;
  right: 0;
}
```

```tsx
<Box className={classes.navCol}>
  <CrossMark className={classes.navColTopJunction} />
  {/* … */}
</Box>
```

## Surfaces

- **App shell** (`layouts/app-shell/`) — the reference implementation. One frame,
  inset from the viewport, subdivided into top rail / nav column + content /
  status rail / accent bar. Every junction is marked. Below `sm` (48em, `NAV_BREAKPOINT`) the nav
  column becomes a square drawer; detached, its left edge is the viewport rather
  than a rule, so the start-side junction marks drop with it (`framed={false}`).
- **Sign-in / password change** — `SignInPage`'s `modernlines` variant from
  `@peppermint/admin`, unmodified.
- **`modules/home/`** — converted off the legacy `tokens` onto Mantine/`--ml-*`
  values, so it inverts with the scheme. Its `ModalPaper`/`ModuleHeader` chrome is
  still mintflow's, flattened by the shell's control-squaring rules rather than
  rebuilt.

## Converting a surface

1. Wrap it in one frame. One per screen — never nest frames.
2. Decide the regions. Draw a solid rule between each. If two regions don't need a
   rule between them, they are one region.
3. Subdivide inside a region with dotted rules. Give every region a mono meta label.
4. Mark every junction with a `CrossMark`.
5. Square and de-elevate the controls, then **re-assert focus** — the scoped
   `:global()` border rule outranks Mantine's own focus styling and will silently
   kill the affordance. See the gotcha in `inspos/design-system/how-to.md`.
6. Close with the dashed status rail and the accent bar.
7. Check 390 / 768 / 1440 in **both** schemes before calling it done.
