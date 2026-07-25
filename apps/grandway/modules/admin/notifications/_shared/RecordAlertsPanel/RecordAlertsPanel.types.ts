export interface RecordAlertsPanelProps {
  /**
   * One or more `source_entity_id` values to filter on. A single id is
   * enough when the record itself is what every relevant alert type keys to
   * (offers, journeys). Some records need more than one id: a checklist's
   * own alerts key to the checklist id, but its per-item alerts
   * (`checklist_item_due`/`checklist_item_overdue`) key to the *item's* id —
   * pass every id whose alerts belong on this screen.
   */
  sourceEntityId: string | string[];
}
