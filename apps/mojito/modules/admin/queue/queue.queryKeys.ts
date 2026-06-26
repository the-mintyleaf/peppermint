export const queueKeys = {
  all: ["queue"] as const,
  slots: (channelId?: string) =>
    [...queueKeys.all, "slots", channelId] as const,
  content: (channelId?: string) =>
    [...queueKeys.all, "content", channelId] as const,
} as const;
