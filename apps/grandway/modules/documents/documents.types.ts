import type { ComponentType } from "react";
import type { SignatorySource } from "@/modules/admin/signatures";
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
 * A signatory as the editor and its templates see it — the **picker/render**
 * shape, not the API DTO. The DTO (`Signatory`) lives in
 * `@/modules/admin/signatures`, which owns this domain; `useSignatures` maps one
 * to the other.
 *
 * The three `signature_*` fields are exactly `SignatureSourceRef`, so this type
 * can be handed straight to `useResolvedSignatureImage` without either module
 * knowing the other's full shape. **There is no resolved image on this type** —
 * uploaded bytes need an authenticated fetch, so only the adapter that knows
 * which two signatories a certificate actually names resolves them.
 *
 * `is_active` keeps backend-ish casing because it is read straight off the DTO.
 */
export interface Signature {
  id: string;
  name: string;
  is_active: boolean;
  title?: string;
  role?: string;
  /** Japanese role line on the certificate. Not a backend field — no endpoint supplies it. */
  jp_role?: string;
  /** Which of the two possible sources is in force. **The only field to branch rendering on.** */
  signature_source: SignatorySource;
  /** The uploaded file's id; `null` unless `signature_source` is `"uploaded"`. */
  signature_file_id: string | null;
  /** The external-link fallback; `""` when unset. Outranked by an uploaded file. */
  signature_image_url: string;
}

/**
 * What a certificate template actually renders: a signatory whose image has
 * already been resolved to a usable URL by the adapter.
 */
export interface RenderSignature {
  id: string;
  name: string;
  role?: string;
  jp_role?: string;
  /** A URL an `<img>` can use, or `""` for a blank signature slot. */
  signature_image: string;
}

/**
 * One attendance row. Stored rows use `month: "YYYY-MM"`; a number (or a bare
 * `"3"`) is how the oldest certificates stored it and is only ever read.
 * `class_hr`, `present` and `absent` are all **hours** (`present + absent ≤
 * class_hr`, `documents/INTEGRATION.md` §7).
 */
export interface CertificateMarkEntry {
  month: string | number;
  total_days?: number;
  class_hr?: number;
  present?: number;
  absent?: number;
  attendance_percentage?: number | string;
}

export type CertificateGender = "male" | "female" | "other" | "";
export type CertificateGradeValue = "A" | "B" | "C" | "D" | "";
export type CertificateSkill =
  | "grammar"
  | "listening"
  | "conversation"
  | "reading"
  | "composition";

/**
 * A `student-certificate` body. **The backend validates this one** (§7, snake_case
 * keys) on create and on every PATCH carrying content — a bad value is 400
 * `DOCUMENTS_CONTENT_INVALID` with `details.fields` keyed by path.
 *
 * The first block is the validated key set and is the only thing ever written.
 * The second block is what certificates saved before 2026-10-29 used: read by
 * `normalizeCertificateContent` so those documents still open and print, and
 * stripped on the next save (`toStoredCertificateContent`). `gender: "Male"` from
 * that era is now rejected, which is why it is never sent back as-is.
 */
export interface CertificateContent {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  course_name?: string;
  course_level?: string;
  course_books?: string[];
  course_total_days?: number | null;
  course_hours_per_day?: number | string | null;
  date_of_admission?: string;
  date_of_completion?: string;
  issue?: string;
  marking?: CertificateMarkEntry[];
  grades?: Partial<Record<CertificateSkill, string>>;
  study_type?: 0 | 1;
  photo_media_id?: string | null;
  instructor_id?: string | null;
  director_id?: string | null;
  branch_name?: string;
  branch_no?: string;
  /** Frontend-only portrait URL override; unvalidated, carried over untouched. */
  image?: string;
  details?: Record<string, unknown>;
  headerProps?: Record<string, unknown>;

  // ── Legacy keys (read only — never written) ───────────────────────────────
  /** @deprecated → `issue` */
  issueDate?: string;
  /** @deprecated → `study_type` */
  studyType?: 0 | 1;
  /** @deprecated → `instructor_id` */
  instructorId?: string | null;
  /** @deprecated → `director_id` */
  directorId?: string | null;
  /** @deprecated → split into `firstname`/`middlename`/`lastname` */
  studentName?: string;
  /** @deprecated → `course_name` */
  program?: string;
  /** @deprecated — never printed */
  nationality?: string;
  /** @deprecated → `course_hours_per_day` */
  coursehour?: number;
  /** @deprecated → `grades.grammar` (same for the other four skills) */
  grammar?: string;
  /** @deprecated → `grades.listening` */
  listening?: string;
  /** @deprecated → `grades.conversation` */
  conversation?: string;
  /** @deprecated → `grades.reading` */
  reading?: string;
  /** @deprecated → `grades.composition` */
  composition?: string;
  /** @deprecated → `branch_name` */
  customBranch?: string;
  /** @deprecated → `branch_no` */
  customBranchNo?: string;
  /** @deprecated → `course_name`/`course_level`/`course_total_days`/`course_books` */
  batch?: {
    course?: {
      name?: string;
      level?: string;
      total_days?: number;
      books?: Array<{ name: string }>;
    };
    instructor?: unknown[];
  };
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
  show_refno?: boolean;
  wodadoc_refno?: string;
  show_dispatch_no?: boolean;
  dispatch_no?: string;
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
  interest_rate?: number | string; // only for type "interest"; defaults from statement_interest
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
  /**
   * The layout version the document was authored for — an opaque label, default
   * `"1"` (`documents/INTEGRATION.md` §4). New Woda letters are created as `"2"`
   * (`getTemplateVersion`). No template branches on it yet: older content is
   * recognised by its shape, which is what keeps pre-version documents rendering.
   */
  templateVersion: string;
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

/**
 * One row per applicant with **any** applicant-owned documents (standalone are
 * excluded). `documentCount` counts live ones (`draft`/`ready`), `archivedCount`
 * removed ones — so an applicant whose documents are all archived still has a row,
 * with `documentCount: 0`.
 */
export interface DocumentWorkspaceSummary {
  applicantId: string;
  applicantName: string;
  documentCount: number;
  archivedCount: number;
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
  /** `^[A-Za-z0-9._-]{1,20}$`; omitted → backend default `"1"`. */
  templateVersion?: string;
  notes?: string;
}

export interface UpdateDocumentInput {
  /** Only these five are accepted — anything else 400s the whole request. */
  label?: string;
  content?: DocumentContent;
  templateVersion?: string;
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
  /**
   * The applicant's photograph as an object URL, for the templates that print a
   * portrait (the CVs and the student certificate). Not part of the applicant
   * payload — it is minted from the `uploaded_files` bytes by the editor
   * provider, which is why it is absent from `fetchApplicantSummary`'s mapping
   * and filled in afterwards. `undefined` until it resolves, and for standalone
   * documents that have no applicant at all.
   *
   * **Never persist this.** An object URL is valid only for the page that
   * created it; storing one in document content would render a broken image
   * after any reload.
   */
  photoUrl?: string;
  /**
   * The `uploaded_files` id behind `photoUrl` — what a certificate stores as
   * `content.photo_media_id`. `null` once the lookup settled and the applicant has
   * no photograph; `undefined` while unknown (loading, failed, or standalone).
   */
  photoFileId?: string | null;
  summary?: string;
  skills?: string;
  experience?: string;
}

export interface DocumentFormProps {
  applicantId: string | null;
  studentFullData?: StudentFullData | null;
  initialContent?: DocumentContent;
  signatures?: Signature[];
  /**
   * Hands the content to the editor, which saves it. The returned promise settles
   * with the save: it **rejects** with the API error when the backend refuses it.
   * A form that can place server field errors (the student certificate, whose
   * content the backend validates) awaits it; the rest may ignore it — the editor
   * reports the failure and keeps the modal open either way.
   */
  onSubmit: (values: DocumentContent) => void | Promise<void>;
  isLoading?: boolean;
  /**
   * Lets a form widen or narrow the modal it sits in — a tabbed form needs a different
   * width per tab, which the static `formModalSize` can't express. Optional: forms that
   * fit one width simply ignore it.
   */
  onModalSizeChange?: (size: string | number) => void;
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
  /**
   * `template_version` sent when a document of this type is **created**. Omitted →
   * the backend's `"1"`. Existing documents keep the version they were created with.
   */
  templateVersion?: string;
}
