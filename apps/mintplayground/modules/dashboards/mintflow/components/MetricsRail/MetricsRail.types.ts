import type { Kpi, Momentum } from "../../module.api";

export interface MetricsRailProps {
  kpis: Kpi[];
  momentum: Momentum;
  onPlanTomorrow: () => void;
}
