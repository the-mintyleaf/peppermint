#!/bin/bash
# PostToolUse for Edit|Write — injects design doctrine context back to Claude
# (via additionalContext) when a visual .tsx file was touched. Replaces the old
# design-primer and output-contract hooks, which never fired (hook_false_negative,
# see .claude/FAILURE-LOG.md).

set -u

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0

# Visual components only.
printf '%s' "$FILE" | grep -qE '/(layouts|modules|components)/.*\.tsx$' || exit 0

TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')
CTX=""

# Design primer — when the file deals with state/action/risk vocabulary.
if grep -qiE '\b(status|action|badge|confirm|danger|delete|suspend|approve|reject|loading|error|empty|disabled|permission|unsaved)\b' "$FILE" 2> /dev/null; then
  CTX="── Design primer (.claude/DESIGN.md) ──
Decision ladder: Safety > Truth > Clarity > Speed > Density > Consistency > Aesthetics
State != Action: badge/fact and button/lever must look and sit differently
Status = words + color + position — never color alone
Name the one question this component answers before laying out elements"
fi

# Output-contract checklist — on new-file creation only.
if [ "$TOOL" = "Write" ]; then
  BASENAME=$(basename "$FILE" .tsx)
  EXTRA=""
  if printf '%s' "$BASENAME" | grep -qiE 'List|Table|Grid'; then
    EXTRA="$EXTRA
- No-results state (list/table detected — REQUIRED)"
  fi
  if printf '%s' "$BASENAME" | grep -qiE 'Form|Modal|Dialog|Drawer'; then
    EXTRA="$EXTRA
- Unsaved changes warning (form/modal detected — REQUIRED)"
  fi
  if printf '%s' "$BASENAME" | grep -qiE 'Dashboard'; then
    EXTRA="$EXTRA
- Data freshness indicator + long-running job state (dashboard detected — REQUIRED)"
  fi
  CTX="$CTX

── Output contract for new component $BASENAME (.claude/DESIGN.md Part 6) ──
Each state must be present or explicitly N/A:
- Empty · Loading/partial · Request-failed (with retry) · Permission-denied
- Read-only mode · Archived/deleted record · Conflicting edits (when applicable)$EXTRA
Also: one page-level anchor (regional anchors subordinate) · actions labeled by risk
tier with destructive ones spatially separated · recovery path for every consequential
action (undo/audit/retry/restore). Structural: .types.ts exists · barrel index.ts
updated · /update-ai-map if module structure changed."
fi

[ -z "$CTX" ] && exit 0

jq -n --arg ctx "$CTX" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
exit 0
