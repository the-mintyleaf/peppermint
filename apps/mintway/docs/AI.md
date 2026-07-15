# Mintway — AI Navigation Map

## App purpose

Identity & access admin for the **grandway** `authenticate` backend. Handles sign-in
(username/password + forced first-login password change), self-service account settings,
staff/admin account administration, and the superadmin security-event audit feed.

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, `@peppermint/admin`
shells + primitives. Backend contract: `.todo/auth_doc_grandway/` (`API.md`,
`DATA_CONTRACT.md`, `INTEGRATION.md`, `SECURITY.md`).

Base API: `/api/v1/auth/` at `NEXT_PUBLIC_API_URL`.

---

## Auth model (grandway) — read before touching auth

- **Login** `POST /login/` → `{ access_token }` (stored in `localStorage.access_token`) +
  HttpOnly `mintway_refresh` / JS-readable `mintway_csrf` / `mintway_device` cookies.
  A first-login account instead returns a **challenge** (no session).
- **Refresh** is cookie-based: `@peppermint/api-client` is configured (`lib/api.ts`) with
  `refreshMode:"cookie"` + `csrfCookieName:"mintway_csrf"` + `accessResponseField:"access_token"`,
  so a 401 silently refreshes via `POST /token/refresh/` (cookie + `X-CSRFToken`).
- **Cross-origin caveat:** the double-submit CSRF cookie must be visible to the app origin
  (same-site / shared-domain deployment). If the API is on a different registrable site,
  the JS-readable CSRF cookie won't be readable and refresh will 403 → logout.
- **Identity** comes from `GET /me/` (`useCurrentUser`) — never decoded from the JWT.
  Roles: `superadmin | admin | staff`.
- **Logout / logout-all** send `X-CSRFToken` via `lib/csrf.ts` `readCsrfHeader()`.

---

## App structure

```
apps/mintway/
├── app/                     # App Router — re-exports only
│   ├── page.tsx             # → ModuleSignIn (sign-in)
│   ├── password-change/     # → ModulePasswordChange (forced first-login)
│   └── admin/               # admin layout + routes
│       ├── page.tsx         # → ModuleHome (empty)
│       └── authenticate/{users,security-events}/
├── layouts/{app,admin}/     # LayoutApp (html/theme), LayoutAdmin (shell + role nav)
├── lib/                     # api.ts (cookie refresh), csrf.ts, authErrorMessages.ts
├── config/{theme,nav}/      # Mantine theme + admin nav builder (role-gated)
├── components/              # RequireStaff (admin gate), createListModule, QueryErrorState
└── modules/
    ├── sign-in/             # SignInPage wrapper (username, first-login challenge)
    ├── password-change/     # forced first-login password change (FormWrapper)
    └── admin/
        ├── home/            # empty home
        ├── not-found/       # admin 404 + catch-all
        └── authenticate/
            ├── _shared/     # types, useCurrentUser, useLogout, password/*, OneTimeSecretModal
            ├── account-settings/  # self-service modal: Profile / Security / Sessions
            ├── users/       # account administration (list/create/profile-edit/lifecycle/sessions)
            └── security-events/   # superadmin audit feed (read-only)
```

---

## Modules

| Module           | Path                                          | Route(s)                              | Notes                                                                           |
| ---------------- | --------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| Sign In          | `modules/sign-in`                             | `/`                                   | `SignInPage`; `onPasswordChangeRequired` stashes challenge → `/password-change` |
| Password Change  | `modules/password-change`                     | `/password-change`                    | first-login mode (challenge); voluntary change lives in account-settings        |
| Account Settings | `modules/admin/authenticate/account-settings` | modal (avatar menu)                   | Profile (read-only), Security (change password), Sessions (+ logout-all)        |
| Users            | `modules/admin/authenticate/users`            | `/admin/authenticate/users`           | `ModalTableShell`; create/profile-edit; role-gated lifecycle; detail drawer     |
| Security Events  | `modules/admin/authenticate/security-events`  | `/admin/authenticate/security-events` | superadmin-only read-only `DataTableShell` feed                                 |

---

## Role gates

- `RequireStaff` (`components/RequireStaff`) gates admin content on `admin`/`superadmin`.
- Users lifecycle actions: admin can deactivate/reactivate (staff); superadmin adds
  suspend/unsuspend/reset-password/revoke-sessions (gated in `UserRowActionsMenu`).
- Security Events is superadmin-only (gated in `SecurityEventsList` + hidden from nav).

---

## Conventions

- All server state via React Query; query fns in `*.api.ts`, keys via `createQueryKeys`.
- Module forms use `FormWrapper` (never hand-rolled `useForm`); modal forms hand values to
  the shell's mutation via `finalSubmitFn`.
- Error copy resolved by `lib/authErrorMessages.ts` `getApiErrorMessage`.
