import type { ComponentType } from "react";
import type { DocumentType } from "./documentTypeDefinitions";

export type { DocumentType } from "./documentTypeDefinitions";

/**
 * Grandway document statuses (`documents/INTEGRATION.md` §5). Only three exist — the
 * mintway `finalized`/`submitted`/`superseded` values do not: `submitted` maps to `ready`,
 * and print snapshots (not a status) live in `document_history`. `archived` is reachable
 * only via the archive endpoint, never the status action.
 */
export type DocumentStatus = "draft" | "ready" | "archived";

/** Status values the status action accepts (`POST /documents/<id>/status/`). */
export type DocumentStatusValue = Exclude<DocumentStatus, "archived">;

/** The backend's six-value document family vocabulary (not the 53 template slugs). */
export type DocumentFamily =
  | "student"
  | "woda"
  | "lor"
  | "moi"
  | "bank_statement"
  | "bank_certificate";

/** Pre-rendered Bikram Sambat sibling for a UTC timestamp (read-only; never sent). */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

/**
 * A reusable signatory, sourced from `document_templates`
 * (`GET /api/v1/document-templates/signatories/?status=active`). Unlike mintway (auth-gated
 * private image blobs), grandway's `signature_image` is the plain external
 * `signature_image_url` — no object-URL minting. `signature_image`/`is_active` keep
 * backend-ish casing because the certificate templates read them directly.
 */
export interface Signature {
  id: string;
  name: string;
  /** The signatory's external image URL (`signature_image_url`); `""` when none. */
  signature_image: string;
  is_active: boolean;
  title?: string;
  role?: string;
  /** True when `signature_image` is a non-empty URL. */
  has_image?: boolean;
  /**
   * Validity window. `document_templates` signatories carry no validity dates yet, so these
   * are usually absent (treated as unbounded) — kept optional for the validity helpers and a
   * future backend addition.
   */
  validFrom?: string | null;
  validTo?: string | null;
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
  place_of_birth?: string;
  gender?: string;
  current_address?: string;
  email?: string;
  contact?: string;
  image?: string;
  student_code?: string;
  // Extended personal info
  nationality?: string;
  languages_known?: string;
  // Europass structured languages (CEFR self-assessment grid)
  mother_tongue?: string;
  languages?: Array<{
    language: string;
    listening?: string;
    reading?: string;
    spoken_production?: string;
    spoken_interaction?: string;
    writing?: string;
  }>;
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
  /**
   * Europass CV appearance controls, set from the right-nav Customizations panel and
   * persisted with the document content. Optional — the other CV variants ignore it.
   */
  appearance?: {
    headerColor?: string;
    headerBrightness?: "light-2" | "light-1" | "default" | "dark-1" | "dark-2";
    fontFamily?: "serif" | "sans";
  };
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
 * Frontend-facing document (detail shape). Field names are app-native camelCase; the API
 * layer maps to/from the backend snake_case shape. `type` carries the `template_key` slug
 * that drives the template registry; `family` is the backend's six-value vocabulary.
 * `content` is opaque JSON the frontend owns entirely (`documents/INTEGRATION.md` §3).
 */
export interface Document {
  id: string;
  applicantId: string | null;
  applicantName: string | null;
  isStandalone: boolean;
  standalonePurpose: string;
  family: DocumentFamily;
  /** The `template_key` slug — drives `getDocumentTypeConfig` registry lookup. */
  type: DocumentType;
  templateKey: string;
  label: string;
  content: DocumentContent;
  status: DocumentStatus;
  notes: string;
  /** `false` once archived — `PATCH`/status then 409 (`DOCUMENT_NOT_EDITABLE`). */
  isEditable: boolean;
  isArchived: boolean;
  archiveReason: string;
  archivedAt: string | null;
  archivedAtBs: BsDate | null;
  archivedByUsername: string | null;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

/** Document list-row shape — `content` is deliberately absent (`INTEGRATION.md` §4). */
export interface DocumentListItem {
  id: string;
  applicantId: string | null;
  applicantName: string | null;
  isStandalone: boolean;
  family: DocumentFamily;
  templateKey: string;
  type: DocumentType;
  label: string;
  status: DocumentStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One row per applicant with live (non-archived, non-standalone) documents. */
export interface DocumentWorkspaceSummary {
  applicantId: string;
  applicantName: string;
  documentCount: number;
  lastUpdated: string;
}

export type DocumentHistoryAction =
  | "document_created"
  | "document_updated"
  | "document_status_changed"
  | "document_archived"
  | "document_restored";

/**
 * An audit history event (`GET /documents/<id>/history/`). Owned by the `audit` module;
 * a body change appears only as the marker `changes.content = { from, to }` — the body is
 * never in the log.
 */
export interface DocumentHistoryEvent {
  id: string;
  action: DocumentHistoryAction;
  actorType: string;
  actorId: string | null;
  actorLabel: string;
  summary: string;
  reason: string;
  changes: Record<string, { from: string; to: string }>;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdAtBs: BsDate | null;
}

export interface CreateDocumentInput {
  /** Exactly one of `applicantId` / `standalonePurpose` is required. */
  applicantId?: string | null;
  standalonePurpose?: string;
  family: DocumentFamily;
  templateKey: string;
  label: string;
  content?: DocumentContent;
  notes?: string;
}

export interface UpdateDocumentInput {
  /** Only these four are accepted — anything else 400s the whole request. */
  label?: string;
  content?: DocumentContent;
  standalonePurpose?: string;
  notes?: string;
}

/**
 * Resolved applicant summary the CV/certificate template adapters read. Field names are
 * template-native so the copied adapters keep working unchanged. Grandway's applicants
 * carry no education/summary/skills yet, so those are optional and usually blank.
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

export interface DocumentFormProps {
  applicantId: string | null;
  studentFullData?: StudentFullData | null;
  initialContent?: DocumentContent;
  signatures?: Signature[];
  onSubmit: (values: DocumentContent) => void;
  isLoading?: boolean;
}

/**
 * A point-in-time content snapshot the editor renders in place of the live document —
 * built from a `document_history` snapshot when previewing history.
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
  /** Render-only update — reflected in the local cache for live preview, never persisted. */
  onUpdate: (content: DocumentContent) => void;
  /**
   * Persisting update — PATCHes the content to the backend so the change survives reload/print.
   * Optional: config bars that only tweak the live preview (e.g. bank padding) omit it.
   */
  onPersist?: (content: DocumentContent) => void;
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
  /** Overrides the Edit-fields modal width for form-heavy types. Defaults to `"xl"`. */
  formModalSize?: string | number;
}
