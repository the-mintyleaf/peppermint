# mintflow — AI Navigation Map

## Purpose

mintflow is the mobile-first **"kamban." minister app** — a task/case workspace for a
government minister. It renders the Claude Design mockups (project `26e16bfd-…`) as real,
responsive React screens built on Mantine (imported via `@peppermint/ui`). These are
**bespoke UI screens — not** `@peppermint/admin` framework screens (no `createListModule`,
`ModalTableShell`, `FormShell`, `createResourceApi`). **No backend yet** — all screen data
is intentional local mock data (same "not wired" spirit as the sign-in screen).

## Surfaces & routing

- `/` — `ModuleSignIn` (pre-auth landing; see `modules/sign-in/docs/AI.md`). Outside the app shell.
- Route group `app/(app)/` wraps the authenticated app in the **app shell** (`layouts/app-shell`):
  - `/home` → `ModuleHome` · `/tasks` → `ModuleTasks` · `/dashboard` → `ModuleDashboard`
  - `/files` → `ModuleFiles` · `/files/[caseId]/trail` → `ModuleWorkTrail`
  - `/ai` → `ModuleAskAi` · `/settings` → `ModuleSettings` (placeholder)
- **Immersive routes, OUTSIDE the shell** (no bottom nav): `/onboarding` → `ModuleOnboarding`,
  `/voice` → `ModuleVoice`.
- `app/` files are re-export only.

## The shared nav shell — `layouts/app-shell/`

`LayoutAppShell` (client) is the chrome around every `(app)` route:

- **Mobile (< 62em):** floating dark **`BottomNav`** pill — Home · Tasks · **＋** · Reports · Files.
- **Desktop (≥ 62em):** left **`IconRail`** — same 4 destinations + Settings + avatar.
- The center **＋** opens the **Create Task** sheet from any screen via `CreateTaskHost`
  (a bottom `Drawer` driven by `app-shell.store.ts`, a Zustand store — `useAppShellStore`).
- Destinations + active-route logic: `nav.config.tsx` (`NAV_DESTINATIONS`, `isDestinationActive`).
  ⚠️ `nav.config` is **not** re-exported from `layouts/app-shell/index.ts` and is marked
  `"use client"` — it imports Phosphor icons (`createContext`); re-exporting it through the
  barrel made the Server-Component `(app)/layout.tsx` evaluate it on the server → SSR 500
  (the prod build tree-shook it and passed, hiding the bug). Import it directly from the
  client nav components only.

## Shared foundation

- **Design tokens:** `config/design/tokens.ts` (`tokens`, `categoryStyles`, `statusDot`) —
  mirrored as `--k-*` CSS vars in `app/globals.css`. Fixed brand values, color-scheme
  independent (screens are a fixed warm-paper surface; the dashboard is a fixed dark surface,
  so light/dark screenshots look identical by design).
- **Theme:** `config/theme/` — Space Grotesk (UI) + JetBrains Mono (monospace), accent-orange
  primary + `accent`/`ink` color ramps.
- **App-local primitives:** `components/` (built on `@peppermint/ui`, exported from
  `components/index.ts`): `Screen` (page container: centered ~460px column that clears the
  bottom nav, `dark`/`fluid` variants), `MonoText`, `SectionLabel`, `StatusPill`, `CheckRing`,
  `CheckItem`, `CaseIcon`.

## Screens (`modules/`)

Each is a `"use client"` module exporting `Module<Name>`, with colocated
`*.data.ts` (mock seed), `*.types.ts`, and a `components/` subfolder where large.

- **home** — Focus-now card, day legend, toggleable task list (CheckItem), Schedule/Reflect rows.
- **tasks** — All-tasks list with status tabs (All/Ongoing/On-Next/Complete) + category badges.
  Rows are presentational (no task-detail route yet).
- **files** — Work collections list with band filter chips, summary strip, `CaseIcon` rows,
  "New work" FAB (opens Create Task). Rows route to the work-trail.
  - **files/work-trail** — vertical case timeline (`TrailStage`/`TrailNode` + branch/handoff lines).
- **dashboard** — Reports. Two layouts via `useMediaQuery` (SSR-guarded, defaults mobile):
  mobile bento grid + desktop two-column. Pure-CSS flex bar charts (no chart lib). Week/Month toggle.
- **create-task** — bottom-sheet form content (`{ onClose }`); status/priority inline pickers,
  sub-tasks. Rendered by `CreateTaskHost`, not a route.
- **onboarding** — 3-step wizard (details / preferences / guidance), immersive.
- **ai** — Ask AI chat. Mock: `AskAi.mutation.ts` `askKambanAi()` resolves canned replies via a
  React Query `useMutation` (`isPending` → typing dots). Composer mic → `/voice`.
  - **ai/voice** — immersive animated voice orb + meter (no real speech).
- **settings** — placeholder (the rail exposes a Settings destination).

## Wiring status — UI ONLY

No backend. Ask AI is a mock mutation (`AskAi.mutation.ts` — swap the body for a real
`api` call later, no call-site change). Voice is animation-only. Sign-in uses the
`notifications.show("Not connected yet")` pattern. Output-contract async states
(loading/error/permission/etc.) are **N/A** on every screen; lists still render empty states.

## Do not do

- Do not import `@mantine/*` directly — always via `@peppermint/ui`.
- Do not add `useEffect` data fetching; server state goes through React Query when wired.
- Do not re-export icon-importing modules (like `nav.config`) through a barrel consumed by a
  Server Component — mark them `"use client"` and import directly (see the SSR note above).
- Do not add the bottom nav to `/onboarding` or `/voice` — they are intentionally immersive.
- Do not swap the fixed token colors for Mantine color-scheme variables — the surfaces are
  deliberately fixed (paper / dark).
