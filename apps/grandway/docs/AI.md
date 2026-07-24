# Grandway — AI Navigation Map

## App purpose

Identity & access admin for the **grandway** `authenticate` backend, the central
**`audit`** activity log, **`leads`** (enquiry tracking for the consultancy), and
**`applicants`**/**`applicant_journeys`** (the client lifecycle a lead converts into —
see Modules below). Handles sign-in (username/password + device binding + optional TOTP
MFA), forced first-login password change, forced superadmin MFA enrollment, self-service
account settings, tier-scoped staff/admin account administration, the read-only
cross-app audit log, lead management, applicant identity records, and per-applicant
study-objective ("journey") tracking for `admin`/`lead_manager` accounts.

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, `@peppermint/admin`
shells + primitives. Backend contract: `docs/backend/{authenticate,audit,lead-management,
applicants,applicant-journeys}/` (copied matched-triple docs — `CONCEPT.md`, `FLOWS.md`,
`INTEGRATION.md` — from `.backend/` at the time each domain was integrated) +
`docs/backend/CORE_INTEGRATION.md` (global conventions). This is the single source the
frontend integrates against — do not read `.backend/` directly for new work; re-sync
these copies if the backend docs change.

Base API: `/api/v1/auth/` (authenticate), `/api/v1/audit/` (audit), `/api/v1/leads/`
(leads), `/api/v1/applicants/` (applicants), and `/api/v1/journeys/` (applicant
journeys) at `NEXT_PUBLIC_API_URL`.

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
│       ├── lead-management/ # → ModuleLeadManagement
│       ├── applicants/{page,new,[id],[id]/edit}.tsx    # → ModuleApplicant{List,Create,Detail,Edit}
│       └── applicant-journeys/{page,[id]}.tsx           # → ModuleJourney{Worklist,Detail}
├── layouts/{app,admin}/     # LayoutApp (html/theme), LayoutAdmin (shell + authority nav)
├── lib/                     # api.ts, authTokens.ts, deviceId.ts, authErrorMessages.ts
├── config/{theme,nav}/      # Mantine theme + admin nav (authority-gated)
├── components/              # RequireAuth, RequireStaff, RequireLeadAccess, QueryErrorState
└── modules/
    ├── sign-in/             # branded layout (SignIn.tsx) + components/SignInPanel (credentials/MFA form)
    ├── password-change/     # forced first-login change (FormWrapper), Paper withBorder card
    ├── mfa-enroll/          # forced superadmin MFA enrollment, same Paper withBorder card
    └── admin/
        ├── home/            # ContainedModule landing + applicant/journey summary widgets
        │   ├── home.hooks.ts          # useApplicantStatusCounts, useJourneyAttentionCounts, useRecentApplicants
        │   └── components/           # StatTile, ApplicantStatusPanel, JourneyStagePanel, RecentApplicantsPanel
        ├── authenticate/
        │   ├── _shared/     # types, useCurrentUser, useLogout, password/*, mfa/*, OneTimeSecretModal
        │   ├── account-settings/  # self-service modal: Profile / Security / Sessions
        │   ├── my-sessions/ # standalone full-page own-sessions view (nav entry)
        │   └── users/       # tier-scoped account administration
        ├── audit/           # central audit log (read-only, admin/superadmin only)
        ├── lead-management/ # categorized leads board — admin (all) / lead_manager (own)
        │   ├── leadManagement.{types,api,queryKeys,hooks}.ts   # also carries the Reference data admin CRUD (sources/loss-reasons)
        │   ├── leadCategory.utils.ts     # categorizeLead(), toLeadBoardRow(), stage/category labels+colors
        │   ├── form/                     # shared create+edit modal (LeadForm, ContactNumbersField, StudyInterestSection)
        │   ├── reference-data/           # Admin-only "Reference data" modal — manage LeadSource/LossReason (FLOWS.md "Configure the pickers")
        │   │   ├── ReferenceDataModal.tsx    # Tabs: Lead sources / Loss reasons; guards close on an unsaved add/edit draft
        │   │   └── components/               # ReferenceEntryPanel (list+toggle+add), ReferenceEntryCard (retire/reactivate), ReferenceEntryForm (inline create/edit)
        │   └── pages/list/
        │       ├── LeadManagementBoard.tsx
        │       ├── leadManagement.columns.tsx
        │       └── components/
        │           ├── LeadRowActionsMenu/
        │           ├── ChangeStageModal/, RecordFollowUpModal/, MarkLeadLostModal/, ReopenLeadModal/, ConvertLeadModal/
        │           └── LeadDetailDrawer/     # Overview (incl. converted-applicant link) / Notes / History tabs
        ├── applicants/       # MultiPageModule — identity/contact/passport/family CRUD
        │   ├── applicants.{types,api,queryKeys,hooks}.ts
        │   ├── form/                     # shared create+edit multi-step form (ApplicantForm + 5 field components)
        │   └── pages/
        │       ├── list/                 # DataTableShell, plain status filter column (no category board)
        │       ├── new/, edit/           # FormShell-wrapped ApplicantForm
        │       └── detail/               # Overview / Passport & Family / Journeys / History tabs
        │           └── components/ApplicantJourneysPanel.tsx  # cross-module: embeds applicant-journeys
        └── applicant-journeys/  # MultiPageModule — study-objective lifecycle
            ├── applicantJourneys.{types,api,queryKeys,hooks,labels}.ts
            ├── form/JourneyForm.tsx      # shared create+edit modal form (applicantId prop for embedded use)
            └── pages/
                ├── list/                 # ModalTableShell worklist + 4 lifecycle dialogs
                └── detail/               # Journey Detail — Overview / History, inline lifecycle actions
```

---

## Modules

| Module             | Path                                          | Route(s)                                                                                              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign In            | `modules/sign-in`                             | `/`                                                                                                   | `ContainedModule`, public. Bespoke — see Auth model above                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Password Change    | `modules/password-change`                     | `/password-change`                                                                                    | forced first-login only; voluntary change lives in account-settings                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| MFA Enroll         | `modules/mfa-enroll`                          | `/mfa-enroll`                                                                                         | forced superadmin enrollment only; voluntary enroll lives in account-settings                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Home               | `modules/admin/home`                          | `/admin`                                                                                              | `ContainedModule`; landing with admin/superadmin quick links, plus (admin/lead_manager only) applicant-status, journey-attention, and recent-applicants summary widgets                                                                                                                                                                                                                                                                                                                              |
| Account Settings   | `modules/admin/authenticate/account-settings` | modal (avatar menu)                                                                                   | Profile (read-only) · Security (password + MFA) · Sessions (list + per-session/others/all revoke)                                                                                                                                                                                                                                                                                                                                                                                                    |
| My Sessions        | `modules/admin/authenticate/my-sessions`      | `/admin/authenticate/sessions`                                                                        | standalone page reusing account-settings' `SessionsTab`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Users              | `modules/admin/authenticate/users`            | `/admin/authenticate/users`                                                                           | `ModalTableShell`; tier-scoped server-side (superadmin→admin, admin→lead_manager); no list filters/search (contract has none)                                                                                                                                                                                                                                                                                                                                                                        |
| Audit              | `modules/admin/audit`                         | `/admin/audit`                                                                                        | `DataTableShell`, read-only, admin/superadmin only; column filters only (no free-text search — contract has none)                                                                                                                                                                                                                                                                                                                                                                                    |
| Leads              | `modules/admin/lead-management`               | `/admin/lead-management`                                                                              | `ContainedModule`, `admin`/`lead_manager` only (never `superadmin` — backend 403s it). Client-aggregated categorized board (`ModalTableShell`, 4 category tabs, no server-side multi-stage filter exists) + shared create/edit modal + 5 lifecycle-action dialogs (incl. Convert to Applicant, Admin-only) + detail drawer (Overview/Notes/History). No delete. Admin-only "Manage sources" header button opens the `reference-data/` modal (Sources/Loss Reasons tabs, add/edit/retire — no delete) |
| Applicants         | `modules/admin/applicants`                    | `/admin/applicants`, `/admin/applicants/new`, `/admin/applicants/[id]`, `/admin/applicants/[id]/edit` | `MultiPageModule`, `admin`/`lead_manager` only (`RequireLeadAccess`). Plain `DataTableShell` (status is a real server filter, not a category board) + 4-step `FormShell` create/edit (Identity & Contact → Addresses → Passport → Family & Emergency Contacts) + detail page with Overview/Passport & Family/Journeys/History tabs. Create is Admin-only; edit and status changes are open to both roles. No delete                                                                                  |
| Applicant Journeys | `modules/admin/applicant-journeys`            | `/admin/applicant-journeys`, `/admin/applicant-journeys/[id]`                                         | `MultiPageModule`, `admin`/`lead_manager` only (`RequireLeadAccess`, identical rule to Leads/Applicants). `ModalTableShell` worklist (stage/target-country column filters, no category tabs) + modal create/edit + dedicated Journey Detail route (linkable permalink, per the concept doc) + 4 lifecycle dialogs (change stage/defer/close/reopen). No delete                                                                                                                                       |

---

## Role gates

- `RequireAuth` (`components/RequireAuth`) — any authenticated account.
- `RequireStaff` (`components/RequireStaff`) — `admin`/`superadmin` baseline; gates
  Users and Audit. A `lead_manager` never reaches `/admin/authenticate/users` or
  `/admin/audit`.
- `RequireLeadAccess` (`components/RequireLeadAccess`) — `admin`/`lead_manager`; gates
  Leads, Applicants, and Applicant Journeys (reused as-is across all three — the name is
  a holdover from Leads being first, but the rule is identical for all three domains'
  backends). Deliberately the mirror image of `RequireStaff`: a `superadmin` never
  reaches any of these three modules (each backend 403s that tier on every endpoint),
  while a `lead_manager` — who cannot use `RequireStaff`-gated areas — can use all three.
  Any component surfacing a summary of this data outside the module itself (e.g. Home's
  widgets) must gate on the same rule — `authorityType === "admin" || isLeadManager`, not
  `isAdmin` alone (`isAdmin` is also true for `superadmin`).
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
- **Lead → Applicant conversion.** `LeadRowActionsMenu`'s "Convert to applicant" action
  (Admin-only) opens `ConvertLeadModal`, which calls `POST /leads/<id>/convert/` and
  navigates straight to `/admin/applicants/<applicant_id>` on success using the ids the
  response already returns — no extra fetch. On the rare `LEADS_LEAD_ALREADY_CONVERTED`
  race (two Admins acting on the same stale board row), it re-fetches the real lead via
  `getLead` to get the applicant id the board's own list-shape row can't carry
  (`toLeadBoardRow` always pads `converted_applicant_id: null`), then redirects instead of
  showing a dead-end error. `LeadOverviewPanel`'s "Converted" section (keyed off
  `converted_applicant_id` presence, not `stage === "converted"`, so it survives a reopen)
  links back to that applicant.
- **Applicants ⇄ Applicant Journeys.** `ApplicantJourneysPanel` (Applicant Detail's
  Journeys tab) embeds the applicant-journeys module: a card list filtered by
  `applicant`, a "New journey" modal (`JourneyForm` with `applicantId` preset, hiding the
  picker), and a "View in worklist" link to `/admin/applicant-journeys?applicant=<id>`
  (read via `useSearchParams`/`forceFilters`, same convention as Audit's `actor_id`).
  `JourneyForm`'s standalone-create applicant picker uses `applicants`' own
  `useApplicantList`/`useApplicantDetail` hooks. **Both cross-imports go through the other
  module's concrete files (`applicants.hooks.ts` / `applicantJourneys.hooks.ts`,
  `applicantJourneys.labels.ts`, `form/JourneyForm.tsx`), never the other module's
  `index.ts` barrel** — importing the barrels would close a cycle (applicants barrel →
  `ApplicantDetail` → `ApplicantJourneysPanel` → applicant-journeys barrel → `JourneyForm`
  → applicants barrel).
- **No `?status=`/`?stage=` deep link into Applicants/Journeys lists.** Unlike Audit's
  `actor_id` and the Journeys panel's `applicant` filter, `status` (Applicants) and
  `stage` (Journeys) each already have a user-editable column filter
  (`applicants.columns.tsx` / `journeys.columns.tsx`). `forceFilters` always wins over a
  column filter in `DataTableWrapper`'s merge, so a URL-seeded deep link on either would
  permanently lock that control instead of just seeding it — there is no "seed once, then
  let the user override" mechanism in the shell. Home's status/stage tiles therefore link
  to the plain (unfiltered) list pages.
- **Home's summary widgets** (`modules/admin/home/home.hooks.ts`) call `status`/`stage`
  count queries at `pageSize: 1` (reading `meta.total`) since neither backend exposes a
  count/aggregate endpoint — same gap Leads' categorized board works around, but resolved
  here with cheap targeted requests instead of a capped full-list aggregate, since Home
  only needs numbers, not rows.

## Conventions

- All server state via React Query; query fns in `*.api.ts`, keys via `createQueryKeys`.
- Module forms use `FormWrapper` (never hand-rolled `useForm`). `FormWrapper<T extends
FormValues>`'s generic bound (`FormValues = Record<string, unknown>`) is genuinely
  stricter than a shell's `T extends object` — a plain interface does **not** structurally
  satisfy it (confirmed by `tsc`: "Index signature for type 'string' is missing"). The
  anti-pattern gate (`.claude/hooks/anti-pattern-gate.sh`) knows this: an interface whose
  name ends in `Values` is exempt from the "no `extends Record<string, unknown>`" check —
  use that suffix (`CreateUserValues`, `LeadFormValues`, …) for any type passed as
  `FormWrapper<T>`'s type argument. Domain/row types (table rows, API DTOs) still follow
  the plain-interface rule — only the FormWrapper values type gets the exemption.
- `leadManagement.hooks.ts` adopts `createResourceApi`/`useAppMutation` from
  `@peppermint/admin` (documented but otherwise unused elsewhere in this app, which
  hand-rolls `*.api.ts` + `useMutation` directly) — a deliberate choice, not a drift; both
  patterns are valid, pick per new module rather than treating either as canonical.
- Error copy resolved by `lib/authErrorMessages.ts` `getApiErrorMessage`.
- QR rendering (`react-qr-code`) is used only in `_shared/mfa/MfaEnrollPanel.tsx`.
- `useConvertLead` (`leadManagement.hooks.ts`) is deliberately a plain `useMutation`, not
  `useAppMutation` — `useAppMutation`'s error notification is unconditional on every
  error, which would show a red "Couldn't convert lead" toast even on the graceful
  `LEADS_LEAD_ALREADY_CONVERTED` redirect path. When a mutation needs to treat a specific
  error as a non-error (a redirect, not a failure notification), hand-roll it rather than
  fighting the primitive's unconditional notification.
- `packages/admin/src/columns/columnFactories.tsx`'s `statusColumn`/`dateColumn`/
  `booleanColumn` constrain their row generic to `object` (not `Record<string, unknown>`)
  — a plain domain-row interface (`Applicant`, `ApplicantJourney`) satisfies it directly,
  matching `DataTableShellColumn`'s own constraint. If a column factory ever again demands
  an index signature, that's a primitive regression, not a signal to add one to a domain
  type.
