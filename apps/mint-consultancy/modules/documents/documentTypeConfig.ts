import type { DocumentType, DocumentTypeConfig } from "./documents.types";
import {
  CertificateForm,
  CertificateTemplate,
  CertificateConfigBar,
} from "./document-types/student-certificate";
import { CvForm, CvTemplate } from "./document-types/student-cv";
import { BankStatementForm, BankStatementTemplate } from "./document-types/bank-statement";
import { WodaForm, WodaTemplate } from "./document-types/woda-documents";

export const documentTypeRegistry: Record<DocumentType, DocumentTypeConfig> = {
  "student-certificate": {
    type: "student-certificate",
    label: "Certificate",
    uniquePerStudent: true,
    requiresStudent: true,
    Form: CertificateForm,
    Template: CertificateTemplate,
    ConfigBar: CertificateConfigBar,
  },
  "student-cv": {
    type: "student-cv",
    label: "CV",
    uniquePerStudent: true,
    requiresStudent: true,
    Form: CvForm,
    Template: CvTemplate,
  },
  "bank-statement": {
    type: "bank-statement",
    label: "Bank Statement",
    uniquePerStudent: false,
    requiresStudent: false,
    Form: BankStatementForm,
    Template: BankStatementTemplate,
  },
  "woda-documents": {
    type: "woda-documents",
    label: "WODA Document",
    uniquePerStudent: false,
    requiresStudent: false,
    Form: WodaForm,
    Template: WodaTemplate,
  },
};

export const documentTypeList = Object.values(documentTypeRegistry);

export function getDocumentTypeConfig(type: DocumentType): DocumentTypeConfig {
  return documentTypeRegistry[type];
}

export function getDefaultLabel(type: DocumentType): string {
  return documentTypeRegistry[type].label;
}
