/** One slice of the composition — a real part of the whole, never a fabricated trend. */
export interface CompositionSegment {
  key: string;
  /** Short noun for the slice (e.g. "Active"). */
  label: string;
  /** The count this slice represents. */
  count: number;
  /** Mantine theme color for the ring section + legend dot. */
  color: string;
}

/**
 * A part-of-whole card: a donut ring of segments that genuinely sum to a population
 * (e.g. engagement health = Active + On hold + Lost), with a legend carrying the raw
 * counts. The dashboard's single composition visual — honest because the parts are a
 * real whole, not a decorative chart (DESIGN.md Layer 2).
 */
export interface CompositionCardProps {
  segments: CompositionSegment[];
  /** Caption under the center total (e.g. "engaged"). */
  centerCaption: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
}
