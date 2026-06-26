You are scaffolding a new module for the Peppermint monorepo.

Arguments: $ARGUMENTS (path to a requirements doc, a module name, or empty)

Follow this sequence exactly:

## Step 1 — Read context first

Before writing any code, read:

- `.claude/CLAUDE.md` (architecture rules)
- `usage-doc/module-patterns/README.md` (module pattern decision matrix)
- `apps/<app>/docs/AI.md` for the target app

## Step 2 — Structure requirements

If $ARGUMENTS points to an unstructured requirements doc, or if no structured requirements exist yet:

- Invoke the `/mint-requirements-tuner` skill to turn raw requirements into a structured document
- Do not proceed to Step 3 until the requirements document is complete and confirmed

## Step 3 — Scaffold the module

Invoke the `/mint-module-builder` skill using the structured requirements document.

Follow every step in the build guide for the assigned module type (ContainedModule, MultiPageModule, ModalModule, or RouteModule).

## Step 4 — Create the module AI map

After scaffolding, create `apps/<app>/modules/<group>/<module>/docs/AI.md` for the new module.

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

Run `/verify` to confirm no type errors or lint failures were introduced.

## Step 7 — Report

Respond with:

- What was scaffolded (module type, files created)
- Docs created or updated
- Verification results
- Any assumptions made
- Any follow-up tasks
