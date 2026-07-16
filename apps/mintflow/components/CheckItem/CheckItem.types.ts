import type { ReactNode } from "react";

export interface CheckItemProps {
  title: ReactNode;
  done: boolean;
  onToggle?: () => void;
  /** Secondary line under the title (e.g. category). */
  subtitle?: ReactNode;
  /** Trailing slot (meta text, remove button). */
  right?: ReactNode;
  ring?: string;
  fill?: string;
  ringSize?: number;
  /** Title color when not done. */
  titleColor?: string;
  fz?: string;
  align?: "center" | "flex-start";
  "aria-label"?: string;
}
