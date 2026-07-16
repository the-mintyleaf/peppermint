import type {
  Department,
  FontDef,
  GuideDef,
  SizeDef,
  ThemeDef,
} from "./Onboarding.types";

/** Selectable departments (single-select chips on step 1). */
export const departments: Department[] = [
  "Home",
  "Press",
  "Finance",
  "Security",
  "Admin",
];

/** Theme swatch cards (step 2). */
export const themeDefs: ThemeDef[] = [
  { key: "Light", label: "Light", swatch: "rgb(252, 251, 249)" },
  { key: "Warm", label: "Warm", swatch: "rgb(245, 238, 230)" },
  { key: "Dark", label: "Dark", swatch: "rgb(24, 26, 29)" },
];

/** Typeface radio rows (step 2). */
export const fontDefs: FontDef[] = [
  {
    key: "Grotesk",
    name: "Space Grotesk",
    note: "Clean, geometric — default",
    stack: '"Space Grotesk", sans-serif',
  },
  {
    key: "Mono",
    name: "JetBrains Mono",
    note: "Monospaced, precise",
    stack: '"JetBrains Mono", monospace',
  },
  {
    key: "System",
    name: "System Sans",
    note: "Native to your device",
    stack: '-apple-system, "Segoe UI", sans-serif',
  },
];

/** Text-size slider stops (step 2). Index maps to `sizeIdx` state (0–3). */
export const sizeDefs: SizeDef[] = [
  { label: "Compact", px: 13 },
  { label: "Default", px: 15 },
  { label: "Large", px: 18 },
  { label: "Extra large", px: 21 },
];

/** Guidance cards (step 3). */
export const guides: GuideDef[] = [
  {
    title: "Focus Now",
    body: "Your single most urgent task, front and centre every morning.",
    tint: "rgba(238, 87, 41, 0.12)",
    fg: "rgb(238, 87, 41)",
    icon: "target",
  },
  {
    title: "Tabs & filters",
    body: "Slice tasks by status — Ongoing, On-Next, Complete — in one tap.",
    tint: "rgba(44, 110, 202, 0.12)",
    fg: "rgb(44, 110, 202)",
    icon: "list",
  },
  {
    title: "Create anywhere",
    body: "The ＋ in the nav bar spins up a new task from any screen.",
    tint: "rgba(16, 130, 85, 0.12)",
    fg: "rgb(15, 115, 75)",
    icon: "plus",
  },
];
