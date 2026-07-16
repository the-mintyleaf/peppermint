import type { ListRow } from "../../../Cases.hooks";

export interface CaseFileRowProps {
  row: ListRow;
  onOpen: (row: ListRow) => void;
}
