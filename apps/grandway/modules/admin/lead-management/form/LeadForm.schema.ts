import { z } from "zod";
import {
  ACADEMIC_SCORE_RANGE,
  LEAD_CERTIFICATE_LIMIT,
  createLanguageTestsSchema,
} from "@/components/academic";
import type { LeadSource } from "../leadManagement.types";
import { passYearRange } from "./LeadForm.utils";

const SCORE_RANGE_MESSAGE = {
  gpa: `A GPA is between ${ACADEMIC_SCORE_RANGE.gpa.min} and ${ACADEMIC_SCORE_RANGE.gpa.max}.`,
  percentage: `A percentage is between ${ACADEMIC_SCORE_RANGE.percentage.min} and ${ACADEMIC_SCORE_RANGE.percentage.max}.`,
} as const;

/**
 * Mirrors `LEADS_STUDY_INTEREST_INVALID`: a score needs its type and must sit
 * in that type's range; a pass year needs its calendar and must sit in that
 * calendar's window. A type or calendar left without its value is harmless —
 * `toLeadPayload` drops it — so it raises nothing here.
 */
const studyInterestSchema = z
  .object({
    interested_countries: z.array(z.string()),
    study_level: z.string(),
    field_of_study: z.string(),
    preferred_intake: z.string(),
    budget_amount: z.number().min(0).nullable(),
    budget_currency: z.string().max(3),
    scholarship_interest: z.boolean(),
    highest_qualification: z.string().max(255),
    highest_qualification_level: z.string(),
    academic_score: z.number({ error: "Enter a number." }).nullable(),
    academic_score_type: z.string(),
    pass_year: z
      .number({ error: "Enter a year." })
      .int("Enter a whole year, e.g. 2080.")
      .nullable(),
    pass_year_calendar: z.string(),
    language_test_status: z.string(),
    interest_notes: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.academic_score !== null) {
      if (
        v.academic_score_type !== "gpa" &&
        v.academic_score_type !== "percentage"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["academic_score_type"],
          message: "Say whether this is a GPA or a percentage.",
        });
      } else {
        const range = ACADEMIC_SCORE_RANGE[v.academic_score_type];
        if (v.academic_score < range.min || v.academic_score > range.max) {
          ctx.addIssue({
            code: "custom",
            path: ["academic_score"],
            message: SCORE_RANGE_MESSAGE[v.academic_score_type],
          });
        }
      }
    }

    if (v.pass_year !== null) {
      if (v.pass_year_calendar !== "bs" && v.pass_year_calendar !== "ad") {
        ctx.addIssue({
          code: "custom",
          path: ["pass_year_calendar"],
          message: "Pick BS or AD.",
        });
      } else {
        const { min, max } = passYearRange(v.pass_year_calendar);
        if (v.pass_year < min || v.pass_year > max) {
          ctx.addIssue({
            code: "custom",
            path: ["pass_year"],
            message: `A ${v.pass_year_calendar.toUpperCase()} pass year is between ${min} and ${max}.`,
          });
        }
      }
    }
  });

export function buildLeadSchema(sources: LeadSource[]) {
  return z
    .object({
      full_name: z.string().min(1, "Required").max(255),
      email: z
        .string()
        .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
      address: z.string(),
      source: z.string().min(1, "Select a lead source"),
      source_detail: z.string().max(255),
      contact_numbers: z
        .array(
          z.object({
            id: z.string().optional(),
            number: z
              .string()
              .min(1, "Required")
              .regex(
                /^\+?[0-9][0-9 ()\-]{4,31}$/,
                "Enter a valid phone number",
              ),
            label: z.enum([
              "mobile",
              "home",
              "work",
              "whatsapp",
              "viber",
              "other",
            ]),
            is_primary: z.boolean(),
          }),
        )
        .min(1, "Add at least one contact number"),
      study_interest: studyInterestSchema,
      language_certificates: createLanguageTestsSchema({
        max: LEAD_CERTIFICATE_LIMIT,
      }),
    })
    .superRefine((values, ctx) => {
      const selectedSource = sources.find((s) => s.id === values.source);
      if (selectedSource?.requires_detail && !values.source_detail.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["source_detail"],
          message: "This lead source requires a short description.",
        });
      }
    });
}
