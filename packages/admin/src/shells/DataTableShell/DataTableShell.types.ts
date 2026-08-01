import type { ElementType, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import type {
  DataTableColumn,
  DataTableRowExpansionProps,
} from "mantine-datatable";
import type {
  AccessAccount,
  AccessLevel,
  AccessMenuChange,
  AccessMenuData,
  AccessRole,
} from "@peppermint/ui";
import type {
  FilterState,
  DataTableWrapperProps,
} from "../../wrappers/DataTableWrapper";

export type ModuleAccessLevel = AccessLevel;
export type ModuleAccessAccount = AccessAccount;
export type ModuleAccessRole = AccessRole;
export type DataTableShellModuleAccess = AccessMenuData;
export type DataTableShellModuleAccessChange = AccessMenuChange;

export interface DataTableShellTab {
  label: string;
  /** Optional icon component (Phosphor icon) */
  icon?: React.ReactNode | React.ComponentType<any>;
  /** Merged into store.setFilters on tab switch — sent to server in server mode. */
  filter?: FilterState;
  /** Applied client-side after the wrapper resolves rows. */
  forceFilter?: <T>(rows: T[]) => T[];
}

export type DataTableColumnFilterType = "text" | "select" | "number" | "date";

export type DataTableShellColumnIcon = Icon | ReactNode;

export interface DataTableColumnFilter {
  type?: DataTableColumnFilterType;
  icon?: Icon;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export type DataTableShellColumn<T extends object = Record<string, unknown>> =
  Omit<DataTableColumn<T>, "filter"> & {
    /** Key used in columnVisibility map. Defaults to String(accessor). */
    key?: string;
    /** Initial visibility before any user preference. Defaults to true. */
    defaultVisible?: boolean;
    /** When set, column appears in the filter picker. */
    filter?: DataTableColumnFilter;
    /** Icon rendered beside the column title in the table header. */
    icon?: DataTableShellColumnIcon;
  };

export interface DataTableShellModuleInfo {
  /** Used as the persistence storageKey and the "New X" button label. */
  name: string;
  /** Human-readable display label. Defaults to name. */
  label?: string;
  description?: string;
  /** Fallback for the Edited label when lastEditedAt is not set. */
  updatedAt?: string | Date;
}

export interface DataTableShellProps<
  T extends object = Record<string, unknown>,
> extends Omit<DataTableWrapperProps<T>, "children" | "persistence"> {
  columns: DataTableShellColumn<T>[];
  moduleInfo: DataTableShellModuleInfo;
  /** Row unique id field. Defaults to 'id'. */
  idAccessor?: string;
  /**
   * Base path used to build navigation hrefs (e.g. `/admin/users`).
   * New button navigates to `${basePath}/new`, edit to `${basePath}/${id}/edit`, etc.
   * Falls back to `newButtonHref` for the New button.
   */
  basePath?: string;

  tabs?: DataTableShellTab[];

  newButtonHref?: string;
  onNewClick?: () => void;
  disableCreateButton?: boolean;

  onEditClick?: (record: T) => void;
  onDeleteClick?: (ids: Array<string | number>) => Promise<void> | void;
  onReviewClick?: (record: T) => void;
  disableEditButton?: boolean;
  disableDeleteButton?: boolean;
  disableReviewButton?: boolean;

  pageSizes?: number[];
  /** Client-side post-filter applied after tab forceFilter. */
  forceFilter?: (rows: T[]) => T[];
  rowStyle?: (record: T, index: number) => React.CSSProperties;
  rowExpansion?: DataTableRowExpansionProps<T>;

  hideToolbar?: boolean;
  disableActions?: boolean;
  /** When true, New/Edit trigger callbacks instead of navigating. */
  sustained?: boolean;
  /** Rendered in the right slot of ModuleHeader (e.g. New button, action menu). */
  headerRight?: ReactNode;

  moduleAccess?: DataTableShellModuleAccess;
  onModuleAccessChange?: (change: DataTableShellModuleAccessChange) => void;
  lastEditedAt?: string | Date;
  shareUrl?: string;
  hideAccessMenu?: boolean;

  /**
   * Wraps everything below ModuleHeader (title, toolbar, table). Defaults to
   * a Fragment — no extra DOM node. Pass e.g. `Paper` to give the whole body
   * a shared surface.
   */
  mainComponent?: ElementType;
  /** Props forwarded to `mainComponent`, e.g. `{ withBorder: true }` for Paper. */
  mainComponentProps?: Record<string, unknown>;
}

// ── Internal props passed to DataTableShellInner ──────────────────────────────

/** Props that belong to DataTableWrapper (not forwarded to the inner shell). */
type DataTableWrapperOnlyKey =
  | "queryKey"
  | "queryGetFn"
  | "dataKey"
  | "paginationKey"
  | "enableServerQuery"
  | "initialSearch"
  | "defaultPageSize"
  | "staleTime"
  | "debounceMs"
  | "forceFilters"
  | "onError";

// Derived from DataTableShellProps (minus the wrapper-only props) so the ~30
// shell props aren't hand-duplicated here and re-forwarded one-by-one.
export type DataTableShellInnerProps<T extends object> = Omit<
  DataTableShellProps<T>,
  DataTableWrapperOnlyKey
> & {
  activeTab: number;
  onTabChange: (index: number) => void;
  activeTabForceFilter?: (rows: T[]) => T[];
};

// ── Sub-component prop types ──────────────────────────────────────────────────

export interface DataTableShellHeaderProps {
  moduleInfo: DataTableShellModuleInfo;
}

export interface DataTableShellToolbarProps<T extends object> {
  moduleInfo: DataTableShellModuleInfo;
  columns: DataTableShellColumn<T>[];
  tabs?: DataTableShellTab[];
  basePath?: string;
  newButtonHref?: string;
  onNewClick?: () => void;
  disableCreateButton?: boolean;
  sustained?: boolean;
}

export interface DataTableShellTableProps<T extends object> {
  columns: DataTableShellColumn<T>[];
  idAccessor: string;
  pageSizes: number[];
  forceFilter?: (rows: T[]) => T[];
  activeTabForceFilter?: (rows: T[]) => T[];
  rowStyle?: (record: T, index: number) => React.CSSProperties;
  rowExpansion?: DataTableRowExpansionProps<T>;
  disableActions?: boolean;
}

export interface DataTableShellTableActionsProps<T extends object> {
  idAccessor: string;
  basePath?: string;
  sustained?: boolean;
  onEditClick?: (record: T) => void;
  onDeleteClick?: (ids: Array<string | number>) => Promise<void> | void;
  onReviewClick?: (record: T) => void;
  disableEditButton?: boolean;
  disableDeleteButton?: boolean;
  disableReviewButton?: boolean;
}
