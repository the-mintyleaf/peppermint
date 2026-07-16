export const taskAnalyticsQueryKeys = {
  dashboard: (month: string) => ["tasks", "analytics", month] as const,
};
