import type { ListRow } from "../Cases.hooks";

export interface ListViewProps {
  rows: ListRow[];
  onOpenRow: (row: ListRow) => void;
}
