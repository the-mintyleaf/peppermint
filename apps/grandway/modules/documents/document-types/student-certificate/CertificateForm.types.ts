import type { FormInstanceContextValue } from "@peppermint/admin";
import type { DocumentPrefill } from "../../documentPrefill.types";
import type {
  CertificateContent,
  CertificateGender,
  DocumentFormProps,
} from "../../documents.types";

export type CertificateGrade = "A" | "B" | "C" | "D";

/** One month of the attendance table. Class and absent hours are derived on save. */
export interface CertificateAttendanceRow {
  /** `YYYY-MM-DD`, always the first of the month — what the month picker yields. */
  month: string | null;
  total_days: number | "";
  present: number | "";
  /**
   * Only on a row from an older certificate whose month could not be read
   * (`0`, `13`, free text): what was stored, shown so the operator can pick the
   * right month. The row is kept, never dropped.
   */
  source_month?: string;
}

/**
 * The certificate form's own shape. Field names are the backend's validated
 * content keys (`documents/INTEGRATION.md` §7) wherever one exists, so a
 * `DOCUMENTS_CONTENT_INVALID` path lands on its field by name; the exceptions are
 * the attendance rows (`marking[i]` → `attendance.i`) and the five grades
 * (`grades.grammar` → `grammar`) — see `serverPathToFormPath`.
 */
export interface CertificateFormValues extends Record<string, unknown> {
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: string | null;
  /** `""` until picked — the template prints it, so it is required. */
  gender: CertificateGender;
  address: string;
  course_name: string;
  course_level: string;
  course_books: string[];
  course_total_days: number | "";
  course_hours_per_day: number | "";
  date_of_admission: string | null;
  date_of_completion: string | null;
  issue: string | null;
  study_type: "0" | "1";
  attendance: CertificateAttendanceRow[];
  grammar: CertificateGrade;
  listening: CertificateGrade;
  conversation: CertificateGrade;
  reading: CertificateGrade;
  composition: CertificateGrade;
  instructor_id: string | null;
  director_id: string | null;
  branch_name: string;
  branch_no: string;
  /**
   * The photograph the certificate prints. No input of its own — the photo field
   * edits the applicant's photograph, and the save writes whichever is current.
   */
  photo_media_id: string | null;
}

export type CertificateFormInstance =
  FormInstanceContextValue<CertificateFormValues>["form"];

/** Shared by the form's section components. */
export interface CertificateSectionProps {
  disabled?: boolean;
}

export interface CertificateSignatorySectionProps extends CertificateSectionProps {
  signatureOptions: { value: string; label: string }[];
}

export interface CertificateSubmitButtonProps {
  isEdit: boolean;
  isLoading?: boolean;
}

export interface CertificateFormRefBridgeProps {
  /** Receives the live form instance so a server refusal can be marked on it. */
  onForm: (form: CertificateFormInstance) => void;
}

export interface CertificateFormBodyProps extends DocumentFormProps {
  /** The stored body when editing; `undefined` when creating. */
  existing: CertificateContent | undefined;
  /** The applicant file, for a NEW certificate only. */
  prefill: DocumentPrefill | null;
  /** The prefill was asked for and failed — the form opens unseeded. */
  prefillFailed: boolean;
}

/** Why a Customizations-panel save was refused. */
export type CertificatePanelRefusal =
  | { kind: "fields"; fields: Record<string, string> }
  | { kind: "other"; message: string };

export interface CertificatePanelRefusalProps {
  refusal: CertificatePanelRefusal;
}

export interface CertificateUnplacedErrorsProps {
  /** Server refusals no input owns, keyed by content path. */
  errors: Record<string, string>;
}
