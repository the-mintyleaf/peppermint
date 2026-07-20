# .claude adjustments

## Purpose

Keep the Claude guidance accurate against the current Peppermint source without
adding speculative architecture process. This is a small corrective todo, not a
platform redesign.

## Verified findings

### P0 — `mint-module-builder` is stale and internally inconsistent

`.claude/skills/mint-module-builder/SKILL.md` conflicts with the current source
and root guidance in several ways:

- It requires domain rows to use `Record<string, unknown>` in places where the
  repository guidance calls for plain interfaces and `DataTableShell` accepts
  `T extends object`.
- Its example query-key strings do not match the array keys produced by
  `createQueryKeys`.
- Its create/edit types and examples permit partial payloads where the contract
  requires separate create and update shapes; one example accesses an `id` not
  present in its declared type.
- It retains obsolete Mojito wording.
- It mandates icons and `xs` controls too broadly, instead of leaving them to
  interaction value and available space.

### P1 — the root package inventory has drifted

`packages/docs/package.json` defines `@peppermint/docs`, but the package list in
`.claude/CLAUDE.md` omits it. Its current source is minimal, so the entry should
describe it honestly as reserved/minimal rather than imply a mature package.

### P2 — enforcement and verification need clearer guidance

The anti-pattern hook is a real PreTool hard gate for patterns it can detect;
it exits non-zero. Its own documented snippet limitation means it cannot prove
all changes comply. Guidance should describe that scope accurately and pair it
with verification appropriate to change risk.

## Approved corrective work

### 1. Repair the module-builder skill

- [x] Replace stale `Record<string, unknown>` constraints with guidance aligned
      to the current table APIs and root type conventions.
- [x] Use `createQueryKeys`-compatible array keys in examples.
- [x] Use distinct, contract-correct create and update types; ensure all example
      property accesses type-check.
- [x] Remove Mojito-era terminology from the skill and any directly linked
      planning guidance.
- [x] Change absolute UI mandates into conditional guidance: use an icon or a
      compact size only when it improves the concrete interaction.
- [x] Validate the revised examples against current exports before presenting the
      skill as authoritative. (Cross-checked against source signatures —
      `createQueryKeys`, `onEditApi(values, record)`, `T extends object`,
      `ModalTableShell<TRow, TCreate, TEdit>`. No live `pnpm check-types`: repo
      `node_modules` is not installed and examples are intentionally stubbed.)

### 2. Correct the root package inventory

- [x] Add `@peppermint/docs` to `.claude/CLAUDE.md` with a precise description
      of its present status. (config/kanban also marked reserved/empty for
      consistency.)

### 3. Make checking proportionate and truthful

- [x] Document which hooks block actions and which checks are advisory, including
      the anti-pattern gate's snippet limitation.
- [x] Add a compact risk-tier verification rule to the relevant guidance. Small
      styling/doc changes need focused checks; shared types, API boundaries,
      forms, tables, routing, and data mutations need stronger targeted tests.

### 4. Add measurable quality rules only after targets are chosen

- [ ] If the owner sets concrete accessibility or performance targets, encode
      only the applicable, measurable checks and their acceptance criteria.

## Explicitly out of scope

- Creating a new framework/product mode taxonomy or another architecture switch.
- Creating a numerical extraction scorecard for app helpers.
- Documenting `@peppermint/ui/system`, `patterns`, or other future public APIs
  before they exist.
- Extracting, deleting, repurposing, or importing from reserved packages.
- Moving app-local helpers into shared packages without a separate owner-approved
  package task.

## Current architectural context

- Apps are independent consumers of the platform; the platform must support both
  admin portals and bespoke product experiences.
- `@peppermint/ui` is a broad Mantine compatibility façade that may evolve
  gradually into a design system without a wholesale rewrite.
- Use admin shells and helpers where an app is intentionally built around that
  framework; otherwise reuse only what fits the requirement.
- Keep helpers local by default. A proposal to promote one requires owner review
  and approval.
- Preserve base theme defaults while allowing substantial app-level customization.
- SSR is allowed when it materially helps a route; it is not a blanket mandate.
