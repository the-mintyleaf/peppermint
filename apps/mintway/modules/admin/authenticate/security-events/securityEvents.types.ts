import type { SecurityEvent } from "@/modules/admin/authenticate/_shared/authenticate.types";

export type { SecurityEvent };

export interface SecurityEventsFetchResponse {
  data: SecurityEvent[];
  meta: { total: number } & Record<string, unknown>;
}
