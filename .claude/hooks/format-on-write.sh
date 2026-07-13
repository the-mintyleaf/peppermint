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
pnpm exec prettier --write "$FILE" > /dev/null 2>&1 || true

exit 0
