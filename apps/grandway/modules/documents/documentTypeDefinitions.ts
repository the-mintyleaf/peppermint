/**
 * WODA letters come in sets per destination: the Japan set and the
 * English-country set (UK, USA, Australia, …). Each set is its own
 * "Add page" submenu. The order here is the menu order.
 */
export const WODA_CATEGORIES = [
  { key: "japan", label: "Woda Documents - Japan" },
  { key: "english", label: "Woda Documents - English Country" },
] as const;

export type WodaCategory = (typeof WODA_CATEGORIES)[number]["key"];

export const WODA_VARIANTS = [
  {
    slug: "woda-address",
    category: "japan",
    folder: "address",
    exportName: "TemplatePermanentAddress",
    label: "WODA — Address Change",
  },
  {
    slug: "woda-dob",
    category: "japan",
    folder: "dob",
    exportName: "TemplateDOBVerification",
    label: "WODA — DOB Verification",
  },
  {
    slug: "woda-fiscal",
    category: "japan",
    folder: "fiscal",
    exportName: "TemplateFiscalYear",
    label: "WODA — Fiscal Year",
  },
  {
    slug: "woda-income",
    category: "japan",
    folder: "income",
    exportName: "TemplateIncomeVerification",
    label: "WODA — Income Verification",
  },
  {
    slug: "woda-migration",
    category: "japan",
    folder: "migration",
    exportName: "TemplateMigration",
    label: "WODA — Migration",
  },
  {
    slug: "woda-occupation",
    category: "japan",
    folder: "occupation",
    exportName: "TemplateOccupationVerification",
    label: "WODA — Occupation",
  },
  {
    slug: "woda-relationship",
    category: "japan",
    folder: "relationship",
    exportName: "TemplateRelationshipVerification",
    label: "WODA — Relationship",
  },
  {
    slug: "woda-surname",
    category: "japan",
    folder: "surname",
    exportName: "TemplateSurname",
    label: "WODA — Surname",
  },
  {
    slug: "woda-tax-clearance",
    category: "japan",
    folder: "taxClearance",
    exportName: "TemplateTaxClearance",
    label: "WODA — Tax Clearance",
  },
  {
    slug: "woda-agriculture-income",
    category: "japan",
    folder: "agriculture-income",
    exportName: "TemplateAgricultureIncome",
    label: "WODA — Agriculture Income",
  },
  {
    slug: "woda-affidavit-financial",
    category: "japan",
    folder: "affidavitFinancial",
    exportName: "TemplateAffidavitFinancial",
    label: "WODA — Affidavit of Financial Support",
  },
  {
    slug: "woda-family",
    category: "japan",
    folder: "family",
    exportName: "TemplateFamilyCertificate",
    label: "WODA — Family Certificate",
  },
  {
    slug: "woda-english-dob",
    category: "english",
    folder: "english/dob",
    exportName: "TemplateEnglishDOBVerification",
    label: "WODA English — DOB Verification",
  },
  {
    slug: "woda-english-relationship",
    category: "english",
    folder: "english/relationship",
    exportName: "TemplateEnglishRelationshipVerification",
    label: "WODA English — Relationship Verification",
  },
  {
    slug: "woda-english-income",
    category: "english",
    folder: "english/income",
    exportName: "TemplateEnglishIncomeVerification",
    label: "WODA English — Annual Income Verification",
  },
] as const;

export const BANK_INSTITUTIONS = [
  { slugKey: "bigyalaxmi", folder: "bigyalaxmi", label: "Bigyalaxmi" },
  { slugKey: "birendranagar", folder: "birendranagar", label: "Birendranagar" },
  { slugKey: "himchuli", folder: "himchuli", label: "Himchuli" },
  { slugKey: "janautthan", folder: "janautthan", label: "Janautthan" },
  { slugKey: "karnali", folder: "karnali", label: "Karnali" },
  {
    slugKey: "mata-bageshwori",
    folder: "mataBageshwori",
    label: "Mata Bageshwori",
  },
  { slugKey: "narayan", folder: "narayan", label: "Narayan" },
  { slugKey: "shahabhagi", folder: "shahabhagi", label: "Shahabhagi" },
  { slugKey: "sumnima", folder: "sumnima", label: "Sumnima" },
  { slugKey: "tribeni", folder: "tribeni", label: "Tribeni" },
  { slugKey: "vyas", folder: "vyas", label: "Vyas" },
] as const;

export const BANK_CERTIFICATE_EXPORTS: Record<string, string> = {
  bigyalaxmi: "TemplateBigyalaxmiCertificate",
  birendranagar: "TemplateBirendranagarCertificate",
  himchuli: "TemplateHimchuliCertificate",
  janautthan: "TemplateJanautthanCertificate",
  karnali: "TemplateKarnaliCertificate",
  mataBageshwori: "TemplateMataBageshworiCertificate",
  narayan: "TemplateNarayanCertificate",
  shahabhagi: "TemplateShahabhagiCertificate",
  sumnima: "TemplateSumnimaCertificate",
  tribeni: "TemplateTribeniCertificate",
  vyas: "TemplateVyasertificate",
};

export const BANK_STATEMENT_EXPORTS: Record<string, string> = {
  bigyalaxmi: "TemplateBigyalaxmiStatement",
  birendranagar: "TemplateBirendranagarStatement",
  himchuli: "TemplateHimchuliStatement",
  janautthan: "TemplateJanautthanStatement",
  karnali: "TemplateKarnaliStatement",
  mataBageshwori: "TemplateMataBageshworiStatement",
  narayan: "TemplateNarayanStatement",
  shahabhagi: "TemplateShahabhagiStatement",
  sumnima: "TemplateSumnimaStatement",
  tribeni: "TemplateTribeniStatement",
  vyas: "TemplateVyasStatement",
};

export type WodaVariantSlug = (typeof WODA_VARIANTS)[number]["slug"];
export type BankInstitutionSlugKey =
  (typeof BANK_INSTITUTIONS)[number]["slugKey"];

export type BankCertificateSlug = `bank-${BankInstitutionSlugKey}-certificate`;
export type BankStatementSlug = `bank-${BankInstitutionSlugKey}-statement`;

export const STUDENT_DOCUMENT_TYPES = [
  "student-certificate",
  "student-cv",
  "student-cv-standard",
  "student-cv-extended",
  "student-cv-europass",
] as const;

export const LOR_INSTITUTIONS = [
  {
    slug: "lor-janajagriti",
    label: "LOR — Shree Janajagriti Secondary School",
  },
  {
    slug: "lor-bageshwari-chief",
    label: "LOR — Bageshwari Multiple Campus (Campus Chief)",
  },
  {
    slug: "lor-bageshwari-hod",
    label: "LOR — Bageshwari Multiple Campus (Head of Dept.)",
  },
  { slug: "lor-shiva", label: "LOR — Shree Shiva Secondary School" },
  { slug: "lor-kcmit", label: "LOR — Kantipur College (KCMIT)" },
  { slug: "lor-tri-chandra", label: "LOR — Tri-Chandra Multiple Campus" },
  { slug: "lor-monastic", label: "LOR — Monastic Secondary English School" },
  { slug: "lor-om-health", label: "LOR — Om Health Campus" },
  { slug: "lor-atlantic", label: "LOR — Atlantic International College" },
  {
    slug: "lor-model-technical",
    label: "LOR — Model College of Technical Education",
  },
  { slug: "lor-nepalgunj", label: "LOR — Nepalgunj Technical College" },
] as const;

export type LorSlug = (typeof LOR_INSTITUTIONS)[number]["slug"];

export const MOI_INSTITUTIONS = [
  { slug: "moi-global-college", label: "MOI — Global College of Management" },
  {
    slug: "moi-janajagriti",
    label: "MOI — Shree Janajagriti Secondary School",
  },
  { slug: "moi-vinayak", label: "MOI — Vinayak Health Care System" },
  { slug: "moi-reliance", label: "MOI — Reliance International Academy" },
  { slug: "moi-bheri-nursing", label: "MOI — Bheri Nursing College" },
] as const;

export type MoiSlug = (typeof MOI_INSTITUTIONS)[number]["slug"];

export const ALL_DOCUMENT_TYPE_SLUGS = [
  ...STUDENT_DOCUMENT_TYPES,
  ...WODA_VARIANTS.map((v) => v.slug),
  ...LOR_INSTITUTIONS.map((l) => l.slug),
  ...MOI_INSTITUTIONS.map((m) => m.slug),
  ...BANK_INSTITUTIONS.flatMap((b) => [
    `bank-${b.slugKey}-certificate` as BankCertificateSlug,
    `bank-${b.slugKey}-statement` as BankStatementSlug,
  ]),
] as const;

export type DocumentType = (typeof ALL_DOCUMENT_TYPE_SLUGS)[number];
