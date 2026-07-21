# mintplayground — design system (Modern Lines)

mintplayground is built in **Modern Lines**: a technical/editorial visual language
where **structure comes from ruled lines, not from elevation**. No shadows, no
cards, no radius — regions are separated by 1px rules, marked at their junctions,
and closed by a single accent bar.

**This file is the whole system.** It is the source of truth for the principles,
the rules, the token vocabulary, and the two extensions this app adds — read it in
full before any visual work; there is no external spec to chase. Copy-paste recipes
and the gotchas that cost real debugging time live alongside it in
[`modern-lines-howto.md`](./modern-lines-howto.md).

Reference implementation in code:

- App shell — `layouts/app-shell/` (the canonical surface: frame → top rail → nav
  column + content → status rail → accent bar, every junction marked).
- Sign-in / password change — `SignInPage`'s `modernlines` variant in
  `@peppermint/admin`
  (`packages/admin/src/pages/SignInPage/components/layouts/SignInLayoutModernLines.tsx`
  - `.module.css`), where the language was first built.

---

## The eight principles

1. **Rules, not elevation.** Every region boundary is a 1px line. No shadows, no
   fills, no cards. If you reach for `box-shadow` to separate two things, you've
   left the language.
2. **Square everything.** `border-radius: 0` without exception — inputs, buttons,
   alerts, surfaces.
3. **Mono is for meta, never for content.** Uppercase letterspaced monospace marks
   _what a region is_ (`AUTHENTICATE`, `01/02 — CREDENTIALS`, `SECURE ACCESS`).
   Headlines and body stay in the sans.
4. **The frame is the page.** One bordered rectangle, inset from the viewport,
   subdivided into rails and columns. Not a page containing boxes.
5. **Brackets mark the live region.** Four corner L-shapes imply focus where a card
   would otherwise sit. Cheaper visually, and it doesn't compete with the frame.
6. **Tokens only.** Every colour is a Mantine variable. The language must render
   correctly in light and dark without a second set of values.
7. **Decoration is `aria-hidden`, and it drops first.** Brackets, rails and the
   accent bar carry no meaning. At narrow widths, hide them rather than let them
   wrap.
8. **One accent bar as the signature.** A single solid brand-coloured bar closes
   the frame. It is the only large area of saturated colour on the page.

---

## The rules

Every value below is a token or derived from one. Nothing here is a raw hex. Where
mintplayground defines a concrete token for a concept, its name is given inline; all
of them are declared once in `public/styles/global.css` (see
[Where the language lives in code](#where-the-language-lives-in-code)).

### 1. Structure

The page is **one frame**, not a canvas of cards.

```
┌─────────────────────────────────────────────┐
│ TOP RAIL       brand ····················· meta │  border-bottom: solid
├──────────────────────┬──────────────────────┤
│                      │                      │
│  BRAND COLUMN        │  CONTENT COLUMN      │  border-right: solid (lg+)
│  meta (top)          │   ┌ ─        ─ ┐     │
│                      │     brackets         │
│  headline (bottom)   │   └ ─        ─ ┘     │
├──────────────────────┴──────────────────────┤
│ STATUS RAIL   step ····· legal ····· version │  border-top: dashed
├─────────────────────────────────────────────┤
│ ACCENT BAR                                  │  solid brand fill
└─────────────────────────────────────────────┘
```

- The frame is inset from the viewport by `--mantine-spacing-xl` on all sides.
- `min-height: calc(100vh - 2 * inset)` — the frame always fills the screen, so it
  never floats in dead space on a short page.
- A two-child brand column uses `justify-content: space-between`: a mono meta line
  at the top, the headline at the bottom. The empty middle is deliberate — it is
  what makes the layout read as editorial rather than under-filled.
- Column split is `58% / 42%` from `lg` up, stacked below.

### 2. Borders

| Role                                      | Token / value                             |
| ----------------------------------------- | ----------------------------------------- |
| Structural (frame, rails, column divider) | `--ml-rule-solid` (`1px solid --ml-line`) |
| Subdivision **within** one region         | `--ml-rule-dotted` (see Extension 1)      |
| Terminal boundary (status rail top)       | `--ml-rule-dashed` — once per surface     |
| Control borders (inputs)                  | `1px solid var(--ml-line)`                |
| Radius                                    | `0` — everywhere, no exceptions           |

Solid means _structure_; dashed means _this is the end of the content_. Use dashed
exactly once per surface, or it stops signifying. `--ml-line` resolves to
`var(--mantine-color-default-border)`, so a re-theme is one token.

### 3. Typography

Two families, strictly divided by job.

| Role                | Family           | Size                     | Treatment                                      |
| ------------------- | ---------------- | ------------------------ | ---------------------------------------------- |
| Meta / region label | `var(--ml-mono)` | `10px`                   | `uppercase`, `letter-spacing: 0.1em`, `fw 800` |
| Input label         | `var(--ml-mono)` | `0.6875rem`              | `uppercase`, `letter-spacing: 0.08em`          |
| Page headline (h1)  | theme sans       | `clamp(2rem, 5vw, 3rem)` | `fw 500`, `lh 1.05`                            |
| Section title (h2)  | theme sans       | `1.75rem`                | `fw 500`, `lh 1.1`                             |
| Body / supporting   | theme sans       | `xs`–`sm`                | dimmed                                         |

`--ml-mono` resolves to the theme's JetBrains Mono (`theme.mantine.main.tsx` →
`fontFamilyMonospace`, loaded in `layouts/app/App.tsx`). Never hardcode a mono
stack. The headline **must** use `clamp()` — a fixed `3rem` takes five lines at
390px.

Meta text is the load-bearing device of this language. It is what makes a plain
bordered box read as _instrumentation_ rather than as an unstyled div. Every major
region gets one — in app code, via `@/components/MonoText` or
`@/components/SectionLabel`, never hand-rolled CSS.

### 4. Colour

- All ink and lines come from tokens: `--mantine-color-text`, `--ml-meta-ink`,
  `--ml-line`, `--mantine-color-body`.
- Saturated colour appears in exactly three places: the accent bar, the primary
  button, and the second half of the headline. Nowhere else.
- The accent bar is a solid `var(--mantine-color-brand-6)` strip, `0.625rem` tall,
  flush to the bottom inside the frame.
- Over a background image, the brand column switches to fixed light ink (`gray.0` /
  `gray.4`) and gets a flat 50%-black overlay. That overlay is not optional — it's
  what guarantees legibility over an arbitrary image.

Because everything is tokenised, the whole language inverts correctly for dark mode
with no second stylesheet.

### 5. Spacing

Mantine's scale only — `xs` / `sm` / `md` / `lg` / `xl`.

| Region        | Padding                                      |
| ------------- | -------------------------------------------- |
| Frame inset   | `--mantine-spacing-xl`                       |
| Rails         | `md` vertical, `lg` horizontal               |
| Columns       | `xl` vertical, `lg` horizontal               |
| Bracket frame | `lg`, with `max-width: 26rem` on the content |

Inside the content column, the label → title → supporting-copy stack uses `xl` gaps.
Tight grouping fights the airiness the frame establishes.

### 6. Responsive

Three collapse rules, in order of width:

| Breakpoint | Behaviour                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `< 30em`   | Top rail's right-hand meta is `display: none` — it wraps before it fits.                               |
| `< 48em`   | Status rail stacks vertically and centres. Three meta columns at 390px wrap into an unreadable tangle. |
| `< 75em`   | Body stacks; the column divider moves from `border-right` to `border-bottom`.                          |

The divider _moves_ rather than disappearing — the line between regions is the
language, so it has to survive the stack.

### 7. States

| State            | Treatment                                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Error            | Square red `Alert`, inline above the fields, with `role="alert"` + `aria-live="assertive"`.                                                          |
| Loading (submit) | Button's own loading state. No overlay, no skeleton — the frame must not flicker.                                                                    |
| Redirecting      | `Loader type="dots"` centred **inside the same frame**. The chrome never unmounts mid-transition.                                                    |
| Focus            | Border switches to the primary colour **plus** a 1px inset outline. This must be re-asserted explicitly — see the gotcha in `modern-lines-howto.md`. |
| Disabled         | Mantine default. Do not add opacity on top of the hairline border; it disappears.                                                                    |

The rule behind all of these: **the frame is permanent**. States change what's
inside it, never the frame itself.

### 8. Accessibility

- Brackets, rails, the accent bar and junction marks are `aria-hidden` — they carry
  no meaning.
- One `h1` per page (the brand headline), section titles as `h2`. The mono meta
  labels are `Text`, never headings — they look like labels but they are not
  document structure.
- 10px mono ink is at the small end; verify contrast in both schemes when changing
  the ramp — it is the first thing that fails. This is exactly why meta uses
  `--ml-meta-ink`, not `dimmed` (below).
- Never remove the focus outline to keep the aesthetic clean. The 1px border
  language makes focus _harder_ to see, not easier — it needs more affordance, not
  less.

---

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
language puts its most load-bearing labels at 9–10px, which is the worst place to be
short on contrast. `--ml-meta-ink` is gray.7 / gray.4 and clears it in both schemes.
The junction mark shares the token: it has to read _darker_ than the hairlines it
joins, or it resolves nothing.

`config/design/tokens.ts` predates this language and still carries the mintflow brand
values (warm paper, dark tile, radii, shadows). **The shell no longer uses them.**
Treat `tokens` as legacy: fine inside a module that has not been converted, wrong for
anything new. Radii and shadows in particular contradict principles 1 and 2 — a
converted surface uses neither.

---

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

The dashed rule keeps the base language's "exactly once per surface" rule. Dotted has
no such limit — but if a region needs more than about four dotted subdivisions, it is
more than one region and should be split with a solid rule instead.

---

## Extension 2 — junction marks

Wherever two rules meet, draw a `+` centred on the crossing (`CrossMark`).

Two hairlines meeting at a T or a cross are genuinely ambiguous at 1px — the eye
reads one bent line rather than two lines meeting. The mark resolves the crossing
and, as a side effect, gives the language the drafting-table register it is reaching
for anyway.

Rules for using it:

- **Every junction, or none in that region.** A half-marked grid looks like a bug.
- **One size, everywhere.** `--ml-cross`, and `CrossMark` takes no size prop. The
  mark is punctuation, not hierarchy — the rules already carry the rank, and varying
  the mark to restate it just makes the grid look inconsistent. If a junction seems
  to need a bigger mark, the rule ranks are wrong, not the mark.
- **Never on a free end.** A rule that stops in open space gets nothing; the mark
  means _two lines meet here_, and using it as a terminator destroys that.
- **Decoration.** Always `aria-hidden`, never interactive, never stateful. It drops
  with the rest of the decoration at narrow widths (principle 7).

The parent positions it. `CrossMark` centres itself on whatever `top`/`left`/`right`/
`bottom` coordinate it is given, so the positioning class lives in the consuming
component's `.module.css` next to the border it is marking.

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

---

## Surfaces

- **App shell** (`layouts/app-shell/`) — the reference implementation. One frame,
  inset from the viewport, subdivided into top rail / nav column + content / status
  rail / accent bar. Every junction is marked. Below `sm` (48em, `NAV_BREAKPOINT`)
  the nav column becomes a square drawer; detached, its left edge is the viewport
  rather than a rule, so the start-side junction marks drop with it (`framed={false}`).
- **Sign-in / password change** — `SignInPage`'s `modernlines` variant from
  `@peppermint/admin`, unmodified.
- **`modules/home/`** — converted off the legacy `tokens` onto Mantine/`--ml-*`
  values, so it inverts with the scheme. Its `ModalPaper`/`ModuleHeader` chrome is
  still mintflow's, flattened by the shell's control-squaring rules rather than
  rebuilt.

---

## Converting a surface

1. Wrap it in one frame. One per screen — never nest frames.
2. Decide the regions. Draw a solid rule between each. If two regions don't need a
   rule between them, they are one region.
3. Subdivide inside a region with dotted rules. Give every region a mono meta label.
4. Mark every junction with a `CrossMark`.
5. Square and de-elevate the controls, then **re-assert focus** — the scoped
   `:global()` border rule outranks Mantine's own focus styling and will silently
   kill the affordance. See the gotcha in [`modern-lines-howto.md`](./modern-lines-howto.md).
6. Close with the dashed status rail and the accent bar.
7. Check 390 / 768 / 1440 in **both** schemes before calling it done.

---

## When to use it

**Good fit:** dashboards, data-dense admin screens, sign-in and other
unauthenticated full-page surfaces — anything where a technical register is
appropriate.

**Poor fit:** marketing pages needing warmth; dense forms with many grouped sections
(the flat border treatment stops reading as hierarchy past ~3 nesting levels); and
any surface already committed to the elevation-based default look — don't mix the two
languages on one screen. When a nested module doesn't fit the frame, that is a design
signal to surface in `/design-decisions`, not a reason to reach for shadows.

---

## Recipes

Copy-paste CSS/TSX for the frame, brackets, control-squaring, rails, the accent bar,
the mono meta label, and the focus-affordance gotcha are in
[`modern-lines-howto.md`](./modern-lines-howto.md). Read the rules here first; the
how-to assumes them.
