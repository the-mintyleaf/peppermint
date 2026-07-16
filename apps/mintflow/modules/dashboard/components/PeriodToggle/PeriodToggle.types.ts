import type { Period } from "../../Dashboard.types";

export interface PeriodToggleProps {
  period: Period;
  onChange: (period: Period) => void;
}
