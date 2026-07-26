import type { ReactNode } from "react";
import type { MantineSize } from "@peppermint/ui";

export interface ProfileFieldProps {
  /** Dimmed label, stacked above the value. */
  label: string;
  /**
   * The value, below the label. `null`/`undefined`/`""` renders a dimmed
   * em-dash so the pair still reads as "known field, nothing on file". A node
   * (badge, link, the stage switch) renders as-is.
   */
  value?: ReactNode;
  /** Font size for both label and value. Defaults to `xs`. */
  size?: MantineSize;
}
