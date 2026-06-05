# Bootstrap Tasks for mint-consultancy

## Task 1: Homepage Setup (Duplicate from zetsel-admin)

### Config & Theme
- [x] `config/theme/theme.mantine.main.tsx` — copy brand palette, fonts
- [x] `config/theme/theme.mantine.components.tsx` — copy component defaults
- [x] `config/theme/index.ts` — createTheme export
- [x] `config/nav/admin-nav.ts` — student-focused nav groups
- [x] `config/header/admin-header.ts` — greeting + action buttons

### Layouts
- [x] `layouts/app/App.tsx` — root HTML shell
- [x] `layouts/app/index.ts` — barrel export
- [x] `layouts/admin/Admin.tsx` — AdminShell wrapper
- [x] `layouts/admin/index.ts` — barrel export

### App Router
- [x] `app/layout.tsx` — replace boilerplate with LayoutApp
- [x] `app/admin/layout.tsx` — LayoutAdmin
- [x] `app/admin/page.tsx` — ModuleHome

### Homepage Module
- [x] `modules/admin/home/home.types.ts`
- [x] `modules/admin/home/home.api.ts`
- [x] `modules/admin/home/home.store.ts`
- [x] `modules/admin/home/Home.tsx` (change userName)
- [x] `modules/admin/home/Home.module.css`
- [x] `modules/admin/home/index.ts`
- [x] `modules/admin/home/components/ChatWelcome/` (all files)
- [x] `modules/admin/home/components/ChatInput/` (all files)
- [x] `modules/admin/home/components/ChatMessage/` (all files)
- [x] `modules/admin/home/components/HomeHeader/` (all files)

### Misc
- [x] `uuid.d.ts` — type declaration
- [x] `.env.local` — NEXT_PUBLIC_MINT_AI_URL

---

## Task 2: Students Module (New)

### Types & API
- [x] `modules/students/students.types.ts` — Student interface
- [x] `modules/students/students.api.ts` — mock fetch
- [x] `modules/students/students.queryKeys.ts` — query keys

### List Page
- [x] `modules/students/pages/list/StudentsList.tsx` — DataTableShell
- [x] `modules/students/pages/list/students.columns.tsx` — column defs
- [x] `modules/students/index.ts` — export ModuleStudents

### Route & Nav
- [x] `app/admin/students/page.tsx` — route page
- [x] Update `config/nav/admin-nav.ts` — add Students link

---

## Progress Summary

**Task 1 (Homepage):** 27/27 ✅  
**Task 2 (Students):** 8/8 ✅  
**Total:** 35/35 tasks complete ✅

---

Status: COMPLETE
