# Governance Doctrine

The companion to `.claude/FAILURE-LOG.md`. The log records **observed** governance
failures; this doc defines what each failure is allowed to change.

## Purpose

The failure log exists to constrain over-reaction. A logged failure entry is the *only*
thing that authorizes a new governance mechanism — and even then, the response is bounded
by the table below. **Most causes do not justify a new rule.** Adding a rule, hook, or
command step without a logged entry behind it is itself a governance failure
(`unrelated_change`).

## When to log

Append one row to `FAILURE-LOG.md` the moment you observe a **real, in-session**
governance failure — a rule that was missing, contradictory, or ignored; a command that
drifted from its intent; a hook that misfired; or a verification gate that wasn't run.

- Record only what actually happened. No hypothetical or "could-have" risks.
- One row per distinct failure. Pick exactly one cause from the fixed list.
- Convert relative dates to absolute (`YYYY-MM-DD`).

## Cause → justified-response

Each cause authorizes exactly the response in its row — nothing broader.

| Cause | Justified response |
|---|---|
| `rule_missing` | Add one narrowly-scoped rule to the relevant doc |
| `rule_contradictory` | Reconcile the conflicting rules — do **not** add a third |
| `rule_present_but_ignored` | Reinforce or relocate the existing rule; **no new rule** (a duplicate is not a fix) |
| `command_drift` | Update the drifted command file; bump its version note |
| `hook_false_positive` | Tighten the hook matcher so it stops over-firing |
| `hook_false_negative` | Extend hook coverage to catch the missed case |
| `unclear_requirement` | No governance change — clarify the requirement up front next time |
| `insufficient_repository_inspection` | No governance change — behavioral: inspect before acting |
| `verification_not_run` | Reinforce the verification gate (Stop-hook / `/verify`); add a new gate only if none exists |
| `unrelated_change` | Revert the out-of-scope change; no mechanism authorized |
