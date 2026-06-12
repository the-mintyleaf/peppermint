export const calendarQueryKeys = {
  entries: (from: string, to: string, filters?: Record<string, unknown>) =>
    ["calendar", "entries", from, to, filters] as const,
};
