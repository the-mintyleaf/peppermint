import { createContext, useContext } from "react";

export interface DataTableShellContextValue<T = unknown> {
  activeTab: number;
  setActiveTab: (index: number) => void;
  /** Derived from store selection + current rows — never stored separately. */
  selectedRecords: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTableShellContext =
  createContext<DataTableShellContextValue<any> | null>(null);
DataTableShellContext.displayName = "DataTableShellContext";

export function useDataTableShellContext<
  T = unknown,
>(): DataTableShellContextValue<T> {
  const ctx = useContext(DataTableShellContext);
  if (!ctx)
    throw new Error(
      "useDataTableShellContext must be used inside <DataTableShell>",
    );
  return ctx as DataTableShellContextValue<T>;
}
