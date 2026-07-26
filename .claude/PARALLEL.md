# Parallel Agent Dispatch Protocol

How the main session (the **orchestrator**) splits independent work across concurrent
subagents, and how phases are committed and reviewed. Referenced by `CLAUDE.md`,
the commands in `.claude/commands/`, and the mint skills.

Subagent definitions live in `.claude/agents/`:

| Agent                  | Purpose                                             | Writes files? | Runs shell? |
| ---------------------- | --------------------------------------------------- | ------------- | ----------- |
| `module-builder`       | Builds exactly ONE assigned module/sub-module       | Yes — jailed  | No          |
| `verifier`             | Runs exactly ONE verification scope                 | No            | Yes         |
| `adversarial-reviewer` | Post-phase adversarial review of a diff or file set | No            | Read-only   |

---

## 1. When to dispatch in parallel

| Situation                                                                                               | Action                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements doc lists 2+ independent `[CONTAINED]`/`[MULTI_PAGE]` modules                              | One `module-builder` per module, dispatched concurrently in a single message                                                                  |
| **Exactly one** module/sub-module to build                                                              | Built **inline** by the orchestrator — never dispatch a single builder (a lone agent adds a spawn + full context reload for zero parallelism) |
| `[NOT_CONTAINED]` / `[CUSTOM]` modules                                                                  | Built inline by the orchestrator, sequentially — never dispatched to builders                                                                 |
| Verification spans a **large** file/package surface where parallel `--filter` runs are genuinely faster | One `verifier` per scope, dispatched concurrently                                                                                             |
| Verification for a normal-sized change (a handful of files/packages)                                    | Run the commands **inline** (`pnpm check-types && pnpm lint`) — do not spawn a verifier just to run one command and report PASS/FAIL          |
| Post-phase review                                                                                       | **Single reviewer by default** (see §7); escalate to dual only for the risk triggers there                                                    |
| Single unit of work                                                                                     | Inline, sequential — no dispatch                                                                                                              |
| Units with genuine dependencies                                                                         | Sequential in dependency order (parallelize only the independent subsets)                                                                     |

Dispatch all concurrent agents **in one message** (multiple tool calls) so they actually
run at the same time.

**Spawn discipline:** every subagent reloads the full `.claude/CLAUDE.md` into its own
context, so a spawn is only worth it when it buys real parallelism or an independent
perspective. Never dispatch an agent to do what a single inline Bash command or a single
inline build would do — that pays the context-reload cost for no benefit.

**Builder model:** `module-builder` defaults to **Sonnet** — it only ever builds the
scaffolded `[CONTAINED]`/`[MULTI_PAGE]` types, downstream of the Opus-run decision
skills (`/design-decisions`, `mint-requirements-tuner`, `/form-builder`) that already
fixed the pages, fields, and columns, with write-time hooks + typecheck + review gating
the output. That is execution, not judgment. **Override to Opus per dispatch** (the
Agent tool's `model` param beats the frontmatter) for a genuinely complex or novel
module — a thin/ambiguous spec, tricky generics, or heavy cross-primitive composition.
`[NOT_CONTAINED]`/`[CUSTOM]` modules never reach a builder — the orchestrator builds
those inline on its own (Opus) session.

## 2. Independence test

Units are parallel-safe if and only if they are **file-disjoint**:

- No unit imports another unit's outputs (types, hooks, components that don't exist yet).
- No unit needs a shared asset that doesn't exist yet. If 2+ units need a shared asset
  (e.g. `modules/<group>/<domain>/_shared/`), the orchestrator creates it **before**
  dispatch — agents never create files outside their assigned folder.
- A unit that depends on a sibling (e.g. imports its types) builds **after** that sibling
  finishes. Declare the dependency in the `.todo` file and dispatch it in a later wave.

## 3. File ownership

**Builder agents** write only inside their assigned module folder — including barrels
and `docs/AI.md` files _inside_ that folder. Everything above it is orchestrator-owned.

**Orchestrator-owned (agents must never touch):**

- Group and parent-domain barrels (`modules/<group>/index.ts`, `modules/<group>/<domain>/index.ts`)
- `app/` route files
- Parent-domain and app-level `docs/AI.md`
- `.todo/` files
- All git operations
- All fixes to verification or review findings
- Write-mode `pnpm format`
- Shared assets (`_shared/`) — pre-created before dispatch

Builders **report** the wiring lines (parent barrel export, `app/` re-export, parent
AI.md row) instead of writing them; the orchestrator applies them in the wiring pass.

Hook note: PreToolUse/PostToolUse hooks fire inside subagents too. Reminders like
"is the group barrel updated?" apply to an agent **only for barrels inside its assigned
folder** — outer barrels are deferred to the orchestrator by design.

## 4. Dispatch prompt template (mandatory)

Subagents share no conversation context. Every `module-builder` dispatch must embed
ALL of the following — a dispatch missing any field is a protocol violation:

```
1. Assigned folder (absolute path), e.g.:
   /Users/<user>/Projects/ppm/apps/<app>/modules/<group>/<domain>/<sub-module>/
2. Requirements doc (absolute path) + which Module Breakdown row is yours
3. Module type tag: [CONTAINED] or [MULTI_PAGE]
4. Read first:
   - .claude/skills/mint-module-builder/SKILL.md
   - .claude/CLAUDE.md (stack, naming, component structure)
   - Parent domain docs/AI.md
   - One existing sibling sub-module as reference
     (e.g. apps/mintflow/modules/admin/organization/members/)
5. Do-not-touch list: anything outside the assigned folder; .todo/; app/;
   parent barrels; parent docs/AI.md
6. Required report format (see .claude/agents/module-builder.md)
```

`verifier` dispatches embed: the exact command (or the file list + scan-mode reference
to `.claude/commands/verify.md` Step 2b) and the required report format.

## 5. Phase workflow & post-phase sequence

Every multi-step task gets a phase-organized `.todo/<task>-todo.md` (single standalone
tasks exempt). After each phase:

1. **Collect** agent reports.
2. **Wiring pass** (orchestrator): parent barrels, `app/` re-exports, parent/app AI.md rows.
3. **Format**: `pnpm format` — orchestrator only, with zero agents active. Formatting
   runs BEFORE verification so `format:check` cannot fail on agent-written code.
4. **Verification fan-out** (Section 6). Orchestrator fixes failures, re-dispatches only
   the failed scope.
5. **Check `.todo` boxes** for completed units.
6. **Commit**: `git add` the phase's files (including the updated `.todo`) +
   `git commit` with a clear message in the repo commit format. Applies to single-task
   work too. The phase's own "commit" checkbox is self-referential — check it right
   after committing; it rides with the next commit (e.g. the review-fix commit).
7. **Dual adversarial review** (Section 7) — unless the phase doesn't warrant it.
8. **Apply combined review fixes** (orchestrator), commit the fixes.

## 6. Verification concurrency matrix

| Concurrent-safe (fan out, one `verifier` each)                    | Serialized / gated                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm check-types` (turbo)                                        | `pnpm build` — runs alone, only after types + lint pass            |
| `pnpm lint` (turbo)                                               | `pnpm format` (write mode) — orchestrator only, zero agents active |
| `pnpm format:check` (read-only prettier)                          | pre-pr gates: verify PASS → doc-check → greploop → PR              |
| Design scan (Step 2b) — batch files across ≤4 scan-mode verifiers |                                                                    |

- Scope each verifier with `--filter` where possible to shrink turbo contention.
- `format:check` is only meaningful **after** the orchestrator's write-mode format pass
  (Section 5, step 3) — never include it in a wave that runs before formatting.
- Concurrent turbo shells on **different** tasks are acceptable; never run two builds
  at once, and never run write-mode format while any agent is active.
- Known gap: `apps/mintflow` has no `check-types` script — the verifier reports it
  SKIPPED with reason. Do not invent the script.

## 7. Post-phase adversarial review

**Single reviewer by default.** After each phase that warrants in-depth review,
dispatch **one** adversarial reviewer over the phase's diff (give it the commit range
or file list and the phase intent):

- Prefer `mcp__codex__codex` (an independent engine — no CLAUDE.md reload) when
  available; otherwise one `adversarial-reviewer` subagent.

Then: apply fixes as the orchestrator (reviewers never edit) and commit the fixes.

**Escalate to a dual review** (both `mcp__codex__codex` **and** one
`adversarial-reviewer`, dispatched in one message, findings combined and deduped)
**only** when the phase carries real risk:

- touches a **package public API** or crosses a package boundary,
- is **cross-cutting** (changes shared wrappers, shells, primitives, or 5+ files),
- or lands **security-, auth-, or money-sensitive** logic.

A localized, single-module, or additive phase gets the single reviewer — a second
Opus-class reviewer on the same small diff is duplicated cost, not added safety.

**Skip the review entirely** when the phase doesn't require in-depth review — e.g.
docs-only changes, trivial config, mechanical renames. Note the skip in the phase report.

**Codex unavailable?** Proceed with the `adversarial-reviewer` alone and note the
omission. Never block a phase on Codex availability.

## 8. Never parallelize

- Requirements tuning (`/mint-requirements-tuner`) — interactive.
- Requirements structuring (`/mint-requirements-tuner`) — one coherent, interactive doc.
- Git operations — single `dev/<name>` branch; orchestrator commits serially.
- `/greploop` — stateful iteration loop.
- Two writers of the same file, ever.
- Write-mode formatting while agents are active.
- Units with declared dependencies (build in waves instead).

## 9. Failure handling

- An agent that hits a blocker (missing shared asset, ambiguous requirement) **stops
  inside its folder and reports the blocker** — it never improvises outside its jail.
- The orchestrator resolves the blocker and re-dispatches **only that unit**.
- One failed unit never blocks the wiring pass for completed units.
- A failed verification scope is fixed by the orchestrator, then only that scope is
  re-dispatched.
