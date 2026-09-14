export interface AvailabilityFieldsProps {
  disabled?: boolean;
  /** Label for the status Select. Defaults to "Availability". */
  label?: string;
  /** Description under the status Select. Defaults to none. */
  description?: string;
  /**
   * Render the note alongside the status. Defaults to `true`. Pass `false`
   * only where the form deliberately doesn't collect a note — the backend
   * still requires one for any non-active status, so such a form must not send
   * `availability_note` at all and leave the stored value alone.
   */
  withNote?: boolean;
}
