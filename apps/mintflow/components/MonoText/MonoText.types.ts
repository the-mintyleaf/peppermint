import type { TextProps } from "@peppermint/ui";

export interface MonoTextProps extends TextProps {
  /** Render as uppercase tracked label (section-label style). */
  label?: boolean;
  children?: React.ReactNode;
}
