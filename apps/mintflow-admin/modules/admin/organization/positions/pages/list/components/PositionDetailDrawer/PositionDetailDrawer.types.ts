import type { Position } from "../../../../positions.types";

export interface PositionDetailDrawerProps {
  position: Position | null;
  opened: boolean;
  onClose: () => void;
}
