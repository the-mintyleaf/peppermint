# Claude Tuning — .claude governance & capability upgrade

Plan: /Users/decoffee/.claude/plans/i-just-want-your-proud-feather.md
Branch: dev/claude-tuning

## Phase 1 — Fix what's broken

- [x] Create `.claude/hooks/` scripts: anti-pattern-gate.sh (PreToolUse hard block), format-on-write.sh, design-context.sh (primer + output contract via additionalContext)
- [x] Rewrite `.claude/settings.json`: stdin-JSON hook dispatch + permissions allowlist
- [x] Test hook scripts directly by piping sample JSON (10 test cases, all pass; format-on-write confirmed live in-session)
- [x] Log observed failures in `.claude/FAILURE-LOG.md` (hook_false_negative ×1, rule_contradictory ×2)
- [x] STANDARDS.md: `pnpm typecheck` → `pnpm check-types`; mark categories ACTIVE vs DORMANT (+ planner skill stray)
- [x] Reconcile module-type taxonomy — mintflow uses all 4 types for real, so SKILL §3 alias claim dropped; CLAUDE.md unchanged
- [ ] Commit phase 1

## Phase 2 — /sync-api (backend docs intake)

- [ ] Move `.todo/task/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md` → `docs/backend/events/`
- [ ] Create `.claude/skills/mint-api-sync/SKILL.md`
- [ ] Create `.claude/commands/sync-api.md`
- [ ] Point mint-requirements-tuner + mint-module-builder at contract digests as required reading
- [ ] Commit phase 2

## Phase 3 — /sync-design (design guidelines intake)

- [ ] Create `.claude/skills/mint-design-sync/SKILL.md`
- [ ] Create `.claude/commands/sync-design.md`
- [ ] Note token-source wiring in verify.md Step 2b (W1 points at app design-system.md when present)
- [ ] Commit phase 3

## Phase 4 — /visual-review (screenshot feedback loop)

- [ ] Create `.claude/scripts/screenshot.mjs` (Playwright capture: breakpoints × light/dark)
- [ ] Create `.claude/skills/visual-review/SKILL.md`
- [ ] Create `.claude/commands/visual-review.md`
- [ ] Update pre-pr.md ("agent cannot take screenshots" → /visual-review) and design-check pointer
- [ ] Commit phase 4

## Final

- [ ] Dual adversarial review (Codex + adversarial-reviewer) over full branch diff; apply fixes; commit
- [ ] Format + verify docs/config; push branch
- [ ] Delete this todo file
