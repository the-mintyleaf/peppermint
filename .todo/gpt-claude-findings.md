# GPT → Claude: architecture findings and context

## Purpose

This is a factual handoff for future work on `.claude/` and shared frontend
packages. It records current owner preferences and verified drift. It is not a
mandate for a broad rewrite; the actionable corrective work is in
[`claude-adjustments.md`](./claude-adjustments.md).

## Current owner preferences

- Existing applications are consumers and testbeds, not templates for every
  future app. The platform should support admin portals and bespoke products.
- `@peppermint/ui` is currently a Mantine-oriented compatibility façade. It can
  become a design system incrementally, while retaining useful compatibility
  access until replacement primitives are genuinely ready.
- `@peppermint/admin` is the preferred foundation for an app intentionally built
  around the admin framework. Other apps may reuse selected pieces or take
  inspiration, but are not required to adopt its module shells.
- Use established API/shell helpers when they fit an admin-framework workflow;
  otherwise build an adapter or resource API that fits the actual requirement and
  the agreed backend contract.
- Keep app helpers local by default. If one appears broadly reusable, recommend
  a package promotion and obtain owner approval before moving or creating shared
  package code.
- Provide a base theme with strong app-level freedom for brand, layout, density,
  and product-specific interactions.
- Mantine client rendering is normal; SSR is available where it materially
  improves first render, SEO, or data loading.
- Reserved packages are intentional. Do not delete, repurpose, or import from
  them unless a task specifically targets that package.
- Frontend decisions should prioritize safety and correctness, clarity and task
  completion, accessibility, performance, consistency, then aesthetics.

## Verified issues

### 1. Stale `mint-module-builder` guidance — highest priority

The skill contains advice that no longer matches the source:

- It uses `Record<string, unknown>` constraints despite root guidance favoring
  plain interfaces and table code accepting `T extends object`.
- It shows string query keys rather than `createQueryKeys`-compatible array keys.
- It blurs create and update contracts, and one edit example reads an `id` that
  its declared values type does not provide.
- It retains obsolete Mojito naming.
- It makes blanket icon and compact-control recommendations that should depend
  on the interaction.

This is operationally significant: a skill framed as canonical can generate code
that conflicts with the current APIs.

### 2. Root documentation misses a real package

`packages/docs/package.json` exists for `@peppermint/docs`, but it is absent from
the root `.claude/CLAUDE.md` package inventory. Record its actual, minimal status
instead of inventing responsibilities for it.

### 3. Hooks are enforcement, with defined limits

The anti-pattern gate is not just a reminder: it can exit non-zero and block a
tool action for detectable violations. It also documents a limitation around
snippet inspection, so it is a scoped guard—not proof that the whole change is
correct. Future guidance should preserve both facts and call for risk-appropriate
verification.

## Important correction to earlier review material

Earlier drafts proposed extra architecture labels, a numerical helper-extraction
rubric, and documentation for hypothetical UI layers. Those were not justified
by the current source or required by the owner's stated approach. They are not
part of the recommended work.

One earlier claim about `useForm` was also incorrect: `@peppermint/ui` re-exports
the Mantine form surface, so its use in the module-builder material is not itself
an invalid import.

## Recommended near-term sequence

1. Bring the module-builder skill into line with current source and validate its
   examples.
2. Add `@peppermint/docs` to the root package inventory accurately.
3. Clarify enforcement scope and make verification proportional to the risk of
   the change.
4. Add accessibility or performance gates only when concrete, measurable targets
   are chosen.

## Review boundaries

- Do not infer that identical local helpers must become packages. Review domain
  coupling, authentication assumptions, routes, policy, and reuse evidence first.
- Do not treat current apps as a reason to impose the admin framework universally.
- Do not delete empty or reserved packages as cleanup.
- When documentation conflicts with source, report the drift and correct the
  narrow documentation issue before proposing structural change.

These notes reflect the current discussion and should be revised when the owner
changes a preference or the source changes.
