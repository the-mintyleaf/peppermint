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
  MANTINE_PAT="(from[[:space:]]+[\"']|require\([\"']|import\([\"'])@mantine/"
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE "$MANTINE_PAT" | head -3)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] Direct @mantine/* import — import from @peppermint/ui instead (add the re-export to the wrapper first if it is missing):
$HIT"
  fi
fi

# 2 — Data fetch inside useEffect. Server state goes through React Query.
# Word boundary before fetch( so refetch()/prefetch() never match; queryFn/mutationFn
# lines are exempt; the window closes at the effect's dependency-array line so an
# adjacent useQuery below an unrelated effect is not flagged.
# Known limitation: only the incoming snippet is scanned, so an Edit that inserts
# a fetch call into an EXISTING useEffect body slips past this gate — the
# post-write scan in design-context.sh and /verify W2 catch that case.
HIT=$(printf '%s\n' "$CONTENT" | awk '
  /useEffect[[:space:]]*\(/ { w = NR + 12 }
  NR <= w && !/queryFn|mutationFn/ && /((^|[^[:alnum:]_])fetch[[:space:]]*\(|axios\.|[^[:alnum:]_]api\.(get|post|put|patch|delete)[[:space:]]*\()/ { printf "%d: %s\n", NR, $0 }
  NR <= w && /\},[[:space:]]*\[/ { w = 0 }' | head -3)
if [ -n "$HIT" ]; then
  REASONS="$REASONS
[B] Data fetch inside useEffect — use useQuery/useMutation (React Query), never useEffect fetching:
$HIT"
fi

# 3 — Inline Axios call. Only the app-root api instance (apps/<app>/[src/]lib/api.ts)
# and @peppermint/api-client may touch axios — a module-local lib/api.ts does NOT qualify.
if ! printf '%s' "$FILE" | grep -qE '(/packages/api-client/|/apps/[^/]+/(src/)?lib/api\.ts$)'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE 'axios\.(get|post|put|patch|delete|create|request)[[:space:]]*\(|new Axios' | head -3)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] Inline Axios call — mutations use useMutation with functions that import the app's src/lib/api.ts instance:
$HIT"
  fi
fi

# 4 — "use client" in an app/ page or layout file (those are re-export-only files).
if printf '%s' "$FILE" | grep -qE '/app/.*(page|layout)\.tsx$'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE '^[[:space:]]*["'"'"']use client["'"'"']' | head -1)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] \"use client\" in an app/ page or layout file — app/ files are re-export-only; move interactivity into the module/layout it imports:
$HIT"
  fi
fi

# 5 — extends Record<string, unknown> on a domain row type. Shells constrain T extends object,
# which a plain interface already satisfies; the index signature only lets typo'd keys through.
# Only React-Flow node data legitimately needs it — a rare case handled via the escape hatch.
# Exemption: FormWrapper<T> (packages/admin) constrains T extends FormValues = Record<string,
# unknown> — a genuinely stricter contract than a shell's `T extends object`, so a plain
# interface does NOT structurally satisfy it (confirmed by tsc: "Index signature for type
# 'string' is missing"). The established codebase convention for a FormWrapper values type is
# `interface FooValues extends Record<string, unknown>` (e.g. mintway's CreateUserValues) — so
# an interface whose name ends in "Values" is exempt from this check.
HIT=$(printf '%s\n' "$CONTENT" | grep -nE 'extends[[:space:]]+Record<[[:space:]]*string[[:space:]]*,[[:space:]]*unknown[[:space:]]*>' | grep -vE 'interface[[:space:]]+[A-Za-z0-9_]*Values[[:space:]]+extends' | head -3)
if [ -n "$HIT" ]; then
  REASONS="$REASONS
[B] extends Record<string, unknown> on a domain type — shells constrain T extends object (a plain interface satisfies it). Remove the index signature; only React-Flow node data is exempt (if that is this case, use the escape hatch below):
$HIT"
fi

# 6 — Logic in an app/ page or layout file. Those are re-export-only; a React hook or an inline
# handler means logic leaked out of the module/layout it belongs in. ("use client" is caught by #4.)
if printf '%s' "$FILE" | grep -qE '/app/.*(page|layout)\.tsx$'; then
  HIT=$(printf '%s\n' "$CONTENT" | grep -nE '(^|[^[:alnum:]_])(useState|useEffect|useRef|useMemo|useCallback|useQuery|useMutation)[[:space:]]*\(|onClick=' | head -3)
  if [ -n "$HIT" ]; then
    REASONS="$REASONS
[B] Logic in an app/ page or layout file — these are re-export-only (export { default } from ... or import X; export default X). Move hooks and handlers into the module/layout it imports:
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
