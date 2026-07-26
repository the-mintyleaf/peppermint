import type { ReactNode } from "react";

export interface DetailFieldProps {
  /** Dimmed left-hand label. */
  label: string;
  /**
   * Right-hand value. A `null`/empty string renders a dimmed em-dash so the
   * row still reads as "known field, no value on file".
   */
  value?: ReactNode;
}
