import type { Position } from "../../../../positions.types";

export interface PositionRowActionsMenuProps {
  position: Position;
  onViewDetails: (position: Position) => void;
}
