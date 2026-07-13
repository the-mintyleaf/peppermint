#!/bin/bash
# Stop hook — reminds about the verification gates when TS/TSX files were modified.
# Emits JSON systemMessage (plain stdout on Stop is only visible in transcript mode).

set -u

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# diff against HEAD so staged-but-uncommitted work is included too
CHANGED=$(git diff HEAD --name-only 2> /dev/null | grep -E '\.(tsx|ts)$')
[ -z "$CHANGED" ] && exit 0

FILES=$(echo "$CHANGED" | head -8)

if echo "$CHANGED" | grep -qE '(layouts|modules|components)/.*\.tsx$'; then
  GATES="/verify (includes design scan) · /design-check or /visual-review for full audit · /simplify if >10 lines changed · /update-ai-map if structure changed"
else
  GATES="/verify (typecheck+lint) · /simplify if >10 lines changed · /update-ai-map if structure changed"
fi

jq -n --arg msg "[post-response] Modified TS/TSX files:
$FILES

Before closing: $GATES" '{systemMessage: $msg}'

exit 0
