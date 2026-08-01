import type {
  BankStatementContent,
  BankTransaction,
} from "../../documents.types";

/** Row 1 is always the opening balance, so its description is fixed, never typed. */
export const OPENING_ROW_DESCRIPTION = "Opening Balance";

const today = () => new Date().toISOString().split("T")[0];

/**
 * Guarantees the sheet opens with its opening-balance row.
 *
 * `computeBankStatement` treats the first transaction as the opening entry — its credit
 * seeds the balance and its date the interest checkpoint — so a statement is never
 * meaningfully empty. A new statement gets that row seeded at the period start; an
 * existing one has its first row's description normalised to the fixed label.
 */
export function withOpeningRow(
  content: BankStatementContent,
): BankTransaction[] {
  const rows = Array.isArray(content.transactions) ? content.transactions : [];

  if (rows.length === 0) {
    return [
      {
        date:
          content.statement_start_date || content.statement_end_date || today(),
        description: OPENING_ROW_DESCRIPTION,
        debit: 0,
        credit: 0,
        type: "normal",
      },
    ];
  }

  return rows.map((row, index) =>
    index === 0
      ? {
          ...row,
          description: OPENING_ROW_DESCRIPTION,
          type: "normal" as const,
        }
      : row,
  );
}
