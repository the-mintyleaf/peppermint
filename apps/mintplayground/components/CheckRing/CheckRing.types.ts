export interface CheckRingProps {
  done: boolean;
  /** Ring (border) color when not filled. Defaults to a muted ring. */
  ring?: string;
  /** Fill + checkmark background color when done. Defaults to accent. */
  fill?: string;
  size?: number;
  /** Makes the ring an interactive toggle button (adds a11y label). */
  onToggle?: () => void;
  "aria-label"?: string;
}
