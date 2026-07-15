# mintway app + grandway auth — TODO

## Phase 0 — Shared package extensions (additive)

- [x] 0a. `@peppermint/api-client` — cookie-refresh mode (refreshMode, withCredentials, csrfCookieName, csrfHeaderName, accessResponseField)
- [x] 0a. Docs — inline JSDoc (no standalone doc files exist for configureApiClient)
- [x] 0b. `SignInPage` — read access_token, onPasswordChangeRequired challenge branch, extend SignInResultData, opt-in withCredentials on postAuth
- [x] 0b. Docs — inline JSDoc/types (no standalone SignInPage doc files exist)
- [x] Verify mintflow still type-checks
- [x] Commit + dual review (Codex + adversarial) → fixes applied + committed

## Phase 1 — mintway app scaffold

- [x] package.json, tsconfig.json, next.config.ts, next-env.d.ts
- [x] config/theme/\*, app/globals.css
- [x] layouts/app/\*
- [x] layouts/admin/\* (role-adapted)
- [x] lib/api.ts (cookie refresh config), lib/authErrorMessages.ts (grandway codes), lib/csrf.ts
- [x] components/{RequireStaff,createListModule,QueryErrorState}/\*
- [x] app/\*\* re-exports
- [x] modules/admin/{home,not-found}/\*
- [x] Commit

## Phase 2 — Auth foundation & login flow

- [x] \_shared/authenticate.types.ts (grandway shapes)
- [x] \_shared/useCurrentUser.ts (role-based)
- [x] \_shared/useLogout.ts (CSRF)
- [x] modules/sign-in/SignIn.tsx (username, challenge callback)
- [x] modules/password-change/PasswordChange.tsx (dual-mode) + PasswordStrengthMeter
- [x] Commit

## Phase 3 — Admin layout identity wiring

- [x] layouts/admin/Admin.tsx (role gate, user-menu, session guard)

## Phase 4 — Account Settings modal

- [x] account-settings: Profile (read-only), Security (change password), Sessions (+ logout-all)
- [x] account-settings.api.ts / .types.ts
- [x] Commit Phase 3+4 + dual review

## Phase 5 — Users admin module

- [x] /design-decisions pass
- [x] users.api.ts, users.types.ts, users.queryKeys.ts
- [x] pages/list/UsersList.tsx (tabs, search, row actions, drawer)
- [x] form/UserForm.tsx (create) + OneTimeSecretModal
- [x] form/UserProfileEditForm.tsx
- [x] Row actions (role-gated lifecycle)
- [x] UserDetailDrawer (Overview / Sessions)
- [x] docs/AI.md
- [x] Commit + dual review

## Phase 6 — Security Events + nav + docs

- [x] modules/admin/authenticate/security-events/\* (read-only feed, superadmin)
- [x] config/nav/admin-nav.ts (rebuilt)
- [x] app/admin/authenticate/{users,security-events}/page.tsx
- [x] apps/mintway/docs/AI.md + module AI maps
- [x] Commit + dual review

## Final

- [x] pnpm format && check-types && lint (both apps)
- [x] pnpm --filter mintway build + --filter mintflow build
- [x] /verify, /design-check, /visual-review
- [x] /pre-pr, open PR
- [x] Delete this todo file
