# mintflow — Authentication (todo)

Mirror mintflow-admin's auth wiring into mintflow: login, tokenization, forced +
own password change, logout, auth gate + role-based nav.

## Phase 1 — API + token layer

- [x] `lib/api.ts` — configureApiClient (baseURL, refreshEndpoint `/api/v1/auth/refresh/`)
- [x] `lib/authErrorMessages.ts` — ERROR_MESSAGES (auth subset) + getApiError/getApiErrorMessage

## Phase 2 — auth hooks/types (`modules/auth/_shared/`)

- [x] `auth.types.ts` — CurrentUser
- [x] `useCurrentUser.ts`
- [x] `useLogout.ts`
- [x] `ChangePasswordForm/` (5 files + index) copied from admin

## Phase 3 — pre-auth routes

- [x] `modules/auth/sign-in/` — ModuleSignIn (+ index)
- [x] `modules/auth/password-change/` — ModulePasswordChange (+ index)
- [x] `app/page.tsx` — re-export ModuleSignIn (was redirect to /dashboard)
- [x] `app/password-change/page.tsx` — re-export ModulePasswordChange

## Phase 4 — gate + role-based nav

- [x] `AppShell.types.ts` — add `requiresStaff?` to nav item/group
- [x] `AppShell.tsx` — token gate, useCurrentUser loader, password_change redirect, dynamic user menu, role filter, account modal
- [x] `nav.config.tsx` — remove placeholder sign-out onClick
- [x] `components/AccountModal/` — change-password modal (+ barrel)

## Phase 5 — docs + verification

- [x] Update `docs/AI.md` (app map)
- [x] `pnpm check-types && pnpm lint` (clean; only pre-existing font warnings)
- [ ] Dual adversarial review; commit
