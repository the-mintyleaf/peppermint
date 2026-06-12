import { contentKeys } from "../content/content.queryKeys";

export const approvalsKeys = {
  list: (filters?: Record<string, unknown>) =>
    contentKeys.list({ status: "pending_review", ...filters }),
} as const;
