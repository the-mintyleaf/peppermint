import { z } from "zod";
import type { ZodTypeAny } from "zod";
import {
  ACADEMIC_SCORE_RANGE,
  QUALIFICATION_LEVEL_OPTIONS,
  createLanguageTestsSchema,
  yearCalendarLabel,
} from "@/components/academic";
import type { QualificationLevel } from "@/components/academic";
import { educationYearBounds } from "./education.utils";

const PHONE_REGEX = /^\+?[0-9][0-9 ()\-]{4,31}$/;

const optionalEmail = z
  .string()
  .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email");

/** Only step 1 has a required field — "Only name is required" (CONCEPT.md). */
export const identitySchema = z.object({
  // Shape only — the picker itself rejects an oversized/wrong-typed file before
  // it ever reaches form state, so this is the backstop, not the message the
  // user normally sees. Always optional: a photograph is never required to save
  // a record, and on create it can't be attached at all (no id to own it yet).
  photograph: z.instanceof(File).nullable(),
  full_name: z.string().min(1, "Required").max(255),
  date_of_birth: z.string().nullable(),
  gender: z.enum(["male", "female", "other", "undisclosed", ""]),
  nationality: z.string().max(255),
  email: optionalEmail,
  contact_numbers: z
    .array(
      z.object({
        id: z.string().optional(),
        number: z
          .string()
          .min(1, "Required")
          .regex(PHONE_REGEX, "Enter a valid phone number"),
        label: z.enum(["mobile", "home", "work", "whatsapp", "viber", "other"]),
        is_primary: z.boolean(),
      }),
    )
    .min(1, "Add at least one contact number"),
});

/**
 * Identity documents. The three identity numbers are free text with only a
 * length limit (the backend does not format-check them). The passport stays
 * fully optional, but its number is required once any passport detail is
 * typed, and expiry must follow issue (INTEGRATION.md §4).
 */
export const documentsSchema = z
  .object({
    citizenship_no: z.string().max(50, "Keep it to 50 characters."),
    citizenship_issue_district: z
      .string()
      .max(100, "Keep it to 100 characters."),
    national_id_no: z.string().max(50, "Keep it to 50 characters."),
    passport_number: z.string(),
    issuing_country: z.string(),
    place_of_issue: z.string(),
    issued_date: z.string().nullable(),
    expiry_date: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    const anyFilled =
      values.passport_number.trim() ||
      values.issuing_country.trim() ||
      values.place_of_issue.trim() ||
      values.issued_date ||
      values.expiry_date;
    if (anyFilled && !values.passport_number.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["passport_number"],
        message:
          "Passport number is required when any passport detail is entered.",
      });
    }
    if (
      values.issued_date &&
      values.expiry_date &&
      values.expiry_date <= values.issued_date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiry_date"],
        message: "Expiry date must be after the issue date",
      });
    }
  });

const LEVELS = QUALIFICATION_LEVEL_OPTIONS.map((option) => option.value) as [
  QualificationLevel,
  ...QualificationLevel[],
];

const optionalYear = z
  .number({ error: "Enter a year." })
  .int("Enter a whole year.")
  .nullish();

/**
 * One education record, mirroring the backend (`APPLICANTS_EDUCATION_INVALID`
 * rules): level required; score and score type together, inside the type's
 * range; a calendar whenever a year is given, each year inside that
 * calendar's window; start ≤ completion; no completion year while ongoing.
 * Issues are row-relative, so they surface as `educations.<i>.<field>`.
 */
export const educationRowSchema = z
  .object({
    id: z.string().nullish(),
    source_lead_id: z.string().nullish(),
    level: z.enum(LEVELS, { error: "Pick the level of study." }),
    qualification: z.string(),
    institution: z.string(),
    country: z.string(),
    completion_status: z.enum(["completed", "ongoing"]),
    score: z.number({ error: "Enter a number." }).nullish(),
    score_type: z.enum(["gpa", "percentage"]).nullish(),
    grading_system: z.string(),
    start_year: optionalYear,
    completion_year: optionalYear,
    year_calendar: z.enum(["bs", "ad"]).nullish(),
  })
  .superRefine((row, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (row.score != null && !row.score_type) {
      issue("score_type", "Pick GPA or percentage for this score.");
    }
    if (row.score_type && row.score == null) {
      issue("score", "Enter the score, or clear the score type.");
    }
    if (row.score != null && row.score_type) {
      const range = ACADEMIC_SCORE_RANGE[row.score_type];
      if (row.score < range.min || row.score > range.max) {
        issue("score", `Must be between ${range.min} and ${range.max}.`);
      }
    }

    const completion =
      row.completion_status === "ongoing" ? null : row.completion_year;
    if (row.completion_status === "ongoing" && row.completion_year != null) {
      issue("completion_year", "An ongoing course has no completion year.");
    }
    const years = [
      ["start_year", row.start_year],
      ["completion_year", completion],
    ] as const;
    const hasYear = years.some(([, value]) => value != null);
    if (hasYear && !row.year_calendar) {
      issue("year_calendar", "Pick BS or AD for these years.");
    }
    if (row.year_calendar) {
      const { min, max } = educationYearBounds(row.year_calendar);
      const calendar = yearCalendarLabel(row.year_calendar);
      for (const [field, value] of years) {
        if (value != null && (value < min || value > max)) {
          issue(field, `${calendar} years run ${min}–${max}.`);
        }
      }
    }
    if (row.start_year != null && completion != null) {
      if (row.start_year > completion) {
        issue("completion_year", "Can't be before the start year.");
      }
    }
  });

export const educationTestsSchema = z.object({
  educations: z.array(educationRowSchema),
  language_tests: createLanguageTestsSchema(),
});

/**
 * A row, once added, requires the backend's non-optional fields for that
 * collection — plus `full_name`, which the backend allows blank but which the
 * form insists on: a nameless person is not a record anyone can act on.
 */
export const familyEmergencySchema = z.object({
  family_members: z.array(
    z.object({
      relationship: z.string().min(1, "Select a relationship"),
      full_name: z.string().min(1, "Required"),
      occupation: z.string(),
      contact_number: z.string(),
      citizenship_no: z.string().max(50, "Keep it to 50 characters."),
    }),
  ),
  emergency_contacts: z.array(
    z.object({
      full_name: z.string().min(1, "Required"),
      relationship: z.string().min(1, "Required"),
      contact_number: z
        .string()
        .min(1, "Required")
        .regex(PHONE_REGEX, "Enter a valid phone number"),
      email: optionalEmail,
      address: z.string(),
    }),
  ),
});

/**
 * Addresses have no rules, but the step still gets a (permissive) schema: now
 * that `STEP_FIELDS` lists its fields, a schema-less step would make
 * `FormWrapper` fall back to validating the WHOLE form on Next — lighting up
 * errors on steps the user hasn't reached yet. Validation only reads issues,
 * never the parsed output, so an empty object schema is enough.
 */
const addressesSchema = z.object({});

/** One schema per step, in step order (`FormWrapper`'s `validation`). */
export const STEP_VALIDATION: ZodTypeAny[] = [
  identitySchema,
  addressesSchema,
  documentsSchema,
  educationTestsSchema,
  familyEmergencySchema,
];

/** Top-level form keys per step — gates Next and locates a server error's step. */
export const STEP_FIELDS: string[][] = [
  [
    "photograph",
    "full_name",
    "date_of_birth",
    "gender",
    "nationality",
    "email",
    "contact_numbers",
  ],
  // Addresses — fully optional (its schema is empty, so Next never blocks);
  // listed so a server address error can name this step.
  ["permanent_address", "current_address"],
  [
    "citizenship_no",
    "citizenship_issue_district",
    "national_id_no",
    "passport_number",
    "issuing_country",
    "place_of_issue",
    "issued_date",
    "expiry_date",
  ],
  ["educations", "language_tests"],
  ["family_members", "emergency_contacts"],
];

/**
 * Sequence: who they are → where they live → their documents → their
 * studies → their family. Identity numbers sit with the passport (all
 * "documents you'd photocopy"), not in step 1, so a fast create stays name +
 * phone. Education and tests share a step: both are the academic record a
 * counsellor fills from the same pile of certificates.
 */
export const STEPS = [
  {
    label: "Identity & Contact",
    description: "Name, DOB, and how to reach them",
  },
  { label: "Addresses", description: "Permanent and current address" },
  {
    label: "Documents",
    description: "Citizenship, national ID and passport",
  },
  {
    label: "Education & Tests",
    description: "Qualifications and language tests",
  },
  {
    label: "Family & Emergency Contacts",
    description: "Next of kin and who to call",
  },
];
