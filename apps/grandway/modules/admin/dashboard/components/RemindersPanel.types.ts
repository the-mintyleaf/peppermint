/**
 * No props. Unlike every other card on this page, Follow-ups takes no
 * `filters` — reminders carry neither a country nor the dashboard's fiscal-year
 * concept, so passing them would imply a narrowing that never happens.
 */
export type RemindersPanelProps = Record<string, never>;
