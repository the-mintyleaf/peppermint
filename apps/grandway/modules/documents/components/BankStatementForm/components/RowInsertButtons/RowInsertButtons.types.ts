export interface RowInsertButtonsProps {
  /** Appends a plain transaction row, dated from the row above it. */
  onAddRow: () => void;
  /** Appends the Interest + Tax pair — the two are never inserted apart. */
  onAddInterestAndTax: () => void;
  disabled?: boolean;
}
