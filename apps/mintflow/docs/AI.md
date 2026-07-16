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
  - `/tasks` → `ModuleTasks` (`modules/tasks/`) — the imported Tasks page.
  - `/cases` → `ModuleCases` (`modules/cases/`) — case-management board.
  - `/cases/[caseId]` → `ModuleCaseProfile` (`modules/cases/profile/`) — full case profile page.
- `app/` files are re-export only (the root redirect is the one allowed exception).

## Modules

### `modules/tasks/` — `ModuleTasks` (ContainedModule)

Single Tasks page with a **List / Board** view toggle, ported verbatim from
`mintflow-admin`'s `admin/tasks` (analytics view dropped). Self-contained on **mock data**
(`kanban/module.api.ts` — `MOCK_TASKS`, `fetchTasks`), no backend.

- `Tasks.tsx` (`ModuleTasks`) — the unified dashboard: shared chrome (`ModuleHeader` +
  `AccessMenu` + New Task, `ManageHeader`, board-filter `SegmentedControl`, List/Board
  toggle, team panel, search) rendered once; the body swaps between board and list.
- `kanban/` — Board view: `KanbanBoard`/`KanbanColumn`/`KanbanCard` (drag via `@dnd-kit`),
  `CreateTaskModal`, `TaskDetailModal`, `TaskModalShared`; hooks `useTasks` /
  `useKanbanBoard` in `KanbanDashboard.hooks.ts`; data + types in `module.api.ts`.
- `general-view/` — List view: `TaskGroupSection` / `TaskListRow` grouped by display
  status (`TaskTable.module.css`), `TeamMembersPanel`; hooks `useTeamMembers` /
  `useGroupedTasks` + `DISPLAY_STATUS_*` in `GeneralViewDashboard.hooks.ts`.

> The `*Dashboard.hooks.ts` filenames are retained from the source; the per-route
> `*Dashboard.tsx` themselves were replaced by the single `Tasks.tsx`.

### `modules/cases/` — `ModuleCases` (ContainedModule)

Single `/cases` case-management board. A **case** = a matter before the Ministry of Home
Affairs (case no · title · summary · category · status · priority · task checklist ·
officers · departments · dates) — **not** files/GB. Status tabs (All / In Progress /
Under Review / On Hold / Resolved / Closed) over a **Block** (4-up card grid) or **List**
(dense table) view, plus a secondary "Recent documents" section (case files) shown only on
the All tab. Clicking a case opens a rich detail modal. Self-contained on **mock data**
(`module.api.ts` — `MOCK_CASES` / `MOCK_FILES`, `fetchCases` / `fetchFiles`), no backend.
Document clicks + New Case / Upload / Update case use the "Not connected yet" pattern.
mintflow orange/paper tokens (loosely seeded by the `Files.dc.html` mock, since reframed).

- `Cases.tsx` (`ModuleCases`) — chrome (`ModuleHeader` + Upload / New Case, `ManageHeader`,
  status `SegmentedControl` tabs, Block/List toggle, sort menu, search) rendered once; body
  swaps between block and list with shared loading / empty states; owns the detail modal.
- `Cases.hooks.ts` — `useCases` / `useFiles` (React Query over the mock fetchers),
  `useFilteredCases` (status + search + `SortKey` sort) / `useFilteredFiles` (search),
  `STATUS_TABS` / `SORT_KEYS`, `formatDate`.
- `module.api.ts` — types (`WorkCase`, `CaseFile`, `Officer`, `CaseTask`, `CaseStatus`,
  `CasePriority`, `CaseCategory`), style maps (`STATUS_STYLE`, `PRIORITY_STYLE`,
  `CATEGORY_STYLE` icon/tint, `FILE_STYLE`), `caseProgress`, mock data + fetchers.
- `block-view/` — `BlockView` (case grid + documents grid via `SimpleGrid`);
  `components/CaseCard` (identity · title/summary · progress bar · departments · officers ·
  status) + `components/FileCard` (document card).
- `list-view/` — `ListView` (cases table + documents table, `ListView.module.css` grids,
  horizontal-scroll wrapped); `components/CaseRow` + `components/FileRow`.
- `detail/CaseDetailModal/` — Mantine `Modal`: header, summary, meta grid, departments,
  officers, and the task checklist (`CheckItem` + `Progress`). Read-only (no editable
  fields → no unsaved-changes state). Footer "Open full profile" routes to
  `/cases/[caseId]`.
- `profile/` — `ModuleCaseProfile`, the full-page case profile at `/cases/[caseId]`
  (adapted from the Claude Design `Work.dc.html` layout, re-skinned to orange/paper and
  mapped onto the police-case model). Reads `caseId` from `useParams`; handles
  loading / error+retry / not-found / empty states. `ModuleHeader` breadcrumb
  (Cases / {title}) + officer avatars + Add task, then a 70/30 split:
  - `profile.api.ts` — derives a `CaseProfileData` (case + its filed `CaseFile`s + a
    synthesized `activity` feed) from `MOCK_CASES`/`MOCK_FILES`; extra presentational maps
    (`PRIORITY_METER`, `TASK_STATE_STYLE`, `ACTIVITY_STYLE`) + `taskBreakdown`; re-exports
    the domain style maps. `CaseProfile.utils.ts` — `formatDate` / `dueRelative` (fixed
    mid-2026 reference). `CaseProfile.hooks.ts` — `useCaseProfile`, `useProfileView`
    (selected checklist task + tab), `useVisibleActivity` (filters the feed to the task).
  - `components/TaskStrip` (checklist chips that filter the activity feed),
    `components/WorkDetail` (status/priority/category badges + progress/tasks/due/opened
    metric strip), `components/ActivityTimeline` (icon-rail feed), `components/WorkTabs`
    (Activity / Files / People tabs), `components/InsightsRail` (dark case-lead card,
    priority meter, progress breakdown, officers brief).

## The app shell — `layouts/app-shell/`

`LayoutAppShell` (client) is a **single always-open 280px navigation panel** (no
icon-rail / sub-nav split) over the warm-paper content area — the in-app, mint-tuned
counterpart of `@peppermint/admin`'s `AdminShell`, rendered as one full-width labeled panel.

- **Config-driven.** `nav.config.tsx` (`APP_SHELL_CONFIG`) holds the static shape —
  `brand` (icon + wordmark + caption), `groups`, `aiButton`, `settingsButton`,
  `notifications`, `user`. `groups` is an array of titled sections
  (`AppShellNavGroup`): **Menu** (Dashboard, Tasks, Cases, Calendar, Team) and
  **Work Files** (dummy kanban boards). `LayoutAppShell` injects router-bound
  `onNavigate` (`router.push`) and `linkComponent` (Next `Link`) at runtime.
  Types: `AppShell.types.ts`.
- **Panel composition** (`components/Sidebar/`): `SidebarBrand` (accent chip + wordmark)
  → `SearchField` (full-width, `spotlight.open()` opens the single `NavSpotlight`, also
  `mod+K`) → scrollable groups, each an uppercase section label + `NavRow` items
  (icon + label + optional count badge; active = accent-tinted, resolved by `nav.utils.ts`
  `resolveActiveHref` / `isActiveHref`) → `SidebarFooter` (icon cluster: AI,
  `BookmarksMenu` variant="sidenav", notifications bell, settings; then the full-width
  `UserMenu` account row).
- **Dark panel is explicit.** Unlike `AdminShell` (transparent over a dark app bg),
  mintflow's body is light, so the panel Stack carries its own `tokens.tile` surface +
  `tokens.shadow.nav` (see `shell.constants.ts` `navCardStyle`, `NAV_WIDTH = 280`).
  Mobile (< `sm`): a fixed `Burger` toggles the collapsed panel; content reserves top
  padding to clear it.
- **Placeholder destinations** (`/cases`, `/calendar`, `/team`, `/work-files/*`,
  `/notifications`, …) have no routes yet and 404 until built — rewire `nav.config.tsx`
  as routes land. `/dashboard` and `/tasks` are real.

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
