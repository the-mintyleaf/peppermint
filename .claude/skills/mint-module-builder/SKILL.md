---
name: mint-module-builder
description: >
  Router + build guide for Peppermint monorepo apps. Read this before building any
  module or page. It carries the always-needed rules (stack, naming, state ownership,
  imports, commit format) and the decision logic — Contained vs Not-Contained vs Custom,
  and single-page vs multi-page within Contained — then routes you to exactly ONE
  build-guide file under reference/. Read the matching reference file after deciding the
  path; do not build from this file alone. Use as a bootstrap when given a requirements
  document.
model: opus
---

# Peppermint Module Build Guide (Router)

This is the authoritative entry point for module work across the Peppermint monorepo
apps (`mintway`, `mintflow`, `mintflow-admin`). It holds the universal rules and the
decision logic, then sends you to **one** path-specific build guide under `reference/`.
Reading this router + the one matching reference file replaces the need to re-scan the
repository before building a module.

> **How to use this skill:** read this router top-to-bottom, decide the path (§2 → §3),
> then open the single `reference/*.md` file the routing table (§3) names. Each reference
> file is self-contained — you will not need a second one for a single build.

---

## 1. Stack at a Glance

| Concern               | Tool                                                   | Rule                                                               |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| UI components         | `@peppermint/ui`                                       | Always import from here — never from `@mantine/*` directly         |
| Forms                 | `FormWrapper` (`@peppermint/admin`)                    | Run `/form-builder` first; never React Hook Form or bare `useForm` |
| Server state          | React Query (`useQuery` / `useMutation`)               | No fetching in `useEffect`; no direct Axios in event handlers      |
| Global client state   | Zustand                                                | Colocate in `<Component>.store.ts`                                 |
| Scoped subtree state  | React Context                                          |                                                                    |
| Local component state | `useState`                                             |                                                                    |
| Routing               | Next.js App Router                                     | `app/` directory only; no client-side router libraries             |
| Icons                 | Phosphor Icons                                         | Default weight `regular`; always `aria-label` on meaningful icons  |
| Animations            | Framer Motion                                          | Duration > 300ms or layout-shifting → check `useReducedMotion()`   |
| Admin shells          | `@peppermint/admin`                                    | `ModalTableShell`, `DataTableShell`, `FormWrapper`, `FormShell`    |
| Module page wrapper   | `@peppermint/ui`                                       | `ModalPaper` — never hand-roll `Paper` + manual `radius`/`h`       |
| HTTP client           | `@peppermint/api-client` or the app's `src/lib/api.ts` | Never instantiate Axios inline                                     |

**TypeScript:** strict mode. No `any`. No `@ts-ignore` without an explanatory comment.
Functional components only. Props typed as `[Name]Props` in `<Name>.types.ts`.

---

## 2. Contained vs Not-Contained vs Custom — Decision Rule

Before building any module or page, classify it into one of **three** parts:

### Contained

A module is **Contained** when it maps to one of the admin framework CRUD patterns — it
manages a list of records with create / edit / delete. This is the default for most
feature modules.

> A _list of cards_ is still **Contained**. Being a list means the normal module rules
> apply. The "cards" exception does **not** extend to lists of cards.

Contained mounts an admin shell (`ModalTableShell` or `DataTableShell`). Pick the shape
in §3.

### Not-Contained

A module is **Not-Contained** ONLY when it is:

- A **reporting page** (charts, KPIs, analytics dashboards with no CRUD)
- A **page composed of information cards** (a status overview, a settings summary page
  made entirely of info panels)

Not-Contained pages do not use the admin shells. They are regular Next.js modules built
to the standard Component Structure — but all data still flows through React Query.

### Custom

**Custom** = `ModalModule` or `RouteModule` (CLAUDE.md → Module Types). These are
**distinct types, not aliases** of the Contained patterns:

- A **ModalModule** has **no route** — another module opens it via state (e.g. the profile
  overlay in the user-avatar menu).
- A **RouteModule** owns its **own layout shell**, wired in `app/`, different from the app
  default (e.g. the pre-auth sign-in screen).

Neither fits the Contained builder patterns. Both are **built inline by the orchestrator**
and are **never dispatched to `module-builder` agents** (`.claude/PARALLEL.md` §1). A
dispatched builder that receives `[CUSTOM]` must stop and report it.

---

## 3. Pick the pattern, then read one reference file

Within **Contained**, pick the shape by route count:

| Pattern             | Route count | Shell                                          | Use when                                                                       |
| ------------------- | ----------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| **ContainedModule** | 1           | `ModalTableShell`                              | Single list page; create & edit open in modals/drawers; form has ≤ ~8 fields   |
| **MultiPageModule** | 2–4         | `DataTableShell` + `FormWrapper` + `FormShell` | Complex form, multi-step wizard, file uploads, or a dedicated detail/view page |

The **form** in _both_ patterns is built on `FormWrapper`. The difference is chrome: a
ContainedModule form renders inside the `ModalTableShell` modal (FormWrapper only, no
`FormShell`); a MultiPageModule form route wraps FormWrapper in `FormShell` for the
full-page header / stepper / footer. Never hand-roll `useForm` for a module form.

**Now open exactly ONE build guide:**

| Path                         | Read                                 |
| ---------------------------- | ------------------------------------ |
| Contained · **single** route | `reference/contained-single-page.md` |
| Contained · **2–4** routes   | `reference/contained-multi-page.md`  |
| **Not-Contained**            | `reference/not-contained.md`         |
| **Custom** (Modal / Route)   | `reference/custom-modules.md`        |

Each reference file carries its own step-by-step build order and its own common-mistakes
list. You should not need a second reference file for one build.

---

## 4. Naming Conventions

| Thing               | Convention                       | Example                            |
| ------------------- | -------------------------------- | ---------------------------------- |
| Folders             | `kebab-case`                     | `user-profile/`, `channels/`       |
| Component files     | `PascalCase`                     | `UserCard.tsx`, `ChannelForm.tsx`  |
| Non-component files | `camelCase`                      | `queryKeys.ts`, `channels.api.ts`  |
| Layout exports      | `Layout<Name>`                   | `LayoutRoot`, `LayoutAdmin`        |
| Module exports      | `Module<Name>`                   | `ModuleChannels`, `ModuleProducts` |
| Module object pages | `main`, `new`, `edit`, `view`    | `ModuleProducts.main`              |
| Layout folders      | `kebab-case` matching the export | `root-layout` → `LayoutRoot`       |
| Module folders      | `kebab-case` matching the export | `product` → `ModuleProducts`       |

---

## 5. App Structure Rules

```
apps/<app-name>/
├── app/           # Next.js App Router — thin re-exports ONLY
├── layouts/       # Layout components
├── modules/       # Feature modules (all module work lives here)
├── components/    # App-level shared components
├── config/        # App, framework, and env configs
├── context/       # Global React context (if needed)
└── assets/        # Images, SVG, fonts, etc.
```

- `app/page.tsx` — one import, one default export. Zero logic.
- `app/layout.tsx` — imports from `layouts/` only.
- Layouts use `kebab-case` folders and export `PascalCase` named exports.
- Modules use `kebab-case` folders and export `Module<Name>` named exports.

---

## 6. State Ownership Quick Reference

| Data type                                      | Where it lives                                 |
| ---------------------------------------------- | ---------------------------------------------- |
| Server / async data                            | React Query (`useQuery` / `useMutation`)       |
| Global client state (shared across components) | Zustand in `<Component>.store.ts` or `stores/` |
| Scoped subtree state                           | React Context                                  |
| Local component state                          | `useState`                                     |

Never fetch in `useEffect`. Never call Axios directly in event handlers.

---

## 7. Universal Gotchas (apply on every path)

These two mistakes are path-agnostic — the reference files carry the path-specific ones.

### Adding `extends Record<string, unknown>` to a domain row type

The shells constrain `T extends object`, which a plain interface already satisfies. Do
not add the index signature to make a shell happy — it weakens type-safety and
contradicts the root guidance (`CLAUDE.md` Anti-Patterns / `.claude/rules.md`). Only
React-Flow node data legitimately needs `Record<string, unknown>`.

```ts
// ❌ index signature not needed — and it lets any typo'd key through
export interface Student extends Record<string, unknown> {
  id: string;
  name: string;
}

// ✅ plain interface — satisfies `T extends object`
export interface Student {
  id: string;
  name: string;
}
```

### Logic in `app/page.tsx`

```tsx
// ❌ logic leaks out of the module
export default function Page() {
  const [open, setOpen] = useState(false);
  return <StudentsList onOpen={() => setOpen(true)} />;
}

// ✅
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
```

---

## 8. Git Commit Format

```
[<package-name or app-name>/<component-name or file-name>] <update-type>: <description>
```

Square brackets are literal — they are part of the commit message.

**Update types:** `add` · `fix` · `update` · `remove` · `docs`

Examples:

```
[mintway/channels] add: ContainedModule for channel management
[@peppermint/admin/DataTableShell] fix: server filter not sent on tab change
[mintway/products] update: add pricing step to MultiPageModule form
```

---

## 9. Package Imports Quick Reference

```ts
// UI components (Mantine wrappers — always use this)
import {
  ModalPaper,
  Paper,
  Stack,
  TextInput,
  Select,
  Button,
  Badge,
  Text,
} from "@peppermint/ui";
import { useForm } from "@peppermint/ui";

// Charts / editor / carousel / code-highlight / dropzone — opt-in SUBPATHS, not the barrel
import { LineChart } from "@peppermint/ui/charts";

// Admin shells
import {
  ModalTableShell,
  DataTableShell,
  FormWrapper,
  FormShell,
  useFormControls,
} from "@peppermint/admin";
import type {
  DataTableShellColumn,
  DataTableShellTab,
  QueryParams,
} from "@peppermint/admin";

// Icons — always from the CSR path
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

// Routing (Next.js only)
import { useParams, useRouter } from "next/navigation";
```

---

## 10. Building from a Requirements Document — Checklist

Given a requirements doc, follow this sequence:

> Before this sequence, the design decisions — page/route surface, form field order,
> column order + icons, shell choice — should already be made and user-confirmed via
> `/design-decisions`. If they aren't, run it first; don't improvise them while building.

0. **Check for a contract digest** — if `apps/<app>/docs/api-contracts/<domain>.md` exists
   for your module's domain, it is required reading and the authority on DTO shapes,
   endpoints, envelopes, and error codes. Do not guess API shapes it already answers; if
   it's missing but `docs/backend/<domain>/` exists, ask the orchestrator to run
   `/sync-api` first.
1. **Classify: Contained / Not-Contained / Custom** (§2).
1. **If Contained — pick ContainedModule or MultiPageModule** (§3), then **read the
   matching `reference/*.md`** and follow its step order. Not-Contained → read
   `reference/not-contained.md`; Custom → read `reference/custom-modules.md`.
1. **Before any form** — run `/form-builder` (it decides controls, ordering, grouping,
   disclosure; `FormWrapper` only renders that decision).
1. **Create the branch** (orchestrator-only): `git checkout -b dev/<feature-name>`.
1. **Every shell/reporting page** gets wrapped in `<ModalPaper withBorder>` — never a
   hand-rolled `Paper` with manual `radius`/`h`.
1. **Every `app/` page** is a one-line re-export.
1. **Tabs** → always `DataTableShellTab[]`, always `filter` (not `forceFilter`).
1. **Entity type** → plain interface (shells constrain `T extends object`); keep
   create/update payloads distinct from the read entity.
1. **Imports** → always from `@peppermint/ui`, never from `@mantine/*`.
1. **Commit format** → `[app-name/module-name] add: description`.
1. **Multiple independent modules in the doc** → do not build them one after another.
   Dispatch one `module-builder` agent per `[CONTAINED]`/`[MULTI_PAGE]` module,
   concurrently, per `.claude/PARALLEL.md`. `[NOT_CONTAINED]`/`[CUSTOM]` and dependent
   modules stay inline/sequential.
1. **When running as a dispatched agent** → write only inside your assigned module
   folder. Outer barrels, `app/` pages, parent AI.md, and `.todo` belong to the
   orchestrator — report the exact wiring lines instead of writing them (see
   `.claude/agents/module-builder.md`). The branch, dispatch, and review items are
   **orchestrator-only** — as a dispatched agent, never attempt git operations, agent
   dispatch, or reviews.
1. **After each phase** (orchestrator) → commit (repo format), then run the dual
   adversarial review per `.claude/PARALLEL.md` Section 7 unless the phase doesn't warrant
   it.
