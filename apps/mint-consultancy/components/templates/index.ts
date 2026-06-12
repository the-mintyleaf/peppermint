// ─── Template Barrel ──────────────────────────────────────────────────────────
// Central export for all document templates.
//
// Usage:
//   import { Templates, WodaTemplates, BankTemplates } from "@/components/templates";
//   import { TemplateStudentCertificate } from "@/components/templates";
//
// Nested access:
//   Templates.student.certificate
//   Templates.woda.dob_verification
//   Templates.bank.bigyalaxmi.certificate
//   Templates.bank.bigyalaxmi.statement

// ─── Re-exports ───────────────────────────────────────────────────────────────

// Student Certificate
export { TemplateStudentCertificate } from "./student-certificate";
export { TemplateStudentCV } from "./student-cv";

// Woda Templates
export { WodaTemplates, WodaDocumentDisplayTemplate } from "./woda";
export type { WodaTemplateKey } from "./woda";

// Bank Templates
export { BankTemplates, BankStatementDisplayTemplate } from "./bank";
export type { BankTemplateKey, BankTemplateVariant } from "./bank";

// ─── Unified Templates Object ─────────────────────────────────────────────────

import { TemplateStudentCertificate } from "./student-certificate";
import { TemplateStudentCV } from "./student-cv";
import { WodaTemplates } from "./woda";
import { BankTemplates } from "./bank";

export const Templates = {
  student: {
    certificate: TemplateStudentCertificate,
    cv: TemplateStudentCV,
  },
  woda: WodaTemplates,
  bank: BankTemplates,
} as const;

export type TemplateKey =
  | { type: "student"; variant: "certificate" | "cv" }
  | { type: "woda"; variant: keyof typeof WodaTemplates }
  | { type: "bank"; bank: keyof typeof BankTemplates; variant: "certificate" | "statement" };
