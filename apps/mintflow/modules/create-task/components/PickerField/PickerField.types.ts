import type { ReactNode } from "react";

import type { PickerOption } from "../../CreateTask.types";

export interface PickerFieldProps {
  /** Leading icon in the label column. */
  icon: ReactNode;
  /** Label text. */
  label: string;
  /** Selectable options. */
  options: PickerOption[];
  /** Currently selected option key. */
  value: string;
  /** Whether this field's dropdown is expanded. */
  open: boolean;
  /** Show a leading dot on the selected chip (Status only). */
  chipDot?: boolean;
  /** Toggle this field's dropdown open/closed. */
  onToggle: () => void;
  /** Select an option by key (also closes the dropdown). */
  onSelect: (key: string) => void;
}
