import type { ReactNode } from "react";
import type { MantineSize } from "@peppermint/ui";

export interface DetailFieldProps {
  /** Dimmed label, stacked above the value. */
  label: string;
  /**
   * The value, below the label. A `null`/empty string renders a dimmed em-dash
   * so the pair still reads as "known field, no value on file".
   */
  value?: ReactNode;
  /** Font size for both label and value. Defaults to `xs`. */
  size?: MantineSize;
}
