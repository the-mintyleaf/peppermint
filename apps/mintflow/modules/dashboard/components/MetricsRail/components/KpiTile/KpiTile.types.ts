import type { Kpi } from "../../../../module.api";

export interface KpiTileProps {
  kpi: Kpi;
  onAction: (kpi: Kpi) => void;
}
