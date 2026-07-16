# mintflow — AI Navigation Map

## Purpose

mintflow is the **"kamban." minister app**, being rebuilt on this branch as an
admin-style surface ("mintflow-admin"). It renders bespoke React screens on Mantine
(via `@peppermint/ui`) tuned to a fixed brand design system — **not**
`@peppermint/admin` framework screens. **No backend yet** — screen data is intentional
local mock data (the "not wired" pattern: `notifications.show("Not connected yet")`).

> ⚠️ Mid-rebuild: the previous mobile shell (bottom-nav + IconRail) and most modules
> were removed. What exists now is the new **single-sidebar app shell** and a
> placeholder dashboard. Add real modules under `modules/` and routes under `app/(app)/`.

## Surfaces & routing

- `/` → redirects to `/dashboard` (`app/page.tsx`).
- Route group `app/(app)/` wraps authenticated routes in the app shell
  (`layouts/app-shell`); `(app)/layout.tsx` is a pure re-export of `LayoutAppShell`.
  - `/dashboard` → `ModuleDashboard` (placeholder content region).
- `app/` files are re-export only (the root redirect is the one allowed exception).

## The app shell — `layouts/app-shell/`

`LayoutAppShell` (client) is a **single dark icon rail** (no second-tier sub-nav) over
the warm-paper content area — the in-app, mint-tuned counterpart of
`@peppermint/admin`'s `AdminShell` MainNav.

- **Config-driven.** `nav.config.tsx` (`APP_SHELL_CONFIG`) holds the static shape —
  brand, `nav` destinations, `additional`, `aiButton`, `settingsButton`,
  `notifications`, `user`. `LayoutAppShell` injects router-bound `onNavigate`
  (`router.push`) and `linkComponent` (Next `Link`) at runtime. Types: `AppShell.types.ts`.
- **Rail composition** (`components/Sidebar/`): `SidebarBrand` (accent chip) → search
  (`spotlight.open()` opens the single `NavSpotlight`, also `mod+K`) → `NavIconButton`
  destinations (mint-accent active pill, active resolved by `nav.utils.ts`
  `resolveActiveNavItem` / `isActiveHref`) → optional `additional` → `SidebarFooter`
  (AI, `BookmarksMenu` variant="sidenav", notifications bell, settings, `UserMenu`).
- **Dark rail is explicit.** Unlike `AdminShell` (transparent rail over a dark app bg),
  mintflow's body is light, so the rail Stack carries its own `tokens.tile` surface +
  `tokens.shadow.nav` (see `shell.constants.ts` `railCardStyle`). Mobile (< `sm`): a
  fixed `Burger` toggles the collapsed rail.
- **Placeholder destinations** (`/cases`, `/calendar`, `/team`, `/notifications`, …)
  have no routes yet and 404 until built — rewire `nav.config.tsx` as routes land.

> ⚠️ SSR lesson (still applies): `nav.config.tsx` is `"use client"` (it imports Phosphor
> icons) and is imported **directly** by the client shell only — it is **not**
> re-exported through `layouts/app-shell/index.ts`. Re-exporting an icon-importing config
> through a barrel a Server Component evaluates caused an SSR 500 in the prior shell.

## Shared foundation

- **Design tokens:** `config/design/tokens.ts` (`tokens`, `categoryStyles`, `statusDot`)
  — fixed brand values, color-scheme independent (warm-paper surface; dark ink/tile rail).
- **Theme:** `config/theme/` — Space Grotesk (UI) + JetBrains Mono (mono), accent-orange
  primary (`accent` ramp, shade 6) + `ink` ramp.
- **App-local primitives:** `components/` (exported from `components/index.ts`): `Screen`,
  `MonoText`, `SectionLabel`, `StatusPill`, `CheckRing`, `CheckItem`, `CaseIcon`.

## Wiring status — UI ONLY

No backend. Auth/sign-out and placeholder actions use the "Not connected yet"
notification pattern. Output-contract async states (loading/error/permission) are **N/A**
on placeholder screens.

## Do not do

- Do not import `@mantine/*` directly — always via `@peppermint/ui`.
- Do not add `useEffect` data fetching; server state goes through React Query when wired.
- Do not re-export `nav.config` (or any icon-importing client module) through a barrel a
  Server Component evaluates — import it directly from the client shell (SSR note above).
- Do not put logic in `app/` files beyond the root redirect — they are re-export only.
- Do not swap the fixed token colors for Mantine color-scheme variables — the paper
  content surface and dark rail are deliberately fixed.
