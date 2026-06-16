export const configThemeMantineMain: any = {
  // * COLORS & SHADES
  colors: {
    brand: [
      "#f1f4fd", // 50
      "#e0e7f9", // 100
      "#c7d5f6", // 200
      "#a1baef", // 300
      "#7496e6", // 400
      "#5373de", // 500
      "#4159d2", // 600
      "#3545c0", // 700
      "#313a9c", // 800
      "#2c357c", // 900
      "#1f234c", // 950
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
