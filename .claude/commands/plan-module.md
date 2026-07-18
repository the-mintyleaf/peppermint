You are structuring the requirements for a Peppermint module — planning only, no code.

Arguments: $ARGUMENTS (module name, short description, or path to a rough requirements doc)

**This is a planning-only session. No application code will be written.** To plan _and_
build in one go, use `/new-module` instead — it runs this same tuner, then scaffolds.

---

## Step 1 — Invoke the skill

Invoke the `/mint-requirements-tuner` skill.

Pass $ARGUMENTS as the raw requirements. If $ARGUMENTS is empty, ask the user what they
want to build before proceeding.

---

## Step 2 — Follow the skill's tuning process

The skill will guide you through:

1. Parsing intent — modules, entities, reuse candidates, inter-module dependencies
2. Module-type confirmation (always first — confirm every module's tag before detail)
3. Gap analysis against the Module Completeness Checklist (incl. section L — reuse &
   dependencies, from an actual scan of the target app)
4. Interviewing the user on every flagged gap — zero assumptions
5. Writing the tuned requirements document (Module Breakdown + Reuse Map + per-module
   detail) to `docs/tuned_requirement.md` (or a user-specified path)

Do not skip module-type confirmation. Do not assume answers — ask.

---

## Step 3 — Output

If gaps remain: ask the grouped clarifying questions and stop. Wait for answers before
writing the document.

If no gaps remain: write the tuned requirements document and report its path.

---

## Step 4 — Next steps (after the document is confirmed)

When the user approves the tuned requirements, suggest:

- `/new-module <path-to-doc>` — to scaffold and build from the document.

Do not begin implementation yourself.
