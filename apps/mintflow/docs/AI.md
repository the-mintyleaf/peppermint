# mintflow — AI Navigation Map

## Purpose

mintflow is the **"kamban." minister app**, being rebuilt on this branch as an
admin-style surface ("mintflow-admin"). It renders bespoke React screens on Mantine
(via `@peppermint/ui`) tuned to a fixed brand design system — **not**
`@peppermint/admin` framework screens. **Authentication is wired to the backend**
(login, tokenization, forced + own password change, logout, session-gated shell — see
[Authentication](#authentication-modulesauth--lib)); **module screen data is still
intentional local mock data** (the "not wired" pattern:
`notifications.show("Not connected yet")`).

> ⚠️ Mid-rebuild: the previous mobile shell (bottom-nav + IconRail) and most modules
> were removed. What exists now is the new **single-sidebar app shell** and a
> placeholder dashboard. Add real modules under `modules/` and routes under `app/(app)/`.

## Surfaces & routing

- `/` → `ModuleSignIn` (`modules/auth/sign-in/`) — the pre-auth sign-in page (no shell).
  A live session redirects itself to `/dashboard`.
- `/password-change` → `ModulePasswordChange` (`modules/auth/password-change/`) — forced
  password change for an authenticated account, outside the shell.
- Route group `app/(app)/` wraps authenticated routes in the app shell
  (`layouts/app-shell`); `(app)/layout.tsx` is a pure re-export of `LayoutAppShell`,
  which **gates the whole group** on a valid session (see [Authentication](#authentication-modulesauth--lib)).
  - `/dashboard` → `ModuleDashboard` (`modules/dashboard/`) — the "Home Work Desk" dashboard (home).
  - `/tasks` → `ModuleTasks` (`modules/tasks/`) — the imported Tasks page.
  - `/cases` → `ModuleCases` (`modules/cases/`) — case-management board.
  - `/cases/[caseId]` → `ModuleCaseProfile` (`modules/cases/profile/`) — full case profile page.
  - `/calendar` → `ModuleCalendar` (`modules/calendar/`) — tasks laid out by due date.
- `app/` files are re-export only (no logic — the gate lives in `LayoutAppShell` and
  the sign-in module).

## Modules

### `modules/dashboard/` — `ModuleDashboard` (ContainedModule)

The **"Home Work Desk"** minister dashboard at `/dashboard` (Claude Design _Home Work
Desk v3_ mockup, adapted). Calm daily surface, self-contained on **mock data**
(`module.api.ts` — `fetchDashboard`, `"populated" | "empty"` variants), no backend.
The mockup's blue-on-grey palette is adapted to the app's fixed brand — blue → accent
orange, white/grey surfaces → paper cards on the dark body; moss/lavender/amber map
onto the existing green/purple + cases amber (no new palette). The **home** route: it
is the one module left ungated. A **preview** `SegmentedControl` in the hero toggles the
populated vs **first-run** (all-zero, no red) state. The mockup's own header + sidebar
are dropped — the app shell provides them.

- `Dashboard.tsx` (`ModuleDashboard`) — a wrapping two-column flex: primary
  (`FocusHero` → `TaskFlowBoard`) + a 360px rail (`AttentionRail` → `WorkFilesRail` →
  `MetricsRail`). Owns loading/error(retry) states, the `TaskDrawer`, the auto-focus
  swap `Modal`, and derives the hero's team avatars / "done this week" / "on hold now".
- `Dashboard.hooks.ts` — `useDashboard` (React Query), `useDashboardBoard`
  (drag-reorderable focus+flow copies; encodes the WIP limit §6 + auto-focus swap
  rule §5), `useDrawer`, `rankWorkFiles` (§7 involvement→deadline→blockers→activity,
  never alphabetical), `hasEnoughData`/`RATE_EMPTY_COPY` (rate empty-state gate §11),
  `notConnected`.
- `module.api.ts` — types (`FocusTask`, `FlowTask`, `WorkFile`, `AttentionItem`,
  `Kpi`, `Momentum` w/ `title`), style maps (`PRIORITY_STYLE`, `FLOW_COLUMN_META`,
  `ATTENTION_TONE`), color consts (`MOSS`/`LAVENDER`/`AMBER`), `FOCUS_LIMIT`/`WIP_LIMIT`,
  mock + empty payloads. `estimate?` is optional and never populated (§11 — the
  estimate chip is render-guarded and never shows).
- `components/FocusHero/` — §5 hero: folded-in greeting + team avatar cluster + preview
  toggle; big-number readout row (`FocusStat` ×3: focus done · done this week · on hold);
  `FocusPill` rows (accent-emphasised "next up", honest done/overdue/in-progress states,
  Continue lever); empty "Choose focus tasks".
- `components/TaskFlowBoard/` — §6 personal kanban (`@dnd-kit`, 3 columns) headed
  "Today's task flow" + "Open Tasks" link (→ `/tasks`), `FlowColumn` (In-progress "3/3"
  amber WIP pill + amber full-notice), `FlowCard` (on-hold = **lavender flag in its real
  column**, overdue amber accent, quick-complete, open-in-drawer); mobile = tabs.
- `components/AttentionRail`, `components/WorkFilesRail/` (`WorkFileCard`) — §8/§7 rails:
  "Needs your attention" (exceptions only, tinted icon rows + tone-colored action link);
  "Active work files" (ranked; swatch dot + open-count, dept·milestone, progress, square
  avatars, "N yours"/"N overdue" badges, accent Open-work-file button).
- `components/MetricsRail/` — §10 "This week" card, 2×2 `KpiTile` (on-time ships in its
  **not-enough-data** empty state; "focus kept" `Sparkline` from `@peppermint/ui/charts`)
  - the dark-tile `MomentumStrip` (title + line + accent Plan-tomorrow).
- `components/TaskDrawer/` — §15 right `Drawer`: primary fields top, secondary lower
  (subtasks/deps/comments/attachments/on-hold/activity), complete/move/archive actions.
  Read-only detail (no editable fields → no unsaved-changes state). All inert actions →
  `notConnected`.

### `modules/calendar/` — `ModuleCalendar` (ContainedModule)

Full-page calendar at `/calendar` (AlignUI week-timeline look) that plots the **Tasks**
by **due date** (`endDate`). A **focus strip** of 4 ranked cards sits on top, then a
**week time-grid** (default) or a **month grid**. Cards are colored by **status**
(In Progress = blue, New = violet, On Hold = amber, Rejected = rose); urgent adds an
orange accent. Self-contained on the tasks module's **mock data** — reuses `fetchTasks` /
`Task` and the `TaskDetailModal`, owns no data, no backend.

Two fixed-data conventions to know: (1) the app has no real clock, so the calendar seeds
and highlights off `REFERENCE_TODAY` (16 Jul 2026) — otherwise the Jun–Aug 2026 mock tasks
would never line up with "today". (2) Tasks carry only a due **date**, no clock time, so the
week grid **synthesizes** a stable per-task time slot from its id (`taskSlot`), with longer
slots — and thus taller cards — for tasks with more assignees + subtasks (`taskWeight`).
New Task / edit actions use the "Not connected yet" pattern.

- `Calendar.tsx` (`ModuleCalendar`) — chrome (`ModuleHeader` + New Task, `ManageHeader`,
  `ModalPaper`) then a toolbar (`‹ / Today / ›` nav, month/week title, All/Mine board-filter
  `SegmentedControl`, Month/Week toggle — **defaults to Week**). Body: `FocusStrip` then
  `WeekGrid` ⇄ `MonthView`; owns loading (`Skeleton`), error+retry, the unscheduled-tasks
  note, the `DayTasksModal`, and the reused `TaskDetailModal`.
- `Calendar.hooks.ts` — `useCalendarTasks` (React Query over `fetchTasks(filter)`),
  `useCalendarNav` (anchor + view + prev/next/today; **week by default**), `useTasksByDay`
  (`Map<"YYYY-MM-DD", Task[]>` keyed on `endDate` + `unscheduled`), `useFocusTasks`
  (rank: ongoing first, else highest priority, then soonest due — top 4), `tasksForDay`,
  `notConnected`.
- `Calendar.utils.ts` — date helpers (`REFERENCE_TODAY`, `buildMonthMatrix`, `buildWeekDays`,
  `dayKey` local Y/M/D never UTC, `dueRelative` / `formatDueShort` / `isDueToday`) **plus the
  week-grid geometry**: `DAY_START_HOUR`/`DAY_END_HOUR`/`HOUR_PX`/`GRID_HEIGHT`, `taskSlot`
  (deterministic hash → slot), `taskWeight`, `formatSlotRange`, `HOUR_MARKS`/`hourMarkLabel`,
  and `packDay` (column-packs overlapping cards into side-by-side lanes).
- `module.api.ts` — thin: re-exports the tasks fetch/types + `statusStyle(task)` (status →
  `{ accent, tint, fg }`), `isUrgent`, `assigneeList`. No new mock data.
- `components/FocusStrip/` — top row of `FocusCard`s (4-up → 2-up → snap-scroll); lead card
  (index 0) is tinted; each shows title, synthesized time, a status pill (or green "Due today")
  and the relative due. Hidden when there are no tasks.
- `components/WeekGrid/` — sticky weekday header + a time gutter (`HOUR_MARKS`) and 7 day
  columns with hour gridlines; `EventCard`s are absolutely positioned by `taskSlot` and
  `packDay` lanes, colored by status, taller cards adding an avatar group + status label.
  Today's column/header is accent-tinted. Wrapped in `ScrollArea.Autosize`.
- `components/MonthView/` — weekday header + CSS-grid 6×7 of `DayCell` (day number, accent
  ring on today, dimmed out-of-month, up to 3 `EventChip`s then a "+N more" → `DayTasksModal`).
- `components/EventChip/` — status dot + title (+ accent for urgent); click opens the task.
  Used by month cells and `DayTasksModal`.
- `components/DayTasksModal/` — Mantine `Modal` listing every task due on a clicked day;
  rows open the `TaskDetailModal`. Read-only (no editable fields → no unsaved-changes state).

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

## Authentication — `modules/auth/` + `lib/`

The one wired-to-backend surface. Mirrors `mintflow-admin`'s auth wiring; account
administration (users, roles, permissions) stays in `mintflow-admin` — this client app
only signs in, holds/refreshes tokens, changes its own password, and gates itself.

- **`lib/api.ts`** — the shared Axios instance from `configureApiClient`
  (`@peppermint/api-client`): `baseURL` from `NEXT_PUBLIC_API_URL`, `refreshEndpoint`
  `/api/v1/auth/refresh/`. Auth-header injection, envelope unwrap, and single-flight 401
  refresh are built in. **Always import the instance from `@/lib/api`.**
- **`lib/authErrorMessages.ts`** — `ERROR_MESSAGES` (auth-code → copy) +
  `getApiError` / `getApiErrorMessage`.
- **`modules/auth/_shared/`** — `auth.types.ts` (`CurrentUser`), `useCurrentUser`
  (`GET /api/v1/auth/me/`, derives `isStaff`/`isSuperuser`), `useLogout`
  (`POST /api/v1/auth/logout/` then clear tokens + return to `/`), and
  `ChangePasswordForm/` (shared by the forced page and the account modal; posts
  `/api/v1/auth/change-password/`, with a `PasswordStrengthMeter`).
- **`modules/auth/sign-in/`** — `ModuleSignIn`: wraps `@peppermint/admin`'s `SignInPage`
  (identifier login + MFA verify + token storage + redirect). Route `/`.
- **`modules/auth/password-change/`** — `ModulePasswordChange`: thin wrapper around
  `ChangePasswordForm`. Route `/password-change`.
- **The gate lives in `LayoutAppShell`** (`layouts/app-shell/AppShell.tsx`): no
  `access_token` → `router.replace("/")`; `useCurrentUser()` holds a loader until identity
  resolves; `password_change_required` → `router.replace("/password-change")`. It builds
  the shell `user` menu from `CurrentUser` (Change password → `AccountModal`; Sign out →
  `useLogout`) and filters nav by role (`filterNavByRole` + the `requiresStaff` flag).
- **`components/AccountModal/`** — own-password change in a `Modal` (Change-password only;
  profile/MFA/sessions/permissions are managed in `mintflow-admin`).

## The app shell — `layouts/app-shell/`

`LayoutAppShell` (client) is a **collapsible 280px navigation panel** over the warm-paper
content area — the in-app, mint-tuned counterpart of `@peppermint/admin`'s `AdminShell`,
rendered as one full-width labeled panel that collapses to a narrow icon rail on desktop.

- **Config-driven.** `nav.config.tsx` (`APP_SHELL_CONFIG`) holds the static shape —
  `brand` (icon + wordmark + caption), `groups`, `aiButton`, `settingsButton`,
  `notifications`. `groups` is an array of titled sections
  (`AppShellNavGroup`): **Menu** (Dashboard, Tasks, Cases, Calendar, Team) and
  **Work Files** (dummy kanban boards). `LayoutAppShell` injects router-bound
  `onNavigate` (`router.push`) and `linkComponent` (Next `Link`), **the `user` menu
  (built from `CurrentUser`), and the role-filtered `groups`** at runtime — a nav item or
  group flagged `requiresStaff` is hidden from non-staff accounts (`filterNavByRole`).
  Types: `AppShell.types.ts`.
- **Panel composition** (`components/Sidebar/`): `SidebarBrand` (accent chip + wordmark)
  → `SearchField` (full-width, `spotlight.open()` opens the single `NavSpotlight`, also
  `mod+K`) → scrollable groups, each an uppercase section label + `NavRow` items
  (icon + label + optional count badge; active = accent-tinted, resolved by `nav.utils.ts`
  `resolveActiveHref` / `isActiveHref`) → `SidebarFooter` (icon cluster: AI,
  `BookmarksMenu` variant="sidenav", notifications bell, settings; then the full-width
  `UserMenu` account row).
- **Collapsible icon rail (desktop).** `SidebarToggle` (a `CaretDouble` `ActionIcon`) sits
  top-right of the brand header when expanded; collapsing shrinks the panel to
  `NAV_WIDTH_COLLAPSED = 72` where the **expand button sits above the search** (now an
  icon-only trigger), section labels are hidden, and `NavRow`/`UserMenu` become icon-only
  with hover tooltips and a vertical footer cluster. Each part takes a `collapsed` prop.
  State lives in `AppShell.store.ts` (`useSidebarStore`, `zustand/persist` →
  `localStorage["mintflow-sidebar"]`). The effective value comes from `useRailCollapsed`
  (`AppShell.hooks.ts`): `hasHydrated && collapsed && matches(min-width:48em)` — the
  `hasHydrated` flag keeps SSR/first paint expanded (no hydration mismatch), and the `sm`
  media query keeps collapse **desktop-only** so the mobile Burger overlay always renders
  in full. Both `AppShell.tsx` (navbar width) and `Sidebar.tsx` read that hook; the navbar
  and panel width transitions are reduced-motion-guarded (`AppShell.module.css` /
  `Sidebar.module.css`).
- **Dark panel is explicit.** Unlike `AdminShell` (transparent over a dark app bg),
  mintflow's body is light, so the panel Stack carries its own `tokens.tile` surface +
  `tokens.shadow.nav` (see `shell.constants.ts` `navCardStyle`, `NAV_WIDTH = 280`).
  Mobile (< `sm`): a fixed `Burger` toggles the panel overlay (independent of the desktop
  collapse); content reserves top padding to clear it.
- **Placeholder destinations** (`/team`, `/work-files/*`, `/notifications`, `/settings`,
  `/ai`, …) have no routes yet and 404 until built — rewire `nav.config.tsx` as routes
  land. `/dashboard`, `/tasks`, `/cases`, and `/calendar` are real.

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

## Wiring status

**Authentication is wired** to the backend (see [Authentication](#authentication-modulesauth--lib))
— real `login/refresh/logout/me/change-password` calls through `@/lib/api`. **Module
screens remain UI-only on mock data**: their New/Edit/placeholder actions use the "Not
connected yet" notification pattern, and their output-contract async states
(loading/error/permission) are **N/A** until the module data is wired.

## Do not do

- Do not import `@mantine/*` directly — always via `@peppermint/ui`.
- Do not add `useEffect` data fetching; server state goes through React Query
  (`useCurrentUser` is the pattern). The only `useEffect`s in the shell are the
  auth-gate redirects, not fetches.
- Do not call `configureApiClient` or Axios inline — import the instance from `@/lib/api`.
- Do not re-export `nav.config` (or any icon-importing client module) through a barrel a
  Server Component evaluates — import it directly from the client shell (SSR note above).
- Do not put logic in `app/` files — they are re-export only (the auth gate lives in
  `LayoutAppShell` and the sign-in module).
- Do not swap the fixed token colors for Mantine color-scheme variables — the paper
  content surface and dark rail are deliberately fixed.
