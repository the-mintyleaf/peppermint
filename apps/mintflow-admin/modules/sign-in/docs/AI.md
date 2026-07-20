# Sign In Module — AI Navigation Map

## Purpose

Sign-in screen, including the MFA challenge step, for mintflow.

## Module type

RouteModule — owns its own layout (`layouts/app/App.tsx`), sits outside the
admin shell, and has no nav entry (it's the pre-authentication entry point).

## Route

`/`

## Entry files

- `SignIn.tsx` — thin wrapper configuring `SignInPage` from `@peppermint/admin`.
- `index.ts` — barrel, exports `ModuleSignIn`.
- `app/page.tsx` — one-line re-export.

## Architecture note

Login/MFA logic lives inside `@peppermint/admin`'s `SignInPage` component
itself (`packages/admin/src/pages/SignInPage/`), not in this module.
`SignInPage` does its own `fetch()` (not the app's `api.ts`/React Query — it's
a shared, backend-agnostic component that takes raw endpoint URLs as props)
and handles: the `identifier`/password form, the `mfa_required` +
`challenge_id` MFA round-trip (`mfaVerifyApi`), inline error display
(`errorMessageMap`), token storage (`access_token`/`refresh_token` in
`localStorage`, matching what `lib/api.ts` reads), and redirect on success.

This module only supplies mintflow-specific configuration: full backend URLs
(`${NEXT_PUBLIC_API_URL}/api/v1/auth/...`), `identifierField="identifier"`,
the shared `ERROR_MESSAGES` map from `lib/authErrorMessages.ts`, and an
`onMfaSetupRecommended` callback.

## Common edit targets

| Task                                 | Files                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Change login/MFA flow behavior       | `packages/admin/src/pages/SignInPage/SignInPage.hooks.ts` (`useSignInController` — shared, check other consumers first)                     |
| Change sign-in page chrome           | `packages/admin/src/pages/SignInPage/components/layouts/` (`SignInLayoutDefault` / `SignInLayoutModernLines`, picked by the `variant` prop) |
| Change the forms inside the page     | `packages/admin/src/pages/SignInPage/components/SignInPanelContent.tsx` (shared by every variant)                                           |
| Change mintflow-specific copy/config | `SignIn.tsx`                                                                                                                                |
| Change error copy                    | `lib/authErrorMessages.ts` (`ERROR_MESSAGES`)                                                                                               |

## Backend endpoints

- `POST /api/v1/auth/login/` `{identifier, password}` → either
  `{access, refresh, user, mfa_setup_recommended}` (success) or
  `{mfa_required: true, challenge_id}` (both are 200 responses — MFA required
  is not an error).
- `POST /api/v1/auth/mfa/totp/verify/` `{challenge_id, code}` → same shape as
  a successful login (`{access, refresh, user}`). `code` accepts both TOTP
  and recovery codes.

## State ownership

- MFA phase / error / loading state: local `useState` inside
  `useSignInController` (`packages/admin/src/pages/SignInPage/SignInPage.hooks.ts`),
  handed to the layout variants as a `SignInController` object.
- Already-signed-in redirect: `useEffect` reading `localStorage` in
  `SignIn.tsx` (mirrors the check in `layouts/admin/Admin.tsx`).

## Do not do

- Do not rebuild login/MFA logic in this module — it belongs in the shared
  `SignInPage` component.
- Do not fetch data in `useEffect` for anything other than the one-off
  already-signed-in redirect check.
- Do not imply which field (identifier vs password) was wrong on
  `AUTH_INVALID_CREDENTIALS` — this is deliberate account-enumeration
  defense from the backend, and `SignInPage` already respects it by showing
  the backend's own generic message.
