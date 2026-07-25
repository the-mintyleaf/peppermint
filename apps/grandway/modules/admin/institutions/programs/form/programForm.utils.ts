import { z } from "zod";
import { refineAvailabilityNote } from "../../components/AvailabilityFields";
import type {
  ProgramCreatePayload,
  ProgramDetail,
  ProgramFormValues,
  ProgramUpdatePayload,
  QualificationLevel,
} from "../../institutions.types";

/**
 * A tuition amount is only meaningful with a currency AND a fee period (the
 * backend fires `INSTITUTIONS_TUITION_INCOMPLETE` otherwise). Availability note is
 * required whenever the status isn't Active. Both are validated here so the fields
 * error inline before a round-trip.
 */
export const programSchema = z
  .object({
    institution: z.string().min(1, "Select an institution"),
    field: z.string().min(1, "Select a field"),
    qualification_level: z.string().min(1, "Select a level"),
    title: z.string().min(1, "Required").max(255),
    campus: z.string().nullable(),
    tuition_amount: z.string(),
    tuition_currency: z.string(),
    tuition_fee_period: z.enum([
      "per_year",
      "per_semester",
      "total_program",
      "",
    ]),
    tuition_is_indicative: z.boolean(),
    tuition_notes: z.string(),
    academic_requirement: z.string(),
    english_requirement: z.string(),
    backlog_tolerance: z.string(),
    document_expectation: z.string(),
    selection_notes: z.string(),
    scholarship_available: z.boolean(),
    scholarship_notes: z.string(),
    duration_months: z.union([
      z.number().int().min(1, "1–120").max(120, "1–120"),
      z.literal(""),
    ]),
    intake_pattern: z.string(),
    availability_status: z.enum(["active", "paused", "seasonal", "inactive"]),
    availability_note: z.string(),
    notes: z.string(),
  })
  .superRefine((values, ctx) => {
    refineAvailabilityNote(values, ctx);
    if (values.tuition_amount.trim() !== "") {
      const amount = Number(values.tuition_amount);
      if (Number.isNaN(amount) || amount < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tuition_amount"],
          message: "Enter a valid amount (0 or more).",
        });
      }
      if (!values.tuition_currency.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tuition_currency"],
          message: "Required when an amount is set.",
        });
      }
      if (!values.tuition_fee_period) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tuition_fee_period"],
          message: "Required when an amount is set.",
        });
      }
    }
  });

export function toProgramInitial(detail?: ProgramDetail): ProgramFormValues {
  return {
    institution: detail?.institution.id ?? "",
    field: detail?.field.id ?? "",
    qualification_level: detail?.qualification_level ?? "",
    title: detail?.title ?? "",
    campus: detail?.campus?.id ?? null,
    tuition_amount: detail?.tuition_amount ?? "",
    tuition_currency: detail?.tuition_currency ?? "",
    tuition_fee_period: detail?.tuition_fee_period ?? "",
    tuition_is_indicative: detail?.tuition_is_indicative ?? false,
    tuition_notes: detail?.tuition_notes ?? "",
    academic_requirement: detail?.academic_requirement ?? "",
    english_requirement: detail?.english_requirement ?? "",
    backlog_tolerance: detail?.backlog_tolerance ?? "",
    document_expectation: detail?.document_expectation ?? "",
    selection_notes: detail?.selection_notes ?? "",
    scholarship_available: detail?.scholarship_available ?? false,
    scholarship_notes: detail?.scholarship_notes ?? "",
    duration_months: detail?.duration_months ?? "",
    intake_pattern: detail?.intake_pattern ?? "",
    availability_status: detail?.availability_status ?? "active",
    availability_note: detail?.availability_note ?? "",
    notes: detail?.notes ?? "",
  };
}

/** Shared field mapping — money is a trimmed, upper-cased decimal string or null. */
function commonFields(v: ProgramFormValues) {
  return {
    title: v.title,
    qualification_level: v.qualification_level as QualificationLevel,
    field: v.field,
    campus: v.campus || null,
    duration_months: v.duration_months === "" ? null : v.duration_months,
    intake_pattern: v.intake_pattern,
    tuition_amount:
      v.tuition_amount.trim() === "" ? null : v.tuition_amount.trim(),
    tuition_currency: v.tuition_currency.trim().toUpperCase(),
    tuition_fee_period: v.tuition_fee_period,
    tuition_is_indicative: v.tuition_is_indicative,
    tuition_notes: v.tuition_notes,
    academic_requirement: v.academic_requirement,
    english_requirement: v.english_requirement,
    backlog_tolerance: v.backlog_tolerance,
    document_expectation: v.document_expectation,
    selection_notes: v.selection_notes,
    scholarship_available: v.scholarship_available,
    scholarship_notes: v.scholarship_notes,
    availability_status: v.availability_status,
    availability_note: v.availability_note,
    notes: v.notes,
  };
}

export function toProgramCreatePayload(
  v: ProgramFormValues,
): ProgramCreatePayload {
  return { institution: v.institution, ...commonFields(v) };
}

/** `institution` is immutable — omitted. `campus: null` genuinely detaches. */
export function toProgramUpdatePayload(
  v: ProgramFormValues,
): ProgramUpdatePayload {
  return commonFields(v);
}
