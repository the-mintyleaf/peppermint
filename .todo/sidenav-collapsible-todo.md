# Sidenav collapsible — todo

## Phase 1: State + constants + toggle

- [ ] Create `AppShell.store.ts` — persisted `useSidebarStore` (collapsed, toggle, setCollapsed, hasHydrated)
- [ ] Add `NAV_WIDTH_COLLAPSED = 72` to `shell.constants.ts`
- [ ] Create `SidebarToggle` component (.tsx/.types.ts/.module.css/index.ts)
- [ ] Export `SidebarToggle` from `Sidebar/components/index.ts`

## Phase 2: Sub-component collapsed variants

- [ ] SidebarBrand — chip-only centered when collapsed
- [ ] SearchField — icon-only + tooltip when collapsed
- [ ] NavRow — icon-only + tooltip when collapsed
- [ ] SidebarFooter — vertical cluster when collapsed, pass collapsed to UserMenu
- [ ] UserMenu — avatar-only + tooltip when collapsed

## Phase 3: Composition + wiring + motion

- [ ] Sidebar.tsx — read store, switch width, toggle placement, hide section labels, pass collapsed down
- [ ] Sidebar.module.css — width transition + reduced-motion guard
- [ ] AppShell.tsx — read store, compute navbar width by collapsed

## Phase 4: Docs + verify

- [ ] Update `apps/mintflow/docs/AI.md` § app shell
- [ ] pnpm format && check-types && lint
- [ ] Visual review expanded + collapsed
- [ ] Dual adversarial review, commit per phase, delete this file
