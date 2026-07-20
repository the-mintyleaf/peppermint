# PasswordChangePage — implementation notes

Consumer-facing props live in `usage-doc/admin/PasswordChangePage.md`. This file
covers internals and the decisions behind them.

## Shape

```
PasswordChangePage.tsx        dispatcher — resolves defaults, picks a layout, renders the scheme toggle
PasswordChangePage.hooks.ts   usePasswordChangeController — form, mutation, phases, error routing
PasswordChangePage.types.ts   props, controller, layout contract
utils/
  resolvePasswordChangePageProps.ts  applies presentational defaults once
  passwordStrength.ts                requirement checklist + score
components/
  PasswordChangePanelContent.tsx     the phase tree — shared by every variant
  PasswordChangeForm.tsx             the three fields
  PasswordStrengthMeter.tsx          gauge + checklist
  layouts/
    PasswordChangeLayoutDefault.tsx      gradient panel + centred card
    PasswordChangeLayoutModernLines.tsx  bordered frame
```

The modern-lines chrome comes from `src/pages/_shared/modernLines.module.css`
rather than a local copy — see below.

## Why it mirrors SignInPage

The two pages are the same architecture on purpose: controller hook → resolved
props → swappable layout, all three layers wired by a `variant` dispatch. The
previous version was a single 270-line component fusing the flow, the form and
the chrome, which is exactly the shape `SignInPage` was refactored out of.

Mirroring it buys two things beyond tidiness. A consumer who has already dressed
their sign-in page passes the same prop names here and gets a matching screen.
And adding a third variant later is one file plus one line in each dispatcher,
in both pages, rather than a fork of whichever one was touched last.

## Why the form instance lives in the controller

`SignInPage` keeps its `useForm` inside `SignInForm`, because nothing outside
that component reads the values. Here the strength meter scores
`new_password` live, so the form is hoisted into the controller and exposed on
`PasswordChangeController.form`. That keeps the meter, the length rule and the
submit validation reading one source — a meter with its own copy of the rule
would eventually disagree with what submit enforces.

`minPasswordLength` rides on the controller for the same reason: the placeholder,
the checklist and the validator all read the resolved value, not a constant.

## Why errors are routed to fields by code

A wrong current password reported as a page-level banner makes the user re-read
three fields to find the one at fault. `ERROR_FIELDS` maps the codes this flow
can produce onto the input that caused them; everything else — including network
and parse failures — falls through to the page-level alert, because attributing
an unknown failure to a field would be a guess that misdirects the user.

`resolveErrorMessage` prefers the consumer's `errorMessageMap`, then the page's
own defaults, then the backend's `error.message`/`message`. The default map is
what makes the page usable with no configuration at all; the consumer map is
what lets an app speak in its own voice.

The `response.json()` parse is guarded: a proxy 502 has no JSON body, and an
unparseable one must still surface as this flow's error type rather than as an
opaque `SyntaxError` with no user-facing message.

## Why `_shared/modernLines.module.css`

The modern-lines chrome is ~200 lines of rules that both auth pages need
identically. Duplicating it would guarantee drift the first time either page's
frame is adjusted, so it lives once under `src/pages/_shared/` and is imported by
the layout that needs it.

`SignInLayoutModernLines.module.css` is still its own copy, because that file was
mid-edit when this page was built. Pointing it at the shared module is a one-line
import change and should happen once that work lands; until then the shared file
carries a comment saying so.

The variable prefix is `--ml-*` (not `--sil-*`) since the module is no longer
sign-in-specific.

## Why a CSS Module rather than a theme override

Same reasoning as `SignInPage`: a nested `MantineProvider` would fight the host
app's theme — including the global `Modal` body-padding override every Peppermint
app sets — and restyle far more than this page. A module scoped to `.root`
reaches exactly the controls on this page.

## Accessibility

- The confirmation state replaces a form that held focus, so it is announced via
  `role="status"` / `aria-live="polite"`; the page-level error alert uses
  `role="alert"` / `aria-live="assertive"`.
- The strength gauge carries `aria-valuenow` plus an `aria-valuetext` of the
  label, so it is not conveyed by bar colour alone; each checklist row prefixes a
  visually-hidden "Met:" / "Not met:".
- The form is `noValidate`: the browser's own bubbles would compete with the
  field-level messages the flow places itself.
