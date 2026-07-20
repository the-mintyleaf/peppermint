# Modern Lines — how-to

Recipes lifted from the working implementation. Paths are relative to the repo
root.

## Set up the root

Alias the line colour and the mono stack once. Everything else references these.

```css
.root {
  --sil-line: var(--mantine-color-default-border);
  --sil-inset: var(--mantine-spacing-xl);

  min-height: 100vh;
  padding: var(--sil-inset);
  background-color: var(--mantine-color-body);
}

.frame {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 2 * var(--sil-inset));
  border: 1px solid var(--sil-line);
}
```

**Use the theme's mono, not your own stack.** `apps/mintflow` already ships
JetBrains Mono via `theme.mantine.main.tsx` (`fontFamilyMonospace`). Reach for
the token:

```css
.meta {
  font-family: var(--mantine-font-family-monospace);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

Never hardcode your own mono stack — it silently bypasses the app's font. In
mintflow the webfont is loaded by `apps/mintflow/layouts/app/App.tsx` (Google
Fonts `<link>`, weights 400–700) and named in `theme.mantine.main.tsx`.

Two related notes:

- The link requests up to `700`, so `fw={800}` on a meta label renders with the
  700 face. Either drop to 700 or add 800 to the font request.
- **In app-level code, use `@/components/MonoText` instead of this CSS.** It
  already applies the mono + uppercase + tracking treatment. The package layout
  can't reach it (packages must never import from `apps/`), which is the only
  reason `.meta` exists as CSS.

Do **not** use `var(--font-special)` — it appears in `SignInLayoutDefault` but is
defined nowhere in the repo and silently resolves to nothing.

## Corner brackets with no extra markup

Four L-shapes from two nested wrappers, two pseudo-elements each.

```css
.formFrame {
  position: relative;
  width: 100%;
  max-width: 26rem;
  padding: var(--mantine-spacing-lg);
}
.formFrameInner {
  position: static; /* so its pseudos anchor to .formFrame */
}

.formFrame::before,
.formFrame::after,
.formFrameInner::before,
.formFrameInner::after {
  content: "";
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none;
}

.formFrame::before {
  top: 0;
  left: 0;
  border-top: 1px solid var(--sil-line);
  border-left: 1px solid var(--sil-line);
}
.formFrame::after {
  right: 0;
  bottom: 0;
  border-right: 1px solid var(--sil-line);
  border-bottom: 1px solid var(--sil-line);
}
.formFrameInner::before {
  top: 0;
  right: 0;
  border-top: 1px solid var(--sil-line);
  border-right: 1px solid var(--sil-line);
}
.formFrameInner::after {
  bottom: 0;
  left: 0;
  border-bottom: 1px solid var(--sil-line);
  border-left: 1px solid var(--sil-line);
}
```

`position: static` on the inner wrapper is the trick — it makes both elements'
pseudos resolve against the same containing block.

```tsx
<Box className={classes.formFrame}>
  <Box className={classes.formFrameInner}>{children}</Box>
</Box>
```

## Square the Mantine controls

Scope to the variant root so nothing else in the app is touched.

```css
.root :global(.mantine-TextInput-input),
.root :global(.mantine-PasswordInput-input),
.root :global(.mantine-Button-root),
.root :global(.mantine-Alert-root),
.root :global(.mantine-Paper-root) {
  border-radius: 0;
  box-shadow: none;
}

.root :global(.mantine-TextInput-input),
.root :global(.mantine-PasswordInput-input) {
  border: 1px solid var(--sil-line);
  background-color: transparent;
}
```

### ⚠ The gotcha that will bite you

`.root :global(...)` has higher specificity than Mantine's own focus styling, so
the border rule above **silently kills the focus affordance**. A focused input
looks identical to an idle one — a keyboard-accessibility failure, not a
cosmetic one. Re-assert it explicitly:

```css
.root :global(.mantine-TextInput-input):focus,
.root :global(.mantine-TextInput-input):focus-within,
.root :global(.mantine-PasswordInput-input):focus,
.root :global(.mantine-PasswordInput-input):focus-within {
  border-color: var(--mantine-primary-color-filled);
  outline: 1px solid var(--mantine-primary-color-filled);
  outline-offset: -2px;
}
```

`PasswordInput` needs `:focus-within` — the visible border is on a wrapper, not
the `<input>` itself.

## Mono meta label

The single most characteristic element. Every region gets one.

```tsx
<Text className={classes.meta} fw={800} size="10px" c="dimmed">
  Authenticate
</Text>
```

Write it in sentence case in JSX and let CSS uppercase it — that way the string
stays readable for translators and screen readers get normal casing.

## Rails

```css
.topRail,
.statusRail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mantine-spacing-md);
  padding: var(--mantine-spacing-md) var(--mantine-spacing-lg);
}
.topRail {
  border-bottom: 1px solid var(--sil-line);
}
.statusRail {
  border-top: 1px dashed var(--sil-line);
}

/* Stack the status rail before its three columns collide. */
@media (max-width: 47.99em) {
  .statusRail {
    flex-direction: column;
    gap: var(--mantine-spacing-xs);
    text-align: center;
  }
}

/* Decorative meta drops rather than wraps. */
@media (max-width: 30em) {
  .topRailMeta {
    display: none;
  }
}
```

## The accent bar

Last child inside the frame, `aria-hidden`.

```css
.accentBar {
  height: 0.625rem;
  background: var(--mantine-color-brand-6);
}
```

```tsx
<Box className={classes.accentBar} aria-hidden />
```

## Applying the language to a new surface

1. Wrap the page in `.root` → `.frame`. Do not nest frames — one per screen.
2. Decide the regions, then draw one solid rule between each. If two regions
   don't need a rule between them, they're one region.
3. Give every region a mono meta label.
4. Put brackets around the one region the user acts in. Exactly one per screen —
   two competing bracket sets destroy the focal point.
5. Square and de-elevate the controls, then re-assert focus (above).
6. Close with the dashed status rail and the accent bar.
7. Check 390 / 768 / 1440 in **both** schemes before calling it done. Every
   issue found in this language's first build was a responsive or contrast one,
   never a desktop-light one.

## Verifying

```bash
node .claude/scripts/screenshot.mjs \
  --url http://localhost:3000/<route> \
  --out <scratchpad>/visual-review/<slug> \
  --widths 390,768,1440 --schemes light,dark
```

Note: if the app forces a colour scheme, `--schemes dark` returns light captures.
Click the toggle in a Playwright script instead of trusting the flag — otherwise
you'll ship dark mode unverified.
