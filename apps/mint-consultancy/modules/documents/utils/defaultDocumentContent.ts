import type { BankContent, CertificateContent, CvContent, DocumentContent, DocumentType, WodaContent } from "../documents.types";
import { BANK_INSTITUTIONS, WODA_VARIANTS } from "../documentTypeDefinitions";

const wodaBaseDefaults: WodaContent = {
  wodadoc_refno: "",
  wodadoc_date: new Date().toISOString().split("T")[0],
  applicant_name: "",
  applicant_honorific: "Mr.",
  applicant_gender: "Male",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
};

const wodaVariantDefaults: Partial<Record<DocumentType, Record<string, unknown>>> = {
  "woda-address": {
    applicant_father_name: "",
    applicant_father_honorific: "",
    applicant_mother_name: "",
    applicant_mother_honorific: "",
    initial_address_name: "",
    applicant_permanent_address: "",
    address_name_change_date_bs: "",
    address_name_change_date: "",
  },
};

const bankBaseDefaults = (slugKey: string): BankContent => ({
  statement_account_holder: "",
  statement_account_no: "",
  statement_account_address: "",
  statement_start_date: "",
  statement_end_date: new Date().toISOString().split("T")[0],
  statement_interest: "5",
  statement_opening_balance: 0,
  statement_closing_balance: 0,
  transactions: [],
  details: {},
  bank: slugKey,
  bank_template: "",
});

export function getDefaultDocumentContent(type: DocumentType): DocumentContent {
  if (type === "student-certificate") {
    const today = new Date().toISOString().split("T")[0];
    return {
      issue: today,
      issueDate: today,
      studyType: 0,
      instructorId: null,
      directorId: null,
      studentName: "",
      program: "",
      nationality: "",
    } satisfies CertificateContent;
  }

  if (type === "student-cv") {
    return { summary: "", skills: "", experience: "" } satisfies CvContent;
  }

  const wodaVariant = WODA_VARIANTS.find((v) => v.slug === type);
  if (wodaVariant) {
    return {
      ...wodaBaseDefaults,
      ...(wodaVariantDefaults[type] ?? {}),
    };
  }

  const bankMatch = type.match(/^bank-(.+)-(certificate|statement)$/);
  if (bankMatch) {
    const [, slugKey, variant] = bankMatch;
    return {
      ...bankBaseDefaults(slugKey),
      bank_template: variant,
    };
  }

  return {};
}

export function usesCreateModal(type: DocumentType): boolean {
  return type === "student-certificate" || type === "student-cv";
}
