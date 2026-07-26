import type { ReactNode } from "react";

export interface StackedMeterSegment {
  /** Segment magnitude. */
  value: number;
  /** Mantine color name or hex. */
  color: string;
  /** Accessible/legend label for the segment. */
  label: string;
}

export interface StackedMeterProps {
  /** Left-hand row label. */
  label: ReactNode;
  /** Ordered segments, drawn left→right. */
  segments: StackedMeterSegment[];
  /** Scale the whole bar against this (usually the max row total across siblings). */
  max: number;
  /** Fixed label column width in px so a group of rows aligns. */
  labelWidth?: number;
  /** Right-hand trailing content — a total, or per-segment metric texts. */
  trailing?: ReactNode;
}
