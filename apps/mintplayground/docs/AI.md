# mintplayground — AI Navigation Map

## Purpose

mintplayground is a **frontend / UI-UX sandbox**. It carries over mintflow's auth
pages, app shell and theme, and nothing else — no cases, tasks, calendar or
dashboard. **There is no backend and there must not be one.** Every request is
served by mock Next route handlers inside this app (`app/api/v1/auth/`), so the
carried-over client code — the api-client's envelope unwrap and single-flight 401
refresh, `SignInPage`'s error resolution, the shell's session gate — runs its real
paths against fake data.

> Build experiments here freely. When adding a surface, prefer extending the
> Sandbox nav group in `layouts/app-shell/nav.config.tsx` over inventing a new
> route group.

## Surfaces & routing

- `/` → `ModuleSignIn` (`modules/auth/sign-in/`) — pre-auth sign-in, no shell. A live
  session redirects itself to `/home`. The demo credentials are rendered in the
  subheading, sourced from `lib/mock/accounts.ts` (there is no registration).
- `/password-change` → `ModulePasswordChange` (`modules/auth/password-change/`) —
  forced password change for an authenticated account, outside the shell.
- Route group `app/(app)/` wraps authenticated routes in the app shell
  (`layouts/app-shell`), which **gates the whole group** on a valid session.
  - `/home` → `ModuleHome` (`modules/home/`) — the landing page.
- The Sandbox nav entries (`/sandbox/*`, `/ai`, `/settings`, `/notifications`) are
  **placeholders with no route behind them** — they 404 by design.
- `app/` files are re-export only.

## The mock backend (`app/api/v1/auth/` + `lib/mock/`)

`lib/api.ts` deliberately sets **no `baseURL`**, so every request is relative and
lands on this app's own route handlers.

| Route                    | Behaviour                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `POST /login/`           | Tokens, or an MFA challenge for an MFA account                  |
| `POST /mfa/totp/verify/` | Accepts `MOCK_MFA_CODE`; a wrong code leaves the challenge open |
| `POST /refresh/`         | Body-mode refresh (`{ refresh }` in, new pair out)              |
| `GET  /me/`              | Profile for the bearer token; 401 drives the api-client refresh |
| `POST /change-password/` | Field-level error codes the form maps onto specific inputs      |
| `POST /logout/`          | Always succeeds — the client clears tokens regardless           |

- `lib/mock/accounts.ts` — the four demo accounts, one per auth branch:
  `minister` (superuser), `officer` (non-staff — proves the `requiresStaff` nav
  filter), `newjoiner` (`password_change_required` → shell bounces to
  `/password-change`), `secure` (MFA). Password for all: `MOCK_PASSWORD`.
- `lib/mock/store.ts` — mutable server state (passwords, MFA challenges). Shared
  across route handlers in one dev-server process; **resets on restart**, which is
  the intended lifetime.
- `lib/mock/tokens.ts` — base64url JSON tokens. **Not JWTs, unsigned, not a security
  boundary.** Identity always comes from `/me/`, never from decoding a token.
- `lib/mock/respond.ts` — `ok` / `fail` mirror the real `{ success, data }` /
  `{ error: { code, message } }` envelopes, plus artificial latency so loading
  states are visible.

`next.config.ts` sets `skipTrailingSlashRedirect` — the client calls DRF-style paths
with a trailing slash, and without this every auth call takes a 308 hop.

## Modules

### `modules/home/` — `ModuleHome` (ContainedModule)

The landing page at `/home`. Answers one question: _what is wired up in here, and who
am I signed in as?_

- `Home.tsx` — page anchor + the `CAPABILITIES` list, then a two-column band of
  session details and the mock-account list.
- `components/SessionPanel/` — the live `/me/` payload, rendered plainly. Its job is
  to make a broken auth path visible on the home page.
- `components/CapabilityGrid/` — ready-vs-placeholder cards. Status is carried by the
  word first, color second.

### `modules/auth/` — carried over from mintflow, unchanged apart from redirects

`sign-in/` (wraps `SignInPage` from `@peppermint/admin`, `modernlines` variant),
`password-change/`, and `_shared/` (`useCurrentUser`, `useLogout`,
`ChangePasswordForm` + its strength meter).

## Layouts

- `layouts/app/` — `LayoutApp`: `<html>`, fonts, Mantine `AppWrapper`, `metadata`.
- `layouts/app-shell/` — `LayoutAppShell`: the session gate plus the 280px sidebar
  (brand, spotlight search, nav groups, footer, user menu). Filters nav by
  `requiresStaff`, bounces a token-less viewer to `/`, and a
  `password_change_required` account to `/password-change`.

## Config

`config/design/tokens.ts` (fixed brand values) and `config/theme/` (Mantine theme +
component defaults) are carried over from mintflow verbatim — including the `Modal`
body `padding: 0` override, so **modal content must supply its own padding**.
