# Global Search (AdminShell spotlight) — todo

Integrates the backend text searches as of `.backend/iterations/20260725_0037_*`
(English-only single-name shapes) into the AdminShell sidenav spotlight.

Domains: applicants `?search=`, leads `?search=`, clients `?search=`,
catalogue programs + institutions `?q=`, documents `?search=`,
checklist templates `?search=`, document-template signatories `?search=`.

## Phase 1 — package contract (`@peppermint/admin` AdminShell)

- [x] Add `AdminShellGlobalSearch` / `AdminShellSearchResult` types to `AdminShell.types.ts`
- [x] Rework `MainNavSpotlight` — controlled query, debounce, remote results, loading/empty/error states
- [x] Custom spotlight filter: nav targets filtered locally, remote results pass through
- [x] Wire the magnifier button in `MainNav` to open the spotlight (currently inert)
- [x] Thread `globalSearch` through `AdminShell` → `Navbar` → `MainNav`
- [x] Docs: `packages/admin/docs/AdminShell.md` + `usage-doc/admin/AdminShell.md`
- [x] Commit + adversarial review

## Phase 2 — app search provider (`apps/grandway`)

- [x] `modules/admin/global-search/` — types, per-domain search fns, fan-out with role gating
- [x] Result → href mapping (detail route where one exists, list route + `?q=` otherwise)
- [x] ~~`useGlobalSearch` hook~~ — not needed, the shell owns the React Query call
- [x] Wire into `layouts/admin/Admin.tsx` config
- [x] Commit + adversarial review

## Phase 3 — `?q=` deep links on list routes

- [x] `initialSearch` prop on DataTableWrapper/DataTableShell + docs
- [x] `lib/useDeepLinkSearch.ts` — reads `?q=`
- [x] Lead management board reads `?q=`
- [x] Clients directory reads `?q=`
- [x] Catalogue programs + providers read `?q=`
- [x] ~~Applicants / documents / checklist templates~~ — their results navigate to
      real detail routes, so no `?q=` plumbing is needed
- [ ] Commit + adversarial review

## Phase 4 — verification & docs

- [ ] `pnpm format` (own files only), `pnpm check-types`, `pnpm lint`
- [ ] Update `apps/grandway/docs/AI.md` + module AI maps
- [ ] Final commit + push
