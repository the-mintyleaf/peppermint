import type { CSSProperties, ReactNode } from "react";

export interface KpiTileProps {
  /** Uppercase mono heading, e.g. "CLOSED". */
  label: string;
  /** Primary metric string, e.g. "142". */
  value: string;
  /** Optional inline unit shown after the value, e.g. "days". */
  unit?: string;
  /** Value color; defaults to near-white. */
  valueColor?: string;
  /** Value font size (38 mobile, 46 desktop). */
  valueSize?: number;
  /** Show an accent dot beside the label (overdue emphasis). */
  headerDot?: boolean;
  /** Footer line — muted caption or a trend node. */
  footer?: ReactNode;
  /** Grid placement / sizing overrides. */
  style?: CSSProperties;
}
