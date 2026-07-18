import type { UseQueryResult } from "@peppermint/ui";

export interface AwaitingColumnProps<T> {
  title: string;
  query: Pick<
    UseQueryResult<T[]>,
    "data" | "isLoading" | "isError" | "refetch"
  >;
  emptyLabel: string;
  renderRow: (item: T) => React.ReactNode;
}
