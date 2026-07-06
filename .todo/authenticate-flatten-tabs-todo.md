# Authenticate — flatten tab modules + ModuleHeader everywhere

Goal: match the `organizations` sub-module `ModuleHeader` + `ModalPaper` pattern
across every `authenticate` sub-module, and split the three tab modules into
independent sibling sub-modules (no `Tabs`).

Split map:
- `roles-bindings/` → `roles/` + `bindings/`
- `direct-access/` → `grants/` + `denials/`
- `access-tools/` → `permission-catalog/` + `access-tester/`

Chrome per module: `RequireStaff` → `ModuleHeader breadcrumbItems` → `ModalPaper withBorder` → shell/panel.

## Phase 1 — roles-bindings → roles/ + bindings/

- [ ] `git mv roles-bindings/roles roles`
- [ ] `git mv roles-bindings/bindings bindings`
- [ ] `roles/pages/RolesList.tsx`: add RequireStaff + ModuleHeader + ModalPaper chrome; fix "Bindings tab" copy → "Bindings screen"
- [ ] `bindings/pages/BindingsList.tsx`: add chrome
- [ ] `roles/index.ts` → `ModuleRoles`; `bindings/index.ts` → `ModuleBindings`
- [ ] `roles/queryKeys` + `bindings/queryKeys` prefix strings cleanup (optional)
- [ ] `roles/docs/AI.md`, `bindings/docs/AI.md` (split from old)
- [ ] `app/admin/authenticate/roles/page.tsx`, `.../bindings/page.tsx`
- [ ] delete `roles-bindings/` (view, index, docs) + `app/.../roles-bindings/`
- [ ] commit

## Phase 2 — direct-access → grants/ + denials/

- [ ] `git mv direct-access/grants grants`; `git mv direct-access/denials denials`
- [ ] `grants/pages/GrantsList.tsx` + `denials/pages/DenialsList.tsx`: add chrome
- [ ] `grants/index.ts` → `ModuleGrants`; `denials/index.ts` → `ModuleDenials`
- [ ] `grants/docs/AI.md`, `denials/docs/AI.md`
- [ ] `app/admin/authenticate/grants/page.tsx`, `.../denials/page.tsx`
- [ ] delete `direct-access/` + `app/.../direct-access/`
- [ ] commit

## Phase 3 — access-tools → permission-catalog/ + access-tester/

- [ ] create `permission-catalog/` + `access-tester/`; move panels/hooks + api/types
- [ ] rename `access-tools.api/types` → `access-tester.api/types`; fix panel imports
- [ ] `PermissionCatalog.tsx` + `AccessTester.tsx` module wrappers (chrome)
- [ ] `permission-catalog/index.ts` → `ModulePermissionCatalog`; `access-tester/index.ts` → `ModuleAccessTester`
- [ ] `permission-catalog/docs/AI.md`, `access-tester/docs/AI.md`
- [ ] `app/admin/authenticate/permission-catalog/page.tsx`, `.../access-tester/page.tsx`
- [ ] delete `access-tools/` + `app/.../access-tools/`
- [ ] commit

## Phase 4 — users header + shared wiring + docs

- [ ] `users/pages/list/UsersList.tsx`: add ModuleHeader
- [ ] `config/nav/admin-nav.ts`: Access Control group → 6 flat items (routes + icons)
- [ ] `authenticate/docs/AI.md`: rewrite sub-module table (6 modules, no tabs)
- [ ] `apps/mintflow/docs/AI.md`: update structure comment
- [ ] commit

## Phase 5 — verify + review

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] dual adversarial review of full diff; apply fixes; commit
- [ ] delete this todo
