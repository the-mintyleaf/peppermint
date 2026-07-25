import type { ReactNode } from "react";

export interface SectionStateProps {
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  isRetrying?: boolean;
  /** Renders a dimmed message instead of `children` when true (an honest "nothing yet", not a spinner). */
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Skeleton height while `isPending` — tune per section (a six-row worklist vs. a single stat strip). */
  skeletonHeight?: number;
  children: ReactNode;
}
