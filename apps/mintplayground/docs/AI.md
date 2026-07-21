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
  session details and the mock-account list. Converted to tokens (it inverts for
  dark mode); its `ModalPaper`/`ModuleHeader` chrome is still mintflow's, flattened
  by the shell's control-squaring rules rather than rebuilt.
- `components/SessionPanel/` — the live `/me/` payload, rendered plainly. Its job is
  to make a broken auth path visible on the home page.
- `components/CapabilityGrid/` — ready-vs-placeholder cards. Status is carried by the
  word first, color second.

### `modules/auth/` — carried over from mintflow, unchanged apart from redirects

`sign-in/` (wraps `SignInPage` from `@peppermint/admin`, `modernlines` variant),
`password-change/`, and `_shared/` (`useCurrentUser`, `useLogout`,
`ChangePasswordForm` + its strength meter).

## Design language — Modern Lines

The app is built in **Modern Lines**: structure comes from ruled lines, not elevation.
Read `docs/design/design-system.md` before any visual work — it is the full spec (the
eight principles, the rules, the token vocabulary, and the two extensions this app
adds); copy-paste recipes live in `docs/design/modern-lines-howto.md`.

The short version:

- Rule rank — `--ml-rule-solid` between regions, `--ml-rule-dotted` within one,
  `--ml-rule-dashed` for the end of the content (once per surface).
- Every junction between two rules carries a `+` (`components/CrossMark/`).
- Tokens only. `--ml-*` (in `public/styles/global.css`) and Mantine variables — never a
  raw hex, never a hardcoded mono stack. The whole app inverts for dark mode, and the
  scheme toggle is a footer quick action in the `Sidebar` (next to Settings).
- `theme.defaultRadius: 0`. Nothing is rounded, including portalled surfaces.

`config/design/tokens.ts` is **legacy** — mintflow's warm-paper/dark-tile values, with
radii and shadows that contradict the language. The shell and `modules/home/` no longer
use it. Fine in an unconverted module, wrong for anything new.

## Layouts

- `layouts/app/` — `LayoutApp`: `<html>`, fonts, Mantine `AppWrapper`, `metadata`.
- `layouts/app-shell/` — `LayoutAppShell`: the session gate plus the frame.

  One bordered rectangle inset from the viewport, subdivided into body (`Sidebar`
  column + content) → `StatusRail` (dashed, the surface's one terminal rule) →
  accent bar. The brand (`SidebarBrand`) sits at the head of the nav column, and
  the scheme toggle is a `SidebarFooter` quick action next to Settings. Below `sm`
  a slim `MobileBar` (brand mark · drawer trigger) opens the frame instead — from
  48em up it is `display: none`. The frame is **permanent**: the loading,
  `/me`-failed and redirect states all render inside it, never instead of it
  (`renderGate` in `AppShell.tsx`).
  - Neither `.frame` nor the sidebar `.panel` sets `overflow: hidden` — junction
    marks straddle the rules they sit on, and clipping amputates them. Scrolling is
    owned by `.content` and the nav's `ScrollArea`.
  - Below `sm` (48em) the nav column leaves the frame and becomes a `Drawer`.
    `Sidebar` takes `collapsed` as a **prop**, not from the store, so the drawer copy
    renders expanded while the desktop column stays collapsed.
  - `NavSpotlight` is mounted once by `AppShell.tsx`, outside both `Sidebar`s — two
    copies would register `mod+K` twice.
  - Still filters nav by `requiresStaff`, bounces a token-less viewer to `/`, and a
    `password_change_required` account to `/password-change`.

## Config

`config/theme/` (Mantine theme + component defaults) is carried over from mintflow,
plus `defaultRadius: 0` for the design language. It keeps the `Modal` body
`padding: 0` override, so **modal content must supply its own padding**.
