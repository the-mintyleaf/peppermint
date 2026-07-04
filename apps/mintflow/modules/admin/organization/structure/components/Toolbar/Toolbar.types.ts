export interface ToolbarSearchOption {
  value: string;
  label: string;
}

export interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onRefresh: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isFullyCollapsed: boolean;
  searchOptions: ToolbarSearchOption[];
  searchValue: string | null;
  onSearchChange: (value: string | null) => void;
}
