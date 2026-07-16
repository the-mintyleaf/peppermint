export type CaseIconKind = "case" | "press" | "folder" | "finance" | "security";

export interface CaseIconProps {
  kind: CaseIconKind;
  /** Icon stroke color. */
  color?: string;
  /** Tinted background of the rounded square. */
  tint?: string;
  /** Outer square size (px). */
  size?: number;
  /** Icon size (px); defaults to ~48% of `size`. */
  iconSize?: number;
  radius?: number;
}
