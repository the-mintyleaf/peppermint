import type { MantineThemeOverride } from "@peppermint/ui";

export const configThemeMantineMain: MantineThemeOverride = {
  colors: {
    // Kamban accent — orange ramp (index 6 is the brand accent rgb(238,87,41)).
    accent: [
      "#fff1ec",
      "#ffe0d5",
      "#ffbfa9",
      "#ff9b78",
      "#f97b4f",
      "#f26535",
      "#ee5729", // 6 — primary accent
      "#cd421a",
      "#a63414",
      "#7f280f",
    ],
    // Near-black ink ramp for dark CTAs / surfaces (index 9 ≈ rgb(10,12,14)).
    ink: [
      "#f5f5f6",
      "#e6e6e8",
      "#c9cacd",
      "#a9abaf",
      "#87898e",
      "#5f6167",
      "#3f4147",
      "#26282d",
      "#16181c",
      "#0a0c0e", // 9 — ink
    ],
    // Kept for continuity with the previous mintflow palette.
    brand: [
      "#effaf4",
      "#d8f3e3",
      "#b3e7cb",
      "#82d3ad",
      "#4eb98b",
      "#289167",
      "#1d7e59",
      "#176549",
      "#14513c",
      "#124232",
    ],
  },
  primaryColor: "accent",
  // Modern Lines principle 2 — square everything, no exceptions. Setting it on
  // the theme is what makes it hold for portalled surfaces (Menu, Tooltip,
  // Drawer, Spotlight) that render outside the shell's scoped stylesheet.
  defaultRadius: 0,
  primaryShade: {
    light: 6,
    dark: 6,
  },
  autoContrast: true,
  luminanceThreshold: 0.5,

  white: "rgb(252, 251, 249)",
  black: "rgb(10, 12, 14)",

  fontFamily: `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  fontFamilyMonospace: `"JetBrains Mono", ui-monospace, monospace`,
  fontSmoothing: true,

  headings: {
    fontFamily: `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "27px", lineHeight: "1.05" },
    },
  },
};
