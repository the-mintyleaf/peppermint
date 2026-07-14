# Mintflow — Design System

> **Reverse-engineered from the current implementation**, not from an external
> brand doc. Every token below traces to real code:
> `config/theme/theme.mantine.main.tsx` (base tokens),
> `config/theme/theme.mantine.components.tsx` (component defaults),
> `app/globals.css`, `layouts/app/App.tsx`, and the app's `.module.css` files.
> Where the code currently uses raw values that _should_ be tokens, they are
> listed under **Current debt** and in **Forbidden** — document what is, flag
> what must migrate.
>
> This is the token reference. For app personality and page patterns see
> `DESIGN.md` (pending); for animation see `motion-system.md` (pending). The
> generic doctrine is `.claude/DESIGN.md`.

**How to use:** style with Mantine component props first (`c`, `bg`, `p`, `radius`,
`shadow`, `size`), then the `style` prop with `var(--mantine-*)`, then CSS Modules.
Never hardcode a value a token already names.

---

## 1. Color

### 1.1 Brand scale (primary)

Green brand ramp. `primaryColor: "brand"`, so `color="brand"` and the default
primary of every Mantine component resolve here.

| Token      | Value     | Theme key          | Use                             |
| ---------- | --------- | ------------------ | ------------------------------- |
| `brand.0`  | `#effaf4` | `colors.brand[0]`  | Lightest tint — subtle fills    |
| `brand.1`  | `#d8f3e3` | `colors.brand[1]`  | Hover tint on light             |
| `brand.2`  | `#b3e7cb` | `colors.brand[2]`  |                                 |
| `brand.3`  | `#82d3ad` | `colors.brand[3]`  |                                 |
| `brand.4`  | `#4eb98b` | `colors.brand[4]`  |                                 |
| `brand.5`  | `#289167` | `colors.brand[5]`  | **Primary shade in dark mode**  |
| `brand.6`  | `#1d7e59` | `colors.brand[6]`  | **Primary shade in light mode** |
| `brand.7`  | `#176549` | `colors.brand[7]`  |                                 |
| `brand.8`  | `#14513c` | `colors.brand[8]`  |                                 |
| `brand.9`  | `#124232` | `colors.brand[9]`  | App background gradient end     |
| `brand.10` | `#09251c` | `colors.brand[10]` | Deepest — rarely used directly  |

- `primaryShade`: `{ light: 6, dark: 5 }` — the filled primary is `brand.6`
  (light) / `brand.5` (dark). Reference as `var(--mantine-color-brand-filled)`,
  not a fixed shade.
- `autoContrast: true`, `luminanceThreshold: 0.5` — text-on-brand contrast is
  computed automatically. Do not hand-pick a text color on brand surfaces.

### 1.2 Neutrals

| Token   | Value     | Theme key | Use                                     |
| ------- | --------- | --------- | --------------------------------------- |
| `white` | `#fefefe` | `white`   | Surface / `var(--mantine-color-white)`  |
| `black` | `#111`    | `black`   | Text ink / `var(--mantine-color-black)` |

Grays come from Mantine's default `gray` / `dark` scales. In use across the app:
`gray.0`–`gray.6` for table hover, borders, muted text; `dark.4`–`dark.7` for
body text. Prefer the **semantic** neutral CSS vars over a fixed step so both
color schemes resolve correctly:

| Semantic var                          | Use                    |
| ------------------------------------- | ---------------------- |
| `var(--mantine-color-text)`           | Default body text      |
| `var(--mantine-color-dimmed)`         | Secondary / label text |
| `var(--mantine-color-body)`           | Page/panel background  |
| `var(--mantine-color-default)`        | Card / node surface    |
| `var(--mantine-color-default-hover)`  | Hover surface          |
| `var(--mantine-color-default-border)` | Standard 1px border    |

### 1.3 Semantic status colors

No custom semantic scale is defined — status uses Mantine default palettes.
Follow `.claude/DESIGN.md` Layer 4: **word + color + position**, never color
alone. Actual usage in the app:

| Meaning              | Mantine color | Seen in                                         |
| -------------------- | ------------- | ----------------------------------------------- |
| Danger / destructive | `red`         | Delete actions, `contextMenuDanger`, error text |
| Warning / highlight  | `orange`      | Path highlight (`orange.5`), analytics accent   |
| Info / link          | `blue`        | Breadcrumb links (`blue.6`), org-node accent    |
| Success              | `green`       | Positive status                                 |
| Search match         | `yellow`      | `nodeSearchMatch` (`yellow.5`)                  |
| Neutral / muted      | `gray`        | Disabled, secondary chrome                      |

Reference filled/light variants as `var(--mantine-color-red-filled)`,
`var(--mantine-color-red-light)`, etc. — do not pin a numeric shade for status.

### 1.4 App background & glass surfaces

| Token / effect     | Value                                                                                        | Location                             |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| App gradient       | `linear-gradient(160deg, var(--mantine-color-dark-9) 0%, var(--mantine-color-brand-9) 100%)` | `layouts/app/App.tsx` (`<html>`)     |
| Glass card fill    | `#ffffff11` (white ~7%)                                                                      | `modules/admin/home/Home.module.css` |
| Glass blur         | `backdrop-filter: blur(20px)`                                                                | same                                 |
| Glass border       | `color-mix(in srgb, var(--mantine-color-white) 18%, transparent)`                            | same                                 |
| Paper grid overlay | `color-mix(... white 6% ...)` 1px lines, `24px` grid                                         | `layouts/admin/Admin.module.css`     |

The glass/gradient aesthetic is the app's signature surface treatment for the
admin home. `color-mix(... white N% ...)` over the gradient is the established
pattern for translucent chrome — reuse it rather than inventing new alphas.

### 1.5 Current debt — raw hex to migrate

These live in code today but violate token discipline. New code must not add to
them; existing ones should migrate to `theme` colors.

| Raw hex                                 | Location                                                       | Nearest token                        |
| --------------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `#2563eb`                               | `Structure.module.css` `--node-accent` (org)                   | `blue.7`                             |
| `#7c3aed`                               | `Structure.module.css` (unit)                                  | `violet.6`                           |
| `#0d9488`                               | `Structure.module.css` (member)                                | `teal.7`                             |
| `#eab308`                               | `Structure.module.css` `nodeSearchMatch` fallback              | `yellow.5`                           |
| `#e03131` `#7048e8` `#1971c2` `#868e96` | `TaskModalShared.tsx` file-type colors                         | `red.7`/`violet.6`/`blue.7`/`gray.5` |
| `#ff8c42`, `#e6ac00`                    | analytics components (`WeeklyProductivity`, `DashboardHeader`) | `orange.4` / `yellow.7`              |

---

## 2. Typography

### 2.1 Font families

| Token          | Value                                | Theme key / var                     | Loaded                                            |
| -------------- | ------------------------------------ | ----------------------------------- | ------------------------------------------------- |
| Base / heading | `"Stack Sans Headline", sans-serif`  | `fontFamily`, `headings.fontFamily` | Google Fonts `<link>` in `App.tsx` (wght 200–700) |
| Special        | `"Bitcount Grid Single", sans-serif` | `--font-special` (`globals.css`)    | Google Fonts `<link>` in `App.tsx` (wght 100–900) |

One typeface for everything (`Stack Sans Headline`); `Bitcount Grid Single` is a
display accent exposed as `var(--font-special)` for numeric/decorative moments
only. `fontSmoothing: true`.

### 2.2 Size scale

The app is **compact-first**: the default control/text size is `xs`, set globally.

| Token        | Value / rule                                                | Where                                                                                                   |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Default size | `var(--mantine-font-size-xs)`                               | `theme.mantine.components.tsx` `defaults.fontSize` — applied to Button, all inputs, Select/Menu options |
| `h1`         | `36px`                                                      | `headings.sizes.h1`                                                                                     |
| Body sizes   | `size="xs"` (dominant), `size="sm"`, occasionally `md`/`lg` | component props                                                                                         |

Use Mantine size tokens (`xs`/`sm`/`md`/`lg`/`xl`) on `Text`/`Title`/inputs —
never a raw `fontSize` in px. Font-size steps resolve from
`var(--mantine-font-size-*)`.

### 2.3 Weights

| Weight | Meaning                           | Where                                        |
| ------ | --------------------------------- | -------------------------------------------- |
| `500`  | **Default `Text` weight**         | `Text.extend({ defaultProps: { fw: 500 } })` |
| `600`  | Emphasis / labels / current items | most common explicit `fw`                    |
| `700`  | Strong emphasis / stat values     | `.statValue`, headings                       |
| `900`  | Modal header                      | `Modal` `styles.header`                      |

### 2.4 Eyebrow / micro-label pattern

A recurring label treatment (section titles, table headers, eyebrows):

```
font-size: 10–11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.03em–0.06em;
color: var(--mantine-color-dimmed)  /* or gray-5 */
```

Seen in `InspectorPanel.module.css` (`.sectionTitle`, `.eyebrow`),
`TaskTable.module.css` (`.headerLabel`). Reuse this recipe for uppercase labels.

Monospace (`font-family: monospace`) is reserved for machine IDs
(`.idText`, `.subtaskIdText`).

---

## 3. Spacing

Use the Mantine spacing scale via props (`gap`, `p`, `px`, `m`, `mt`, …) or
`var(--mantine-spacing-*)`. Observed dominant usage: `xs` and `md`, then `sm`.

| Token | Var                         | Typical use                                                           |
| ----- | --------------------------- | --------------------------------------------------------------------- |
| `xs`  | `var(--mantine-spacing-xs)` | Default gap in compact stacks/grids; page padding (`Home.module.css`) |
| `sm`  | `var(--mantine-spacing-sm)` | Medium gaps                                                           |
| `md`  | `var(--mantine-spacing-md)` | Section padding, generous gaps                                        |
| `lg`  | `var(--mantine-spacing-lg)` | Vertical rhythm between blocks                                        |
| `xl`  | `var(--mantine-spacing-xl)` | Large section padding                                                 |

**Current debt:** CSS Modules use raw px for internal component padding/gap
(e.g. `14px`, `12px`, `8px`, `6px`, `4px` in `InspectorPanel`, `Structure`,
`TaskTable`). These are intentional micro-adjustments inside components; new
_layout_ spacing must use the scale, and raw px should not leak into props.

---

## 4. Radius

| Token | Value (Mantine default) | Where used                                                 |
| ----- | ----------------------- | ---------------------------------------------------------- |
| `xs`  | `2px`                   | `radius="xs"` (rare)                                       |
| `sm`  | `4px`                   | Inline cells, small chips                                  |
| `md`  | `8px`                   | **Default** — cards, most surfaces                         |
| `lg`  | `16px`                  | (available)                                                |
| `xl`  | `Infinity` (pill)       | `radius="xl"` — most common; pills, avatars, round buttons |

Prefer `radius="md"` / `radius="xl"` props. CSS-module raw radii in use — treat
as **current debt**, map to the nearest token:

| Raw radius     | Location                      | Nearest token  |
| -------------- | ----------------------------- | -------------- |
| `20px`         | empty-state card              | `lg`+ / custom |
| `14px`         | structure toolbar             | between md/lg  |
| `12px`, `10px` | node, section, context menu   | `md`           |
| `8px`          | node icon, stat, actions      | `md`           |
| `6px`, `4px`   | context-menu item, breadcrumb | `sm`           |

---

## 5. Shadow / elevation

Use `shadow="sm"` / `shadow="md"` props on Mantine surfaces (the only two props
in use). CSS Modules define a layered elevation system for floating chrome —
these are the app's de-facto elevation tokens:

| Elevation      | Value                                                                                | Location                       |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| Resting node   | `0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)`                               | `Structure.module.css` `.node` |
| Hover node     | `0 6px 20px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.06)`                               | `.nodeHovered`                 |
| Toolbar        | `0 4px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)`                              | `.toolbar`                     |
| Context menu   | `0 8px 24px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)`                              | `.contextMenu`                 |
| Card hover     | `0 4px 16px rgba(0,0,0,.1)`                                                          | `KanbanCard.module.css`        |
| Glass card     | `0 8px 32px color-mix(... black 8% ...), inset 0 1px 0 color-mix(... white 12% ...)` | `Home.module.css`              |
| Selection ring | `0 0 0 3px color-mix(in srgb, <accent> 18–25%, transparent)`                         | `.nodeSelected`, highlights    |

**Pattern:** two stacked shadows (large soft + tight tight) for depth; a `0 0 0 3px`
color-mix ring for selection/focus states. Reuse these recipes rather than
inventing new blur/offset combinations.

---

## 6. Z-index

No global z-index scale is defined; layering is local. Observed ladder — keep new
values on these rungs:

| Layer                       | z-index | Location               |
| --------------------------- | ------- | ---------------------- |
| In-flow accents             | `1`–`2` | inline `zIndex`        |
| Empty state                 | `5`     | `Structure.module.css` |
| Canvas toolbar              | `10`    | `.toolbar`             |
| Breadcrumb nav              | `20`    | `.breadcrumbNav`       |
| Node actions popover        | `100`   | `.nodeActions`         |
| Overlays / analytics chrome | `200`   | inline                 |
| Context menu (top)          | `1000`  | `.contextMenu`         |

Mantine portals (Modal, Menu, Tooltip, Notifications) manage their own z-index —
do not hardcode over them.

---

## 7. Breakpoints

Mantine defaults (`xs 36em`, `sm 48em`, `md 62em`, `lg 75em`, `xl 88em`). Custom
media queries currently in use:

| Query              | Location                          | Purpose                          |
| ------------------ | --------------------------------- | -------------------------------- |
| `max-width: 48em`  | `AccountSettingsModal.module.css` | Sidebar → stacked (matches `sm`) |
| `max-width: 768px` | `Home.module.css`                 | Bento grid → single column       |

Prefer `em`-based queries aligned to Mantine's `sm` (`48em`). `768px` in
`Home.module.css` is close to `md` (`62em` = 992px) but chosen for the bento
layout — align new breakpoints to the Mantine scale unless a layout demands otherwise.

---

## 8. Icon sizes (Phosphor)

Phosphor is the only icon library (weight `regular` default). Sizes are passed as
the numeric `size` prop. Observed scale — snap to these steps:

| Size (px)        | Use                                     |
| ---------------- | --------------------------------------- |
| `9`–`11`         | Micro glyphs inside chips / dense cells |
| `12`–`13`        | Inline table / list icons               |
| `14`             | **Default** action & label icon         |
| `16`             | Standard button / header icon           |
| `18`–`24`        | Emphasis, section headers               |
| `48`, `72`, `86` | Empty-state / illustration icons        |

Always include `aria-label` on meaningful icons.

---

## Forbidden

Mirrors `STANDARDS.md → Design system enforcement`. The design scan (`/verify`
Step 2b) and `/design-check` check against this file.

- **Raw hex** in `.tsx` or new CSS (`#1d7e59`, `#fff`, …) — use a `brand.*`,
  semantic Mantine color, or `var(--mantine-color-*)`. Existing raw hex is
  tracked under §1.5 / §4 **Current debt**; do not add more.
- **Arbitrary px font sizes** — use `size="xs|sm|md|lg|xl"` or
  `var(--mantine-font-size-*)`. (`h1: 36px` is the one themed exception.)
- **Arbitrary spacing in props** — use the `xs`–`xl` scale or
  `var(--mantine-spacing-*)`. Raw px belongs only inside CSS-module component
  internals, never in a Mantine spacing prop.
- **One-off radii** — use `radius="xs|sm|md|lg|xl"`; don't introduce new px radii.
- **One-off shadows** — reuse the §5 elevation recipes; no new blur/offset combos.
- **Hardcoded z-index above Mantine portals** — stay on the §6 ladder.
- **Direct `@mantine/*` imports** — always import through `@peppermint/ui`.
- **Pinning a numeric shade for status color** — use `*-filled` / `*-light`
  semantic vars so both color schemes resolve.
- **Hand-picking text color on brand surfaces** — `autoContrast` handles it.
