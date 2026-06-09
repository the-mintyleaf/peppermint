export const calendarQueryKeys = {
  entries: (from: string, to: string) => ["calendar", "entries", from, to] as const,
};
