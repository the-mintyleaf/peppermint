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
  /** Font size for the label. Defaults to `xs` — the quiet half of the pair. */
  labelSize?: MantineSize;
  /**
   * Font size for the value. Defaults to `sm`, one step above the label: the
   * data is what the operator came to read, so it outranks its own caption.
   * A `ReactNode` value has to carry this size itself.
   */
  valueSize?: MantineSize;
}
