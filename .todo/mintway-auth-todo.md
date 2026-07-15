# mintway app + grandway auth — TODO

## Phase 0 — Shared package extensions (additive)

- [ ] 0a. `@peppermint/api-client` — cookie-refresh mode (refreshMode, withCredentials, csrfCookieName, csrfHeaderName, accessResponseField)
- [ ] 0a. Update api-client docs + usage-doc
- [ ] 0b. `SignInPage` — read access_token, onPasswordChangeRequired challenge branch, extend SignInResultData, credentials:"include" on postAuth
- [ ] 0b. Update SignInPage docs + usage-doc
- [ ] Verify mintflow still type-checks/builds
- [ ] Commit + dual review

## Phase 1 — mintway app scaffold

- [ ] package.json, tsconfig.json, next.config.ts, next-env.d.ts
- [ ] config/theme/\*, app/globals.css
- [ ] layouts/app/\*
- [ ] layouts/admin/\* (role-adapted)
- [ ] lib/api.ts (cookie refresh config), lib/authErrorMessages.ts (grandway codes), lib/csrf.ts
- [ ] components/{RequireStaff,createListModule,QueryErrorState}/\*
- [ ] app/\*\* re-exports
- [ ] modules/admin/{home,not-found}/\*
- [ ] Commit

## Phase 2 — Auth foundation & login flow

- [ ] \_shared/authenticate.types.ts (grandway shapes)
- [ ] \_shared/useCurrentUser.ts (role-based)
- [ ] \_shared/useLogout.ts (CSRF)
- [ ] modules/sign-in/SignIn.tsx (username, challenge callback)
- [ ] modules/password-change/PasswordChange.tsx (dual-mode) + PasswordStrengthMeter
- [ ] Commit

## Phase 3 — Admin layout identity wiring

- [ ] layouts/admin/Admin.tsx (role gate, user-menu, session guard)

## Phase 4 — Account Settings modal

- [ ] account-settings: Profile (read-only), Security (change password), Sessions (+ logout-all)
- [ ] account-settings.api.ts / .types.ts
- [ ] Commit Phase 3+4 + dual review

## Phase 5 — Users admin module

- [ ] /design-decisions pass
- [ ] users.api.ts, users.types.ts, users.queryKeys.ts
- [ ] pages/list/UsersList.tsx (tabs, search, row actions, drawer)
- [ ] form/UserForm.tsx (create) + OneTimeSecretModal
- [ ] form/UserProfileEditForm.tsx
- [ ] Row actions (role-gated lifecycle)
- [ ] UserDetailDrawer (Overview / Sessions)
- [ ] docs/AI.md
- [ ] Commit + dual review

## Phase 6 — Security Events + nav + docs

- [ ] modules/admin/authenticate/security-events/\* (read-only feed, superadmin)
- [ ] config/nav/admin-nav.ts (rebuilt)
- [ ] app/admin/authenticate/{users,security-events}/page.tsx
- [ ] apps/mintway/docs/AI.md + module AI maps
- [ ] Commit + dual review

## Final

- [ ] pnpm format && check-types && lint (both apps)
- [ ] pnpm --filter mintway build + --filter mintflow build
- [ ] /verify, /design-check, /visual-review
- [ ] /pre-pr, open PR
- [ ] Delete this todo file
