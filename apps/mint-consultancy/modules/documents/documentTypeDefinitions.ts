export const WODA_VARIANTS = [
  { slug: "woda-address", folder: "address", exportName: "TemplatePermanentAddress", label: "WODA — Address Change" },
  { slug: "woda-dob", folder: "dob", exportName: "TemplateDOBVerification", label: "WODA — DOB Verification" },
  { slug: "woda-fiscal", folder: "fiscal", exportName: "TemplateFiscalYear", label: "WODA — Fiscal Year" },
  { slug: "woda-income", folder: "income", exportName: "TemplateIncomeVerification", label: "WODA — Income Verification" },
  { slug: "woda-migration", folder: "migration", exportName: "TemplateMigration", label: "WODA — Migration" },
  { slug: "woda-occupation", folder: "occupation", exportName: "TemplateOccupationVerification", label: "WODA — Occupation" },
  { slug: "woda-relationship", folder: "relationship", exportName: "TemplateRelationshipVerification", label: "WODA — Relationship" },
  { slug: "woda-surname", folder: "surname", exportName: "TemplateSurname", label: "WODA — Surname" },
  { slug: "woda-tax-clearance", folder: "taxClearance", exportName: "TemplateTaxClearance", label: "WODA — Tax Clearance" },
  { slug: "woda-agriculture-income", folder: "agriculture-income", exportName: "TemplateAgricultureIncome", label: "WODA — Agriculture Income" },
] as const;

export const BANK_INSTITUTIONS = [
  { slugKey: "bigyalaxmi", folder: "bigyalaxmi", label: "Bigyalaxmi" },
  { slugKey: "birendranagar", folder: "birendranagar", label: "Birendranagar" },
  { slugKey: "himchuli", folder: "himchuli", label: "Himchuli" },
  { slugKey: "janautthan", folder: "janautthan", label: "Janautthan" },
  { slugKey: "karnali", folder: "karnali", label: "Karnali" },
  { slugKey: "mata-bageshwori", folder: "mataBageshwori", label: "Mata Bageshwori" },
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
export type BankInstitutionSlugKey = (typeof BANK_INSTITUTIONS)[number]["slugKey"];

export type BankCertificateSlug = `bank-${BankInstitutionSlugKey}-certificate`;
export type BankStatementSlug = `bank-${BankInstitutionSlugKey}-statement`;

export const STUDENT_DOCUMENT_TYPES = ["student-certificate", "student-cv"] as const;

export const LOR_INSTITUTIONS = [
  { slug: "lor-janajagriti", label: "LOR — Shree Janajagriti Secondary School" },
  { slug: "lor-bageshwari-chief", label: "LOR — Bageshwari Multiple Campus (Campus Chief)" },
  { slug: "lor-bageshwari-hod", label: "LOR — Bageshwari Multiple Campus (Head of Dept.)" },
  { slug: "lor-shiva", label: "LOR — Shree Shiva Secondary School" },
  { slug: "lor-kcmit", label: "LOR — Kantipur College (KCMIT)" },
  { slug: "lor-tri-chandra", label: "LOR — Tri-Chandra Multiple Campus" },
  { slug: "lor-monastic", label: "LOR — Monastic Secondary English School" },
  { slug: "lor-om-health", label: "LOR — Om Health Campus" },
  { slug: "lor-atlantic", label: "LOR — Atlantic International College" },
  { slug: "lor-model-technical", label: "LOR — Model College of Technical Education" },
  { slug: "lor-nepalgunj", label: "LOR — Nepalgunj Technical College" },
] as const;

export type LorSlug = (typeof LOR_INSTITUTIONS)[number]["slug"];

export const ALL_DOCUMENT_TYPE_SLUGS = [
  ...STUDENT_DOCUMENT_TYPES,
  ...WODA_VARIANTS.map((v) => v.slug),
  ...LOR_INSTITUTIONS.map((l) => l.slug),
  ...BANK_INSTITUTIONS.flatMap((b) => [
    `bank-${b.slugKey}-certificate` as BankCertificateSlug,
    `bank-${b.slugKey}-statement` as BankStatementSlug,
  ]),
] as const;

export type DocumentType = (typeof ALL_DOCUMENT_TYPE_SLUGS)[number];
