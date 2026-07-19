# Mintway — AI Navigation Map

## App purpose

Identity & access admin for the **grandway** `authenticate` backend **plus the
Applicant CRM** for the `applicant` backend. Handles sign-in (username/password + forced
first-login password change), self-service account settings, staff/admin account
administration, the superadmin security-event audit feed, and the full applicant
lifecycle (leads → applicants, profile, CRM, cases, assignments).

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, `@peppermint/admin`
shells + primitives. Backend contracts: `.todo/auth_doc_grandway/` (auth) and
`.todo/applications/` (applicant: `API.md`, `DATA_CONTRACT.md`, `INTEGRATION.md`,
`SECURITY.md`).

Base APIs: `/api/v1/auth/` (auth) and `/api/v1/applicants/` · `/api/v1/application-cases/`
(applicant) at `NEXT_PUBLIC_API_URL`.

> The document generator is a separate effort from the applicant CRM. Its list and
> signatory admin surfaces are the `modules/admin/documents` + `modules/admin/signatures`
> modules (`/admin/documents`, `/admin/signatures`); the full-screen editor engine
> (`modules/documents/` + `components/templates/`) stays outside the admin shell at
> `/documents/[applicantId]` and is consumed by those modules via the `modules/documents`
> barrel (`documentsApi`, `documentQueryKeys`, shared types).

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
│       ├── page.tsx         # → ModuleHome (dashboard)
│       └── authenticate/{users,security-events}/
├── layouts/{app,admin}/     # LayoutApp (html/theme), LayoutAdmin (shell + role nav)
├── lib/                     # api.ts (cookie refresh), csrf.ts, authErrorMessages.ts
├── config/{theme,nav}/      # Mantine theme + admin nav builder (role-gated)
├── components/              # RequireStaff (admin gate), createListModule, QueryErrorState, StatusSwitchButton (shared status-pill Menu.Target)
└── modules/
    ├── sign-in/             # SignInPage wrapper (username, first-login challenge)
    ├── password-change/     # forced first-login password change (FormWrapper)
    └── admin/
        ├── home/            # role-adaptive dashboard (signal board)
        ├── not-found/       # admin 404 + catch-all
        └── authenticate/
            ├── _shared/     # types, useCurrentUser, useLogout, password/*, OneTimeSecretModal
            ├── account-settings/  # self-service modal: Profile / Security / Sessions
            ├── users/       # account administration (list/create/profile-edit/lifecycle/sessions)
            └── security-events/   # superadmin audit feed (read-only)
```

---

## Modules

| Module           | Path                                          | Route(s)                              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | --------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign In          | `modules/sign-in`                             | `/`                                   | `SignInPage`; `onPasswordChangeRequired` stashes challenge → `/password-change`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Password Change  | `modules/password-change`                     | `/password-change`                    | first-login mode (challenge); voluntary change lives in account-settings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Home             | `modules/admin/home`                          | `/admin`                              | `ContainedModule` operational dashboard (signal board). `RequireAuth` (staff-reachable) + `ModuleErrorBoundary`; role-adaptive via `useCurrentUser`. No stats API — every number is aggregated client-side (`Home.hooks.ts`): applicant counts per `lifecycle_stage`/`engagement_status` via `fetchApplicants` `meta.total`, recent list, admin-only follow-up attention queue (`next_follow_up_at`, best-effort ordering), and admin ops tiles (`documentsApi.listWorkspaces`/`listSignatures`, `fetchUsers`). Tiles are quiet links (state), separate from `QuickActions` buttons (levers) |
| Account Settings | `modules/admin/authenticate/account-settings` | modal (avatar menu)                   | Profile (read-only), Security (change password), Sessions (+ logout-all)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Users            | `modules/admin/authenticate/users`            | `/admin/authenticate/users`           | `ModalTableShell`; create/profile-edit; role-gated lifecycle; detail drawer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Security Events  | `modules/admin/authenticate/security-events`  | `/admin/authenticate/security-events` | superadmin-only read-only `DataTableShell` feed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Documents        | `modules/admin/documents`                     | `/admin/documents`                    | admin-only workspaces `DataTableShell` (`pages/list/`); `NewDocumentModal` applicant picker (shell `onNewClick`) → opens the full-screen editor at `/documents/[applicantId]`                                                                                                                                                                                                                                                                                                                                                                                                                |
| Signatures       | `modules/admin/signatures`                    | `/admin/signatures`                   | admin-only signatory CRUD on `ModalTableShell` + `FormWrapper` (`pages/list/`, `form/`); form leads with `SignatureImageField` (dropzone → `SignatureCropModal` crop/downscale → PNG), status is not a form field (created active); `useSignatureLifecycle` drives deactivate/reactivate shared by `SignatureStatusCell` (interactive Status dropdown) and `SignatureRowActionsMenu` (edit + deactivate); shares the engine signature API via `signatures.api.ts`, invalidates the editor's `documentQueryKeys.signatures()` on write                                                        |

---

## Role gates

- `RequireStaff` (`components/RequireStaff`) gates admin content on `admin`/`superadmin`.
- Users lifecycle actions: admin can deactivate/reactivate (staff); superadmin adds
  suspend/unsuspend/reset-password/revoke-sessions (gated in `UserRowActionsMenu`).
- Security Events is superadmin-only (gated in `SecurityEventsList` + hidden from nav).

---

## Applicant CRM (`modules/admin/applicant`)

A MultiPageModule group (mirrors mintflow's `organization`). The applicant is the
aggregate root; each detail section is a route under `[applicantId]`. Backend contract:
`.todo/applications/`.

**Shared spine — `applicant/_shared/`** (read before touching any section):

- `applicant.types.ts` / `applicant.enums.ts` — domain types (role-projected) + label/color maps.
- `applicant.api.ts` — applicant-core client (CRUD, transition, lock/unlock, histories, merge).
  `postCapturingMeta` re-tags success payloads so the shared api-client's envelope unwrap
  doesn't drop the create/merge `possible_duplicate` warning meta.
- `applicantQueryKeys.ts` — `createQueryKeys` per resource.
- `childResource/createChildResource.tsx` — **the DRY factory** every nested CRUD section
  uses (ModalTableShell-backed; scoped to `/applicants/:id/:slug`; string-array query key
  namespaced by slug + applicantId).
- `useApplicant.ts` (detail + role/version/lock), `useApplicantMutation.ts` (useAppMutation
  - the app error resolver), `ApplicantDetailShell/` (header + role-filtered section nav).

**Access:** `components/RequireAuth` gates the staff-reachable surface (list, overview,
addresses, profile image); `components/RequireStaff` (admin/superadmin) gates every other
section. Role also drives field projections — never render admin-only fields for staff.

**Sections & routes:**

| Section     | Path                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicants  | `applicant/applicants`  | `/admin/applicants` list (staff/admin projections, tabs, dup warning) + create/edit + inline Stage/Engagement switches (`ApplicantLifecycleSwitch`, admin-only, open the transition modal pre-filled) + lock/archive/merge. Row **View** opens `components/ApplicantProfileModal` — a modal profile hub (hero identity + lifecycle/engagement badges + record actions) whose bento **section tiles link out to** the still-existing `[id]/[section]` routes; opened via `ApplicantProfileProvider`/`useApplicantProfile`. The `[id]` overview + tab shell remain the deep route |
| Addresses   | `applicant/addresses`   | `/admin/applicants/[id]/addresses` — addresses (child factory) + profile image (streamed blob + multipart upload). **Staff+**                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Identity    | `applicant/identity`    | `[id]/identity` — identity documents + evidence media (upload/view/delete)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Education   | `applicant/education`   | `[id]/education` — educations · language tests · trainings · skills · languages · academic gradings                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Family      | `applicant/family`      | `[id]/family` — family members · emergency contacts · references                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Interests   | `applicant/interests`   | `[id]/interests` — interest profile (OneToOne) + qualification assessments (append-only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CRM         | `applicant/crm`         | `[id]/crm` — interactions · sponsors · travel · visa · consents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Cases       | `applicant/cases`       | `[id]/cases` list/open + top-level `/admin/application-cases/[caseId]` detail (edit, transition, status-history)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Assignments | `applicant/assignments` | `[id]/assignments` — assign (user + case picker) / end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| History     | `applicant/history`     | `[id]/history` — lifecycle · lock · merge feeds (read-only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

**Concurrency:** every applicant PATCH/transition/lock/archive and every case PATCH/transition
sends the last-read `record_version` (cases carry their own). A 409 refetches; the message
tells the user to reload.

**v1 deferrals:** identity media-ref linking + identity dup-fingerprint warning; clearing an
optional field on an agent-built child record (delete + recreate). Documents/signatures are
their own admin modules (`modules/admin/documents`, `modules/admin/signatures`), not part of
the applicant CRM.

## Conventions

- All server state via React Query; query fns in `*.api.ts`, keys via `createQueryKeys`.
- Module forms use `FormWrapper` (never hand-rolled `useForm`); modal forms hand values to
  the shell's mutation via `finalSubmitFn`.
- Error copy resolved by `lib/authErrorMessages.ts` `getApiErrorMessage`.
