export interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoArrange: () => void;
  onSave: () => void;
  onTogglePeople: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saved: boolean;
  showPeople: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  nodeCount: number;
}
