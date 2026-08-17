/**
 * The overlay layers this module participates in, named once rather than
 * guessed at each call site.
 *
 * Mantine's defaults are 200 for a modal and 300 for a popover — fine in
 * isolation, wrong here, for two compounding reasons:
 *
 * 1. **The reminders panel can be hosted inside a modal.** The applicants list
 *    opens it that way, so the form it launches must sit above 200. Two modals
 *    sharing a layer leaves the order to DOM insertion, which is not a
 *    guarantee worth resting a blocked form on.
 * 2. **Once the form is above 200, its own date picker is not.** A popover on
 *    the default 300 renders *behind* a form at 400 — the calendar opens
 *    invisibly and the field looks broken.
 *
 * So the order is stated explicitly and must stay strictly increasing:
 * host modal (200) < form < picker < confirm.
 */
export const REMINDER_LAYER = {
  /** The create/reschedule form, above a possible host modal. */
  form: 400,
  /** The form's date picker, above the form it belongs to. */
  picker: 450,
  /**
   * Discard and dismiss confirms, above everything.
   *
   * A confirm is the one surface that must never be obscured: it is the last
   * point at which someone can stop an irreversible action.
   */
  confirm: 500,
} as const;
