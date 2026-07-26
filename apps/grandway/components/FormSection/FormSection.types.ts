import type { ReactNode } from "react";

/**
 * A titled form section: a leading rule, a heading row (title left, optional
 * subtle actions right), an optional dimmed helper line, then the fields.
 * Replaces the older bordered `Fieldset legend=` grouping so every multi-section
 * form reads the same. Presentation only — carries no form state, so it drops
 * into `FormWrapper` and raw `useForm` forms alike.
 */
export interface FormSectionProps {
  /** Section heading, rendered as `Text fw={600} size="sm"`. */
  title: string;
  /**
   * Right-aligned slot in the heading row — the home for a section's controls:
   * a decision toggle (a single subtle `Button` for two modes, a `Menu` for
   * more), an "Add row" action, etc. Use `variant="subtle" size="xs"`.
   */
  actions?: ReactNode;
  /** Optional dimmed helper shown under the heading, above the fields. */
  description?: ReactNode;
  /** The section's form fields. */
  children: ReactNode;
}
