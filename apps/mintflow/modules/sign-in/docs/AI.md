# Sign In Module — AI Navigation Map

## Purpose

Auth-initiation (login) screen for mintflow — the pre-authentication entry
point. Implements the `Login.dc.html` Claude Design (kamban./Griha onboarding
look) as a responsive full-page screen.

## Module type

ContainedModule — a single self-contained view at `/`, no nested routes and
no own layout shell. It renders inside the shared app root layout
(`layouts/app/App.tsx`, wired via `app/layout.tsx`) — it does **not** own that
layout. It is the unauthenticated landing and has no nav entry.

## Route

`/` (`app/page.tsx` re-exports `ModuleSignIn`).

## Entry files

- `SignIn.tsx` — `"use client"` component; the whole screen and its two phases.
- `SignIn.types.ts` — `SignInPhase` (`"intro" | "email"`).
- `SignIn.module.css` — scoped palette/type from the design + hero, CTA, and
  reveal animation styles.
- `index.ts` — barrel, exports `ModuleSignIn` + `SignInPhase`.

## Two phases (local `useState<SignInPhase>`)

- `intro` — logo, hero artwork placeholder, headline, **Continue with email**
  CTA, **Continue with magic email** link, footer copy.
- `email` — same header, with revealed **Email** + **Password** fields and a
  **Continue** submit; **Use another method** returns to `intro`.

Clicking **Continue with email** switches `intro → email`. The swap is a short
(180 ms) `reveal-in` fade, disabled under `prefers-reduced-motion`.

## Wiring status — UI ONLY

Nothing is connected to a backend yet (deliberate, this build):

- **Continue** (email submit) and **Continue with magic email** both call
  `notifications.show(...)` with a "Not connected yet" info message.
- Submit is disabled until both fields are non-empty; no network request,
  no token storage, no redirect.

When auth is wired later, replace `handleSubmit` / the magic-email handler —
see the admin `SignInPage` in `@peppermint/admin` for the login/MFA pattern
(`/api/v1/auth/login/`, token storage, redirect).

## Output contract states

Mostly **N/A** — there is no query or mutation here, so no
empty/loading/request-failed/permission-denied/read-only/archived/conflict
states apply. The only interactive states are the `intro`/`email` phase swap
and the submit-disabled-until-filled guard.

## Design source

`Login.dc.html` (Claude Design project `26e16bfd-…`). Copy (kamban./Griha)
is kept verbatim per product decision. Colors/type live as scoped CSS custom
properties in `SignIn.module.css` — this pre-auth screen intentionally does
not use the app's brand-green design tokens.

## Do not do

- Do not add data fetching in `useEffect` — there is none here.
- Do not swap the scoped login palette for app brand tokens; the light
  onboarding look is intended.
- Do not rebuild login/MFA logic inline when wiring auth — delegate to the
  shared `@peppermint/admin` `SignInPage` pattern.
