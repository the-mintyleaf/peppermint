# Global Search (AdminShell spotlight) — todo

Integrates the backend text searches as of `.backend/iterations/20260725_0037_*`
(English-only single-name shapes) into the AdminShell sidenav spotlight.

Domains: applicants `?search=`, leads `?search=`, clients `?search=`,
catalogue programs + institutions `?q=`, documents `?search=`,
checklist templates `?search=`, document-template signatories `?search=`.

## Phase 1 — package contract (`@peppermint/admin` AdminShell)

- [ ] Add `AdminShellGlobalSearch` / `AdminShellSearchResult` types to `AdminShell.types.ts`
- [ ] Rework `MainNavSpotlight` — controlled query, debounce, remote results, loading/empty/error states
- [ ] Custom spotlight filter: nav targets filtered locally, remote results pass through
- [ ] Wire the magnifier button in `MainNav` to open the spotlight (currently inert)
- [ ] Thread `globalSearch` through `AdminShell` → `Navbar` → `MainNav`
- [ ] Docs: `packages/admin/docs/AdminShell.md` + `usage-doc/admin/AdminShell.md`
- [ ] Commit + adversarial review

## Phase 2 — app search provider (`apps/grandway`)

- [ ] `modules/admin/global-search/` — types, per-domain search fns, fan-out with role gating
- [ ] Result → href mapping (detail route where one exists, list route + `?q=` otherwise)
- [ ] `useGlobalSearch` hook (React Query, `enabled` on min query length)
- [ ] Wire into `layouts/admin/Admin.tsx` config
- [ ] Commit + adversarial review

## Phase 3 — `?q=` deep links on list routes

- [ ] Applicants list reads `?q=` → prefills table search
- [ ] Lead management list reads `?q=`
- [ ] Clients directory reads `?q=`
- [ ] Institutions (programs / providers) reads `?q=`
- [ ] Documents (all) reads `?q=`
- [ ] Checklist templates reads `?q=`
- [ ] Commit + adversarial review

## Phase 4 — verification & docs

- [ ] `pnpm format` (own files only), `pnpm check-types`, `pnpm lint`
- [ ] Update `apps/grandway/docs/AI.md` + module AI maps
- [ ] Final commit + push
