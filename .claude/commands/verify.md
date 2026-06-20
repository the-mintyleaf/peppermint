You are running the full verification checklist for the Peppermint monorepo.

Arguments: $ARGUMENTS (optional filter: `--filter <package-name>` to scope to a specific app or package)

## Step 1 — Check which scripts exist

Before running anything, verify which of the following scripts are present in `package.json` at the repo root or in the target package:

- pnpm typecheck
- pnpm lint
- pnpm build
- pnpm format

Do not invent or run scripts that do not exist.

## Step 2 — Run available scripts

Run each available script in this order:

1. pnpm typecheck (or pnpm check-types) — must pass with zero errors
2. pnpm lint — must pass with zero errors
3. pnpm build — must pass before opening a PR
4. pnpm format — apply before committing

If $ARGUMENTS includes --filter name, scope each command with pnpm --filter name.

## Step 3 — Report results

Output a table showing each check: result (PASS / FAIL / SKIPPED) and any notes.

## Step 4 — Fix failures

If typecheck or lint fails, investigate and fix the errors before reporting success.

Do not mark a task complete if any check fails.

## Step 5 — Final status

Report overall PASS or FAIL, any errors fixed, and any checks skipped with reason.
