// ─── Woda Template Formatting ───────────────────────────────────────────────
// Pure helpers the WODA letters share for names, dates, money and wording.

/** The document's content as the templates read it from `FormHandler`. */
export type WodaValues = Record<string, unknown> | undefined;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** A trimmed string, or "" for anything that is not a non-empty string. */
export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** "Mr." + "Ram Thapa" → "Mr. Ram Thapa"; either half may be missing. */
export function fullName(honorific: unknown, name: unknown): string {
  return [text(honorific), text(name)].filter(Boolean).join(" ");
}

/** A deceased person is written "Late …" and is left out of tables and photos. */
export function isLate(honorificOrName: unknown): boolean {
  return /^late\b/i.test(text(honorificOrName));
}

/**
 * The applicant's gender for son/daughter wording. A gendered honorific wins,
 * because it is what prints beside the name — and letters saved before some
 * forms asked for gender were all seeded "Male".
 */
export function isMale(values: WodaValues): boolean {
  const honorific = text(values?.applicant_honorific).toLowerCase();
  if (["miss", "mrs.", "mrs", "ms.", "ms"].includes(honorific)) return false;
  if (["mr.", "mr"].includes(honorific)) return true;
  return values?.applicant_gender !== "Female";
}

/** son/daughter, grandson/granddaughter, his/her — from the applicant's gender. */
export function kinship(values: WodaValues) {
  const male = isMale(values);
  return {
    child: male ? "son" : "daughter",
    grandchild: male ? "grandson" : "granddaughter",
    possessive: male ? "his" : "her",
  };
}

/** Parse an ISO/`Date`-able value; `null` when empty or unparseable. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  // A date-only ISO string is a calendar day, not UTC midnight — read it as
  // local so the printed day never shifts by the viewer's timezone.
  const day =
    typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) return new Date(+day[1], +day[2] - 1, +day[3]);
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 2006-12-08 → "2006/12/08", the way the ward office writes A.D. dates. */
export function slashDate(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}/${mm}/${dd}`;
}

/** "2063/08/22 B.S. (2006/12/08 A.D.)" — either half is dropped when missing. */
export function dualDate(bs: unknown, ad: unknown): string {
  const bsText = text(bs).replace(/-/g, "/");
  const adText = slashDate(ad);
  if (bsText && adText) return `${bsText} B.S. (${adText} A.D.)`;
  if (bsText) return `${bsText} B.S.`;
  return adText ? `${adText} A.D.` : "";
}

/** A finite number, or 0. */
export function toAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** 2581200 → "2,581,200.00". */
export function money(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** The separator before item `index` of `count` in "A, B and C". */
export function listSeparator(index: number, count: number): string {
  if (index === 0) return "";
  return index === count - 1 ? " and " : ", ";
}

/** The list rows stored under `key`, or an empty list. */
export function rows(
  values: WodaValues,
  key: string,
): Record<string, unknown>[] {
  const list = values?.[key];
  return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
}

// ─── People & periods ───────────────────────────────────────────────────────

export interface WodaMember {
  name: string;
  citizenship: string;
  /** "Applicant", "Applicant's Father", … */
  relation: string;
}

/** "Grandfather" → "Applicant's Grandfather"; a value already naming the applicant is kept. */
function applicantRelation(relation: string): string {
  if (!relation || /^applicant/i.test(relation)) return relation;
  return `Applicant's ${relation}`;
}

/**
 * Additional relatives. Documents saved before the repeatable list existed held
 * at most one, behind the `extra_relation` switch, and still print it.
 */
function relatives(values: WodaValues): WodaMember[] {
  if (Array.isArray(values?.relatives)) {
    return rows(values, "relatives").map((row) => ({
      name: text(row.name),
      citizenship: text(row.citizenship),
      relation: applicantRelation(text(row.relation)),
    }));
  }
  if (!values?.extra_relation) return [];
  return [
    {
      name: fullName(
        values.relation_extra_honorific,
        values.relation_extra_name,
      ),
      citizenship: "",
      relation: applicantRelation(text(values.relation_extra_relation)),
    },
  ];
}

/**
 * Everyone a relationship letter certifies: the applicant, then each living
 * parent, then the additional relatives. A "Late" person is left out — they can
 * neither be photographed nor present a citizenship certificate.
 */
export function relationshipMembers(values: WodaValues): WodaMember[] {
  const members: WodaMember[] = [
    {
      name: fullName(values?.applicant_honorific, values?.applicant_name),
      citizenship: text(values?.applicant_citizenship),
      relation: "Applicant",
    },
  ];
  const parents = [
    ["applicant_father", "Applicant's Father"],
    ["applicant_mother", "Applicant's Mother"],
  ] as const;
  for (const [key, relation] of parents) {
    const honorific = values?.[`${key}_honorific`];
    const name = text(values?.[`${key}_name`]);
    if (!name || isLate(honorific)) continue;
    members.push({
      name: fullName(honorific, name),
      citizenship: text(values?.[`${key}_citizenship`]),
      relation,
    });
  }
  return [
    ...members,
    ...relatives(values).filter((m) => m.name && !isLate(m.name)),
  ];
}

/** The parent whose income or tax a letter is about (`applicant_earning_guardian`). */
export function earningGuardian(values: WodaValues) {
  // Anything but "father" is the mother — the rule the letters always used.
  const isMother = values?.applicant_earning_guardian !== "father";
  const key = isMother ? "applicant_mother" : "applicant_father";
  return {
    name: fullName(values?.[`${key}_honorific`], values?.[`${key}_name`]),
    relation: isMother ? "mother" : "father",
    pronoun: isMother ? "she" : "he",
    possessive: isMother ? "her" : "his",
  };
}

export interface WodaFiscalYear {
  /** "2023/2024" */
  label: string;
  start: unknown;
  end: unknown;
}

/** The three fiscal years an income or tax letter covers, oldest first. */
export function fiscalYears(values: WodaValues): WodaFiscalYear[] {
  return [1, 2, 3].map((n) => ({
    label: text(values?.[`fiscal_${n}_ad`]),
    start: values?.[`fiscal_${n}_start`],
    end: values?.[`fiscal_${n}_end`],
  }));
}

/** Per-year totals of the `income1..3` columns of the `occupations` rows. */
export function fiscalTotals(values: WodaValues): number[] {
  const sum = [0, 0, 0];
  for (const row of rows(values, "occupations")) {
    sum[0] += toAmount(row.income1);
    sum[1] += toAmount(row.income2);
    sum[2] += toAmount(row.income3);
  }
  return sum;
}

export interface WodaEarner {
  name: string;
  /** "Father", "Grandfather", … — may be blank. */
  relation: string;
}

/** Distinct income owners, in the order they first appear in the `incomes` rows. */
export function incomeEarners(values: WodaValues): WodaEarner[] {
  const seen = new Map<string, string>();
  for (const row of rows(values, "incomes")) {
    const owner = text(row.owner);
    if (!owner || seen.has(owner)) continue;
    seen.set(owner, text(row.relation));
  }
  return [...seen].map(([name, relation]) => ({ name, relation }));
}
