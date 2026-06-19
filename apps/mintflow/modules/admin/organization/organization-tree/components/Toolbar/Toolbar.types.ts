export interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoArrange: (layoutMode: "compact" | "expanded") => void;
  canUndo: boolean;
  canRedo: boolean;
  activeDepartmentId: string | null;
  activeDepartmentName: string | null;
  onClearActiveDepartment: () => void;
  viewMode: "explorer" | "fullmap";
  onToggleViewMode: () => void;
  onCollapseAll: () => void;
  focusedBranchId: string | null;
  onClearFocusBranch: () => void;
  onBackToParent: () => void;
  onFitVisible: () => void;
}
