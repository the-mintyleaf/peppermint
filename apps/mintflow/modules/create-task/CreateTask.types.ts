export interface CreateTaskProps {
  /** Close the hosting sheet (called on cancel and after create). */
  onClose: () => void;
}

/** Which inline property picker is currently expanded (single-open). */
export type PickerKind = "status" | "priority";

/** A selectable option in the Status / Priority inline dropdowns. */
export interface PickerOption {
  /** Stable option key persisted in form state. */
  key: string;
  /** Human-readable label shown in the chip + dropdown row. */
  label: string;
  /** Leading dot color (dropdown rows + status chip). */
  dot?: string;
  /** Foreground (text) color of the chip. */
  fg: string;
  /** Background tint of the chip. */
  bg: string;
  /** Border color of the chip. */
  border: string;
}

/** A single sub-task line in the sub-tasks card. */
export interface SubTask {
  id: number;
  title: string;
  done: boolean;
}
