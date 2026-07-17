import type { MantineThemeOverride } from "@peppermint/ui";

export const configThemeMantineMain: MantineThemeOverride = {
  colors: {
    brand: [
      "#eff4ff",
      "#dbe6fe",
      "#bfd4fe",
      "#92b8fe",
      "#5f93fb",
      "#3a6cf7",
      "#2c52ed",
      "#1c38d9",
      "#1d2eb0",
      "#1d2d8b",
      "#171e54",
    ],
  },
  primaryColor: "brand",
  primaryShade: {
    light: 6,
    dark: 5,
  },
  autoContrast: true,
  luminanceThreshold: 0.5,

  white: "#fefefe",
  black: "#111",

  fontFamily: `"Stack Sans Headline", sans-serif`,
  fontSmoothing: true,

  headings: {
    fontFamily: `"Stack Sans Headline", sans-serif`,
    sizes: {
      h1: { fontSize: "36" },
    },
  },
};
