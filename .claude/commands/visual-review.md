You are running a visual review of rendered UI.

Arguments: $ARGUMENTS — `<route>` (e.g. `/admin/organization`), optionally followed by extra widths (e.g. `320,1920`). If no route is given, derive candidates from the current diff's touched modules (their routes are in the module `docs/AI.md`) and confirm with the user.

Follow `.claude/skills/visual-review/SKILL.md` exactly:

1. Ensure a dev server is running (reuse if up; start `pnpm dev --filter <app>` in the background if not).
2. `pnpm exec playwright install chromium` (idempotent).
3. Capture with `node .claude/scripts/screenshot.mjs --url <url> --out <scratchpad>/visual-review/<slug> --widths 390,768,1440 --schemes light,dark`.
4. Read every PNG and audit per the skill's checklist (anchors, state≠action, breakpoints, dark mode, output-contract states).
5. Report severity-ranked findings, each citing its screenshot as evidence. Stop any server you started.
