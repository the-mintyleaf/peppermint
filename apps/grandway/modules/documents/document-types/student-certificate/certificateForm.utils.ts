import { z } from "zod";
import type {
  CertificateContent,
  StudentFullData,
} from "../../documents.types";
import type { DocumentPrefill } from "../../documentPrefill.types";
import {
  CERTIFICATE_SKILLS,
  attendancePercent,
  normalizeCertificateContent,
  splitFullName,
  toCertificateGender,
  toStoredCertificateContent,
  type CertificateFields,
  type CertificateMarkRow,
} from "./certificateContent";
import type {
  CertificateAttendanceRow,
  CertificateFormInstance,
  CertificateFormValues,
  CertificateGrade,
} from "./CertificateForm.types";
import { MAX_ATTENDANCE_MONTHS } from "./attendanceRange";

export { attendancePercent } from "./certificateContent";
export { MAX_ATTENDANCE_MONTHS } from "./attendanceRange";

export const CERTIFICATE_GRADES: CertificateGrade[] = ["A", "B", "C", "D"];

/** Backend limit on `course_books`. */
export const MAX_TEXTBOOKS = 20;

// ── Validation — mirrors the backend's rules (§7) so a refusal is rare ─────

const text = (max: number) => z.string().max(max, `At most ${max} characters`);
const required = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .max(max, `At most ${max} characters`);
const requiredDate = (label: string) =>
  z
    .string({ error: `Pick the ${label}` })
    .nullable()
    .refine((v) => !!v, `Pick the ${label}`);
const optionalNumber = z.union([z.number(), z.literal("")]);

export const certificateSchema = z
  .looseObject({
    firstname: required("first name", 150),
    middlename: text(150),
    lastname: required("last name", 150),
    date_of_birth: requiredDate("date of birth"),
    gender: z.string().refine((v) => v !== "", "Pick the gender"),
    address: required("current address", 300),
    course_name: required("course name", 150),
    course_level: required("target level", 50),
    course_books: z
      .array(text(150))
      .max(MAX_TEXTBOOKS, `At most ${MAX_TEXTBOOKS} textbooks`),
    course_total_days: optionalNumber.refine(
      (v) => v === "" || (Number.isInteger(v) && v >= 0 && v <= 1000),
      "A whole number of days, up to 1000",
    ),
    course_hours_per_day: optionalNumber.refine(
      (v) => v !== "" && v > 0 && v <= 24,
      "Enter the hours per class (up to 24)",
    ),
    date_of_admission: requiredDate("admission date"),
    date_of_completion: z.string().nullable(),
    issue: requiredDate("issue date"),
    branch_name: text(150),
    branch_no: text(50),
    attendance: z
      .array(
        z.looseObject({
          month: z
            .string()
            .nullable()
            .refine((v) => !!v, "Pick a month"),
          total_days: optionalNumber.refine(
            (v) => v === "" || (Number.isInteger(v) && v >= 0),
            "A whole number of days",
          ),
          present: optionalNumber.refine(
            (v) => v === "" || v >= 0,
            "Can't be negative",
          ),
        }),
      )
      .max(MAX_ATTENDANCE_MONTHS, `At most ${MAX_ATTENDANCE_MONTHS} months`),
  })
  .superRefine((values, ctx) => {
    const { date_of_admission: admission, date_of_completion: completion } =
      values;
    if (admission && completion && completion < admission) {
      ctx.addIssue({
        code: "custom",
        path: ["date_of_completion"],
        message: "Can't be before the admission date",
      });
    }
    const hoursPerDay = Number(values.course_hours_per_day) || 0;
    const seen = new Set<string>();
    values.attendance.forEach((row, i) => {
      const month = row.month?.slice(0, 7);
      if (month && seen.has(month)) {
        ctx.addIssue({
          code: "custom",
          path: ["attendance", i, "month"],
          message: "This month is already listed",
        });
      }
      if (month) seen.add(month);
      const classHours = (Number(row.total_days) || 0) * hoursPerDay;
      // Negative / fractional values are reported by the row schema above.
      if ((Number(row.present) || 0) > classHours) {
        ctx.addIssue({
          code: "custom",
          path: ["attendance", i, "present"],
          message: `At most ${classHours} hours that month`,
        });
      }
    });
  });

// ── Content → form ───────────────────────────────────────────────────────────

/** Class hours for a month, from the days held and the course's hours per day. */
export function classHoursFor(
  row: CertificateAttendanceRow,
  hoursPerDay: number | "",
): number {
  return (Number(row.total_days) || 0) * (Number(hoursPerDay) || 0);
}

/**
 * A stored row → a form row. A row whose month could not be placed is **kept**
 * with `month: null` and its original text, so the form asks for the month (and
 * says what was stored) instead of the save quietly dropping it.
 */
function toAttendanceRow(row: CertificateMarkRow): CertificateAttendanceRow {
  return {
    month: row.month ? `${row.month}-01` : null,
    total_days: row.total_days,
    present: row.present,
    ...(row.month ? {} : { source_month: row.source_month }),
  };
}

function fromFields(
  f: CertificateFields,
  today: string,
): CertificateFormValues {
  return {
    firstname: f.firstname,
    middlename: f.middlename,
    lastname: f.lastname,
    date_of_birth: f.date_of_birth || null,
    gender: f.gender,
    address: f.address,
    course_name: f.course_name,
    course_level: f.course_level,
    course_books: f.course_books,
    course_total_days: f.course_total_days ?? "",
    course_hours_per_day: f.course_hours_per_day ?? "",
    date_of_admission: f.date_of_admission || null,
    date_of_completion: f.date_of_completion || null,
    issue: f.issue || today,
    study_type: f.study_type === 1 ? "1" : "0",
    attendance: f.marking.map(toAttendanceRow),
    // An ungraded skill opens on A, as the form always has.
    grammar: f.grades.grammar || "A",
    listening: f.grades.listening || "A",
    conversation: f.grades.conversation || "A",
    reading: f.grades.reading || "A",
    composition: f.grades.composition || "A",
    instructor_id: f.instructor_id,
    director_id: f.director_id,
    branch_name: f.branch_name,
    branch_no: f.branch_no,
    photo_media_id: f.photo_media_id,
  };
}

/**
 * Seed a NEW certificate from the applicant file (`GET /documents/prefill/`):
 * name parts, date of birth, gender, the current (else permanent) address, and
 * the photograph. Every seeded field stays editable — the prefill splits names
 * naively and is only a starting point.
 */
function seedFromPrefill(
  fields: CertificateFields,
  prefill: DocumentPrefill | null | undefined,
  student: StudentFullData | null | undefined,
): CertificateFields {
  const p = prefill?.applicant;
  const name =
    p && (p.firstName || p.lastName)
      ? {
          firstname: p.firstName,
          middlename: p.middleName,
          lastname: p.lastName,
        }
      : splitFullName(student?.fullName ?? "");
  return {
    ...fields,
    ...name,
    date_of_birth: p?.dateOfBirth ?? "",
    gender: toCertificateGender(p?.gender),
    address:
      p?.currentAddress?.formatted || p?.permanentAddress?.formatted || "",
    // `fetchApplicantSummary` leaves `program` blank today (Grandway applicants
    // carry none), so this is usually "" — typed in the form, never required
    // from the profile. The form waits for the summary so it is at least current.
    course_name: student?.program ?? "",
    photo_media_id: prefill?.photoMediaId ?? student?.photoFileId ?? null,
  };
}

export function toCertificateFormValues(
  existing: CertificateContent | undefined,
  student: StudentFullData | null | undefined,
  prefill?: DocumentPrefill | null,
): CertificateFormValues {
  const today = new Date().toISOString().split("T")[0];
  const fields = normalizeCertificateContent(existing);
  if (!existing) {
    return fromFields(seedFromPrefill(fields, prefill, student), today);
  }
  // A certificate with no name at all opens with the applicant's, split.
  const named =
    fields.firstname || fields.lastname
      ? fields
      : { ...fields, ...splitFullName(student?.fullName ?? "") };
  return fromFields(named, today);
}

// ── Form → content ───────────────────────────────────────────────────────────

/**
 * Form rows → stored rows. Every row is kept (the schema refuses a save with a
 * month missing), and class hours are computed from the **stored** `total_days`
 * — the same number the row shows — so the printed row matches what was typed.
 */
function toMarkRows(values: CertificateFormValues): CertificateMarkRow[] {
  const hoursPerDay = Number(values.course_hours_per_day) || 0;
  return values.attendance.map((row) => {
    const month = row.month ? row.month.slice(0, 7) : "";
    const totalDays = Number(row.total_days) || 0;
    const classHours = totalDays * hoursPerDay;
    const present = Number(row.present) || 0;
    return {
      month,
      source_month: month || (row.source_month ?? ""),
      total_days: totalDays,
      class_hr: classHours,
      present,
      absent: Math.max(classHours - present, 0),
      attendance_percentage: attendancePercent(present, classHours),
    };
  });
}

/**
 * The photograph to store: the applicant's current one once the editor knows it
 * (so a photo just uploaded in the form is the one printed), else whatever the
 * form opened with.
 */
export function resolvePhotoMediaId(
  fromForm: string | null,
  student: StudentFullData | null | undefined,
): string | null {
  return student?.photoFileId === undefined ? fromForm : student.photoFileId;
}

/**
 * Rebuild the stored body under the backend's validated keys only. Keys this
 * form does not own (`image`, `details`, `headerProps`, …) are carried over;
 * legacy certificate keys are dropped — content is saved wholesale.
 */
export function toCertificateContent(
  values: CertificateFormValues,
  existing: CertificateContent | undefined,
  photoMediaId: string | null = values.photo_media_id,
): CertificateContent {
  const grades = {} as CertificateFields["grades"];
  for (const skill of CERTIFICATE_SKILLS) grades[skill] = values[skill];

  const fields: CertificateFields = {
    firstname: values.firstname,
    middlename: values.middlename,
    lastname: values.lastname,
    date_of_birth: values.date_of_birth ?? "",
    gender: values.gender,
    address: values.address,
    course_name: values.course_name,
    course_level: values.course_level,
    course_books: values.course_books,
    course_total_days:
      values.course_total_days === "" ? null : values.course_total_days,
    course_hours_per_day:
      values.course_hours_per_day === "" ? null : values.course_hours_per_day,
    date_of_admission: values.date_of_admission ?? "",
    date_of_completion: values.date_of_completion ?? "",
    issue: values.issue ?? "",
    marking: toMarkRows(values),
    grades,
    study_type: values.study_type === "1" ? 1 : 0,
    photo_media_id: photoMediaId,
    instructor_id: values.instructor_id,
    director_id: values.director_id,
    branch_name: values.branch_name,
    branch_no: values.branch_no,
  };
  return toStoredCertificateContent(fields, existing);
}

// ── Server refusals → form errors ────────────────────────────────────────────

/** Top-level content keys that are form fields of the same name. */
const SAME_NAME_KEYS = new Set<string>([
  "firstname",
  "middlename",
  "lastname",
  "date_of_birth",
  "gender",
  "address",
  "course_name",
  "course_level",
  "course_books",
  "course_total_days",
  "course_hours_per_day",
  "date_of_admission",
  "date_of_completion",
  "issue",
  "study_type",
  "instructor_id",
  "director_id",
  "branch_name",
  "branch_no",
]);

/**
 * A `DOCUMENTS_CONTENT_INVALID` path → the form field that shows it, or `null`
 * when no input owns it (`photo_media_id`, a whole-list `marking` error).
 * Attendance rows map one-to-one: every form row is saved, in order, so
 * `marking[i]` is `attendance.i`.
 */
export function serverPathToFormPath(path: string): string | null {
  const row = path.match(/^marking\[(\d+)\](?:\.(\w+))?$/);
  if (row) {
    const [, index, field] = row;
    if (!field || field === "month") return `attendance.${index}.month`;
    if (field === "total_days") return `attendance.${index}.total_days`;
    // class_hr, absent and the percentage are derived from hours attended.
    return `attendance.${index}.present`;
  }
  const grade = path.match(/^grades\.(\w+)$/);
  if (grade) {
    return (CERTIFICATE_SKILLS as readonly string[]).includes(grade[1])
      ? grade[1]
      : null;
  }
  if (/^course_books\[\d+\]$/.test(path)) return "course_books";
  return SAME_NAME_KEYS.has(path) ? path : null;
}

/** What `applyServerFieldErrors` did with a refusal. */
export interface AppliedServerErrors {
  /** Form paths now marked, in the order the server listed them. */
  placed: string[];
  /** Refusals no input owns, keyed by their server path. */
  unplaced: Record<string, string>;
}

/**
 * Marks every refused field on the open form. Returns the marked form paths
 * (so the form can open the tab holding the first) and the refusals no input
 * owns, for the form to list above its fields.
 */
export function applyServerFieldErrors(
  form: CertificateFormInstance,
  fields: Record<string, string>,
): AppliedServerErrors {
  const mapped: Record<string, string> = {};
  const unplaced: Record<string, string> = {};
  for (const [path, message] of Object.entries(fields)) {
    const target = serverPathToFormPath(path);
    if (target) mapped[target] = mapped[target] ?? message;
    else unplaced[path] = message;
  }
  form.setErrors(mapped);
  return { placed: Object.keys(mapped), unplaced };
}
