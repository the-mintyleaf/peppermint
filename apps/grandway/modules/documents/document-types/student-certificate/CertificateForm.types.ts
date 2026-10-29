export type CertificateGrade = "A" | "B" | "C" | "D";

/** One month of the attendance table. Class and absent hours are derived on save. */
export interface CertificateAttendanceRow {
  /** `YYYY-MM-DD`, always the first of the month — what the month picker yields. */
  month: string | null;
  total_days: number | "";
  present: number | "";
}

/**
 * The certificate form's own shape. It is flatter than the stored content: the
 * course lives under `batch.course` and the attendance under `marking` there,
 * which `toCertificateContent` rebuilds on save.
 */
export interface CertificateFormValues extends Record<string, unknown> {
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: string | null;
  gender: "Male" | "Female";
  address: string;
  course_name: string;
  course_level: string;
  textbooks: string[];
  course_days: number | "";
  coursehour: number | "";
  date_of_admission: string | null;
  date_of_completion: string | null;
  issue: string | null;
  studyType: "0" | "1";
  attendance: CertificateAttendanceRow[];
  grammar: CertificateGrade;
  listening: CertificateGrade;
  conversation: CertificateGrade;
  reading: CertificateGrade;
  composition: CertificateGrade;
  instructorId: string | null;
  directorId: string | null;
  customBranch: string;
  customBranchNo: string;
}

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
