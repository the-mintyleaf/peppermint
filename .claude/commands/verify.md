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

## Step 2b — Design scan (visual files only)

Run this step only when the task touched `.tsx` files inside `layouts/`, `modules/`, or `components/`. Skip it for config-only, package.json, or backend-only changes.

Detect which visual files are in scope:

```bash
git diff --name-only HEAD 2>/dev/null | grep -E "(layouts|modules|components)/.*\.tsx$"
```

For each file in scope, run the following checks. Each check is labeled with its severity.

### BLOCK checks — fail the design step if unaddressed

**B1 — Icon-only button missing `aria-label`**

```bash
grep -n "weight=" <file> | head -10
```

Look for `<PhosphorIcon` or phosphor icon component usages (identified by `weight=` prop or `Ph` prefix) that are inside a `<button>`, `<ActionIcon>`, or clickable wrapper without a nearby `aria-label` attribute on the same element or its parent.

Flag pattern: icon used as the sole content of an interactive element, with no `aria-label` within 3 lines.

**B2 — `onClick` on a status badge/tag (state-action confusion)**

```bash
grep -n "onClick" <file> | head -20
```

Look for `onClick` on elements that also carry `Badge`, `Tag`, or `Chip` in their JSX type or nearby className. A status badge with an `onClick` is a state-action confusion bug (see DESIGN.md §1.9).

Flag pattern: `<Badge ... onClick=` or `<Tag ... onClick=` or `<Chip ... onClick=`.

**B3 — Confirmation dialog without consequence text**

```bash
grep -n -A 5 "confirm\|modal\|dialog\|Modal\|Dialog" <file> | grep -iE "are you sure|confirm\?" | head -5
```

Look for confirmation patterns that contain only a binary yes/no prompt without naming what will happen, who is affected, or whether the action is reversible. "Are you sure?" alone is a B3 violation (DESIGN.md §1.10).

### WARN checks — print findings, do not block

**W1 — Raw hex color on a status or badge element**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}" <file> | head -10
```

Flag any raw hex color (`#xxxxxx` or `#xxx`) used in a `color=`, `style=`, or `className=` prop near a `Badge`, `Tag`, `status`, or `severity` keyword within 5 lines. Use design tokens instead.

**W2 — Data fetch without loading/error/empty handling**

```bash
grep -n "useQuery\|useSuspenseQuery" <file> | head -5
```

If `useQuery` is present, look for conditional rendering that handles `isLoading`, `isError`, and the empty case (`data?.length === 0` or similar). If none are present in the same file, flag W2.

### Severity summary rule

- If any BLOCK check finds a violation: report it as `[BLOCK]`, list the file:line, and mark this step FAILED. The PR cannot proceed until the violation is fixed or explicitly dismissed.
- WARN findings are reported as `[WARN]` and do not block, but must be printed.
- **Dismissal:** A BLOCK violation can be dismissed with reasoning. Log the dismissal to `.todo/design-dismissals.md` with this format:
  ```
  [YYYY-MM-DD] <file>:<line> <check-id> — <reasoning>
  ```
  The dismissal recurs on the next touch of the same file. Undocumented dismissals are not permitted.

### Ceiling statement — always print this at the end of Step 2b, regardless of outcome

```
⚠ Mechanical scan only. Passing means no detectable violations, not that the design is sound.
  Run /design-check for the full pre-flight audit.
```

## Step 3 — Report results

Output a table showing each check: result (PASS / FAIL / SKIPPED) and any notes.

## Step 4 — Fix failures

If typecheck or lint fails, investigate and fix the errors before reporting success.
If the Step 2b design scan fails on a BLOCK check, fix or dismiss with logging before reporting success.

Do not mark a task complete if any check fails.

## Step 5 — Final status

Report overall PASS or FAIL, any errors fixed, and any checks skipped with reason.
