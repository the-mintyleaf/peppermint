# Mojito AI Usage Guide — Update Guide

This document explains what to re-study and what to keep in sync when updating `SKILL.md`.

---

## When to update the skill

Update `SKILL.md` when any of the following change:

| Trigger | What changes in SKILL.md |
|---|---|
| A new shell is added to `@peppermint/admin` | Section 3 (pattern picker), package import reference (Section 11) |
| `ModalTableShell` or `DataTableShell` props change | Sections 4 and 5 (build guides) |
| `FormWrapper` or `FormShell` API changes | Section 5 (MultiPageModule form steps) |
| A new CRUD strategy or module shape is introduced | Section 3 decision table |
| The Contained/Not Contained rule is revised | Section 2 |
| New naming conventions are adopted | Section 6 |
| App folder structure changes | Section 7 |
| State management tools change | Sections 1 and 8 |
| New packages are added to the monorepo | Section 1 (stack table), Section 11 (imports) |
| New common mistakes are identified from real builds | Section 9 |
| Git commit format changes | Section 10 |
| `CLAUDE.md` is updated with new rules | Sections 1, 6, 7, 8 |

---

## What to re-study before updating

Run through these files/locations every time you update the skill:

### 1. The reference usage-docs
```
usage-doc/module-patterns/README.md          # decision table
usage-doc/module-patterns/ContainedModule.md # ContainedModule step-by-step
usage-doc/module-patterns/MultiPageModule.md # MultiPageModule step-by-step
usage-doc/module-patterns/ModalModule.md     # (may have diverged from ContainedModule)
usage-doc/module-patterns/RouteModule.md     # (may have diverged from MultiPageModule)
usage-doc/admin/FormWrapper.md               # FormWrapper API
usage-doc/admin/FormShell.md                 # FormShell API
usage-doc/admin/DataTableShell.md            # DataTableShell API
```

These are the **source of truth** for correct patterns. If they conflict with what exists in the app, the usage-docs win — the app may contain inconsistencies from older builds.

### 2. The admin package exports
```
packages/admin/src/index.ts
```
Check for new exports, renamed props, or removed APIs.

### 3. A real module example in the Mojito app
The channels module is the canonical ContainedModule reference:
```
apps/mojito/modules/admin/channels/
```
Read the whole folder to verify the skill examples still match the real implementation. If they diverge, update the skill to match the usage-doc pattern (not the inconsistent app code).

### 4. `CLAUDE.md`
```
.claude/CLAUDE.md
```
Re-read every time — it is the root of all conventions. Any new rule there must propagate into this skill.

### 5. `rules.md`
```
.claude/rules.md
```
Check for any supplementary rules added since the last update.

---

## What NOT to do when updating

- Do not copy inconsistent patterns from existing app modules without verifying them against the usage-docs first.
- Do not remove an existing section without confirming the concept is no longer relevant.
- Do not add a new framework/package to Section 1 or 11 without confirming it has been adopted into `CLAUDE.md`.
- Do not change the Contained/Not Contained rule without explicit instruction — it is intentional and overrides surface-level appearances (e.g. a list of cards is still Contained).

---

## How to update

1. Create a branch: `git checkout -b dev/skill-update-<date>`.
2. Re-study the files listed above.
3. Edit `SKILL.md` — focus only on sections affected by what changed.
4. Commit: `[.claude/mojito-ai-usage-guide] docs: update skill for <what changed>`.
5. Push and open a PR if required; otherwise merge to the working branch.

---

## Sync checklist

Before finalising an update, verify:

- [ ] Every code example in SKILL.md compiles against the current `@peppermint/admin` and `@peppermint/ui` exports
- [ ] The decision table in Section 3 matches `usage-doc/module-patterns/README.md`
- [ ] The ContainedModule build guide matches `usage-doc/module-patterns/ContainedModule.md`
- [ ] The MultiPageModule build guide matches `usage-doc/module-patterns/MultiPageModule.md`
- [ ] The Paper wrapper spec (`p={0} withBorder radius="lg" h="calc(100vh - 16px)"`) is correct
- [ ] All import paths are current (especially Phosphor icon CSR paths)
- [ ] The Contained/Not Contained rule in Section 2 is unchanged unless explicitly revised
- [ ] Section 9 (common mistakes) reflects any new anti-patterns discovered since the last update
- [ ] Section 10 git commit format matches `CLAUDE.md`
