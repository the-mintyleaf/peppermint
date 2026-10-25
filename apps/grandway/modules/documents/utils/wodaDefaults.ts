/**
 * Wording the WODA letters print by default, per country set. Seeded into a new
 * document's content and offered as the form default, so the operator only
 * edits it when a ward office cites something different.
 */
export const WODA_LEGAL_BASIS = {
  /** Japan — Birth Verification Certificate. */
  japanBirth:
    "Chapter 3, Section 12, Sub-Section 2, Clause E (7) of Local Government Operation Act, 2074 B.S. (2017 A.D.)",
  /** Japan — Relationship Certificate (printed after "in accordance with the"). */
  japanRelationship:
    "Chapter 3, Section 12, Sub-Section 2, Clause E (1) of Local Government Operation Act, 2074 B.S. (2017 A.D.)",
  /** English country — both the birth and relationship letters. */
  english:
    "the Section 12 of the Local Government Operation Act, 2074 B.S. (2017 A.D.)",
} as const;

/** The signing official on both sets' letters. */
export const WODA_DEFAULT_SIGNER_POST = "Ward Chairman";

/** Currencies an English-country income letter converts into — suggestions only. */
export const WODA_FOREIGN_CURRENCIES = [
  "Euro",
  "Pound Sterling",
  "US Dollar",
  "Australian Dollar",
  "Canadian Dollar",
  "New Zealand Dollar",
];
