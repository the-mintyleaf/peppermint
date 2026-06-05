// ─── Page Configuration Props ──────────────────────────────────────────────────
// Props for A4-sized pages used in document templates (certificates, statements)

export const configPageProps = {
  style: {
    backgroundColor: "white",
    aspectRatio: "8.3 / 11.7",
    fontFamily: `"Rubik", sans-serif`,
  },
} as const;
