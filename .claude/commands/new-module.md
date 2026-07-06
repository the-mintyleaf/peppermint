You are scaffolding a new module for the Peppermint monorepo.

Arguments: $ARGUMENTS (path to a requirements doc, a module name, or empty)

Follow this sequence exactly; within Step 3b, independent modules build concurrently.

## Step 1 — Read context first

Before writing any code, read:

- `.claude/CLAUDE.md` (architecture rules)
- `usage-doc/module-patterns/README.md` (module pattern decision matrix)
- `apps/<app>/docs/AI.md` for the target app

## Step 2 — Structure requirements

If $ARGUMENTS points to an unstructured requirements doc, or if no structured requirements exist yet:

- Invoke the `/mint-requirements-tuner` skill to turn raw requirements into a structured document
- Do not proceed to Step 3 until the requirements document is complete and confirmed

## Step 3 — Scaffold the module(s)

### Step 3a — Single module

Invoke the `/mint-module-builder` skill using the structured requirements document.

Follow every step in the build guide for the assigned module type (ContainedModule, MultiPageModule, ModalModule, or RouteModule).

### Step 3b — 2+ independent modules (parallel dispatch)

When the Module Breakdown table lists 2+ independent modules, follow `.claude/PARALLEL.md`:

1. Create the `dev/` branch and a phase-organized `.todo/<task>-todo.md` first.
2. Pre-create any shared assets (`_shared/`) that 2+ modules need.
3. Dispatch one `module-builder` agent per `[CONTAINED]`/`[MULTI_PAGE]` row, concurrently in a single message, using the mandatory dispatch prompt template.
4. `[NOT_CONTAINED]`/`[CUSTOM]` rows and dependent modules are built inline/sequentially by the main session.

### Step 3c — Wiring pass (after agents return)

From the agent reports, the main session: updates group/parent barrels, creates `app/` route re-exports, and checks the `.todo` boxes. Agents never write these files.

## Step 4 — Create the module AI map

After scaffolding, create `apps/<app>/modules/<group>/<module>/docs/AI.md` for the new module.

(In Step 3b dispatch, each module's own AI map arrives from its `module-builder` agent — the main session only writes parent-domain and app-level maps.)

The AI map must include:

- Module purpose
- Module type
- Route (if any)
- Entry files
- Common edit targets table
- State ownership
- Do-not-do list

## Step 5 — Update the app AI map

Open `apps/<app>/docs/AI.md` and add the new module to the Major Modules table.

## Step 6 — Verify

Run `/verify` to confirm no type errors or lint failures were introduced. `/verify` parallelizes internally per `.claude/PARALLEL.md`.

## Step 6b — Commit + dual adversarial review

Commit the phase (`git add` + `git commit`, repo commit format), then run the dual adversarial review per `.claude/PARALLEL.md` Section 7 (Codex + `adversarial-reviewer` in parallel). Apply combined fixes, commit them.

## Step 7 — Report

Respond with:

- What was scaffolded (module type, files created)
- Docs created or updated
- Verification results
- Any assumptions made
- Any follow-up tasks
