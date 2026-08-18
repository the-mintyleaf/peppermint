import type { BankTransaction } from "../../../../documents.types";

/** A file line that could not be imported, and why. */
export interface TransactionCsvIssue {
  /** 1-based line number in the file, so the operator can find it in the spreadsheet. */
  line: number;
  reason: string;
}

export interface ParsedTransactionCsv {
  /** Rows ready to enter the sheet, in file order. */
  rows: BankTransaction[];
  issues: TransactionCsvIssue[];
  /** Things read on a guess — an unrecognised column, a headerless file. Not failures. */
  warnings: string[];
  /** True when at least one `03/04/2026`-style date was read day-first on a guess. */
  ambiguousDates: boolean;
  skipped: number;
  /** The delimiter the file turned out to use — shown so an odd read is explainable. */
  delimiter: string;
}

/**
 * How imported rows meet the rows already on the sheet.
 *
 * `replace` drops the existing rows and rebuilds the sheet from the file (its first row
 * becomes the opening balance); `append` keeps the sheet and adds the file below it.
 */
export type TransactionImportMode = "replace" | "append";

export interface TransactionImportProps {
  /** Applies the accepted rows. The parent owns the opening-row invariant. */
  onImport: (rows: BankTransaction[], mode: TransactionImportMode) => void;
  /** Number of rows currently on the sheet — decides whether Append is offered. */
  existingRowCount: number;
  isLoading?: boolean;
}
