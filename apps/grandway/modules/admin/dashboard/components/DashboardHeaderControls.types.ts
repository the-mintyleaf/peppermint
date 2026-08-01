export interface DashboardHeaderControlsProps {
  fiscalYear: string;
  country: string;
  onFiscalYearChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onRefresh: () => void;
  /**
   * `dataUpdatedAt` of the `summary` query — the dashboard's data-freshness
   * stamp, required for a dashboard surface (DESIGN.md Part 6) because there is
   * no refresh contract and nothing polls (INTEGRATION.md §9). `0` = nothing has
   * landed yet.
   */
  fetchedAt: number;
}
