export type OnboardingStep = 1 | 2 | 3;

export type Department = "Home" | "Press" | "Finance" | "Security" | "Admin";

export type ThemeKey = "Light" | "Warm" | "Dark";

export type FontKey = "Grotesk" | "Mono" | "System";

export type GuideIconKey = "target" | "list" | "plus";

export interface ThemeDef {
  key: ThemeKey;
  label: string;
  /** Swatch preview color. */
  swatch: string;
}

export interface FontDef {
  key: FontKey;
  name: string;
  note: string;
  /** CSS font-family stack used for the "Ag" preview + label. */
  stack: string;
}

export interface SizeDef {
  label: string;
  /** Preview font size in px. */
  px: number;
}

export interface GuideDef {
  title: string;
  body: string;
  /** Tinted icon-square background. */
  tint: string;
  /** Icon foreground color. */
  fg: string;
  icon: GuideIconKey;
}

export interface StepDetailsProps {
  fullName: string;
  onFullName: (value: string) => void;
  email: string;
  onEmail: (value: string) => void;
  dept: Department;
  onDept: (dept: Department) => void;
}

export interface StepPreferencesProps {
  theme: ThemeKey;
  onTheme: (theme: ThemeKey) => void;
  font: FontKey;
  onFont: (font: FontKey) => void;
  sizeIdx: number;
  onSizeIdx: (idx: number) => void;
}
