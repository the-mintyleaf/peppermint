import type { MantineThemeOverride } from "@peppermint/ui";

export const configThemeMantineMain: MantineThemeOverride = {
  colors: {
    brand: [
      "#fff9ed",
      "#fff2d4",
      "#ffe2a8",
      "#ffcd71",
      "#ffb54d",
      "#fe9211",
      "#ef7607",
      "#c65908",
      "#9d460f",
      "#7e3b10",
      "#441c06",
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
