#!/bin/bash
# Stop hook — reminds about the verification gates when TS/TSX files were modified.

set -u

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

CHANGED=$(git diff --name-only 2> /dev/null | grep -E '\.(tsx|ts)$')
[ -z "$CHANGED" ] && exit 0

echo "[post-response] Modified TS/TSX files:"
echo "$CHANGED" | head -8
echo ""

if echo "$CHANGED" | grep -qE '(layouts|modules|components)/.*\.tsx$'; then
  echo "Before closing: /verify (includes design scan) · /design-check for full audit · /simplify if >10 lines changed · /update-ai-map if structure changed"
else
  echo "Before closing: /verify (typecheck+lint) · /simplify if >10 lines changed · /update-ai-map if structure changed"
fi

exit 0
