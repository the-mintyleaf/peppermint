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

/** The span of rows a single move/remove acts on — a lone row, or an interest+tax pair. */
export interface RowBlock {
  start: number;
  end: number;
  /** True when the block is an interest row and the tax row deducted from it. */
  isPair: boolean;
}

/**
 * Resolves the row at `index` to the block it belongs to.
 *
 * Interest and the tax deducted on it are one entry on the statement, split across two
 * printed lines — a lone interest row would credit untaxed interest, and a lone tax row
 * would deduct tax on nothing. So they are inserted together and, here, moved and removed
 * together whichever of the two the operator acted on.
 *
 * Pairing is positional: a tax row directly under an interest row. An orphan of either
 * type (an import can produce one) resolves to itself and behaves like any other row.
 */
export function getRowBlock(
  transactions: BankTransaction[],
  index: number,
): RowBlock {
  const type = transactions[index]?.type ?? "normal";

  if (type === "interest" && transactions[index + 1]?.type === "tax")
    return { start: index, end: index + 1, isPair: true };

  if (type === "tax" && transactions[index - 1]?.type === "interest")
    return { start: index - 1, end: index, isPair: true };

  return { start: index, end: index, isPair: false };
}

/**
 * Swaps the block at `index` with its neighbouring block, returning the new rows.
 *
 * Both sides of the swap are whole blocks, so a plain row stepping past an interest+tax
 * pair jumps the pair rather than landing between its two halves. Row 1 is the opening
 * balance and never moves or is displaced; a move that would cross it — or run off the
 * end of the sheet — returns `null`.
 */
export function moveRowBlock(
  transactions: BankTransaction[],
  index: number,
  direction: -1 | 1,
): BankTransaction[] | null {
  const block = getRowBlock(transactions, index);
  if (block.start === 0) return null;

  const neighbourIndex = direction === -1 ? block.start - 1 : block.end + 1;
  if (neighbourIndex < 1 || neighbourIndex > transactions.length - 1)
    return null;

  const neighbour = getRowBlock(transactions, neighbourIndex);
  const rows = transactions.slice(block.start, block.end + 1);
  const neighbourRows = transactions.slice(neighbour.start, neighbour.end + 1);
  const next = [...transactions];
  const span = rows.length + neighbourRows.length;

  if (direction === -1) {
    next.splice(neighbour.start, span, ...rows, ...neighbourRows);
  } else {
    next.splice(block.start, span, ...neighbourRows, ...rows);
  }

  return next;
}

/** Drops the whole block at `index` — an interest+tax pair leaves as one. */
export function removeRowBlock(
  transactions: BankTransaction[],
  index: number,
): BankTransaction[] {
  const block = getRowBlock(transactions, index);
  const next = [...transactions];
  next.splice(block.start, block.end - block.start + 1);
  return next;
}
