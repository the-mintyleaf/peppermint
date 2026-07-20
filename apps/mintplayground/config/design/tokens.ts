/**
 * Kamban design tokens — fixed brand values extracted from the Claude Design
 * mockups. These are color-scheme independent (the app is predominantly the
 * warm "paper" light surface; the dashboard uses the dark tile surface).
 *
 * Keep in sync with the `--k-*` CSS variables in `app/globals.css`.
 * Prefer these constants in component `style`/props; use the CSS vars only in
 * `.module.css` files (animations, pseudo-elements).
 */
export const tokens = {
  ink: "rgb(10, 12, 14)",
  paper: "rgb(252, 251, 249)",
  paper2: "rgb(244, 242, 238)",

  accent: "rgb(238, 87, 41)",
  accentDark: "rgb(205, 66, 26)",
  accentSoft: "rgba(238, 87, 41, 0.1)",
  accentGlow: "rgba(238, 87, 41, 0.35)",

  blue: "rgb(106, 168, 255)",
  blueInk: "rgb(44, 110, 202)",
  blueSoft: "rgba(44, 110, 202, 0.1)",

  green: "rgb(30, 120, 75)",
  greenSoft: "rgb(143, 226, 182)",
  greenTint: "rgba(16, 130, 85, 0.1)",

  purpleInk: "rgb(102, 72, 180)",
  purpleSoft: "rgba(120, 90, 200, 0.1)",

  tile: "#171719",
  tileDeep: "#0a0a0b",

  /** hairline dividers over the paper surface */
  line: "rgba(0, 0, 0, 0.07)",
  lineStrong: "rgba(0, 0, 0, 0.12)",

  /** muted foregrounds over paper */
  muted: "rgba(0, 0, 0, 0.42)",
  muted2: "rgba(0, 0, 0, 0.5)",

  mono: '"JetBrains Mono", ui-monospace, monospace',

  radius: {
    card: 18,
    tile: 24,
    pill: 20,
    sheet: 30,
  },
  shadow: {
    card: "0 1px 0 rgba(0,0,0,0.02), 0 14px 34px rgba(20,30,40,0.1)",
    nav: "0 14px 32px rgba(20,30,40,0.22)",
    fab: "0 12px 28px rgba(20,30,40,0.28)",
  },
} as const;

/** Category badge palette (task categories) — fg over a soft tinted bg. */
export const categoryStyles: Record<string, { fg: string; bg: string }> = {
  GENERAL: { fg: "rgb(44,110,202)", bg: "rgba(44,110,202,0.1)" },
  PRESS: { fg: "rgb(205,66,26)", bg: "rgba(238,87,41,0.1)" },
  SECURITY: { fg: "rgb(15,115,75)", bg: "rgba(16,130,85,0.1)" },
  FINANCE: { fg: "rgb(102,72,180)", bg: "rgba(120,90,200,0.1)" },
  ADMIN: { fg: "rgba(0,0,0,0.6)", bg: "rgba(0,0,0,0.06)" },
};

/** Status dot colors used across task lists. */
export const statusDot: Record<string, string> = {
  Ongoing: "rgb(106,168,255)",
  "On-Next": "rgb(245,125,27)",
  Complete: "rgb(143,226,182)",
};

export type Tokens = typeof tokens;
