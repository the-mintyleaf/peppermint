# Parallel Agent Dispatch + Phase Workflow — Todo

## Phase 1 — Protocol + agents

- [x] Create `.claude/PARALLEL.md` (orchestration protocol)
- [x] Create `.claude/agents/module-builder.md`
- [x] Create `.claude/agents/verifier.md`
- [x] Create `.claude/agents/adversarial-reviewer.md`
- [ ] Commit Phase 1
- [ ] Dual adversarial review (Codex + Opus reviewer), apply fixes, commit

## Phase 2 — Doctrine + commands

- [ ] Edit `.claude/CLAUDE.md` (Parallel Agent Dispatch & Phase Workflow subsection)
- [ ] Edit `.claude/commands/verify.md`
- [ ] Edit `.claude/commands/new-module.md`
- [ ] Edit `.claude/commands/post-edit-loop.md`
- [ ] Edit `.claude/commands/pre-pr.md`
- [ ] Edit `.claude/rules.md` (pointer)
- [ ] Commit Phase 2
- [ ] Dual adversarial review, apply fixes, commit

## Phase 3 — Skills

- [ ] Edit `.claude/skills/mint-module-builder/SKILL.md`
- [ ] Edit `.claude/skills/mint-module-planner/SKILL.md`
- [ ] Commit Phase 3
- [ ] Dual adversarial review, apply fixes, commit

## Phase 4 — Verification + cleanup

- [ ] Consistency grep (unqualified sequential language)
- [ ] Cross-reference check (agent names, PARALLEL.md references, model fields)
- [ ] Frontmatter sanity (YAML, tool lists)
- [ ] `pnpm format:check` on touched files; format if needed
- [ ] Final commit, delete this todo file, push branch
