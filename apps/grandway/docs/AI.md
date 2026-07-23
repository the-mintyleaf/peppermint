# Grandway — AI Navigation Map

## App purpose

Identity & access admin for the **grandway** `authenticate` backend, the central
**`audit`** activity log, and **`leads`** (enquiry tracking for the consultancy — a
categorized board in progress, see Modules below). Handles sign-in (username/password +
device binding + optional TOTP MFA), forced first-login password change, forced
superadmin MFA enrollment, self-service account settings, tier-scoped staff/admin account
administration, the read-only cross-app audit log, and lead management for
`admin`/`lead_manager` accounts.

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, `@peppermint/admin`
shells + primitives. Backend contract: `docs/backend/{authenticate,audit,lead-management}/`
(copied matched-triple docs — `CONCEPT.md`, `FLOWS.md`, `INTEGRATION.md` — from `.backend/`
at the time each app was integrated) + `docs/backend/CORE_INTEGRATION.md` (global
conventions). This is the single source the frontend integrates against — do not read
`.backend/` directly for new work; re-sync these copies if the backend docs change.

Base API: `/api/v1/auth/` (authenticate), `/api/v1/audit/` (audit), and `/api/v1/leads/`
(leads) at `NEXT_PUBLIC_API_URL`.

---

## Auth model — read before touching auth

- **Login** `POST /login/` → `data.access` (+ `data.refresh` in dev only; a cookie in
  prod — not yet built here, see `lib/api.ts`), always sends a persisted `device_id`
  (`lib/deviceId.ts`, max 3 devices/account). MFA is the _same_ endpoint resubmitted with
  `otp_code` on `AUTH_MFA_REQUIRED` — there is no separate challenge/verify step.
- **Tokens** stored via `lib/authTokens.ts` under the exact keys
  `@peppermint/api-client` defaults to (`access_token`/`refresh_token`) — `lib/api.ts` is
  a one-line `configureApiClient({ baseURL })`, no overrides needed.
- **Identity** from `GET /me/` (`useCurrentUser`) — never decoded from the JWT.
  Authority tiers: `superadmin | admin | lead_manager` (NOT mintway's `staff` naming —
  this is a different, newer backend contract; do not copy mintway's auth code).
- **Sign-in is bespoke** (`modules/sign-in`), not the shared `@peppermint/admin`
  `SignInPage` primitive — that primitive's MFA/payload model doesn't fit this contract
  (see the plan file referenced in git history for the full rationale). Do not migrate it
  to `SignInPage` without re-checking that primitive's current capabilities. Its **visual
  design is deliberately styled to match** `SignInPage`'s default layout/field/button
  treatment (mirrored by hand, since the internal layout components aren't part of that
  package's public export surface) — keep new auth-flow screens (password-change,
  mfa-enroll) visually consistent with this same card treatment (`Paper withBorder p="xl"
radius="md" maw={420}`), not `ModalPaper` (that's for admin content areas under a
  `ModuleHeader`, not standalone full-page auth screens).
- **Sessions** have no `is_current` field — "this device" is inferred by comparing
  `Session.device_id` to `lib/deviceId.ts`'s persisted value.

---

## App structure

```
apps/grandway/
├── app/                     # App Router — re-exports only
│   ├── page.tsx             # → ModuleSignIn
│   ├── password-change/     # → ModulePasswordChange (forced first-login)
│   ├── mfa-enroll/          # → ModuleMfaEnrollForced (forced superadmin MFA)
│   └── admin/
│       ├── page.tsx         # → ModuleHome
│       ├── authenticate/{users,sessions}/, audit/
│       └── lead-management/ # → ModuleLeadManagement
├── layouts/{app,admin}/     # LayoutApp (html/theme), LayoutAdmin (shell + authority nav)
├── lib/                     # api.ts, authTokens.ts, deviceId.ts, authErrorMessages.ts
├── config/{theme,nav}/      # Mantine theme + admin nav (authority-gated)
├── components/              # RequireAuth, RequireStaff, RequireLeadAccess, QueryErrorState
└── modules/
    ├── sign-in/             # branded layout (SignIn.tsx) + components/SignInPanel (credentials/MFA form)
    ├── password-change/     # forced first-login change (FormWrapper), Paper withBorder card
    ├── mfa-enroll/          # forced superadmin MFA enrollment, same Paper withBorder card
    └── admin/
        ├── home/            # minimal ContainedModule landing
        ├── authenticate/
        │   ├── _shared/     # types, useCurrentUser, useLogout, password/*, mfa/*, OneTimeSecretModal
        │   ├── account-settings/  # self-service modal: Profile / Security / Sessions
        │   ├── my-sessions/ # standalone full-page own-sessions view (nav entry)
        │   └── users/       # tier-scoped account administration
        ├── audit/           # central audit log (read-only, admin/superadmin only)
        └── lead-management/ # categorized leads board — admin (all) / lead_manager (own) — in progress
```

---

## Modules

| Module           | Path                                          | Route(s)                       | Notes                                                                                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign In          | `modules/sign-in`                             | `/`                            | `ContainedModule`, public. Bespoke — see Auth model above                                                                                                                                                                                                                                                   |
| Password Change  | `modules/password-change`                     | `/password-change`             | forced first-login only; voluntary change lives in account-settings                                                                                                                                                                                                                                         |
| MFA Enroll       | `modules/mfa-enroll`                          | `/mfa-enroll`                  | forced superadmin enrollment only; voluntary enroll lives in account-settings                                                                                                                                                                                                                               |
| Home             | `modules/admin/home`                          | `/admin`                       | `ContainedModule`; minimal landing, quick links for admin/superadmin                                                                                                                                                                                                                                        |
| Account Settings | `modules/admin/authenticate/account-settings` | modal (avatar menu)            | Profile (read-only) · Security (password + MFA) · Sessions (list + per-session/others/all revoke)                                                                                                                                                                                                           |
| My Sessions      | `modules/admin/authenticate/my-sessions`      | `/admin/authenticate/sessions` | standalone page reusing account-settings' `SessionsTab`                                                                                                                                                                                                                                                     |
| Users            | `modules/admin/authenticate/users`            | `/admin/authenticate/users`    | `ModalTableShell`; tier-scoped server-side (superadmin→admin, admin→lead_manager); no list filters/search (contract has none)                                                                                                                                                                               |
| Audit            | `modules/admin/audit`                         | `/admin/audit`                 | `DataTableShell`, read-only, admin/superadmin only; column filters only (no free-text search — contract has none)                                                                                                                                                                                           |
| Leads            | `modules/admin/lead-management`               | `/admin/lead-management`       | `ContainedModule`, `admin`/`lead_manager` only (never `superadmin` — backend 403s it). **In progress:** Phase 1 scaffold only (types/api/gate/nav/route); the categorized `ModalTableShell` board, create/edit form, and lifecycle-action modals land in later phases — see `.todo/lead-management-todo.md` |

---

## Role gates

- `RequireAuth` (`components/RequireAuth`) — any authenticated account.
- `RequireStaff` (`components/RequireStaff`) — `admin`/`superadmin` baseline; gates
  Users and Audit. A `lead_manager` never reaches `/admin/authenticate/users` or
  `/admin/audit`.
- `RequireLeadAccess` (`components/RequireLeadAccess`) — `admin`/`lead_manager`; gates
  Leads. Deliberately the mirror image of `RequireStaff`: a `superadmin` never reaches
  `/admin/lead-management` (the leads backend 403s that tier on every endpoint), while a
  `lead_manager` — who cannot use `RequireStaff`-gated areas — can use this one.
- Within Users, every row action (block/restore/reset-password/reset-mfa/sessions/events)
  is uniformly available — the list itself is already scoped server-side to the tier the
  caller manages, so there is no finer per-action authority split (unlike mintway's old
  contract, which had a separate superadmin-only tier for some actions).
- Superadmin MFA is mandatory — `SecurityTab`/`UserRowActionsMenu` hide the disable
  action rather than let it fail with `AUTH_MFA_MANDATORY`.

## Cross-module integration

- Users' detail drawer → "View authentication activity in Audit" links to
  `/admin/audit?actor_id=<uuid>`, read by `AuditLogList` via `useSearchParams` and applied
  through `DataTableShell`'s `forceFilters` (a fixed, non-clearable filter — broadening the
  view means navigating to the plain `/admin/audit`).
- `modules/admin/audit` exports `useEntityAuditTrail(entityType, entityId)` for any future
  module to embed a record's timeline without re-deriving the filter shape.

## Conventions

- All server state via React Query; query fns in `*.api.ts`, keys via `createQueryKeys`.
- Module forms use `FormWrapper` (never hand-rolled `useForm`); the anti-pattern gate
  blocks `extends Record<string, unknown>` on _any_ type including FormWrapper values
  types — use a plain interface (see `apps/mintflow-admin/.../CreateOrganizationForm.types.ts`
  for the established precedent).
- Error copy resolved by `lib/authErrorMessages.ts` `getApiErrorMessage`.
- QR rendering (`react-qr-code`) is used only in `_shared/mfa/MfaEnrollPanel.tsx`.
