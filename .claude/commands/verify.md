You are running the full verification checklist for the Peppermint monorepo.

Arguments: $ARGUMENTS (optional filter: `--filter <package-name>` to scope to a specific app or package)

## Step 1 — Check which scripts exist

Before running anything, verify which of the following scripts are present in `package.json` at the repo root or in the target package:

- pnpm check-types (the repo's typecheck script — there is no `typecheck` script)
- pnpm lint
- pnpm build
- pnpm format / pnpm format:check (root only — no sub-package has them)

Do not invent or run scripts that do not exist.

## Step 2 — Run available scripts

The list below is the **logical gate order** (what must pass before what). Execution
is parallelized per `.claude/PARALLEL.md`:

1. pnpm format — apply FIRST (write mode, main session, no agents active), so
   later checks never fail on unformatted code
2. pnpm check-types — must pass with zero errors
3. pnpm lint — must pass with zero errors
4. pnpm build — must pass before opening a PR

**Dispatch rule:** after the format pass, dispatch check-types, lint, and
format:check as concurrent `verifier` agents in a single message. `build` runs
alone, only after types and lint pass. Never run write-mode `pnpm format`
concurrently with anything.

**Filter scoping:** if $ARGUMENTS includes --filter name, apply the filter to
check-types, lint, and build only. `format`/`format:check` exist at the repo root
only — never pass them a `--filter`; to scope formatting, use path arguments
instead (e.g. `pnpm exec prettier --check "apps/<app>/**/*.{ts,tsx,md}"`). Known gap:
`apps/mintflow` has no `check-types` script — the verifier reports it SKIPPED;
do not invent the script.

## Step 2b — Design scan (visual files only)

Run this step only when the task touched `.tsx` files inside `layouts/`, `modules/`, or `components/`. Skip it for config-only, package.json, or backend-only changes.

Detect which visual files are in scope:

```bash
git diff --name-only HEAD 2>/dev/null | grep -E "(layouts|modules|components)/.*\.tsx$"
```

**Dispatch rule:** if more than 3 visual files are in scope, batch them across up to
4 `verifier` agents in scan mode (per `.claude/PARALLEL.md`); with 3 or fewer, scan
inline.

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

Flag any raw hex color (`#xxxxxx` or `#xxx`) used in a `color=`, `style=`, or `className=` prop near a `Badge`, `Tag`, `status`, or `severity` keyword within 5 lines. Use design tokens instead. When `apps/<app>/docs/design/design-system.md` exists (created by `/sync-design`), name the specific token from its color tables that should replace the hex value.

**W2 — Data fetch without loading/error/empty handling**

```bash
grep -n "useQuery\|useSuspenseQuery" <file> | head -5
```

If `useQuery` is present, look for conditional rendering that handles `isLoading`, `isError`, and the empty case (`data?.length === 0` or similar). If none are present in the same file, flag W2.

**W3 — AI map stale after a structure change**

```bash
git diff --name-only HEAD 2>/dev/null | grep -E "modules/.*/(index\.ts|[^/]+\.tsx)$"
git diff --name-only HEAD 2>/dev/null | grep -E "modules/.*/docs/AI\.md$"
```

If a module's structure changed (a component/file added, removed, or renamed under `modules/<group>/<module>/`) but that module's own `docs/AI.md` is **not** in the diff, flag W3 — the AI map is likely stale. Run `/update-ai-map` to reconcile it in the same pass, not weeks later.

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

## Step 2c — Contract completeness (only when a requirements artifact is in scope)

Run this only when a `tuned_requirement.md` (or the feature's flow/requirements artifact) exists for the work in scope and a build is about to start. It turns "the contract is complete" from a promise into a check.

```bash
grep -nE "\[placeholder\]|\bTBD\b|\[fieldName\]|\[error\.code\]|\[roles\]|\[what shows\]|\[where the user lands\]|see Error → UI Behavior" docs/tuned_requirement.md
```

Every per-feature section — including the `UI States`, `Error → UI Behavior`, `Field → API Mapping`, `Permissions`, and `Post-success Navigation` sections produced by `mint-requirements-tuner` — must hold confirmed values, not template stubs. Any remaining bracket `[placeholder]` or unresolved `TBD` means the contract is incomplete: flag `[BLOCK]` and do not proceed to build until it is filled at the gate. The one exception is a `TBD` the user explicitly authorized as a deferral (per `mint-requirements-tuner` rule 3) — note it, do not block on it.

## Step 3 — Report results

Output a table showing each check: result (PASS / FAIL / SKIPPED) and any notes.

## Step 4 — Fix failures

If typecheck or lint fails, investigate and fix the errors before reporting success.
If the Step 2b design scan fails on a BLOCK check, fix or dismiss with logging before reporting success.

Fixes are applied by the main session only — never by `verifier` agents. After
fixing, re-dispatch only the failed scope, not the whole matrix.

Do not mark a task complete if any check fails.

## Step 5 — Final status

Report overall PASS or FAIL, any errors fixed, and any checks skipped with reason.
