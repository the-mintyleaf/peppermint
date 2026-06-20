You are running the module planner for the Peppermint monorepo.

Arguments: $ARGUMENTS (module name, short description, or path to a rough requirements doc)

**This is a planning-only session. No application code will be written.**

---

## Step 1 — Invoke the skill

Invoke the `/mint-module-planner` skill.

Pass $ARGUMENTS as the module description. If $ARGUMENTS is empty, ask the user what they want to build before proceeding.

---

## Step 2 — Follow the skill's planning process

The skill will guide you through:

1. Reading pre-flight docs (CLAUDE.md, app AI.md, usage-doc/module-patterns)
2. Inspecting existing modules to build a reuse map
3. Identifying the module type
4. Running the Planning Gate (ask questions if blocking gaps exist — then stop)
5. Producing the full module blueprint

Do not skip pre-flight reading. Do not skip the Planning Gate.

---

## Step 3 — Output

If questions are needed: output the grouped clarifying questions and stop. Wait for the user to respond before producing the blueprint.

If no blocking gaps exist: output the complete blueprint using the template in the skill.

---

## Step 4 — Next steps (after blueprint is approved)

When the user approves the blueprint, suggest:

- `/new-module` — to begin structured requirements tuning and implementation
- Or: hand the Handoff Prompt from the blueprint to a new Claude Code session

Do not begin implementation yourself.
