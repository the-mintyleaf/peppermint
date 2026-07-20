# Modern Lines — the rules

Every value below is a token or derived from one. Nothing here is a raw hex.

## 1. Structure

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

Rules:

- The frame is inset from the viewport by `--mantine-spacing-xl` on all sides.
- `min-height: calc(100vh - 2 * inset)` — the frame always fills the screen, so
  it never floats in dead space on a short page.
- The brand column uses `justify-content: space-between` with exactly two
  children: a mono meta line at the top, the headline at the bottom. The empty
  middle is deliberate — it is what makes the layout read as editorial rather
  than under-filled.
- Column split is `58% / 42%` from `lg` up, stacked below.

## 2. Borders

| Role                                      | Value                                            |
| ----------------------------------------- | ------------------------------------------------ |
| Structural (frame, rails, column divider) | `1px solid var(--mantine-color-default-border)`  |
| Terminal boundary (status rail top)       | `1px dashed var(--mantine-color-default-border)` |
| Control borders (inputs)                  | `1px solid var(--mantine-color-default-border)`  |
| Radius                                    | `0` — everywhere, no exceptions                  |

Solid means _structure_; dashed means _this is the end of the content_. Use
dashed exactly once per surface, or it stops signifying.

Alias the border colour once at the root so a re-theme is one line:

```css
.root {
  --sil-line: var(--mantine-color-default-border);
}
```

## 3. Typography

Two families, strictly divided by job.

| Role                | Family                                 | Size                     | Treatment                                      |
| ------------------- | -------------------------------------- | ------------------------ | ---------------------------------------------- |
| Meta / region label | `var(--mantine-font-family-monospace)` | `10px`                   | `uppercase`, `letter-spacing: 0.1em`, `fw 800` |
| Input label         | `var(--mantine-font-family-monospace)` | `0.6875rem`              | `uppercase`, `letter-spacing: 0.08em`          |
| Page headline (h1)  | theme sans                             | `clamp(2rem, 5vw, 3rem)` | `fw 500`, `lh 1.05`                            |
| Section title (h2)  | theme sans                             | `1.75rem`                | `fw 500`, `lh 1.1`                             |
| Body / supporting   | theme sans                             | `xs`–`sm`                | `c="dimmed"`                                   |

The headline **must** use `clamp()`. A fixed `3rem` takes five lines at 390px.

Meta text is the load-bearing device of this language. It is what makes a plain
bordered box read as _instrumentation_ rather than as an unstyled div. Every
major region gets one.

## 4. Colour

- All ink and lines come from tokens: `--mantine-color-text`,
  `--mantine-color-dimmed`, `--mantine-color-default-border`,
  `--mantine-color-body`.
- Saturated colour appears in exactly three places: the accent bar, the primary
  button, and the second half of the headline. Nowhere else.
- The accent bar is a solid `var(--mantine-color-brand-6)` strip, `0.625rem`
  tall, flush to the bottom inside the frame.
- Over a background image, the brand column switches to fixed light ink
  (`gray.0` / `gray.4`) and gets a flat 50%-black overlay. That overlay is not
  optional — it's what guarantees legibility over an arbitrary image.

Because everything else is tokenised, the whole language inverts correctly for
dark mode with no second stylesheet.

## 5. Spacing

Mantine's scale only — `xs` / `sm` / `md` / `lg` / `xl`.

| Region        | Padding                                      |
| ------------- | -------------------------------------------- |
| Frame inset   | `--mantine-spacing-xl`                       |
| Rails         | `md` vertical, `lg` horizontal               |
| Columns       | `xl` vertical, `lg` horizontal               |
| Bracket frame | `lg`, with `max-width: 26rem` on the content |

Inside the content column, the label → title → supporting-copy stack uses `xl`
gaps. Tight grouping fights the airiness the frame establishes.

## 6. Responsive

Three collapse rules, in order of width:

| Breakpoint | Behaviour                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `< 30em`   | Top rail's right-hand meta is `display: none` — it wraps before it fits.                               |
| `< 48em`   | Status rail stacks vertically and centres. Three meta columns at 390px wrap into an unreadable tangle. |
| `< 75em`   | Body stacks; the column divider moves from `border-right` to `border-bottom`.                          |

Note the divider _moves_ rather than disappearing — the line between regions is
the language, so it has to survive the stack.

## 7. States

| State            | Treatment                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Error            | Square red `Alert`, inline above the fields, with `role="alert"` + `aria-live="assertive"`.                                              |
| Loading (submit) | Button's own loading state. No overlay, no skeleton — the frame must not flicker.                                                        |
| Redirecting      | `Loader type="dots"` centred **inside the same frame**. The chrome never unmounts mid-transition.                                        |
| Focus            | Border switches to the primary colour **plus** a 1px inset outline. See the gotcha in `how-to.md` — this must be re-asserted explicitly. |
| Disabled         | Mantine default. Do not add opacity on top of the hairline border; it disappears.                                                        |

The rule behind all of these: **the frame is permanent**. States change what's
inside it, never the frame itself.

## 8. Accessibility

- Brackets, rails and the accent bar are `aria-hidden` — they carry no meaning.
- One `h1` per page (the brand headline), section titles as `h2`. The mono meta
  labels are `Text`, never headings — they look like labels but they are not
  document structure.
- 10px dimmed mono is at the small end. Verify contrast in both schemes when
  changing the ramp; it is the first thing that fails.
- Never remove the focus outline to keep the aesthetic clean. The 1px border
  language makes focus _harder_ to see, not easier — it needs more affordance,
  not less.
