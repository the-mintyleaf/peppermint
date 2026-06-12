export const configThemeMantineMain: any = {
  // * COLORS & SHADES
  colors: {
    brand: [
      "#f1fcf4", // 50
      "#dff9e7", // 100
      "#c1f1d0", // 200
      "#91e4ac", // 300
      "#59cf80", // 400
      "#38c768", // 500
      "#24954a", // 600
      "#20753d", // 700
      "#1e5d34", // 800
      "#1a4d2d", // 900
      "#092a16", // 950
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

  // * FONTS
  fontFamily: `"Stack Sans Text", sans-serif`,
  fontSmoothing: true,

  headings: {
    fontFamily: `"Stack Sans Headline", sans-serif`,
    sizes: {
      h1: { fontSize: "36" },
    },
  },
};
