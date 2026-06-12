import type { Platform } from "../shared/domain.types";

export interface CompetitorRow extends Record<string, unknown> {
  id: string;
  handle: string;
  platform: Platform;
  volumeSeries: Array<{ date: Date; value: number }>;
}

export interface CompetitorsFetchResponse {
  data: CompetitorRow[];
  meta: { total: number; page: number; pageSize: number };
}
