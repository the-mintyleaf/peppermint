import type {
  BankTransaction,
  BankTransactionType,
} from "../../../../documents.types";
import { OPENING_ROW_DESCRIPTION } from "../../BankStatementForm.utils";
import type {
  ParsedTransactionCsv,
  TransactionCsvIssue,
} from "./TransactionImport.types";

/**
 * The column order the sample file ships in. Import does not depend on it — a header row
 * is matched by name (see `HEADER_ALIASES`) — but a file with no recognisable header is
 * read positionally against this list, which is what a hand-made sheet usually looks like.
 */
const COLUMNS = [
  "date",
  "description",
  "type",
  "debit",
  "credit",
  "interest_rate",
  "tax_rate",
  "balance",
] as const;

type ColumnKey = (typeof COLUMNS)[number];

/** Header spellings seen on real exports, normalised to lowercase with runs of spaces collapsed. */
const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  date: ["date", "transaction date", "txn date", "value date", "miti"],
  description: [
    "description",
    "particulars",
    "narration",
    "details",
    "remarks",
    "vivaran",
  ],
  type: ["type", "row type", "entry type"],
  debit: [
    "debit",
    "dr",
    "dr amount",
    "debit amount",
    "withdrawal",
    "withdrawal amount",
    "withdrawn",
    "payment",
    "money out",
    "amount out",
    "outflow",
  ],
  credit: [
    "credit",
    "cr",
    "cr amount",
    "credit amount",
    "deposit",
    "deposit amount",
    "receipt",
    "money in",
    "amount in",
    "inflow",
  ],
  interest_rate: [
    "interest %",
    "interest%",
    "interest rate",
    "interest_rate",
    "interest",
  ],
  tax_rate: ["tax %", "tax%", "tax rate", "tax_rate", "tax"],
  balance: ["balance", "running balance", "closing balance"],
};

/** Lines the sheet carries for the reader, never for the importer. */
const NON_DATA_ROW = /^(#|total|totals|closing|note|notes|grand total)/i;

const normaliseHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ").replace(/[."']/g, "");

/**
 * Splits raw file text into a grid of cells.
 *
 * Written by hand rather than pulled from a CSV package: the format we accept is narrow
 * (one delimiter, RFC-4180 quoting) and a dependency for it would be the whole library's
 * surface for forty lines of work. Handles quoted fields containing the delimiter, escaped
 * `""` quotes, embedded newlines, CRLF, and a leading UTF-8 BOM.
 */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const source = text.replace(/^﻿/, "");

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\r") continue;
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows;
}

/**
 * Picks the delimiter from the first non-empty line.
 *
 * Excel writes `;` in locales whose decimal mark is a comma, and pasting a block out of a
 * sheet yields tabs — so guessing beats forcing the user to convert the file by hand.
 */
export function sniffDelimiter(text: string): string {
  const firstLine =
    text
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .find((line) => line.trim().length > 0) ?? "";

  const counts = [",", ";", "\t"].map((delimiter) => ({
    delimiter,
    count: firstLine.split(delimiter).length - 1,
  }));

  const best = counts.reduce((a, b) => (b.count > a.count ? b : a));
  return best.count > 0 ? best.delimiter : ",";
}

/**
 * What a lone separator means depends on what is being read: `12,000` is twelve thousand
 * rupees but `6,5` is a rate of six and a half percent.
 */
export type AmountKind = "amount" | "rate";

/**
 * Reads a number out of a spreadsheet cell.
 *
 * Cells arrive formatted for people: `1,250.00`, `1.250,00`, `Rs. 4 500`. Where both
 * separators appear the last one is the decimal mark, which settles US and European
 * formatting between them. A lone separator is genuinely ambiguous — `12,000` is a
 * thousands group in one locale and twelve in another — so an amount reads a single
 * separator followed by exactly three digits as a thousands group (the convention every
 * bank export follows), while a rate never does.
 *
 * Returns `null` — never a silent `0` — when the text is not a number at all, so the row
 * can be reported rather than imported as an empty amount. A blank cell is a real `0`.
 */
export function parseAmount(
  raw: string,
  kind: AmountKind = "amount",
): number | null {
  const text = raw.trim();
  if (!text) return 0;
  // A cell still holding its formula means the file was never opened by a spreadsheet.
  if (text.startsWith("=")) return null;

  // A minus only counts where a number carries it — leading, or bracketed accountancy style.
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  // Take the first run that starts and ends on a digit, so a currency prefix ("Rs. 4 500")
  // or a trailing note cannot contribute its own dots to the number.
  const bare = /^[.,]\d+$/.test(text) ? `0${text}` : text;
  const run = bare.match(/\d[\d.,\s']*\d|\d/);
  if (!run) return null;
  const digits = run[0].replace(/[\s']/g, "");

  const commas = (digits.match(/,/g) ?? []).length;
  const dots = (digits.match(/\./g) ?? []).length;
  let normalised: string;

  if (!commas && !dots) {
    normalised = digits;
  } else if (commas && dots) {
    normalised =
      digits.lastIndexOf(",") > digits.lastIndexOf(".")
        ? // `1.250,00` — comma is the decimal mark.
          digits.replace(/\./g, "").replace(",", ".")
        : // `1,250.00` — dot is the decimal mark.
          digits.replace(/,/g, "");
  } else {
    const separator = commas ? "," : ".";
    const groupCount = commas || dots;
    const tail = digits.slice(digits.lastIndexOf(separator) + 1);
    // `1,234,567` can only be grouping; `12,000` is grouping by convention; `12,00` is not.
    const grouped = groupCount > 1 || (kind === "amount" && tail.length === 3);
    normalised = grouped
      ? digits.split(separator).join("")
      : digits.replace(separator, ".");
  }

  const value = Number(normalised);
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Rejects impossible calendar dates (31 February) that `new Date` would silently roll over. */
function toIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export interface ParsedDate {
  /** ISO `YYYY-MM-DD`, or `null` when the cell holds no readable date. */
  value: string | null;
  /** True when a `03/04/2026`-style cell could have been read either way round. */
  ambiguous: boolean;
}

/**
 * Reads a date cell into the ISO form the statement stores.
 *
 * Excel rewrites a date-formatted column into the machine's locale on save, so the file
 * coming back is often not the file that went out. Slash/dash dates are read as
 * **day-first** (the Nepali convention, and the one the sample teaches); where the first
 * two numbers are both ≤ 12 that reading is a guess, and the caller is told so it can warn
 * rather than quietly shift a statement by months.
 */
export function parseDateCell(raw: string): ParsedDate {
  const text = raw.trim();
  if (!text) return { value: null, ambiguous: false };

  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) {
    return {
      value: toIso(Number(iso[1]), Number(iso[2]), Number(iso[3])),
      ambiguous: false,
    };
  }

  const slashed = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (slashed) {
    const first = Number(slashed[1]);
    const second = Number(slashed[2]);
    const year = Number(slashed[3]);
    // Only one reading survives when a part exceeds 12; otherwise day-first, flagged.
    if (first > 12 && second <= 12) {
      return { value: toIso(year, second, first), ambiguous: false };
    }
    if (second > 12 && first <= 12) {
      return { value: toIso(year, first, second), ambiguous: false };
    }
    return { value: toIso(year, second, first), ambiguous: true };
  }

  const textual = text
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .match(/^(?:(\d{1,2}) ([a-z]{3,})|([a-z]{3,}) (\d{1,2})) (\d{4})$/);
  if (textual) {
    const day = Number(textual[1] ?? textual[4]);
    const monthName = (textual[2] ?? textual[3]).slice(0, 3);
    const month = MONTHS.indexOf(monthName) + 1;
    if (month > 0) {
      return { value: toIso(Number(textual[5]), month, day), ambiguous: false };
    }
  }

  return { value: null, ambiguous: false };
}

function parseType(raw: string): BankTransactionType | null {
  const text = raw.trim().toLowerCase();
  if (
    !text ||
    text === "normal" ||
    text === "opening" ||
    text === "transaction"
  ) {
    return "normal";
  }
  if (text === "interest") return "interest";
  if (text === "tax") return "tax";
  return null;
}

/** The header row's meaning: where each known column sits, and what could not be placed. */
interface HeaderMapping {
  columns: Partial<Record<ColumnKey, number>>;
  /** Header cells that matched nothing — their values never reach the sheet. */
  unrecognised: string[];
}

/** Maps the header row onto column positions; `null` when the file has no usable header. */
function mapHeader(cells: string[]): HeaderMapping | null {
  const columns: Partial<Record<ColumnKey, number>> = {};
  const unrecognised: string[] = [];

  cells.forEach((cell, index) => {
    const name = normaliseHeader(cell);
    if (!name) return;
    const match = (Object.keys(HEADER_ALIASES) as ColumnKey[]).find((key) =>
      HEADER_ALIASES[key].includes(name),
    );
    if (match && columns[match] === undefined) {
      columns[match] = index;
      return;
    }
    if (!match) unrecognised.push(cell.trim());
  });

  // A header is only trusted when it names the two columns a statement cannot do without.
  return columns.date !== undefined &&
    (columns.debit !== undefined || columns.credit !== undefined)
    ? { columns, unrecognised }
    : null;
}

const POSITIONAL: Partial<Record<ColumnKey, number>> = Object.fromEntries(
  COLUMNS.map((key, index) => [key, index]),
);

/** What one file line turned into: a row, a reported problem, or nothing at all. */
interface RowOutcome {
  row?: BankTransaction;
  issue?: TransactionCsvIssue;
  ambiguous?: boolean;
}

/** Reads one non-empty line. Returns an empty outcome for lines the sheet keeps for people. */
function readRow(get: (key: ColumnKey) => string, line: number): RowOutcome {
  const dateCell = get("date").trim();
  const descriptionCell = get("description").trim();

  const date = parseDateCell(dateCell);

  // A totals or note line is recognised only where no readable date sits — otherwise a
  // genuine entry ("Total electricity payment", "Notes: cheque cleared") would vanish.
  if (!date.value) {
    if (NON_DATA_ROW.test(dateCell) || NON_DATA_ROW.test(descriptionCell)) {
      return {};
    }
    if (!dateCell) {
      return descriptionCell
        ? { issue: { line, reason: "No date — row skipped" } }
        : {};
    }
    return { issue: { line, reason: `Unreadable date "${dateCell}"` } };
  }

  const type = parseType(get("type"));
  if (!type) {
    return {
      issue: {
        line,
        reason: `Unknown type "${get("type").trim()}" — use normal, interest or tax`,
      },
    };
  }

  if (type === "interest" || type === "tax") {
    // Interest and tax figures are derived from the rows above, never imported: only the
    // rate travels, so a re-imported sheet re-computes instead of freezing stale amounts a
    // spreadsheet happened to hold. A blank rate cell stays undefined so that
    // `computeBankStatement` falls back to the statement-level default, exactly as it does
    // for a rate left empty in the grid.
    const rateCell = get(
      type === "interest" ? "interest_rate" : "tax_rate",
    ).trim();
    const rate = rateCell ? parseAmount(rateCell, "rate") : undefined;
    if (rateCell && (rate === null || rate === undefined || rate < 0)) {
      return {
        issue: { line, reason: `Unreadable ${type} rate "${rateCell}"` },
      };
    }
    return {
      ambiguous: date.ambiguous,
      row: {
        date: date.value,
        description: type === "interest" ? "Interest Deposit" : "Tax Deduction",
        debit: 0,
        credit: 0,
        type,
        ...(type === "interest"
          ? { interest_rate: rate ?? undefined }
          : { tax_rate: rate ?? undefined }),
      },
    };
  }

  const debit = parseAmount(get("debit"));
  const credit = parseAmount(get("credit"));
  if (debit === null || credit === null) {
    const formula =
      get("debit").trim().startsWith("=") ||
      get("credit").trim().startsWith("=");
    return {
      issue: {
        line,
        reason: formula
          ? "Formula not calculated — open the file in Excel and save it again"
          : "Debit or credit is not a number",
      },
    };
  }
  if (debit < 0 || credit < 0) {
    return {
      issue: {
        line,
        reason:
          "Negative or bracketed amount — write it as a positive figure in the Debit or Credit column",
      },
    };
  }

  return {
    ambiguous: date.ambiguous,
    row: {
      date: date.value,
      description: descriptionCell,
      debit,
      credit,
      type: "normal",
    },
  };
}

/**
 * Turns a CSV/TSV file into statement rows.
 *
 * Nothing is thrown for a bad line: every rejected line is returned as an issue carrying
 * its file line number, and anything read on a guess (an ambiguous date, a header column
 * that matched nothing) is returned as a warning — so the preview can show exactly what
 * will and will not be imported before anything touches the sheet.
 */
export function parseTransactionCsv(text: string): ParsedTransactionCsv {
  const delimiter = sniffDelimiter(text);
  const grid = parseDelimited(text, delimiter);
  const issues: TransactionCsvIssue[] = [];
  const warnings: string[] = [];
  const rows: BankTransaction[] = [];
  let ambiguousDates = false;

  const firstFilled = grid.findIndex((cells) =>
    cells.some((cell) => cell.trim().length > 0),
  );
  if (firstFilled === -1) {
    return { rows, issues, warnings, ambiguousDates, skipped: 0, delimiter };
  }

  const header = mapHeader(grid[firstFilled]);
  const columns = header ? header.columns : POSITIONAL;
  const startLine = header ? firstFilled + 1 : firstFilled;

  if (header) {
    // A header naming Debit but not Credit still reads as a valid header, and every credit
    // in the file would then import as a blank 0 — so the columns that matched nothing are
    // named rather than passed over.
    const missing = (["debit", "credit"] as const).filter(
      (key) => columns[key] === undefined,
    );
    if (missing.length > 0) {
      warnings.push(
        `No ${missing.join(" or ")} column was recognised${
          header.unrecognised.length > 0
            ? ` (unused columns: ${header.unrecognised.join(", ")})`
            : ""
        } — those amounts import as 0. Rename the column to ${missing
          .map((key) => (key === "debit" ? "Debit" : "Credit"))
          .join(" / ")}.`,
      );
    }
  } else {
    warnings.push(
      "No header row was recognised — columns were read in order: Date, Description, Type, Debit, Credit, Interest %, Tax %.",
    );
  }

  for (let i = startLine; i < grid.length; i++) {
    const cells = grid[i];
    if (!cells.some((cell) => cell.trim().length > 0)) continue;

    const outcome = readRow((key) => {
      const index = columns[key];
      return index === undefined ? "" : (cells[index] ?? "");
    }, i + 1);

    if (outcome.issue) issues.push(outcome.issue);
    if (outcome.row) rows.push(outcome.row);
    if (outcome.ambiguous) ambiguousDates = true;
  }

  return {
    rows,
    issues,
    warnings,
    ambiguousDates,
    skipped: issues.length,
    delimiter,
  };
}

/** Quotes a cell only when it needs it, so the file stays readable in a text editor. */
const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const csvLine = (cells: string[]) => cells.map(csvCell).join(",");

/**
 * Builds the download-and-edit sample.
 *
 * The Balance column and the totals line are real spreadsheet formulas — `=H2+E3-D3`,
 * `=SUM(D2:D9)` — which Excel and Sheets evaluate on open, so the operator can type
 * amounts and watch the statement add up before importing it back. On save those cells
 * come back as calculated numbers, and the importer ignores the column entirely: the
 * running balance is always derived by `computeBankStatement`, never taken from a file.
 */
export function buildSampleCsv(): string {
  const header = [
    "Date",
    "Description",
    "Type",
    "Debit",
    "Credit",
    "Interest %",
    "Tax %",
    "Balance",
  ];

  const entries: Array<{
    date: string;
    description: string;
    type: string;
    debit: string;
    credit: string;
    interest: string;
    tax: string;
  }> = [
    {
      date: "2026-01-05",
      description: OPENING_ROW_DESCRIPTION,
      type: "normal",
      debit: "",
      credit: "250000",
      interest: "",
      tax: "",
    },
    {
      date: "2026-01-18",
      description: "Cash Deposit",
      type: "normal",
      debit: "",
      credit: "75000",
      interest: "",
      tax: "",
    },
    {
      date: "2026-02-06",
      description: "ATM Withdrawal",
      type: "normal",
      debit: "12000",
      credit: "",
      interest: "",
      tax: "",
    },
    {
      date: "2026-02-21",
      description: "Salary Credit",
      type: "normal",
      debit: "",
      credit: "48000",
      interest: "",
      tax: "",
    },
    {
      date: "2026-03-10",
      description: "Fund Transfer",
      type: "normal",
      debit: "25000",
      credit: "",
      interest: "",
      tax: "",
    },
    {
      date: "2026-03-31",
      description: "Interest Deposit",
      type: "interest",
      debit: "",
      credit: "",
      interest: "6.5",
      tax: "",
    },
    {
      date: "2026-03-31",
      description: "Tax Deduction",
      type: "tax",
      debit: "",
      credit: "",
      interest: "",
      tax: "5",
    },
    {
      date: "2026-04-14",
      description: "Cash Deposit",
      type: "normal",
      debit: "",
      credit: "100000",
      interest: "",
      tax: "",
    },
  ];

  const FIRST_DATA_ROW = 2;
  const lastRow = FIRST_DATA_ROW + entries.length - 1;

  const body = entries.map((entry, index) => {
    const row = FIRST_DATA_ROW + index;
    // Row 1 of the sheet is the opening balance; every row after it carries the one above.
    const balance =
      index === 0 ? `=E${row}-D${row}` : `=H${row - 1}+E${row}-D${row}`;
    return csvLine([
      entry.date,
      entry.description,
      entry.type,
      entry.debit,
      entry.credit,
      entry.interest,
      entry.tax,
      balance,
    ]);
  });

  const totals = csvLine([
    "",
    "TOTAL",
    "",
    `=SUM(D${FIRST_DATA_ROW}:D${lastRow})`,
    `=SUM(E${FIRST_DATA_ROW}:E${lastRow})`,
    "",
    "",
    `=H${lastRow}`,
  ]);

  const notes = [
    "",
    "# Row 2 is the opening balance — put the opening amount in Credit.",
    "# Type: leave blank or write normal · interest · tax.",
    "# Interest and Tax rows take a rate only — the amounts are calculated on import.",
    "# Dates: YYYY-MM-DD is read exactly; 05/01/2026 is read as day/month.",
    "# The Balance column and this note block are ignored when the file is imported.",
  ].map((note) => csvLine([note, "", "", "", "", "", "", ""]));

  // The BOM keeps Excel on Windows from reading the file as the legacy code page.
  return `﻿${[csvLine(header), ...body, totals, ...notes].join("\r\n")}\r\n`;
}

/** Hands the built sample to the browser as a download. */
export function downloadSampleCsv(filename = "bank-statement-sample.csv") {
  const blob = new Blob([buildSampleCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Deferred: revoking in the same tick has been seen to cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
