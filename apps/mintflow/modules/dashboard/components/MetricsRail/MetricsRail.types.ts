import type { Kpi, Momentum } from "../../module.api";

export interface MetricsRailProps {
  kpis: Kpi[];
  momentum: Momentum;
  onKpiAction: (kpi: Kpi) => void;
  onPlanTomorrow: () => void;
}
