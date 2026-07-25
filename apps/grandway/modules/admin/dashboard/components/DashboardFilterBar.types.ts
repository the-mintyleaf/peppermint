export interface DashboardFilterBarProps {
  fiscalYear: string;
  country: string;
  onFiscalYearChange: (value: string) => void;
  onCountryChange: (value: string) => void;
}
