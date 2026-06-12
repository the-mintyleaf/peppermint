import { contentKeys } from "../content/content.queryKeys";

export const draftsKeys = {
  list: (filters?: Record<string, unknown>) =>
    contentKeys.list({ status: "draft", ...filters }),
} as const;
