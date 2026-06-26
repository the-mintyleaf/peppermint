You are verifying that AI navigation maps are accurate and in sync with the current codebase.

Arguments: $ARGUMENTS (app name, module path, or `--fix` to auto-repair stale entries)

## Step 1 — Identify scope

If $ARGUMENTS names an app or module, scope the check to that area.

If $ARGUMENTS is empty, check the app and module most recently touched (use `git diff --name-only HEAD` to identify).

If $ARGUMENTS is `--fix`, apply repairs automatically after reporting.

## Step 2 — Read the AI maps

- Read `apps/<app>/docs/AI.md`
- Read `apps/<app>/modules/<group>/<module>/docs/AI.md` if it exists

## Step 3 — Verify every file path listed

For each file path or folder reference in the AI maps, check whether it exists on the filesystem.

Classify each entry as:

- **Accurate** — path exists and content is correct
- **Stale** — path was listed but file/folder no longer exists or was renamed
- **Missing** — something exists in the code that should be in the AI map but is not

## Step 4 — Report

Output a table:

| Entry                                         | Status   | Notes                    |
| --------------------------------------------- | -------- | ------------------------ |
| `organization-tree/OrganizationTree.tsx`      | Accurate | —                        |
| `organization-tree/OrganizationTree.hooks.ts` | Stale    | File does not exist      |
| `organization-tree/components/NewPanel/`      | Missing  | Not yet listed in AI map |

## Step 5 — Fix (if --fix)

If `--fix` was passed, update the stale and missing entries in the AI maps.

Do not rewrite sections that are accurate.

## Step 6 — Report outcome

If `--fix` was used, list what was changed.

If `--fix` was not used, recommend running `/doc-check --fix` or `/update-ai-map` to resolve issues.
