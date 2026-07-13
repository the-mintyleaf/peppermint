#!/bin/bash
# PreToolUse gate for Edit|Write — hard-blocks known anti-patterns in the INCOMING content.
# Interface: hook JSON on stdin; exit 2 + stderr = deny the tool call with the reason.
# False block? Log it as hook_false_positive in .claude/FAILURE-LOG.md and tighten the
# matcher here (see .claude/GOVERNANCE.md) — never bypass inline.

set -u

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0

# Scope: TypeScript sources inside apps/ or packages/ only.
printf '%s' "$FILE" | grep -qE '/(apps|packages)/.*\.(ts|tsx)$' || exit 0

# Incoming content: Write → .content, Edit → .new_string (or .edits[].new_string).
CONTENT=$(printf '%s' "$INPUT" | jq -r '
  [ .tool_input.content // empty,
    .tool_input.new_string // empty,
    ((.tool_input.edits // [])[] | (.new_string // .new_str // empty))
  ] | map(select(. != "")) | join("\n")')
[ -z "$CONTENT" ] && exit 0

REASONS=""

# 1 — Direct @mantine/* import. packages/ui IS the wrapper, so it is exempt.
if ! printf '%s' "$FILE" | grep -q '/packages/ui/'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE 'from .@mantine/' | head -3)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] Direct @mantine/* import — import from @peppermint/ui instead (add the re-export to the wrapper first if it is missing):
$HIT"
  fi
fi

# 2 — Data fetch inside useEffect. Server state goes through React Query.
HIT=$(printf '%s\n' "$CONTENT" | awk '/useEffect[[:space:]]*\(/{w=NR+12} NR<=w && /(fetch\(|axios\.|[^A-Za-z]api\.(get|post|put|patch|delete)[[:space:]]*\()/{printf "%d: %s\n", NR, $0}' | head -3)
if [ -n "$HIT" ]; then
  REASONS="$REASONS
[B] Data fetch inside useEffect — use useQuery/useMutation (React Query), never useEffect fetching:
$HIT"
fi

# 3 — Inline Axios call. Only the app api instance and @peppermint/api-client may touch axios.
if ! printf '%s' "$FILE" | grep -qE '(/packages/api-client/|/lib/api\.ts$)'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE 'axios\.(get|post|put|patch|delete|create|request)[[:space:]]*\(|new Axios' | head -3)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] Inline Axios call — mutations use useMutation with functions that import the app's src/lib/api.ts instance:
$HIT"
  fi
fi

# 4 — "use client" in an app/ page or layout file (those are re-export-only files).
if printf '%s' "$FILE" | grep -qE '/app/.*(page|layout)\.tsx$'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -n 'use client' | head -1)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] \"use client\" in an app/ page or layout file — app/ files are re-export-only; move interactivity into the module/layout it imports:
$HIT"
  fi
fi

if [ -n "$REASONS" ]; then
  {
    echo "Anti-pattern gate blocked this write (.claude/hooks/anti-pattern-gate.sh):"
    echo "$REASONS"
    echo ""
    echo "Fix the content and retry. Line numbers refer to the incoming snippet, not the file."
    echo "False positive? Log hook_false_positive in .claude/FAILURE-LOG.md and tighten this gate per .claude/GOVERNANCE.md — do not work around it."
  } >&2
  exit 2
fi

exit 0
