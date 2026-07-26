import type { ReactNode } from "react";

/**
 * A remark-required transition — one that can't be a plain inline confirm
 * because it collects extra fields (a loss reason, a defer intake, an outcome).
 * Selecting it closes the switch and hands off to `onClick`, which opens the
 * matching structured modal in the parent.
 */
export interface InlineStageSwitchAction {
  /** Menu item text, e.g. "Mark as lost". */
  label: string;
  /** Opens the structured modal in the parent wrapper. */
  onClick: () => void;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Mantine palette name — red for destructive transitions. */
  color?: string;
}

export interface InlineStageSwitchProps {
  /** The record's current stage/status value. */
  current: string;
  /** Palette name per value — tints the pill, the dots, and the confirm button. */
  colorMap: Record<string, string>;
  /** Human label per value. */
  labelMap: Record<string, string>;
  /**
   * Plain transitions offered for inline confirmation. Must already exclude
   * `current`. Empty when the record is terminal.
   */
  targets: string[];
  /**
   * Runs the mutation for a picked plain transition. Resolves on success (the
   * switch then closes) and rejects on error (the confirm panel stays open; the
   * error surfaces through the app's mutation notification).
   */
  onConfirm: (value: string) => Promise<unknown>;
  /** Remark-required transitions rendered below a divider; each opens a modal. */
  actions?: InlineStageSwitchAction[];
  /** No plain targets left — the pill shows a check instead of a caret. */
  terminal?: boolean;
  /** Render a read-only badge with no lever (e.g. no permission). */
  disabled?: boolean;
  /** Record identifier woven into the control's aria-label, e.g. the name. */
  entityLabel: string;
  /** Section label above the target list, e.g. "Move to stage" / "Set status". */
  menuLabel?: string;
}
