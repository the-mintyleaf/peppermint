import { z } from "zod";
import type {
  CertificateContent,
  CertificateMarkEntry,
  StudentFullData,
} from "../../documents.types";
import type {
  CertificateAttendanceRow,
  CertificateFormValues,
  CertificateGrade,
} from "./CertificateForm.types";

export const CERTIFICATE_GRADES: CertificateGrade[] = ["A", "B", "C", "D"];

const required = (label: string) =>
  z.string().trim().min(1, `Enter the ${label}`);
const requiredDate = (label: string) =>
  z
    .string({ error: `Pick the ${label}` })
    .nullable()
    .refine((v) => !!v, `Pick the ${label}`);
const positive = (message: string) =>
  z
    .union([z.number(), z.literal("")])
    .refine((v) => v !== "" && v > 0, message);

/** The fields the template's missing-fields banner asks for are the required ones. */
export const certificateSchema = z
  .looseObject({
    firstname: required("first name"),
    lastname: required("last name"),
    date_of_birth: requiredDate("date of birth"),
    address: required("current address"),
    course_name: required("course name"),
    course_level: required("target level"),
    coursehour: positive("Enter the class hours per day"),
    date_of_admission: requiredDate("admission date"),
    issue: requiredDate("issue date"),
    attendance: z.array(
      z.object({
        month: z
          .string()
          .nullable()
          .refine((v) => !!v, "Pick a month"),
        total_days: z.union([z.number(), z.literal("")]),
        present: z.union([z.number(), z.literal("")]),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    const hoursPerDay = Number(values.coursehour) || 0;
    values.attendance.forEach((row, i) => {
      const classHours = (Number(row.total_days) || 0) * hoursPerDay;
      if ((Number(row.present) || 0) > classHours) {
        ctx.addIssue({
          code: "custom",
          path: ["attendance", i, "present"],
          message: `At most ${classHours} hours that month`,
        });
      }
    });
  });

/** Class hours for a month, from the days held and the course's hours per day. */
export function classHoursFor(
  row: CertificateAttendanceRow,
  hoursPerDay: number | "",
): number {
  return (Number(row.total_days) || 0) * (Number(hoursPerDay) || 0);
}

/** Attendance as a two-decimal percentage, or 0 when no classes were held. */
export function attendancePercent(present: number, classHours: number): number {
  return classHours > 0 ? Math.round((present / classHours) * 10000) / 100 : 0;
}

function toGrade(value: unknown): CertificateGrade {
  return CERTIFICATE_GRADES.includes(value as CertificateGrade)
    ? (value as CertificateGrade)
    : "A";
}

/** `"2026-03"` or `3` (as older content stored it) → the picker's `"2026-03-01"`. */
function toMonthValue(month: CertificateMarkEntry["month"]): string | null {
  if (typeof month === "string" && /^\d{4}-\d{2}/.test(month)) {
    return `${month.slice(0, 7)}-01`;
  }
  const n = Number(month);
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return `${new Date().getFullYear()}-${String(n).padStart(2, "0")}-01`;
}

/**
 * A certificate saved by the old form has only `studentName` — the template
 * never printed it, so split it into the parts it does print.
 */
function splitName(
  full: string,
): Pick<CertificateFormValues, "firstname" | "middlename" | "lastname"> {
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

export function toCertificateFormValues(
  existing: CertificateContent | undefined,
  student: StudentFullData | null | undefined,
): CertificateFormValues {
  const today = new Date().toISOString().split("T")[0];
  const course = existing?.batch?.course;
  const name = existing?.firstname
    ? {
        firstname: existing.firstname,
        middlename: existing.middlename ?? "",
        lastname: existing.lastname ?? "",
      }
    : splitName(existing?.studentName || student?.fullName || "");

  return {
    ...name,
    date_of_birth: existing?.date_of_birth || null,
    gender: existing?.gender === "Female" ? "Female" : "Male",
    address: existing?.address ?? "",
    course_name: course?.name || existing?.program || student?.program || "",
    course_level: course?.level ?? "",
    textbooks: (course?.books ?? []).map((b) => b.name).filter(Boolean),
    course_days: course?.total_days || "",
    coursehour: existing?.coursehour || "",
    date_of_admission: existing?.date_of_admission || null,
    date_of_completion: existing?.date_of_completion || null,
    issue: existing?.issue || existing?.issueDate || today,
    studyType: existing?.studyType === 1 ? "1" : "0",
    attendance: (existing?.marking ?? []).map((m) => ({
      month: toMonthValue(m.month),
      total_days: m.total_days ?? "",
      present: m.present ?? "",
    })),
    grammar: toGrade(existing?.grammar),
    listening: toGrade(existing?.listening),
    conversation: toGrade(existing?.conversation),
    reading: toGrade(existing?.reading),
    composition: toGrade(existing?.composition),
    instructorId: existing?.instructorId ?? null,
    directorId: existing?.directorId ?? null,
    customBranch: existing?.customBranch ?? "",
    customBranchNo: existing?.customBranchNo ?? "",
  };
}

/**
 * Rebuild the stored shape. Keys this form does not own (`image`, `details`,
 * `headerProps`, …) are carried over — content is saved wholesale.
 */
export function toCertificateContent(
  values: CertificateFormValues,
  existing: CertificateContent | undefined,
): CertificateContent {
  const hoursPerDay = Number(values.coursehour) || 0;
  const marking: CertificateMarkEntry[] = values.attendance
    .filter((row) => row.month)
    .map((row) => {
      const classHours = classHoursFor(row, hoursPerDay);
      const present = Number(row.present) || 0;
      return {
        month: (row.month as string).slice(0, 7),
        total_days: Number(row.total_days) || 0,
        class_hr: classHours,
        present,
        absent: Math.max(classHours - present, 0),
        attendance_percentage: attendancePercent(present, classHours),
      };
    });

  return {
    ...existing,
    firstname: values.firstname.trim(),
    middlename: values.middlename.trim(),
    lastname: values.lastname.trim(),
    date_of_birth: values.date_of_birth ?? "",
    gender: values.gender,
    address: values.address.trim(),
    date_of_admission: values.date_of_admission ?? "",
    date_of_completion: values.date_of_completion ?? "",
    issue: values.issue ?? "",
    issueDate: values.issue ?? "",
    coursehour: hoursPerDay,
    studyType: values.studyType === "1" ? 1 : 0,
    grammar: values.grammar,
    listening: values.listening,
    conversation: values.conversation,
    reading: values.reading,
    composition: values.composition,
    instructorId: values.instructorId,
    directorId: values.directorId,
    customBranch: values.customBranch.trim(),
    customBranchNo: values.customBranchNo.trim(),
    batch: {
      ...existing?.batch,
      course: {
        name: values.course_name.trim(),
        level: values.course_level.trim(),
        total_days: Number(values.course_days) || 0,
        books: values.textbooks.map((name) => ({ name })),
      },
    },
    marking,
  };
}
