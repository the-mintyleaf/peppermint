import type { ContentItem } from "@/modules/admin/shared/domain.types";

export type DraftRow = ContentItem & Record<string, unknown>;

export interface DraftsFetchResponse {
  data: DraftRow[];
  meta: { total: number; page: number; pageSize: number };
}
