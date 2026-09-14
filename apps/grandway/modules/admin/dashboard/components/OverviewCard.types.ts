import type { ComponentType, ReactNode } from "react";
import type { FigureTone } from "../dashboard.tone";

export interface OverviewCardProps {
  /** The card's subject, in the operator's vocabulary. Set in the tinted strip. */
  label: string;
  icon: ComponentType<{ size?: number }>;
  /**
   * Derived per render from the figures the card carries — `toneForAlert` for a
   * single one, `worstTone` for several. Never a fixed colour chosen at the call
   * site, or the wall stops re-colouring itself as the day moves.
   */
  tone?: FigureTone;
  /** Footer line — what the figures count over, or where the card leads. */
  caption?: string;
  /** The figure, the chart, or the meters. Given a fixed height so every card agrees. */
  children: ReactNode;
  isPending?: boolean;
  isError?: boolean;
  /** Makes the whole card a button. Omit for a card with no destination. */
  onActivate?: () => void;
  /** Accessible name for the `onActivate` control. */
  activateLabel?: string;
}

export interface OverviewFigureProps {
  /** `undefined` while loading; renders `—` (never `0`) when the fetch failed. */
  value: number | undefined;
  isPending?: boolean;
  isError?: boolean;
  /**
   * Optional denominator, drawn as a thin share track under the figure. Only
   * pass one the SAME request supplies — a share against a number from another
   * endpoint is two clocks pretending to be one fraction.
   */
  share?: { of: number | undefined; label: string };
}
