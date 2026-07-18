# Peppermint Module Build Guide — Update Guide

This document explains what to re-study and what to keep in sync when updating the
`mint-module-builder` skill. The skill is now a **router + per-path reference set**:

```
mint-module-builder/
├── SKILL.md                          # ROUTER — universal rules + decision logic + routing table
└── reference/
    ├── contained-single-page.md      # ContainedModule build guide (single route)
    ├── contained-multi-page.md       # MultiPageModule build guide (2–4 routes)
    ├── not-contained.md              # reporting / info-card page build guide
    └── custom-modules.md             # ModalModule + RouteModule (per CLAUDE.md)
```

Edit the **narrowest** file for what changed. Only touch `SKILL.md` for things every path
shares; per-path detail lives in the matching `reference/*.md`.

---

## When to update — what changes where

| Trigger                                             | File(s) to change                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| A new shell is added to `@peppermint/admin`         | `SKILL.md` §3 (pattern picker), §9 (imports)                                    |
| `ModalTableShell` props change                      | `reference/contained-single-page.md`                                            |
| `DataTableShell` props change                       | `reference/contained-multi-page.md` (+ `not-contained.md` if used read-only)    |
| `FormWrapper` / `FormShell` API changes             | both `reference/contained-*.md` form steps                                      |
| Charts/editor/etc. subpath export changes           | `SKILL.md` §9, `reference/not-contained.md`                                     |
| `/form-builder` mandate or form-flow rule changes   | `SKILL.md` §1 + §10, both `contained-*.md` form steps, `not-contained.md`       |
| A new CRUD strategy or module shape is introduced   | `SKILL.md` §2–§3 (+ a new `reference/*.md` if it's a new path)                  |
| The Contained / Not-Contained / Custom rule revised | `SKILL.md` §2 (+ the affected reference file)                                   |
| ModalModule / RouteModule definition changes        | `reference/custom-modules.md` (keep it aligned with `CLAUDE.md` → Module Types) |
| New naming conventions adopted                      | `SKILL.md` §4                                                                   |
| App folder structure changes                        | `SKILL.md` §5                                                                   |
| State-management tools change                       | `SKILL.md` §1 and §6                                                            |
| New packages added to the monorepo                  | `SKILL.md` §1 (stack table), §9 (imports)                                       |
| A new path-specific mistake is found                | the matching `reference/*.md` "Common Mistakes" section                         |
| A new path-agnostic mistake is found                | `SKILL.md` §7 (Universal Gotchas)                                               |
| Git commit format changes                           | `SKILL.md` §8                                                                   |
| `CLAUDE.md` gains a new rule                        | `SKILL.md` §1/§4/§5/§6 and/or the relevant reference file                       |

---

## What to re-study before updating

Run through these every time you update the skill:

### 1. The reference usage-docs (source of truth)

```
usage-doc/module-patterns/README.md          # shape/strategy decision table
usage-doc/module-patterns/ContainedModule.md  # ContainedModule step-by-step
usage-doc/module-patterns/MultiPageModule.md   # MultiPageModule step-by-step
usage-doc/admin/FormWrapper.md                 # FormWrapper API
usage-doc/admin/FormShell.md                   # FormShell API
usage-doc/admin/DataTableShell.md              # DataTableShell API
```

> **Naming-collision caveat.** `usage-doc/module-patterns/ModalModule.md` and
> `RouteModule.md` describe CRUD **strategies** (`DataTableModalShell` etc.) — a
> _different_ concept from the `Custom` path in this skill. The `Custom` path follows
> **`CLAUDE.md` → Module Types** (ModalModule = non-routed overlay; RouteModule =
> own-layout route), per the `.claude/FAILURE-LOG.md` 2026-07-13 reconciliation. Do **not**
> re-align `reference/custom-modules.md` to those usage-docs — align it to `CLAUDE.md` and
> the real examples in `apps/mintflow-admin/` (`account-settings/`, `sign-in/`,
> `password-change/`).

If the usage-docs conflict with what exists in the app, the usage-docs win for CRUD paths
— the app may contain inconsistencies from older builds.

### 2. The admin package exports

```
packages/admin/src/index.ts
```

Check for new exports, renamed props, or removed APIs.

### 3. A real module example in the apps

```
apps/mintflow-admin/modules/admin/authenticate/grants/   # canonical ContainedModule (list)
apps/mintflow-admin/modules/admin/authenticate/account-settings/  # canonical ModalModule
apps/mintflow-admin/modules/sign-in/                       # canonical RouteModule
```

Read the folder to verify the reference examples still match reality. If they diverge,
update the reference file to match the usage-doc pattern (not the inconsistent app code) —
except for the `Custom` path, which tracks the real app modules + `CLAUDE.md`.

### 4. `CLAUDE.md`

```
.claude/CLAUDE.md
```

Re-read every time — root of all conventions, and the authority for the `Custom` path.

### 5. `rules.md`

```
.claude/rules.md
```

Check for supplementary rules added since the last update.

---

## What NOT to do when updating

- Do not copy inconsistent patterns from existing app modules without verifying against
  the usage-docs first.
- Do not remove a reference file or router section without confirming the concept is no
  longer relevant.
- Do not add a new framework/package to `SKILL.md` §1 or §9 without confirming it has been
  adopted into `CLAUDE.md`.
- Do not change the Contained / Not-Contained / Custom rule without explicit instruction —
  it is intentional and overrides surface appearances (a list of cards is still Contained).
- Do not re-point `reference/custom-modules.md` at the CRUD-strategy usage-docs (see the
  collision caveat above).

---

## How to update

1. Create a branch: `git checkout -b dev/skill-update-<date>`.
2. Re-study the files listed above.
3. Edit the narrowest file(s) — router for shared changes, one `reference/*.md` for
   path-specific changes.
4. Commit: `[.claude/mint-module-builder] docs: update skill for <what changed>`.
5. Push and open a PR if required; otherwise merge to the working branch.

---

## Sync checklist

Before finalising an update, verify:

- [ ] Every code example (router + all reference files) compiles against the current
      `@peppermint/admin` and `@peppermint/ui` exports
- [ ] The `SKILL.md` §3 decision + routing table matches
      `usage-doc/module-patterns/README.md` and every link resolves to a `reference/*.md`
      that exists
- [ ] `reference/contained-single-page.md` matches `usage-doc/module-patterns/ContainedModule.md`
- [ ] `reference/contained-multi-page.md` matches `usage-doc/module-patterns/MultiPageModule.md`
- [ ] `reference/custom-modules.md` matches `CLAUDE.md` → Module Types and the real
      mintflow-admin examples (NOT the CRUD-strategy usage-docs)
- [ ] **Shared Contained gotchas** (forceFilter vs filter, ModalPaper wrap, oversized
      renders, header icons, untyped tabs) are edited in **both** `contained-single-page.md`
      **and** `contained-multi-page.md` — they are intentionally duplicated for
      self-sufficiency and must not drift apart
- [ ] The `ModalPaper` wrapper spec (`<ModalPaper withBorder>`, no manual `radius`/`h`) is
      correct in every reference file
- [ ] All import paths are current (especially Phosphor icon CSR paths and the
      `@peppermint/ui/charts` subpath)
- [ ] The Contained / Not-Contained / Custom rule in `SKILL.md` §2 is unchanged unless
      explicitly revised
- [ ] `SKILL.md` §8 git commit format matches `CLAUDE.md`
