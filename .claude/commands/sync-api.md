You are syncing backend API docs into the frontend.

Arguments: $ARGUMENTS — `<app> <domain>` (e.g. `mintflow events`). If the domain is omitted, list the folders under `docs/backend/` and ask which one to sync.

Follow `.claude/skills/mint-api-sync/SKILL.md` exactly:

1. Read `docs/backend/<domain>/` (INTEGRATION.md → API.md → DATA_CONTRACT.md → SECURITY.md) and note the backend version from the Change History.
2. If `apps/<app>/docs/api-contracts/<domain>.md` already exists, run the skill's drift check first — same version means report "in sync" and stop.
3. Write or update the contract digest at `apps/<app>/docs/api-contracts/<domain>.md`.
4. If a target module for this domain exists (or the user is about to build one), generate/update its `.types.ts`, `.queryKeys.ts`, and `.api.ts` per the skill's conventions, then run `pnpm check-types` on the app.
5. Report: digest path, pinned version, files touched, drift findings, and the Gaps section verbatim.

If `docs/backend/<domain>/` does not exist, say so and ask where the backend docs are — never invent a contract.
