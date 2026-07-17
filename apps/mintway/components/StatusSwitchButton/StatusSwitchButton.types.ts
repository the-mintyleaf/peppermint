import type { ComponentPropsWithoutRef } from "react";
import type { ButtonProps } from "@peppermint/ui";

/**
 * A status-switch trigger. Everything a Mantine `Button` accepts (including the DOM
 * handlers/ref that `Menu.Target` injects), minus the slots this component owns
 * (`children`, `rightSection`), plus the required `label` and status `color`.
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
}
