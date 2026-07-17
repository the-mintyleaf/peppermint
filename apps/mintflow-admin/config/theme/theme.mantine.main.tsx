import type { MantineThemeOverride } from "@peppermint/ui";

export const configThemeMantineMain: MantineThemeOverride = {
  colors: {
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
      "#09251c",
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
