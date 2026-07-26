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

First run `pnpm format` (main session, write mode — Step 2 edited files, and code
must never be committed unformatted). Then run verification (per `.claude/PARALLEL.md`
§6):

- **Normal-sized scope (default):** run `pnpm check-types && pnpm lint` **inline** in
  the main session — no spawn, no context reload.
- **Large multi-package scope only:** dispatch two `verifier` agents concurrently in a
  single message (one `pnpm check-types`, one `pnpm lint`) when parallel runs are
  genuinely faster.

The main session fixes any reported failures itself (verifiers never fix), then re-runs only the failed scope. Do not proceed until both pass.

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
