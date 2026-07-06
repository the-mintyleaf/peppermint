You are preparing a branch for a pull request.

Arguments: $ARGUMENTS (optional base branch, default: main)

## Step 1 — Verify

Run `/verify` to execute the full verification checklist (pnpm format + check-types + lint + build). `/verify` parallelizes internally per `.claude/PARALLEL.md`.

Do not proceed to Step 2 if ANY check fails — check-types, lint, build, or format check. Fix errors first.

**Note:** Steps 1 → 2 → 3 remain strictly sequential gates. Git push, PR creation, and greploop are never parallelized.

## Step 2 — Check AI maps

Run `/doc-check` for the app and module in scope.

If any AI map entries are stale or missing, run `/update-ai-map` before continuing.

## Step 3 — Greptile review (if available)

If the `/greploop` skill is available and Greptile is configured, invoke it to iterate the PR until 5/5 confidence with zero unresolved comments.

If Greptile is not available, skip this step and note it in the PR description.

## Step 4 — Prepare PR description

Gather:

- Branch name and base branch
- `git log main..HEAD --oneline` for the commit list
- `git diff main..HEAD --name-only` for changed files

Compose the PR description following the format in `.claude/STANDARDS.md > Agentic Git workflow`:

**Title:** `[<app-or-package>/<area>] <type>: <description>` (under 70 characters)

**Body:**

```
## Summary
- bullet points describing what changed and why

## Changed areas
- list of modules, packages, or files touched

## Screenshots
- (flag for human if UI changed — agent cannot take screenshots)

## Docs updated
- list of docs/AI.md files updated

## Checks run
- typecheck: PASS/FAIL
- lint: PASS/FAIL
- build: PASS/FAIL
- format: PASS/FAIL

## Known risks
- any risks, caveats, or assumptions

## Follow-up
- any tasks deferred to a follow-up PR
```

## Step 5 — Push and create PR

Push the branch:

```bash
git push -u origin <branch-name>
```

Create the PR using gh CLI:

```bash
gh pr create --title "<title>" --body "<body>"
```

If `gh` is not available or not authenticated, output the full PR title and body for manual creation and note that the branch was pushed.

## Step 6 — Report

Respond with the PR URL (or manual PR content) and a summary of checks run.
