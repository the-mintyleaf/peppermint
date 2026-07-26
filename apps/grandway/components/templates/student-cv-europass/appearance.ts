/**
 * Shared appearance constants + helpers for the Europass CV template. Kept next to the
 * renderer so the template (this folder), the form, and the right-nav ConfigBar all read
 * one source of truth for defaults, swatches, and the font/contrast mapping.
 */

export type EuropassFontFamily = "serif" | "sans";

export interface EuropassAppearance {
  headerColor: string;
  fontFamily: EuropassFontFamily;
}

export const DEFAULT_EUROPASS_APPEARANCE: EuropassAppearance = {
  headerColor: "#f3f3f3",
  fontFamily: "sans",
};

/** Preset header-band colors offered as swatches in the Customizations panel. */
export const EUROPASS_HEADER_SWATCHES: Array<{ label: string; value: string }> =
  [
    { label: "Europass grey", value: "#f3f3f3" },
    { label: "Brand blue", value: "#1558d6" },
    { label: "Teal", value: "#0f766e" },
    { label: "Maroon", value: "#7f1d1d" },
    { label: "Slate", value: "#334155" },
  ];

const SERIF_STACK = "'Times New Roman', Georgia, serif";
const SANS_STACK = "Arial, Helvetica, 'Segoe UI', sans-serif";

export function fontStackFor(family: EuropassFontFamily | undefined): string {
  return family === "serif" ? SERIF_STACK : SANS_STACK;
}

/**
 * Returns a near-black or white text color that reads legibly on `hex`, using perceived
 * brightness (sRGB weighted). Falls back to dark text for any unparseable value.
 */
export function readableTextColor(hex: string | undefined): string {
  const rgb = parseHex(hex);
  if (!rgb) return "#111111";
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 / 255;
  return brightness > 0.6 ? "#111111" : "#ffffff";
}

function parseHex(
  hex: string | undefined,
): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6 || /[^0-9a-fA-F]/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}
