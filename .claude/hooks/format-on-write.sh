#!/bin/bash
# PostToolUse for Edit|Write — auto-formats the touched file with the repo's Prettier,
# so verification's format:check can never fail on freshly written code.

set -u

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0

case "$FILE" in
  *.ts | *.tsx | *.md | *.css) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
ERR=$(pnpm exec prettier --write "$FILE" 2>&1 > /dev/null)
if [ $? -ne 0 ]; then
  # Prettier failing to parse usually means a syntax error in what was just
  # written — tell Claude instead of hiding it.
  jq -n --arg ctx "[WARN] prettier could not format $FILE (likely a syntax error in the content just written):
$(printf '%s' "$ERR" | head -5)" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
fi

exit 0
