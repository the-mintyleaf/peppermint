# Claude / AI-Efficiency Updates

Roadmap for token optimization + agent architecture of the `.claude` setup and the
build pipeline. Thesis of the open work: **the last leap was generation → composition
(pre-made primitives); the next league is composition → derivation** — anything
mechanically derivable from a single machine-readable source of truth should never
touch an LLM at all. LLM stays for judgment + the ~1-in-10 custom case only.

---

## Phase 0 — Subagent economy (DONE — committed to `.claude/`)

- [x] `verifier` → `haiku` (runs one command, reports; no reasoning)
- [x] `adversarial-reviewer` → `sonnet` (Codex is the independent second eye)
- [x] `mint-api-sync` → `sonnet` (doc→type transcription, not deep reasoning)
- [x] `module-builder` → `sonnet` default + per-dispatch `opus` override for complex/novel modules
- [x] `mint-module-builder` _skill_ stays `opus` (bootstrap/routing = the decision layer)
- [x] PARALLEL §1/§6: single module built inline; routine verification run inline (no verifier spawn per command)
- [x] PARALLEL §7: single reviewer by default; dual only for package-API / cross-cutting / security phases
- [x] `verify.md` / `post-edit-loop.md`: inline check-types+lint by default, fan out only for large multi-package surface
- [x] `module-builder` stops reading `rules.md` (compact mirror of the already-in-context CLAUDE.md)

## Phase 0.5 — Optional cleanup (not started)

- [ ] CLAUDE.md dedupe-only pass — remove rules restated between Stack Rules and Anti-Patterns (NO substantive cuts; the builder genuinely needs the substance). Target the restatement only.

---

## Phase 1 — Contract-first deterministic codegen ⭐ highest leverage

Deletes the highest-risk, highest-token LLM task (DTO synthesis) and replaces it with a
build step. Every module built afterward inherits perfectly-accurate types for free.

- [ ] Confirm whether the backend can emit a machine-readable contract (OpenAPI / JSON-Schema / TypeSpec) instead of prose `DATA_CONTRACT.md`. If not, raise it with the backend team — this is the prerequisite and it pays back on every module forever.
- [ ] Wire deterministic generation of `.types.ts` (e.g. `openapi-typescript`) from the structured contract — zero tokens, 100% accurate.
- [ ] Extend to the api-client layer, query keys, and Zod validators (all pure transforms of the same source).
- [ ] Reduce `mint-api-sync` to: drift check + the prose-only `INTEGRATION.md`/`SECURITY.md` digest; hand type generation to the generator. (Eliminates most of the 7% sync-api cost + the DTO-correctness risk.)

## Phase 2 — Scaffolding generator for composition boilerplate

Stop paying generation tokens for the frame; pay them only for the picture.

- [ ] Add a `plop`/`hygen`-style generator (or tiny CLI) that emits the module skeleton from the tuned requirements + contract: `createListModule` config, column skeletons, form skeleton, barrel `index.ts`, `docs/AI.md` stub.
- [ ] Rescope `module-builder` to fill only the judgment gaps (icon/column choice, disclosure order, custom renders) on top of the generated skeleton.
- [ ] Re-verify the Sonnet-default builder is now trivially safe (barely anything left to reason about).

## Phase 3 — Schema-driven forms

Forms are the last big hand-written surface; make a form a data structure, not JSX.

- [ ] Add a `renderForm(schema, layout)` primitive to `@peppermint/admin` (or `@peppermint/ui`) that derives fields from a Zod schema + layout descriptor.
- [ ] Update `/form-builder` to output a form _config_, not code.
- [ ] Migrate a reference form to the config-driven primitive; confirm builder generates no form JSX.

## Phase 4 — Golden-module eval harness ⭐ this is what earns the "10"

The missing feedback loop — converts the cheap-model strategy from "sound on paper" to
"provably safe."

- [ ] Keep one canonical, committed golden module per type (`[CONTAINED]`, `[MULTI_PAGE]`).
- [ ] CI step regenerates each golden from its spec and diffs against the committed version.
- [ ] Fail/alert on drift → automatic detection when a cheaper model degrades output, instead of catching it by eye.
- [ ] Once green + trusted, use it to push model tiers down more aggressively with a safety net.

---

## Guardrail (applies to all open phases)

Deterministic machinery trades LLM flexibility for code you maintain. Right trade for
**high-volume, stable** patterns (which these are). Wrong trade for churny one-offs —
codegen that fights a moving spec is worse than an LLM. Derive the stable ~90%; keep the
LLM for the volatile ~10% and the 1-in-10 custom module (which already routes inline to Opus).

**If doing only one first:** Phase 1 (contract-first codegen). Phase 4 is the close second.
