import type { ReactNode } from "react";
import type { MantineSize } from "@peppermint/ui";

export interface DetailFieldProps {
  /** Dimmed label — left of the value, or above it when `stacked`. */
  label: string;
  /**
   * The value. A `null`/empty string renders a dimmed em-dash so the pair still
   * reads as "known field, no value on file".
   */
  value?: ReactNode;
  /** Font size for both label and value. Defaults to `xs`. */
  size?: MantineSize;
  /**
   * Put the value on its own line below the label, left-aligned and
   * newline-preserving. For free text that reads as prose rather than as a
   * property. Defaults to `false`.
   */
  stacked?: boolean;
}
