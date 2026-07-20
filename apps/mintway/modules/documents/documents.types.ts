import type { ComponentType } from "react";
import type { DocumentType } from "./documentTypeDefinitions";

export type { DocumentType } from "./documentTypeDefinitions";

export type DocumentStatus =
  | "draft"
  | "ready"
  | "finalized"
  | "submitted"
  | "superseded"
  | "archived";

export interface Signature {
  id: string;
  name: string;
  /** Client-side object URL for the private signature image (empty when none / not loaded). */
  signature_image: string;
  is_active: boolean;
  title?: string;
  organization?: string;
  has_image?: boolean;
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
  // Extended personal info
  nationality?: string;
  languages_known?: string;
  religion?: string;
  alternate_email?: string;
  // Passport
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  // IELTS achievement
  ielts_overall?: string;
  ielts_date?: string;
  ielts_listening?: string;
  ielts_reading?: string;
  ielts_writing?: string;
  ielts_speaking?: string;
  // Extended sections
  courses_training?: string;
  ref1_name?: string;
  ref1_title?: string;
  ref1_institution?: string;
  ref1_address?: string;
  ref1_email?: string;
  ref1_contact?: string;
  ref2_name?: string;
  ref2_title?: string;
  ref2_institution?: string;
  ref2_address?: string;
  ref2_email?: string;
  ref2_contact?: string;
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
    description?: string;
  }>;
  educations?: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_period: string;
    end_period: string;
    gpa?: string;
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

/** Discriminates plain rows from operator-inserted, auto-computed interest/tax rows. */
export type BankTransactionType = "normal" | "interest" | "tax";

/** A single user-entered statement transaction. Running `balance` is derived, never stored. */
export interface BankTransaction {
  date: string;
  description: string;
  debit?: number;
  credit?: number;
  type?: BankTransactionType; // default "normal"
  tax_rate?: number | string; // only for type "tax"; defaults from statement_tax
}

/** Fields shared by both bank statements and bank certificates. */
type BankBaseContent = Record<string, unknown> & {
  statement_account_holder?: string;
  statement_account_no?: string;
  statement_account_address?: string;
  statement_account_type?: string;
  statement_start_date?: string;
  statement_end_date?: string;
  statement_ref_no?: string;
  statement_interest?: string | number; // rate %
  bank?: string;
  bank_template?: string;
  details?: Record<string, unknown>;
  headerProps?: Record<string, unknown>;
};

/** Input shape for `bank-*-statement` documents. Running balances and totals are DERIVED (see computeBankStatement). */
export type BankStatementContent = BankBaseContent & {
  statement_opening_balance?: number;
  statement_opening_date?: string;
  statement_tax?: string | number; // rate %
  transactions?: BankTransaction[];
  statement_spokesperson?: string;
  statement_spokesperson_post?: string;
  statement_account_status?: string;
  statement_member_id?: string;
};

/** Input shape for `bank-*-certificate` documents. */
export type BankCertificateContent = BankBaseContent & {
  statement_total_balance?: number | string;
  statement_total_balance_words?: string;
  statement_total_balance_words_usd?: string;
  statement_balance_total_number?: number | string;
  statement_usdrate?: number | string;
  statement_spokesperson?: string;
  statement_spokesperson_post?: string;
  statement_interest_post?: string;
  statement_interest_method?: string;
  statement_member_id?: string;
};

/** Broad bank content union — used where a document may be either variant. */
export type BankContent = BankStatementContent & BankCertificateContent;

export type LorContent = Record<string, unknown> & {
  lor_ref_no?: string;
  lor_letter_no?: string;
  lor_date?: string;
  institution_name?: string;
  institution_subname?: string;
  institution_address?: string;
  lor_title?: string;
  lor_salutation?: string;
  student_honorific?: string;
  student_name?: string;
  para_1?: string;
  para_2?: string;
  para_3?: string;
  para_4?: string;
  recommender_honorific?: string;
  recommender_name?: string;
  recommender_title?: string;
  recommender_dept?: string;
  recommender_contact?: string;
  recommender_email?: string;
  headerProps?: Record<string, unknown>;
};

export type MoiContent = Record<string, unknown> & {
  moi_ref_no?: string;
  moi_letter_no?: string;
  moi_date?: string;
  institution_name?: string;
  institution_address?: string;
  student_honorific?: string;
  student_name?: string;
  student_last_name?: string;
  student_pronoun?: string;
  signatory_name?: string;
  signatory_contact?: string;
  signatory_email?: string;
  headerProps?: Record<string, unknown>;
};

export type DocumentContent =
  | CertificateContent
  | CvContent
  | WodaContent
  | BankContent
  | LorContent
  | MoiContent;

/**
 * Frontend-facing document. Field names stay app-native (`type`, `content`, `applicantId`)
 * — the API layer maps to/from the backend shape (`document_type`, `document_content`,
 * `applicant`, `record_version`, …) and translates the legacy `student-*` ⇄ `applicant-*`
 * slugs. `recordVersion` powers optimistic concurrency on update.
 */
export interface Document {
  id: string;
  applicantId: string | null;
  type: DocumentType;
  label: string;
  content: DocumentContent;
  status: DocumentStatus;
  recordVersion: number;
  currentRevisionNumber: number;
  schemaVersion: number;
  applicationCaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Status action verbs exposed by the backend (`POST /documents/:id/:action/`). */
export type DocumentStatusAction = "ready" | "finalize" | "submit" | "archive";

/**
 * Immutable content snapshot appended on every persisted content edit
 * (`GET /documents/:id/revisions/`). Surfaced inline in the History sidebar; `restore`
 * appends a new revision rather than mutating history.
 */
export interface DocumentRevision {
  id: string;
  revisionNumber: number;
  contentSnapshot: DocumentContent;
  labelSnapshot: string;
  statusSnapshot: DocumentStatus;
  documentTypeSnapshot: DocumentType;
  changeReason?: string;
  changedBy?: string | null;
  createdAt: string;
}

/** Frontend-computed derived values captured verbatim on a print/render event. */
export interface PrintEventSnapshot {
  contentSnapshot?: DocumentContent;
  resolvedApplicantDataSnapshot?: Record<string, unknown>;
  derivedValuesSnapshot?: Record<string, unknown>;
  renderConfigSnapshot?: Record<string, unknown>;
}

export type PrintStatus =
  | "rendered"
  | "print_initiated"
  | "artifact_downloaded"
  | "failed";

/** Evidentiary print/render record (`GET /documents/:id/print-events/`). */
export interface PrintEvent {
  id: string;
  documentId: string;
  type: DocumentType;
  /**
   * The linked revision's **id** (UUID). The API takes `revision_number` on create
   * but returns `document_revision` as an id on read — they are not the same value,
   * so this must never be coerced to a number. Resolve the display number by
   * matching against the revisions list.
   */
  revisionId: string | null;
  snapshot: PrintEventSnapshot;
  printStatus: PrintStatus;
  printedAt: string;
}

/** Payload the editor sends when recording a print (derived values computed client-side). */
export interface CreatePrintEventInput {
  revisionNumber?: number | null;
  contentSnapshot?: DocumentContent;
  derivedValuesSnapshot?: Record<string, unknown>;
  renderConfigSnapshot?: Record<string, unknown>;
  templateKey?: string;
  templateVersion?: string;
  printStatus?: PrintStatus;
}

export interface CreateDocumentInput {
  applicantId: string;
  type: DocumentType;
  label: string;
  content: DocumentContent;
  applicationCaseId?: string | null;
}

export interface UpdateDocumentInput {
  label?: string;
  content?: DocumentContent;
  schemaVersion?: number;
  recordVersion: number;
  /**
   * Why this edit was made. Stored on the revision the PATCH appends and shown in
   * the revision history; without it every revision reads "No reason given".
   */
  changeReason?: string;
  /** Frontend document type — used only to map certificate content keys; never sent. */
  type?: DocumentType;
}

/**
 * Reusable applicant data composed by `GET /applicants/:id/document-prefill/`. Kept loose —
 * it aggregates the applicant plus profile children; the editor maps the fields it needs into
 * a document snapshot (documents are persisted independently, §12.5).
 */
export type DocumentPrefill = Record<string, unknown>;

/**
 * Resolved applicant summary the template adapters read (derived from the prefill). Field
 * names are template-native so the copied CV/certificate adapters keep working unchanged.
 */
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

/** Certificate signatory (`GET /signatures/`). `signature_image` is a client object URL. */
export interface SignatureInput {
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  imageFile?: File | null;
}

export interface DocumentFormProps {
  applicantId: string | null;
  studentFullData?: StudentFullData | null;
  initialContent?: DocumentContent;
  signatures?: Signature[];
  onSubmit: (values: DocumentContent) => void;
  isLoading?: boolean;
}

/**
 * A point-in-time content snapshot the editor can render in place of the live document —
 * built from either a revision or a print event when the user previews history.
 */
export interface HistoricalSnapshot {
  content: DocumentContent;
  config?: Record<string, unknown>;
}

export interface DocumentTemplateProps {
  document: Document;
  studentFullData?: StudentFullData | null;
  signatures?: Signature[];
  historicalSnapshot?: HistoricalSnapshot | null;
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
  applicantId: string;
  applicantCode: string;
  applicantName: string;
  documentCount: number;
  draftCount: number;
  finalizedCount: number;
  submittedCount: number;
  lastUpdated: string;
}
