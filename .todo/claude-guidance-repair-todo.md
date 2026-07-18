# Claude Guidance Repair — todo

Corrective pass on `.claude/` (correctness + governance honesty; a11y/perf deferred).

## Phase 1 — Repair mint-module-builder SKILL + de-Mojito linked skills

- [x] Type constraint: drop `Record<string, unknown>` mandate → plain interfaces / `T extends object` (prose + Student/Product examples + Common Mistakes block)
- [x] Query keys: stringly → `createQueryKeys` array form
- [x] Edit-api + generics: `onEditApi={(values, record) => update(record.id, values)}` + wire `<ModalTableShell<Row, FormValues>>`
- [x] Create/update payloads: `Partial<T>` → distinct create/update types
- [x] Presentation mandates → conditional (icon / xs size are defaults, not laws)
- [x] De-Mojito SKILL.md
- [x] Reference `createListModule` as the real staff-CRUD primitive
- [x] De-Mojito SKILL-UPDATE-GUIDE.md, mint-module-planner, mint-requirements-tuner, bootstrap-docs
- [x] Commit Phase 1

## Phase 2 — Honest package inventory in CLAUDE.md

- [x] Add `@peppermint/docs` entry; mark config/docs/kanban as reserved/empty consistently
- [x] Commit Phase 2

## Phase 3 — Governance honesty

- [x] Document hook block-vs-advise scope + anti-pattern-gate snippet limitation
- [x] Add compact risk-tier verification rule (STANDARDS.md, pointer from rules.md)
- [x] Commit Phase 3

## Phase 4 — Verify & close out

- [x] Examples validated by source-signature cross-check (live `pnpm check-types` not
      runnable: no `node_modules`; examples are stubbed) + fixed example import consistency
- [x] `grep -rli mojito .claude` → empty
- [x] Consistency re-read of SKILL.md vs CLAUDE.md/rules.md (all `Record<>` refs negative)
- [ ] `pnpm format` — deferred: prettier not installed (no root `node_modules`)
- [x] Update `.todo/claude-adjustments.md` checkboxes
