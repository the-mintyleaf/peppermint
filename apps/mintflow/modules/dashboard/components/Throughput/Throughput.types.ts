import type { CSSProperties } from "react";

import type { ThroughputBar } from "../../Dashboard.types";

export interface ThroughputProps {
  bars: ThroughputBar[];
  /** Range caption, e.g. "Mon–Sun". */
  periodLabel: string;
  /** Mobile = fixed 96px bar row; desktop = bars fill height + counts above. */
  variant: "mobile" | "desktop";
  /** Grid placement / sizing overrides. */
  style?: CSSProperties;
}
