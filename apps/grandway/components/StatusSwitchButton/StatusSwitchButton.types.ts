import type { ComponentPropsWithoutRef } from "react";
import type { ButtonProps } from "@peppermint/ui";

/**
 * A status-switch trigger. Everything a Mantine `Button` accepts (including the
 * DOM handlers/ref that `Menu.Target` injects), minus the slots this component
 * owns (`children`, `rightSection`), plus the required `label` and status
 * `color`.
 */
export interface StatusSwitchButtonProps
  extends
    Omit<ButtonProps, "color" | "children" | "rightSection">,
    Omit<
      ComponentPropsWithoutRef<"button">,
      "color" | "children" | keyof ButtonProps
    > {
  /** Text shown next to the status dot. */
  label: string;
  /** Mantine palette name (e.g. `"teal"`) — tints the button and the dot. */
  color: string;
  /**
   * Terminal state — the record has reached the end of its track. Swaps the
   * caret affordance for a check mark; pair with a `Menu` that only offers a
   * way back (e.g. Reopen) so the pill reads as a settled status.
   */
  terminal?: boolean;
}
