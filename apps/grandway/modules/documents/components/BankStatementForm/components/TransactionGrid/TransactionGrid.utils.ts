import type { BankTransaction } from "../../../../documents.types";

const toTime = (value: unknown): number => {
  if (!value) return NaN;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : NaN;
};

/**
 * Flags each row that is dated earlier than the row above it.
 *
 * A statement is read top-to-bottom, and `computeBankStatement` accrues interest over the
 * days since the previous checkpoint — so a backwards date is both wrong on the printed
 * page and silently yields a zero-day accrual. Rows with a missing or unparseable date
 * are skipped rather than flagged; the comparison then continues from the last row that
 * did have one.
 */
export function findBackwardsDatedRows(
  transactions: BankTransaction[],
): boolean[] {
  const flags = transactions.map(() => false);
  let previous = NaN;

  transactions.forEach((transaction, index) => {
    const current = toTime(transaction.date);
    if (Number.isNaN(current)) return;
    if (!Number.isNaN(previous) && current < previous) flags[index] = true;
    previous = current;
  });

  return flags;
}
