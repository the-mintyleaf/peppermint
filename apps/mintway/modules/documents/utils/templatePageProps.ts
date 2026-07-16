export const A4_DIMENSIONS = {
  width: "210mm",
  minHeight: "297mm",
} as const;

export const configPageProps = {
  style: {
    backgroundColor: "white",
    width: A4_DIMENSIONS.width,
    minHeight: A4_DIMENSIONS.minHeight,
    aspectRatio: "210 / 297",
    fontFamily: `"Rubik", sans-serif`,
  },
} as const;
