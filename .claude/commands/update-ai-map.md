You are synchronizing AI navigation maps after a code change.

Arguments: $ARGUMENTS (app name, module path, or empty to auto-detect from recent git diff)

## Step 1 — Identify scope

If $ARGUMENTS is provided, use it to identify the app and module.

If $ARGUMENTS is empty, run:

```bash
git diff --name-only HEAD
```

Identify which app and module was touched from the changed file paths.

## Step 2 — Read the current AI maps

- Read `apps/<app>/docs/AI.md`
- Read `apps/<app>/modules/<group>/<module>/docs/AI.md` if it exists

## Step 3 — Cross-reference against actual filesystem

For every file path or folder listed in the AI maps, verify it still exists.

Check for:

- New entry files (index.tsx, module entry point changes)
- New or removed sub-modules
- New or removed stores, contexts, hooks, queries
- New or removed panel/drawer/modal components
- Route changes
- New common edit targets

## Step 4 — Update only what changed

Do not rewrite the full AI map. Update only the stale sections:

- Add new modules to Major Modules table
- Update Common Edit Targets table
- Update State Ownership if new stores or contexts were added
- Update Do-not-do if new anti-patterns are relevant
- Update Routes if new routes were added or existing ones changed

## Step 5 — Create if missing

If `apps/<app>/modules/<group>/<module>/docs/AI.md` does not exist yet, create it.

Follow the module AI map template from `## Tactical Programming for AI Agents` in `.claude/CLAUDE.md`.

## Step 6 — Report

Respond with:

- Which AI maps were updated
- What sections changed
- Any file paths that were stale and corrected
- Whether any AI maps need to be created next
