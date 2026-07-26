/**
 * Shared appearance constants + helpers for the Europass CV template. Kept next to the
 * renderer so the template (this folder), the form, and the right-nav ConfigBar all read
 * one source of truth for defaults, swatches, and the font/contrast mapping.
 */

export type EuropassFontFamily = "serif" | "sans";

/** Brightness step applied to the chosen header color, lightest → darkest. */
export type EuropassBrightness =
  | "light-2"
  | "light-1"
  | "default"
  | "dark-1"
  | "dark-2";

export interface EuropassAppearance {
  headerColor: string;
  headerBrightness: EuropassBrightness;
  fontFamily: EuropassFontFamily;
}

export const DEFAULT_EUROPASS_APPEARANCE: EuropassAppearance = {
  headerColor: "#f3f3f3",
  headerBrightness: "default",
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

/**
 * Brightness steps offered per header color. `mix` blends the base color toward white
 * (positive) or black (negative) by that fraction; `default` (0) is the base color itself.
 */
export const EUROPASS_BRIGHTNESS_LEVELS: Array<{
  value: EuropassBrightness;
  label: string;
  mix: number;
}> = [
  { value: "light-2", label: "Light 2", mix: 0.4 },
  { value: "light-1", label: "Light 1", mix: 0.2 },
  { value: "default", label: "Default", mix: 0 },
  { value: "dark-1", label: "Dark 1", mix: -0.2 },
  { value: "dark-2", label: "Dark 2", mix: -0.4 },
];

/**
 * Blends `hex` toward white (mix > 0) or black (mix < 0) by |mix|. Returns the input
 * unchanged when it can't be parsed, so an unexpected value never breaks rendering.
 */
export function shadeHex(hex: string, mix: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const target = mix >= 0 ? 255 : 0;
  const t = Math.min(1, Math.abs(mix));
  const channel = (c: number) =>
    Math.round(c + (target - c) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

/** Resolves the displayed header background from a base color + brightness step. */
export function resolveHeaderColor(
  headerColor: string | undefined,
  brightness: EuropassBrightness | undefined,
): string {
  const base = headerColor || DEFAULT_EUROPASS_APPEARANCE.headerColor;
  const level = EUROPASS_BRIGHTNESS_LEVELS.find((l) => l.value === brightness);
  return shadeHex(base, level?.mix ?? 0);
}

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
