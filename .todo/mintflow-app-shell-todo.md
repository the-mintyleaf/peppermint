# mintflow single-sidebar App Shell — todo

## Phase 1 — Foundations

- [x] `shell.constants.ts` (RAIL_WIDTH, insets, dark railCardStyle from mint tokens)
- [x] `AppShell.types.ts` (AppShellConfig + nav/additional/brand/ai/settings/user types)
- [x] `nav.utils.ts` (resolveActiveNavItem)
- [x] `nav.config.tsx` (placeholder brand + destinations + footer config, "use client")

## Phase 2 — Rail pieces

- [x] `components/Sidebar/components/NavIconButton/`
- [x] `components/Sidebar/components/SidebarBrand/`
- [x] `components/Sidebar/components/UserMenu/`
- [x] `components/Sidebar/components/NavSpotlight/`
- [x] `components/Sidebar/components/SidebarFooter/`
- [x] `components/Sidebar/Sidebar.tsx` (+ types, index) composing the rail

## Phase 3 — Shell + wiring

- [ ] `AppShell.tsx` (LayoutAppShell) + `AppShell.module.css`
- [ ] barrels: `components/index.ts`, `layouts/app-shell/index.ts`
- [ ] `app/(app)/layout.tsx` wraps children in LayoutAppShell
- [ ] placeholder `modules/dashboard/` (ModuleDashboard) + `app/(app)/dashboard/page.tsx`
- [ ] point `/` at `/dashboard` (or leave stub) — decide at wiring

## Phase 4 — Docs

- [ ] refresh `apps/mintflow/docs/AI.md` for single-sidebar shell

## Verify

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] dev render `/dashboard`
- [ ] visual review
