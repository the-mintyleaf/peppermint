# Custom Modules — Build Guide (ModalModule & RouteModule)

> Read this after the router (`SKILL.md`) has classified the work as **Custom**.
> ModalModule and RouteModule (as defined in `.claude/CLAUDE.md` → Module Types) are
> **distinct types, not aliases** of the Contained builder patterns. Neither fits the
> `ModalTableShell` / `DataTableShell` CRUD flow, and neither is dispatched to a
> `module-builder` agent — both are **built inline by the orchestrator**
> (`.claude/PARALLEL.md` §1, `.claude/agents/module-builder.md`). If a dispatched builder
> receives `[CUSTOM]`, it must stop and report it.

> **⚠ Naming collision — read this.** The files `usage-doc/module-patterns/ModalModule.md`
> and `RouteModule.md` describe something _different_: CRUD **strategies** built on
> `DataTableModalShell` / `DataTableShell + FormShell`. Those are the Contained CRUD space
> (use the `contained-*` guides for that). This guide follows the **CLAUDE.md** meaning,
> which is the root authority (see `.claude/FAILURE-LOG.md`, 2026-07-13 reconciliation):
> a ModalModule is a **non-routed overlay opened via state**, and a RouteModule is a
> **top-level route that owns its own layout shell**. Do not treat the CRUD-strategy
> usage-docs as the spec for this path.

---

## ModalModule — non-routed overlay

**Definition (CLAUDE.md):** triggered from another module, overlays the page, opened via
**state — not a route**. It has no URL segment and no `app/` page of its own.

**Canonical example:** `apps/mintflow-admin/modules/admin/authenticate/account-settings/`
— the self-service settings modal opened from the "Profile" item in the user-avatar menu.

**How it is wired**

- A parent (usually a **layout**, e.g. `LayoutAdmin`) owns the open/close state with
  `useDisclosure` and mounts the modal **only while open** (conditional render), so the
  modal's queries don't fire until the user opens it.
- The trigger is an event on another component (menu item, button) calling the disclosure
  `open()` — never a router navigation.
- The module exports the modal component from its `index.ts`; the parent imports and
  mounts it. There is **no** `app/…/page.tsx` re-export (the whole point is it isn't
  routed — do not add one).

**File structure**

```
modules/<group>/<name>/
├── index.ts                         # exports <Name>Modal
├── <Name>Modal.tsx                  # modal shell (sidebar/tabs/content, or a single form)
├── <Name>Modal.types.ts            # props (e.g. { opened, onClose }) + local unions
├── <Name>Modal.module.css          # layout that props/style can't express
├── <name>.api.ts / <name>.hooks.ts # useQuery/useMutation, keys via createQueryKeys
└── components/                      # tab/section sub-components when it grows
    └── docs/AI.md
```

**Rules**

- Data via React Query as everywhere else. Server state → `useQuery`/`useMutation`;
  open/close → `useDisclosure` in the **parent** (not a store); tab/sub-screen state →
  local `useState`.
- Build forms inside it on `FormWrapper` (run `/form-builder` first) — the modal supplies
  the chrome, so no `FormShell`, same as a ContainedModule modal form.
- Gate visibility deliberately: the account-settings modal is intentionally **not**
  `RequireStaff`-wrapped because it's for every user — decide the gate per module.
- `docs/AI.md` must state `Module type: ModalModule — not routed`, name the trigger and
  the parent that mounts it, and include "Do not re-add a route for this."

---

## RouteModule — owns its own layout shell

**Definition (CLAUDE.md):** a top-level route that needs its **own layout shell**,
different from the app default, wired in `app/`.

**Canonical examples:** `apps/mintflow-admin/modules/sign-in/` and `…/password-change/`
— pre-authentication screens that own `layouts/app/App.tsx` and sit **outside** the admin
shell, with no nav entry.

**How it is wired**

- The module renders under a **different layout** than the admin default. The layout is
  wired in `app/` (a route-group `layout.tsx` re-exporting the module's layout, or the
  page mounting a wrapper that is not `LayoutAdmin`).
- The `app/` page is still a **one-line re-export** (named import + default export) — the
  logic lives in the module; the layout choice is what makes it a RouteModule.
- Often the heavy logic lives in a shared `@peppermint/admin` page component
  (e.g. `SignInPage`), and the module is a thin wrapper supplying app-specific config
  (endpoint URLs, error-message map). Prefer that when a shared component exists — check
  other consumers before editing the shared component.

**File structure**

```
modules/<group>/<name>/
├── index.ts                     # exports Module<Name>
├── <Name>.tsx                   # thin wrapper: configures a shared page or composes its own
├── <Name>.types.ts
└── docs/AI.md
app/<route>/page.tsx             # one-line re-export (orchestrator-owned)
app/<route>/layout.tsx           # wires the module's own layout (orchestrator-owned)
```

**Rules**

- `app/` files stay logic-free re-exports; the custom **layout** is the only thing that
  distinguishes this from a ContainedModule.
- Server state via React Query. The one sanctioned `useEffect` exception seen in practice
  is a one-off "already-signed-in" `localStorage` redirect check — not data fetching.
- Respect security posture from the backend contract (e.g. sign-in must not reveal which
  field was wrong on `AUTH_INVALID_CREDENTIALS`).
- `docs/AI.md` must state `Module type: RouteModule — owns its own layout (<layout path>)`,
  the route, and where the real logic lives if it's a shared component.

---

## Orchestrator checklist for Custom work

- Build **inline** — never dispatch to a `module-builder` agent.
- No CRUD shell. If the module actually manages a list of records with create/edit/delete,
  it is **Contained**, not Custom — re-run the router.
- Wire the trigger (ModalModule) or the layout + `app/` re-export (RouteModule) yourself;
  these are shared-wiring files the orchestrator owns.
- Author `docs/AI.md` and run `/update-ai-map` to register it in the app map.
- For exhaustive CRUD-shell examples, the `contained-single-page.md` /
  `contained-multi-page.md` guides are the reference — **not** the similarly-named
  usage-docs (see the collision note above).
