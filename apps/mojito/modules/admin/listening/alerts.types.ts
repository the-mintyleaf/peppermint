export interface AlertRow extends Record<string, unknown> {
  id: string;
  type: "volume_spike" | "crisis" | "keyword_mention";
  text: string;
  read: boolean;
  triggeredAt: Date;
}

export interface AlertsFetchResponse {
  data: AlertRow[];
  meta: { total: number; page: number; pageSize: number };
}
