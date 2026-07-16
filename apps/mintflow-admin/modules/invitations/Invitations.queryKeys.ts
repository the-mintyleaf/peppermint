export const invitationsQueryKeys = {
  mine: (status?: string) => ["memberships", "mine", status ?? "all"] as const,
};
