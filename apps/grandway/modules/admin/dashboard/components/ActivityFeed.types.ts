export interface ActivityFeedProps {
  /** Only `fiscal_year` is honoured here — `country` is deliberately not accepted (see `dashboard.api.ts`). */
  fiscalYear: string;
}
