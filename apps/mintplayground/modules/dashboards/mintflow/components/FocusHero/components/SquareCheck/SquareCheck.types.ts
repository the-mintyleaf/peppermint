export interface SquareCheckProps {
  done: boolean;
  onToggle: () => void;
  /** px size of the square (default 24). */
  size?: number;
}
