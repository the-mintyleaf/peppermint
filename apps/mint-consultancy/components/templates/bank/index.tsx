// ─── Bank Statement Templates ──────────────────────────────────────────────────
// All bank templates organized by institution

// Bigyalaxmi
import { TemplateBigyalaxmiCertificate } from "./bigyalaxmi/certificate";
import { TemplateBigyalaxmiStatement } from "./bigyalaxmi/statement";

// Sumnima
import { TemplateSumnimaCertificate } from "./sumnima/certificate";
import { TemplateSumnimaStatement } from "./sumnima/statement";

// Mata Bageshwori
import { TemplateMataBageshworiCertificate } from "./mataBageshwori/certificate";
import { TemplateMataBageshworiStatement } from "./mataBageshwori/statement";

// Narayan
import { TemplateNarayanCertificate } from "./narayan/certificate";
import { TemplateNarayanStatement } from "./narayan/statement";

// Himchuli
import { TemplateHimchuliCertificate } from "./himchuli/certificate";
import { TemplateHimchuliStatement } from "./himchuli/statement";

// Vyas
import { TemplateVyasertificate } from "./vyas/certificate";
import { TemplateVyasStatement } from "./vyas/statement";

// Birendranagar
import { TemplateBirendranagarCertificate } from "./birendranagar/certificate";
import { TemplateBirendranagarStatement } from "./birendranagar/statement";

// Karnali
import { TemplateKarnaliCertificate } from "./karnali/certificate";
import { TemplateKarnaliStatement } from "./karnali/statement";

// Janautthan
import { TemplateJanautthanCertificate } from "./janautthan/certificate";
import { TemplateJanautthanStatement } from "./janautthan/statement";

// Tribeni
import { TemplateTribeniCertificate } from "./tribeni/certificate";
import { TemplateTribeniStatement } from "./tribeni/statement";

// Shahabhagi
import { TemplateShahabhagiCertificate } from "./shahabhagi/certificate";
import { TemplateShahabhagiStatement } from "./shahabhagi/statement";

// ─── Display Component (re-exported from display.tsx) ─────────────────────────
export { BankStatementDisplayTemplate } from "./display";

// ─── Named Exports ────────────────────────────────────────────────────────────
export const BankTemplates = {
  bigyalaxmi: {
    certificate: TemplateBigyalaxmiCertificate,
    statement: TemplateBigyalaxmiStatement,
  },
  birendranagar: {
    certificate: TemplateBirendranagarCertificate,
    statement: TemplateBirendranagarStatement,
  },
  himchuli: {
    certificate: TemplateHimchuliCertificate,
    statement: TemplateHimchuliStatement,
  },
  janautthan: {
    certificate: TemplateJanautthanCertificate,
    statement: TemplateJanautthanStatement,
  },
  karnali: {
    certificate: TemplateKarnaliCertificate,
    statement: TemplateKarnaliStatement,
  },
  mataBageshwori: {
    certificate: TemplateMataBageshworiCertificate,
    statement: TemplateMataBageshworiStatement,
  },
  narayan: {
    certificate: TemplateNarayanCertificate,
    statement: TemplateNarayanStatement,
  },
  shahabhagi: {
    certificate: TemplateShahabhagiCertificate,
    statement: TemplateShahabhagiStatement,
  },
  sumnima: {
    certificate: TemplateSumnimaCertificate,
    statement: TemplateSumnimaStatement,
  },
  tribeni: {
    certificate: TemplateTribeniCertificate,
    statement: TemplateTribeniStatement,
  },
  vyas: {
    certificate: TemplateVyasertificate,
    statement: TemplateVyasStatement,
  },
} as const;

export type BankTemplateKey = keyof typeof BankTemplates;
export type BankTemplateVariant = "certificate" | "statement";
