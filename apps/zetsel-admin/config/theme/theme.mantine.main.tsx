export const configThemeMantineMain: any = {
  // * COLORS & SHADES
  colors: {
    brand: [
      "#eef7ff", // 50
      "#daecff", // 100
      "#bddfff", // 200
      "#90ccff", // 300
      "#52abff", // 400
      "#358efc", // 500
      "#1f6ff1", // 600
      "#1758de", // 700
      "#1948b4", // 800
      "#1a408e", // 900
      "#152856", // 950
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
