export interface DashboardHeaderControlsProps {
  fiscalYear: string;
  country: string;
  onFiscalYearChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onRefresh: () => void;
}
