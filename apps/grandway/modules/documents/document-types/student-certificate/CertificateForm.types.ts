import type { FormInstanceContextValue } from "@peppermint/admin";
import type { DocumentPrefill } from "../../documentPrefill.types";
import type {
  CertificateContent,
  CertificateGender,
  DocumentFormProps,
} from "../../documents.types";
import type { AttendanceMonthRange } from "./attendanceRange";

export type CertificateGrade = "A" | "B" | "C" | "D";

/** One month of the attendance table. Class and absent hours are derived on save. */
export interface CertificateAttendanceRow {
  /** `YYYY-MM-DD`, always the first of the month — what the month picker yields. */
  month: string | null;
  total_days: number | "";
  /**
   * Days attended — what the form asks for. The certificate stores and prints
   * hours attended, worked out on save as days attended × hours per class.
   */
  days_attended: number | "";
  /**
   * Only on an older row whose stored hours could not be turned into days (no
   * hours per class to divide by): those hours, kept as they are on save until
   * days attended are typed.
   */
  present_hours?: number;
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
  /**
   * Runs the client validation before the save. Returns `false` (after opening
   * the tab with the first error) to stop it.
   */
  onBeforeSubmit: () => boolean;
}

/** The form's two tabs. */
export type CertificateTab = "general" | "attendance";

export interface CertificateFormTabsProps {
  tab: CertificateTab;
  onTabChange: (tab: CertificateTab) => void;
  applicantId: string | null;
  /** The applicant's name, for the photo field. */
  studentName?: string;
  signatureOptions: { value: string; label: string }[];
  disabled?: boolean;
}

export interface CertificateTabErrorBadgeProps {
  /** Fields with an error on the tab; nothing renders at 0. */
  count: number;
}

/** Start month / number of months picked while the table forms no range yet. */
export interface AttendanceRangeDraft {
  /** `YYYY-MM-01`. */
  start: string | null;
  count: number | null;
}

export interface CertificateAttendanceTableProps extends CertificateSectionProps {
  /**
   * `true` when the rows are one unbroken run, so the range sets every month and
   * the month column only names it. `false` for an older table shown as saved:
   * each month stays pickable and a row can be removed.
   */
  rangeDriven: boolean;
}

export interface CertificateAttendanceRowProps extends CertificateSectionProps {
  form: CertificateFormInstance;
  row: CertificateAttendanceRow;
  index: number;
  rangeDriven: boolean;
}

export interface CertificateMonthNameProps {
  /** `"Aug 2024"`. */
  name: string;
  /** A server refusal on the row's month. */
  error?: string;
}

export interface CertificateAttendanceRangeProps extends CertificateSectionProps {
  /** The range the rows form, or `null` when they form none. */
  range: AttendanceMonthRange | null;
  /** The table holds rows that form no range — an older certificate. */
  legacy: boolean;
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
