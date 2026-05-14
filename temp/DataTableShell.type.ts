import type { PropTabsTab } from "@settle/admin";

// ─────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────

type PropSustained = {
  sustained?: boolean;
};

type PropIdAccessor = {
  idAccessor?: string;
};

type PropRowStyle = {
  // row-styles
  enableRowStyle?: boolean;
  rowColor?: string;
  rowBackgroundColor?: string;
  rowStyle?: any;
};

type PropServerSearch = {
  hasServerSearch?: boolean;
};

type PropRowExpansion = {
  rowExpansion?: any;
};

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────

export type PropDataTableHeader = {
  moduleInfo: any;
  newButtonHref?: string;
  sustained?: boolean;
  onNewClick?: () => void;
  disableCreateButton?: boolean;
  customHeading?: string;
};

// ─────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────

export type PropDataTableToolbar = PropSustained & {
  moduleInfo: any;
  tabs: PropTabsTab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  customColumns: any[];
  hideFilters?: boolean;
  filterList: any[];
  setCustomColumns?: any;
  onToggleColumn?: any;
  onResetColumns?: any;
  // Mobile new button props
  newButtonHref?: string;
  onNewClick?: () => void;
  disableCreateButton?: boolean;
};

// ─────────────────────────────────────────────
// DataTable config
// ─────────────────────────────────────────────

export type PropDataTableShellDataTable = PropRowStyle &
  PropServerSearch &
  PropRowExpansion & {
    customColumns?: any[];
    pageSizes?: number[];
    forceFilter?: (data: any) => any;
    disableActions?: boolean;
    columns: any[];
  } & PropIdAccessor;

// ─────────────────────────────────────────────
// Shell (full table wrapper)
// ─────────────────────────────────────────────

export type PropDataTableShell = PropSustained &
  PropDataTableHeader &
  PropDataTableShellDataTable & {
    tabs?: PropTabsTab[];
    hideFilters?: boolean;
    filterList: any[];
    tableActions?: any[];
    sortStatus?: any;
    newButtonHref?: string;
    onNewClick?: () => void;
    onEditClick?: (record: any) => void;
    onDeleteClick?: (ids: (string | number)[]) => void | Promise<void>;
    onReviewClick?: (record: any) => void;
    disableCreateButton?: boolean;
    disableEditButton?: boolean;
    disableDeleteButton?: boolean;
    disableReviewButton?: boolean;
  };

export type PropDataTableShellActions = PropIdAccessor & PropSustained & {
  onNewClick?: () => void;
  onEditClick?: (record: any) => void;
  onDeleteClick?: (ids: (string | number)[]) => void;
  onReviewClick?: (record: any) => void;
  disableEditButton?: boolean;
  disableDeleteButton?: boolean;
  disableReviewButton?: boolean;
};
