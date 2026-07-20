# SignInPage — implementation notes

Consumer-facing props live in `usage-doc/admin/SignInPage.md`. This file covers
internals and the decisions behind them.

## Shape

```
SignInPage.tsx              dispatcher — resolves defaults, picks a layout, renders the scheme toggle
SignInPage.hooks.ts         useSignInController — the entire flow
SignInPage.types.ts         props, controller, layout contract
utils/
  resolveSignInPageProps.ts applies presentational defaults once
  unwrapEnvelope.ts         { success, data } unwrap
components/
  SignInPanelContent.tsx    the phase tree — shared by every variant
  SignInForm.tsx            credentials
  MfaChallengeForm.tsx      MFA code
  MagicLinkForm.tsx         magic link
  GoogleIcon.tsx
  layouts/
    SignInLayoutDefault.tsx        gradient panel + centred card
    SignInLayoutModernLines.tsx    bordered frame
    SignInLayoutModernLines.module.css
```

## Why the controller/layout split

The page was one 595-line component fusing three concerns: the auth flow, the
phase-switching form tree, and the outer chrome. Adding a second appearance by
branching inside it would have pushed it past 900 lines.

The split is what makes variants cheap:

- **`useSignInController`** owns phases, both mutations, token storage and the
  handlers. It has nothing to do with appearance, so it is written once.
- **`SignInPanelContent`** owns the error alert and the three forms. Duplicating
  this per variant would have been ~150 lines of drift risk, so variants wrap it
  rather than reimplement it. Only the heading block and the chrome are per-variant.
- **Layouts** own nothing but arrangement. Both implement `SignInLayoutProps`, so
  the dispatch in `SignInPage.tsx` is a straight component swap.

## Why defaults are resolved in the dispatcher

`resolveSignInPageProps` applies every presentational default (`heading`, `brand`,
the `has*Login` flags, …) once, at the page level, and layouts receive
`ResolvedSignInPageProps` where those fields are `Required`.

Defaulting inside a layout instead — which is how the first cut was written —
means a second variant silently receives `undefined` for anything the consumer
omitted, and `heading[0]` throws on the one route with no authenticated fallback.
It also lets two variants disagree about the fallback copy. The `Required<Pick<…>>`
type is what makes the guarantee checkable rather than conventional.

## Why a CSS Module for `modernlines`, not a theme override

Wrapping the variant in a nested `MantineProvider` would fight the host app's own
theme — including the global `Modal` body-padding override every Peppermint app
sets — and would restyle far more than this one page. A CSS Module scoped to
`.root` reaches exactly the controls on this page and nothing else.

The module does three things: draws the frame, and then reaches into Mantine's
control classes to square the corners and swap elevation for hairline borders.
That second part re-asserts focus styling explicitly — the border rule outranks
Mantine's own focus treatment, and without the re-assert a focused field looks
inert, which is a keyboard-accessibility failure, not a cosmetic one.

All colour comes from tokens (`--mantine-color-default-border`,
`--mantine-color-body`, `dimmed`, `brand`), so the variant follows the app's
light/dark toggle. Monospace is confined to meta text and input labels via a
`--sil-mono` var with a system-mono stack — the package ships no font.

Note: `var(--font-special)`, referenced by `SignInLayoutDefault`, is not defined
anywhere in the repo and resolves to nothing. It is inherited from the original
component; `modernlines` deliberately does not use it.

## Known gaps

- `SignInForm` and `MfaChallengeForm` call `useForm` from `@mantine/form`
  directly. CLAUDE.md mandates `FormWrapper` and forbids direct `@mantine/*`
  imports. Migrating changes validation timing, dirty tracking and submit
  semantics across three consuming apps, so it belongs in its own commit behind
  `/form-builder` — not smuggled into variant work.
- `icon` and `forgotRedirectUrl` are in `SignInPageProps` but read by nothing.
  They were already dead before the split. Removing them is a breaking change to
  the package's public surface and needs a consumer sweep first.
- `SignInLayoutDefault` hardcodes `c="gray.0"` for its headline, redirect state
  and legal text while the page ships a light/dark toggle. In light mode that is
  near-white text on a near-white background. Pre-existing, and fixing it changes
  the default variant's appearance, so it is deliberately out of scope here —
  `modernlines` does not repeat the pattern.
