export const contentKeys = {
  all: ["content"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...contentKeys.lists(), { filters }] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
} as const;
