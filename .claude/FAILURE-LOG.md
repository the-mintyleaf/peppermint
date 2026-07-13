# Claude Governance Failure Log

Record only OBSERVED failures. Do not record hypothetical risks.

| Date       | Task                 | Failure                                                                                                                                                                                                                                                            | Rule Present? | Cause               | Impact | Corrective Action                                                                                                                                                              |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _example_  | Config audit         | `endpoint.md` never invoked the policy-engine lifecycle (§35); endpoints built via this command would ship policy-noncompliant                                                                                                                                     | Yes           | command_drift       | High   | Added policy-engine step to `endpoint.md` (v1.1)                                                                                                                               |
| 2026-07-13 | .claude tuning audit | All three `settings.json` hooks read `$CLAUDE_TOOL_INPUT_FILE_PATH`, which does not exist in the hooks interface (tool input arrives as stdin JSON) — anti-pattern gate, design primer, and output-contract checklist never fired for any file                     | Yes           | hook_false_negative | High   | Rewrote hooks as stdin-JSON scripts in `.claude/hooks/` (gate now hard-blocks via exit 2; design context injected via `additionalContext`); verified by piping sample payloads |
| 2026-07-13 | .claude tuning audit | `STANDARDS.md` verification categories mandate `pnpm typecheck`, `pnpm test*`, `pnpm analyze`, `pnpm lighthouse`, `pnpm clean`, and Storybook stories — none exist in the repo — while `rules.md` forbids inventing scripts                                        | Yes           | rule_contradictory  | Medium | Reconciled: fixed `typecheck` → `check-types`, marked script-less categories DORMANT with "no runner configured" headers; no new rules added                                   |
| 2026-07-13 | .claude tuning audit | `mint-module-builder` §3 claims `ModalModule` ≡ ContainedModule and `RouteModule` ≡ MultiPageModule, but CLAUDE.md defines them as distinct types and mintflow AI maps document real ModalModule (non-routed profile overlay) and RouteModule (own-layout) modules | Yes           | rule_contradictory  | Medium | Reconciled: SKILL §3 now states both are distinct, orchestrator-built-inline types — not aliases; CLAUDE.md table unchanged (it matched reality)                               |

> The row above is an **illustrative format example** from another project (its
> `endpoint.md`/§35 references do not exist in this repo). Real entries start below it.

## Cause categories (use exactly these)

`rule_missing` · `rule_contradictory` · `rule_present_but_ignored` · `command_drift` ·
`hook_false_positive` · `hook_false_negative` · `unclear_requirement` ·
`insufficient_repository_inspection` · `verification_not_run` · `unrelated_change`

The cause→justified-response table lives in `GOVERNANCE.md`. A failure entry is the
_only_ thing that authorizes a new governance mechanism.
