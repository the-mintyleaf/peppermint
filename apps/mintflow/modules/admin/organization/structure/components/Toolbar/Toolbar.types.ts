export interface ToolbarSearchOption {
  value: string;
  label: string;
}

export interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onRefresh: () => void;
  onCollapseAll: () => void;
  searchOptions: ToolbarSearchOption[];
  searchValue: string | null;
  onSearchChange: (value: string | null) => void;
}
