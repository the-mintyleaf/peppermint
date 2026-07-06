You are running the full post-edit agent loop. Use this after completing any substantial code change.

Arguments: $ARGUMENTS (optional scope: file, folder, or module path)

This loop chains simplification, verification, and doc checks. Simplification is sequential (it edits files); the verification step fans out per `.claude/PARALLEL.md`.

## Step 1 — Identify scope

If $ARGUMENTS is provided, use it as the scope.

If $ARGUMENTS is empty, identify recently modified files using: git diff --name-only HEAD

## Step 2 — Simplify

Invoke the `/simplify` command on the scope.

Apply code-simplifier principles to all modified .ts and .tsx files.

Skip files where the change was trivial (fewer than 10 lines changed or purely additive types).

## Step 3 — Verify (parallel)

Dispatch two `verifier` agents concurrently in a single message (per `.claude/PARALLEL.md`):

- One running `pnpm check-types` (the repo's typecheck script)
- One running `pnpm lint`

The main session fixes any reported failures itself (verifiers never fix), then re-dispatches only the failed scope. Do not proceed until both scopes pass.

## Step 4 — Verify docs

Run the `/doc-check` command for the app and module in scope.

If any AI map entries are stale or missing, run `/update-ai-map` to fix them.

## Step 5 — Final report

Respond with a concise summary:

- What was simplified (files and changes)
- Type check: PASS or FAIL (errors fixed)
- Lint: PASS or FAIL (errors fixed)
- Docs: AI maps accurate / updated / issues found
- Overall status: READY TO COMMIT or ISSUES REMAINING

Do not mark the loop complete if type check or lint still fails.
