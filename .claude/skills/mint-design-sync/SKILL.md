---
name: mint-design-sync
description: >
  Ingests user-provided design guidelines (brand doc, token list, style guide in
  any format) and produces the app's design doc set — design-system.md,
  motion-system.md, DESIGN.md — plus the matching Mantine theme values in code,
  so tokens are enforced, not just written down. Use when the user hands over
  design guidelines, or when an app is missing apps/<app>/docs/design/.
---

# Design Guidelines Sync

Turns whatever design guidance the user provides into the three files
STANDARDS.md mandates, wired into the app's real Mantine theme. After this runs,
"use design tokens, never raw values" is checkable: every token in the docs
exists in the theme, and every themed value has a documented token.

**Zero invention rule** (same as mint-requirements-tuner): every token value
traces to the user's guidelines or to an explicit Mantine default the user
confirmed. Gaps become questions, not made-up values.

---

## 1. Inputs

- The user's guidelines — any format: markdown, a pasted brand doc, a token
  dump, screenshots of an existing product. Read all of it first.
- `.claude/DESIGN.md` — the generic doctrine. The app DESIGN.md **derives from**
  it (app personality, domain-specific patterns); it never restates it.
- The app's existing theme: `apps/<app>/config/theme/` (mintflow:
  `theme.mantine.main.tsx` for tokens, `theme.mantine.components.tsx` for
  component defaults). Existing values are the current de-facto system — diff
  the guidelines against them and surface conflicts instead of silently
  overwriting.

## 2. Interview for gaps

Ask (batched, like mint-requirements-tuner) about anything the guidelines leave
open, at minimum:

- Color: primary/accent scales, semantic colors (success/warning/danger/info),
  dark mode — supported now, later, or never?
- Typography: font families (and how they load), the size scale, heading rules.
- Spacing/radius/shadow scales and their step values.
- Breakpoints, if they differ from Mantine defaults.
- Motion: base durations, easing curve(s), what is allowed to animate.
- Density: compact admin vs. spacious — affects component-default sizes.

## 3. Outputs

### `apps/<app>/docs/design/design-system.md`

Token tables — for each: token name, value, the Mantine theme key that carries
it, and usage constraints. Sections: color (incl. semantic status colors —
words + color + position rule from `.claude/DESIGN.md` Layer 4), typography,
spacing, radius, shadow, z-index, breakpoints, icon sizes. Every table row must
name where the token lives in code (`theme.mantine.main.tsx` key or CSS
variable). End with a **Forbidden** list: raw hex, arbitrary px, one-off
shadows/radii/z-indexes (mirrors STANDARDS.md → Design system enforcement).

### `apps/<app>/docs/design/motion-system.md`

Durations (named steps, e.g. `fast`/`base`/`slow` with ms), easings, what each
is for, the reduced-motion rule (>300ms or layout-shifting → `useReducedMotion()`
per CLAUDE.md), reusable motion helper locations, and motion anti-patterns.

### `apps/<app>/docs/design/DESIGN.md`

App-specific direction only: personality, mood, how this app's domain maps onto
the doctrine's page patterns, worked examples. Link to `.claude/DESIGN.md` for
the doctrine — do not duplicate it.

### Theme code — `apps/<app>/config/theme/`

Apply the tokens to `theme.mantine.main.tsx` (colors, fonts, spacing, radius,
shadows, breakpoints) and component defaults to `theme.mantine.components.tsx`.
The docs and the theme must agree — a token documented but not themed (or vice
versa) is a sync failure. Run `pnpm check-types` and `pnpm build --filter <app>`
after editing.

## 4. Conflict handling

When the guidelines contradict the existing theme or existing component usage:

1. List each conflict (token, current value, guideline value, blast radius —
   grep for usages).
2. Ask the user which wins. Never restyle the app as a silent side effect of a
   docs sync.
3. Approved value changes land in the same run; approved-but-large restyles
   become a follow-up task in the report.

## 5. Report

Files written, tokens added/changed (docs + theme), conflicts resolved or
deferred, open questions. Remind: the design scan (`/verify` Step 2b) and
`/design-check` now check against these files — W1 raw-hex findings should
point at the correct token from `design-system.md`.
