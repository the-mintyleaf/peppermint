You are syncing design guidelines into an app's design system.

Arguments: $ARGUMENTS — `<app>` (e.g. `mintflow`), optionally followed by a path to the guidelines document. If no guidelines are given, ask the user to provide them (paste, file path, or link) before doing anything else.

Follow `.claude/skills/mint-design-sync/SKILL.md` exactly:

1. Read the user's guidelines, `.claude/DESIGN.md`, and the app's existing theme (`apps/<app>/config/theme/`).
2. Interview for every gap the guidelines leave open (batch the questions). Zero invented values.
3. Write `apps/<app>/docs/design/design-system.md`, `motion-system.md`, and `DESIGN.md`.
4. Apply the tokens to the app theme files; run `pnpm check-types` and a filtered build.
5. Surface guideline-vs-existing-theme conflicts and let the user decide — never restyle silently.
6. Report files written, token changes, conflicts, and open questions.
