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
  /** Server-search hits mapped to Select options. */
  searchResults: ToolbarSearchOption[];
  /** The typed search text (controlled) — drives the server query upstream. */
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  /** Fired when a result is picked — the id to jump to. */
  onSelectUnit: (value: string | null) => void;
  searchLoading?: boolean;
}
