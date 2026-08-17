export interface ReminderAlertLinkProps {
  /**
   * The `source_entity_id` of a `custom_reminder` notification — a **reminder**
   * id, not the id of the record the reminder concerns.
   */
  reminderId: string;
  /**
   * Fired when the reader follows the link. The notification feed uses it to
   * mark the alert read, exactly as it does for the generic "View record"
   * button — following a link is the same act whichever control renders it.
   */
  onNavigate?: () => void;
}
