import type {
  BankStatementContent,
  BankTransaction,
  BankTransactionType,
} from "../documents.types";

/** A rendered transaction row: user input plus the derived running balance. */
export interface ComputedTransactionRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: BankTransactionType;
  interest_rate?: number;
  tax_rate?: number;
}

/** Everything derived from a statement's inputs. Field names match what the templates read. */
export interface ComputedBankStatement {
  workedStatements: ComputedTransactionRow[];
  statements_opening_bal: number;
  statements_opening_date: string;
  statement_debit_total: number;
  statement_credit_total: number;
  statement_balance_total: number; // closing balance
}

const DAYS_PER_YEAR = 365;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

function daysBetween(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const days = Math.round((b - a) / 86_400_000);
  return days > 0 ? days : 0;
}

/**
 * Simple pro-rated interest.
 *
 * INTEREST BASIS (the one domain knob): interest accrues on the running balance at the
 * point the Interest Deposit row sits, pro-rated over the days since the previous
 * interest checkpoint (or the opening date) at the annual rate. If a real bank statement
 * shows a different basis (average/min balance, different day-count), adjust only this.
 */
function computeInterest(
  baseBalance: number,
  annualRatePct: number,
  days: number,
): number {
  return round2(baseBalance * (annualRatePct / 100) * (days / DAYS_PER_YEAR));
}

/**
 * Derives the running-balance rows and totals for a bank statement from its user-entered
 * inputs. Pure and side-effect free so the form preview and the print template can share
 * one computation.
 *
 * The FIRST transaction is always the opening credit entry: its credit seeds the opening
 * balance and its date the opening date, so `workedStatements` covers rows 1..n only
 * (the template renders a dedicated "Opening Balance" row from `statements_opening_*`).
 *
 * Operator-inserted `interest` / `tax` rows carry no stored amount — they are derived here
 * from the rows above, so deleting or reordering those rows re-syncs them automatically:
 *   - interest: `running × row.interest_rate% × days(sinceLastCheckpoint → row.date) / 365`
 *   - tax:      `row.tax_rate% × (interest credited above since the last tax row)`
 *
 * Both rates are per-row, falling back to `statement_interest` / `statement_tax`.
 */
export function computeBankStatement(
  content: BankStatementContent,
): ComputedBankStatement {
  const txns: BankTransaction[] = Array.isArray(content.transactions)
    ? content.transactions
    : [];
  const interestRate = num(content.statement_interest);

  const first = txns[0];
  const opening = first ? round2(num(first.credit)) : 0;
  const openingDate = String(first?.date ?? content.statement_start_date ?? "");

  let running = opening;
  let debitTotal = 0;
  let creditTotal = 0;
  let lastInterestDate = openingDate; // checkpoint for the next interest accrual
  let untaxedInterest = 0; // interest credited since the last tax deduction
  const rows: ComputedTransactionRow[] = [];

  for (let i = 1; i < txns.length; i++) {
    const t = txns[i];
    const date = String(t.date ?? "");
    const type: BankTransactionType = t.type ?? "normal";

    if (type === "interest") {
      // Each row may carry its own rate; `statement_interest` is only the default.
      const rowRate =
        t.interest_rate === undefined || t.interest_rate === ""
          ? interestRate
          : num(t.interest_rate);
      const interest = computeInterest(
        running,
        rowRate,
        daysBetween(lastInterestDate, date),
      );
      running = round2(running + interest);
      creditTotal = round2(creditTotal + interest);
      untaxedInterest = round2(untaxedInterest + interest);
      lastInterestDate = date;
      rows.push({
        date,
        description: "Interest Deposit",
        debit: 0,
        credit: interest,
        balance: running,
        type,
        interest_rate: rowRate,
      });
      continue;
    }

    if (type === "tax") {
      const taxRate = num(t.tax_rate ?? content.statement_tax);
      const tax = round2(untaxedInterest * (taxRate / 100));
      running = round2(running - tax);
      debitTotal = round2(debitTotal + tax);
      untaxedInterest = 0;
      rows.push({
        date,
        description: `Tax Deduction @${taxRate}%`,
        debit: tax,
        credit: 0,
        balance: running,
        type,
        tax_rate: taxRate,
      });
      continue;
    }

    const debit = round2(num(t.debit));
    const credit = round2(num(t.credit));
    running = round2(running + credit - debit);
    debitTotal = round2(debitTotal + debit);
    creditTotal = round2(creditTotal + credit);
    rows.push({
      date,
      description: String(t.description ?? ""),
      debit,
      credit,
      balance: running,
      type,
    });
  }

  return {
    workedStatements: rows,
    statements_opening_bal: opening,
    statements_opening_date: openingDate,
    statement_debit_total: debitTotal,
    statement_credit_total: creditTotal,
    statement_balance_total: running,
  };
}
