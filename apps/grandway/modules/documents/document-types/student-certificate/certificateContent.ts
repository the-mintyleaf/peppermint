// Pure — no React, no runtime imports — so it can be exercised directly with
// `node --experimental-strip-types`.
import type {
  CertificateContent,
  CertificateGender,
  CertificateGradeValue,
  CertificateMarkEntry,
  CertificateSkill,
} from "../../documents.types";

/**
 * The student certificate's content, read in one place.
 *
 * Since 2026-10-29 the backend validates a `student-certificate` body against a
 * snake_case key set (`documents/INTEGRATION.md` §7). Certificates saved before
 * then used the template's own keys (`gender: "Male"`, top-level grades,
 * `coursehour`, `studyType`, `instructorId`, `customBranch`, `batch.course.*`).
 *
 * - **Read both.** `normalizeCertificateContent` resolves either era into
 *   `CertificateFields`; the form, the Customizations panel and the template
 *   adapter all start from it, so an old certificate opens and prints unchanged.
 *   A new key wins whenever it is present.
 * - **Write only the new.** `toStoredCertificateContent` emits the validated keys
 *   and drops the legacy ones (`gender: "Male"` would now be refused). Keys this
 *   file does not own (`image`, `details`, `headerProps`, …) are carried over —
 *   content is saved wholesale.
 */

export const CERTIFICATE_SKILLS: readonly CertificateSkill[] = [
  "grammar",
  "listening",
  "conversation",
  "reading",
  "composition",
];

/** Keys only certificates saved before 2026-10-29 carry. Never written back. */
export const LEGACY_CERTIFICATE_KEYS = [
  "issueDate",
  "studyType",
  "instructorId",
  "directorId",
  "studentName",
  "program",
  "nationality",
  "coursehour",
  "grammar",
  "listening",
  "conversation",
  "reading",
  "composition",
  "customBranch",
  "customBranchNo",
  "batch",
] as const;

/** One attendance month as the form and the template read it. */
export interface CertificateMarkRow {
  /** `YYYY-MM`, or `""` when an old row's month could not be placed. */
  month: string;
  total_days: number;
  class_hr: number;
  present: number;
  absent: number;
  attendance_percentage: number;
}

/** Every certificate field, resolved from either key era. */
export interface CertificateFields {
  firstname: string;
  middlename: string;
  lastname: string;
  /** `YYYY-MM-DD` or `""` — the same for the other three dates. */
  date_of_birth: string;
  gender: CertificateGender;
  address: string;
  course_name: string;
  course_level: string;
  course_books: string[];
  course_total_days: number | null;
  course_hours_per_day: number | null;
  date_of_admission: string;
  date_of_completion: string;
  issue: string;
  marking: CertificateMarkRow[];
  grades: Record<CertificateSkill, CertificateGradeValue>;
  study_type: 0 | 1;
  photo_media_id: string | null;
  instructor_id: string | null;
  director_id: string | null;
  branch_name: string;
  branch_no: string;
}

// ── Value coercion ───────────────────────────────────────────────────────────

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function firstDefined<T>(
  ...values: Array<T | null | undefined>
): T | undefined {
  for (const v of values) if (v !== undefined && v !== null) return v;
  return undefined;
}

/** `"Male"` (old) / `"male"` (new) → the backend's lowercase vocabulary. */
export function toCertificateGender(value: unknown): CertificateGender {
  const v = str(value).trim().toLowerCase();
  return v === "male" || v === "female" || v === "other" ? v : "";
}

export function toCertificateGrade(value: unknown): CertificateGradeValue {
  const v = str(value).trim().toUpperCase();
  return v === "A" || v === "B" || v === "C" || v === "D" ? v : "";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Any parseable date → `YYYY-MM-DD`; anything else → `""`. */
export function toIsoDate(value: unknown): string {
  const v = str(value).trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * A row's month → `YYYY-MM`. The oldest certificates stored a bare month number;
 * it is placed in the year that follows the admission date (a month before the
 * admission month belongs to the next year), else the current year.
 */
export function toYearMonth(
  month: CertificateMarkEntry["month"],
  admission: string,
): string {
  if (typeof month === "string") {
    const m = month.trim().match(/^(\d{4})-(\d{2})/);
    if (m) {
      const n = Number(m[2]);
      return n >= 1 && n <= 12 ? `${m[1]}-${m[2]}` : "";
    }
  }
  const n = Number(month);
  if (!Number.isInteger(n) || n < 1 || n > 12) return "";
  const adm = admission.match(/^(\d{4})-(\d{2})/);
  if (!adm) return `${new Date().getFullYear()}-${pad2(n)}`;
  const admYear = Number(adm[1]);
  const year = n >= Number(adm[2]) ? admYear : admYear + 1;
  return `${year}-${pad2(n)}`;
}

function num(value: unknown): number {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function numOrNull(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Attendance as a two-decimal percentage, or 0 when no classes were held. */
export function attendancePercent(present: number, classHours: number): number {
  return classHours > 0 ? round2((present / classHours) * 100) : 0;
}

function toMarkRow(
  entry: CertificateMarkEntry,
  admission: string,
): CertificateMarkRow {
  const class_hr = num(entry.class_hr);
  const present = num(entry.present);
  const stored = numOrNull(entry.attendance_percentage);
  return {
    month: toYearMonth(entry.month, admission),
    total_days: num(entry.total_days),
    class_hr,
    present,
    absent: num(entry.absent),
    attendance_percentage: stored ?? attendancePercent(present, class_hr),
  };
}

/**
 * The oldest certificates kept one `studentName` the template never printed;
 * split it into the parts it does print.
 */
export function splitFullName(
  full: string,
): Pick<CertificateFields, "firstname" | "middlename" | "lastname"> {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { firstname: parts[0] ?? "", middlename: "", lastname: "" };
  }
  return {
    firstname: parts[0],
    middlename: parts.slice(1, -1).join(" "),
    lastname: parts[parts.length - 1],
  };
}

// ── Read ─────────────────────────────────────────────────────────────────────

function readName(
  c: CertificateContent,
): Pick<CertificateFields, "firstname" | "middlename" | "lastname"> {
  if (c.firstname || c.lastname) {
    return {
      firstname: str(c.firstname),
      middlename: str(c.middlename),
      lastname: str(c.lastname),
    };
  }
  return splitFullName(str(c.studentName));
}

function readGrades(
  c: CertificateContent,
): Record<CertificateSkill, CertificateGradeValue> {
  const out = {} as Record<CertificateSkill, CertificateGradeValue>;
  for (const skill of CERTIFICATE_SKILLS) {
    out[skill] = toCertificateGrade(firstDefined(c.grades?.[skill], c[skill]));
  }
  return out;
}

function readStudyType(c: CertificateContent): 0 | 1 {
  return Number(firstDefined<number>(c.study_type, c.studyType)) === 1 ? 1 : 0;
}

/** Either key era → every field resolved. `undefined`/`{}` → all blank. */
export function normalizeCertificateContent(
  raw: CertificateContent | null | undefined,
): CertificateFields {
  const c: CertificateContent = raw ?? {};
  const course = c.batch?.course;
  const date_of_admission = toIsoDate(c.date_of_admission);
  const books =
    c.course_books ?? (course?.books ?? []).map((b) => str(b?.name));

  return {
    ...readName(c),
    date_of_birth: toIsoDate(c.date_of_birth),
    gender: toCertificateGender(c.gender),
    address: str(c.address),
    course_name: str(firstDefined(c.course_name, course?.name, c.program)),
    course_level: str(firstDefined(c.course_level, course?.level)),
    course_books: books.map((b) => str(b).trim()).filter(Boolean),
    course_total_days: numOrNull(
      firstDefined<unknown>(c.course_total_days, course?.total_days),
    ),
    course_hours_per_day: numOrNull(
      firstDefined<unknown>(c.course_hours_per_day, c.coursehour),
    ),
    date_of_admission,
    date_of_completion: toIsoDate(c.date_of_completion),
    issue: toIsoDate(firstDefined(c.issue, c.issueDate)),
    marking: (c.marking ?? []).map((m) => toMarkRow(m, date_of_admission)),
    grades: readGrades(c),
    study_type: readStudyType(c),
    photo_media_id: str(c.photo_media_id) || null,
    instructor_id:
      str(firstDefined<unknown>(c.instructor_id, c.instructorId)) || null,
    director_id:
      str(firstDefined<unknown>(c.director_id, c.directorId)) || null,
    branch_name: str(firstDefined(c.branch_name, c.customBranch)),
    branch_no: str(firstDefined(c.branch_no, c.customBranchNo)),
  };
}

// ── Write ────────────────────────────────────────────────────────────────────

/** `content` minus the legacy certificate keys — what a save carries over. */
export function withoutLegacyCertificateKeys(
  existing: CertificateContent | null | undefined,
): CertificateContent {
  const rest: CertificateContent = { ...(existing ?? {}) };
  for (const key of LEGACY_CERTIFICATE_KEYS) delete rest[key];
  return rest;
}

function toStoredRow(row: CertificateMarkRow): CertificateMarkEntry {
  return {
    month: row.month,
    total_days: Math.max(0, Math.trunc(row.total_days)),
    class_hr: Math.max(0, row.class_hr),
    present: Math.max(0, row.present),
    absent: Math.max(0, row.absent),
    attendance_percentage: Math.min(
      100,
      Math.max(0, round2(row.attendance_percentage)),
    ),
  };
}

/**
 * Fields → the body the backend validates. Only the new keys are written; a row
 * whose month could not be placed is dropped (it never printed either).
 */
export function toStoredCertificateContent(
  fields: CertificateFields,
  existing?: CertificateContent | null,
): CertificateContent {
  const totalDays = fields.course_total_days;
  return {
    ...withoutLegacyCertificateKeys(existing),
    firstname: fields.firstname.trim(),
    middlename: fields.middlename.trim(),
    lastname: fields.lastname.trim(),
    date_of_birth: fields.date_of_birth,
    gender: fields.gender,
    address: fields.address.trim(),
    course_name: fields.course_name.trim(),
    course_level: fields.course_level.trim(),
    course_books: fields.course_books.map((b) => b.trim()).filter(Boolean),
    course_total_days: totalDays === null ? null : Math.trunc(totalDays),
    course_hours_per_day: fields.course_hours_per_day,
    date_of_admission: fields.date_of_admission,
    date_of_completion: fields.date_of_completion,
    issue: fields.issue,
    marking: fields.marking.filter((r) => r.month).map(toStoredRow),
    grades: { ...fields.grades },
    study_type: fields.study_type,
    photo_media_id: fields.photo_media_id,
    instructor_id: fields.instructor_id,
    director_id: fields.director_id,
    branch_name: fields.branch_name.trim(),
    branch_no: fields.branch_no.trim(),
  };
}
