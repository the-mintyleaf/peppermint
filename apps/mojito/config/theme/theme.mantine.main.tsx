export const configThemeMantineMain: any = {
  // * COLORS & SHADES
  colors: {
    brand: [
      "#effaf4", // 50
      "#d8f3e3", // 100
      "#b3e7cb", // 200
      "#82d3ad", // 300
      "#4eb98b", // 400
      "#289167", // 500
      "#1d7e59", // 600
      "#176549", // 700
      "#14513c", // 800
      "#124232", // 900
      "#09251c", // 950
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
