import type { ReactNode } from "react";

export interface StatTileProps {
  label: string;
  count: number;
  isLoading: boolean;
  isError?: boolean;
  color?: string;
  icon: ReactNode;
}
