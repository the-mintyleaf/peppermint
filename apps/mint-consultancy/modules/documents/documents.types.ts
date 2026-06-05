import type { ComponentType } from "react";

export type DocumentType =
  | "student-certificate"
  | "student-cv"
  | "bank-statement"
  | "woda-documents";

export type DocumentStatus = "draft" | "submitted" | "archived";

export interface Signature {
  id: string;
  name: string;
  signature_image: string;
  is_active: boolean;
}

export interface CertificateContent {
  issueDate: string;
  studyType: 0 | 1;
  instructorId: string | null;
  directorId: string | null;
  studentName: string;
  program: string;
  nationality: string;
}

export interface CvContent {
  summary: string;
  skills: string;
  experience: string;
}

export interface BankStatementContent {
  bankKey: string;
  accountHolder: string;
  accountNumber: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
}

export interface WodaContent {
  title: string;
  documentNumber: string;
  issueDate: string;
  recipient: string;
  body: string;
}

export type DocumentContent =
  | CertificateContent
  | CvContent
  | BankStatementContent
  | WodaContent;

export interface Document {
  id: string;
  studentId: string | null;
  type: DocumentType;
  label: string;
  content: DocumentContent;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PrintLogSnapshot {
  content: DocumentContent;
  config?: Record<string, unknown>;
}

export interface PrintLog {
  id: string;
  documentId: string;
  type: DocumentType;
  snapshot: PrintLogSnapshot;
  printedAt: string;
}

export interface CreateDocumentInput {
  studentId: string | null;
  type: DocumentType;
  label: string;
  content: DocumentContent;
}

export interface UpdateDocumentInput {
  label?: string;
  content?: DocumentContent;
  status?: DocumentStatus;
}

export interface StudentFullData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  nationality: string;
  enrolledAt: string;
  summary?: string;
  skills?: string;
  experience?: string;
}

export interface DocumentFormProps {
  studentId: string | null;
  studentFullData?: StudentFullData | null;
  onSubmit: (values: DocumentContent) => void;
  isLoading?: boolean;
}

export interface DocumentTemplateProps {
  document: Document;
  studentFullData?: StudentFullData | null;
  signatures?: Signature[];
  historicalSnapshot?: PrintLogSnapshot | null;
  isHistorical?: boolean;
}

export interface DocumentConfigBarProps {
  document: Document;
  onUpdate: (content: DocumentContent) => void;
  signatures?: Signature[];
  disabled?: boolean;
}

export interface DocumentTypeConfig {
  type: DocumentType;
  label: string;
  uniquePerStudent: boolean;
  requiresStudent: boolean;
  Form: ComponentType<DocumentFormProps>;
  Template: ComponentType<DocumentTemplateProps>;
  ConfigBar?: ComponentType<DocumentConfigBarProps>;
}

export interface DocumentWorkspaceSummary extends Record<string, unknown> {
  studentId: string;
  studentName: string;
  documentCount: number;
  lastUpdated: string;
}
