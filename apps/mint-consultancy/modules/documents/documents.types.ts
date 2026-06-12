import type { ComponentType } from "react";
import type { DocumentType } from "./documentTypeDefinitions";

export type { DocumentType } from "./documentTypeDefinitions";

export type DocumentStatus = "draft" | "submitted" | "archived";

export interface Signature {
  id: string;
  name: string;
  signature_image: string;
  is_active: boolean;
}

export interface CertificateMarkEntry {
  month: string | number;
  total_days?: number;
  class_hr?: number;
  present?: number;
  absent?: number;
  attendance_percentage?: number | string;
}

export interface CertificateContent {
  issueDate?: string;
  issue?: string;
  studyType: 0 | 1;
  instructorId: string | null;
  directorId: string | null;
  studentName?: string;
  program?: string;
  nationality?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  date_of_admission?: string;
  date_of_completion?: string;
  coursehour?: number;
  grammar?: string;
  listening?: string;
  conversation?: string;
  reading?: string;
  composition?: string;
  image?: string;
  customBranch?: string;
  customBranchNo?: string;
  batch?: {
    course?: {
      name?: string;
      level?: string;
      total_days?: number;
      books?: Array<{ name: string }>;
    };
    instructor?: unknown[];
  };
  marking?: CertificateMarkEntry[];
  details?: Record<string, unknown>;
  headerProps?: Record<string, unknown>;
}

export interface CvContent {
  summary?: string;
  skills?: string;
  experience?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  current_address?: string;
  email?: string;
  contact?: string;
  image?: string;
  student_code?: string;
  contact_detail?: {
    emergency_contact_name?: string;
    emergency_contact_relation?: string;
    emergency_contact_phone?: string;
  };
  experiences?: Array<{
    company: string;
    role: string;
    start_period: string;
    end_period: string;
  }>;
  educations?: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_period: string;
    end_period: string;
  }>;
  family_members?: Array<{
    name: string;
    relationship: string;
    age: number;
    occupation?: string;
    contact?: string;
  }>;
  gradings?: Array<{
    grammar: string;
    conversation: string;
    composition: string;
    listening: string;
    reading: string;
  }>;
  batch_detail?: { course?: string; name?: string };
}

export type WodaContent = Record<string, unknown> & {
  wodadoc_refno?: string;
  wodadoc_date?: string;
  applicant_name?: string;
  details?: Record<string, unknown>;
  headerProps?: Record<string, unknown>;
};

export type BankContent = Record<string, unknown> & {
  statement_account_holder?: string;
  statement_account_no?: string;
  statement_account_address?: string;
  statement_start_date?: string;
  statement_end_date?: string;
  statement_interest?: string;
  statement_opening_balance?: number;
  statement_closing_balance?: number;
  transactions?: Array<Record<string, unknown>>;
  bank?: string;
  bank_template?: string;
  details?: Record<string, unknown>;
  headerProps?: Record<string, unknown>;
};

export type DocumentContent = CertificateContent | CvContent | WodaContent | BankContent;

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
