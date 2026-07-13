#!/bin/bash
# PostToolUse for Edit|Write — post-write scans of the file ON DISK, injected back
# to Claude via additionalContext. Two jobs:
#   1. useEffect-fetch warning for any apps/packages TS file (catches edits that
#      insert a fetch into an EXISTING useEffect body, which the PreToolUse gate
#      cannot see — its snippet-only scan is a documented limitation).
#   2. Design primer + output-contract checklist for visual .tsx files.
# Replaces the old design-primer/output-contract hooks, which never fired
# (hook_false_negative, see .claude/FAILURE-LOG.md).

set -u

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0

CTX=""

# 1 — Post-write useEffect-fetch scan (warn, not block) on any apps/packages TS source.
if printf '%s' "$FILE" | grep -qE '/(apps|packages)/.*\.(ts|tsx)$'; then
  HIT=$(awk '
    /useEffect[[:space:]]*\(/ { w = NR + 12 }
    NR <= w && !/queryFn|mutationFn/ && /((^|[^[:alnum:]_])fetch[[:space:]]*\(|axios\.|[^[:alnum:]_]api\.(get|post|put|patch|delete)[[:space:]]*\()/ { printf "%d: %s\n", NR, $0 }
    NR <= w && /\},[[:space:]]*\[/ { w = 0 }' "$FILE" 2> /dev/null | head -3)
  if [ -n "$HIT" ]; then
    CTX="[WARN] $FILE now contains what looks like a data fetch inside useEffect:
$HIT
Server state must go through React Query (useQuery/useMutation). Fix it, or if this is a false match, ignore this warning."
  fi
fi

# 2 — Visual components: primer + output contract.
if printf '%s' "$FILE" | grep -qE '/(layouts|modules|components)/.*\.tsx$'; then
  TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')

  if grep -qiE '\b(status|action|badge|confirm|danger|delete|suspend|approve|reject|loading|error|empty|disabled|permission|unsaved)\b' "$FILE" 2> /dev/null; then
    CTX="$CTX

── Design primer (.claude/DESIGN.md) ──
Decision ladder: Safety > Truth > Clarity > Speed > Density > Consistency > Aesthetics
State != Action: badge/fact and button/lever must look and sit differently
Status = words + color + position — never color alone
Name the one question this component answers before laying out elements"
  fi

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
fi

[ -z "$CTX" ] && exit 0

jq -n --arg ctx "$CTX" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
exit 0
