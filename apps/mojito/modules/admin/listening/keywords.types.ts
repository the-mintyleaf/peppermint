export interface KeywordRow extends Record<string, unknown> {
  id: string;
  term: string;
  kind: "keyword" | "hashtag";
  volumeSeries: Array<{ date: Date; value: number }>;
}

export interface KeywordsFetchResponse {
  data: KeywordRow[];
  meta: { total: number; page: number; pageSize: number };
}
