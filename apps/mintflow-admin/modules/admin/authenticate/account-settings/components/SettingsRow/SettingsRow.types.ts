import type { ReactNode } from "react";

export interface SettingsRowProps {
  label: string;
  /** Secondary line under the label — describes the setting. */
  description?: string;
  /** Right-aligned content: a read-only value, a button, or a badge. */
  right?: ReactNode;
}
