# `integration_pack/` — Frontend Integration Pack templates

This directory is the canonical template set for an app's **Frontend Integration
Pack** — the `<app>/docs/integration/` folder the frontend reads to integrate a
module. It replaces the retired `INTEGRATION_TEMPLATE.md`.

Governed by CLAUDE.md **§19.1 / §19.3** (doc type + required content) and
**§35 item 16** (freshness hook). The pack is a **strict, frontend-facing
contract** — see the "STRICT CONTRACT" banner in `PROMPT.md`.

## What's here

| File                   | Role                                                                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROMPT.md`            | The authoring/generator prompt. **Start here.** How to build or update a pack, the strict-contract rules, the per-entity 7-section block, the pattern catalogue, and the definition of done.                                                               |
| `ENTITY_TEMPLATE.md`   | The copy-me per-entity skeleton (header + seven numbered sections). Identical to `example/entities/_TEMPLATE.md`; each generated pack also ships its own copy as `entities/_TEMPLATE.md`.                                                                  |
| `README_TEMPLATE.md`   | Skeleton for the pack's own `README.md`.                                                                                                                                                                                                                   |
| `OVERVIEW_TEMPLATE.md` | Skeleton for `overview.md` (pack version + change history, envelopes, auth, pagination, conventions, role model, dependency order).                                                                                                                        |
| `ENUMS_TEMPLATE.md`    | Skeleton for `enums.md`.                                                                                                                                                                                                                                   |
| `FLOWS_TEMPLATE.md`    | Skeleton for `flows.md`.                                                                                                                                                                                                                                   |
| `GAPS_TEMPLATE.md`     | Skeleton for `gaps.md`.                                                                                                                                                                                                                                    |
| `example/`             | A **frozen style-reference snapshot** of a real pack (the `applicant` domain, trimmed to a representative slice). It is the gold standard for caliber and shape. **It is not live docs — never edit it, never treat it as the applicant app's real pack.** |

## How to (re)generate a pack

1. Read `PROMPT.md` in full.
2. Copy the skeletons into `<app>/docs/integration/`: `README.md`, `overview.md`,
   `enums.md`, `flows.md`, `gaps.md`, and `entities/_TEMPLATE.md` (from
   `ENTITY_TEMPLATE.md`), plus one `entities/<entity>.md` per resource.
3. Fill them from the app's current `docs/API.md` + `docs/DATA_CONTRACT.md` +
   `docs/SECURITY.md` (+ `constants.py` for enum/error truth). Trace or gap —
   never invent.
4. Match `example/` for shape and caliber.
5. Bump the pack version + add a change-history row in `overview.md`, then stage
   the changed pack files (the freshness hook requires it).
