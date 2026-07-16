"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { realStructureDataSource } from "./realStructureDataSource";
import type { StructureDataSource } from "./structureDataSource.types";

export interface StructureDataContextValue {
  /** The organization the canvas is rendering. Always supplied by a provider. */
  orgId: string;
  /** How the canvas reads/writes structure data — real axios or an in-memory mock. */
  dataSource: StructureDataSource;
}

/**
 * Defaults to the real axios source with an empty `orgId`. The empty `orgId` never
 * matters in practice: components that need it (the canvas, InspectorPanel) always
 * render under a provider. Shared pickers used elsewhere (e.g. `UnitPickerSelect`
 * in the positions/delegations forms) take `organizationId` as a prop and only read
 * `dataSource` from here — so with no provider they transparently use the real API.
 */
const StructureDataContext = createContext<StructureDataContextValue>({
  orgId: "",
  dataSource: realStructureDataSource,
});

export interface StructureDataProviderProps {
  orgId: string;
  /** Defaults to the real axios source; the test-tree passes an in-memory mock. */
  dataSource?: StructureDataSource;
  children: ReactNode;
}

export function StructureDataProvider({
  orgId,
  dataSource = realStructureDataSource,
  children,
}: StructureDataProviderProps) {
  const value = useMemo(() => ({ orgId, dataSource }), [orgId, dataSource]);
  return (
    <StructureDataContext.Provider value={value}>
      {children}
    </StructureDataContext.Provider>
  );
}

export function useStructureData(): StructureDataContextValue {
  return useContext(StructureDataContext);
}
