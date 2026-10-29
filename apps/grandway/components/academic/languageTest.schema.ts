import { z } from "zod";

import {
  LANGUAGE_TEST_SCORE_FIELDS,
  LANGUAGE_TEST_SCORE_RULES,
  LANGUAGE_TEST_TYPE_OPTIONS,
  describeScoreRule,
  languageTestTypeLabel,
} from "./academic.labels";
import type { LanguageTestScoreRule, LanguageTestType } from "./academic.types";

const TEST_TYPES = LANGUAGE_TEST_TYPE_OPTIONS.map((option) => option.value) as [
  LanguageTestType,
  ...LanguageTestType[],
];

/**
 * Today's date in Nepal as `YYYY-MM-DD` — the calendar the backend judges
 * "not in the future" in. String comparison IS date comparison for this format.
 */
export function nepalTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isOnStep(value: number, step: number): boolean {
  const ratio = value / step;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
}

/** True when a score is inside its test's range (and on-step for IELTS). */
export function scoreFitsRule(
  value: number,
  rule: LanguageTestScoreRule,
): boolean {
  if (value < rule.min) return false;
  if (rule.max !== null && value > rule.max) return false;
  return !rule.stepEnforced || isOnStep(value, rule.step);
}

export interface LanguageTestRowSchemaOptions {
  /** Override "today" (tests). Defaults to Nepal's today at validation time. */
  today?: () => string;
}

// `nullish` throughout: a host row built by hand (rather than by
// `emptyLanguageTestRow`) may omit a key, and an invisible "required" error
// on a field the user never saw would block the submit.
const optionalScore = z.number({ error: "Enter a number." }).nullish();

/**
 * Zod schema for ONE language-test row, mirroring the backend: a required
 * test type; every score optional but inside its test's range (IELTS also on
 * a 0.5 step); `test_date` not in the future; `expiry_date` after `test_date`.
 * Issues carry row-relative paths, so nested in a host schema they surface as
 * `<path>.<index>.<field>` — exactly what FormWrapper keys errors by.
 */
export function createLanguageTestRowSchema(
  options: LanguageTestRowSchemaOptions = {},
) {
  const today = options.today ?? nepalTodayIso;
  return z
    .object({
      id: z.string().nullish(),
      source_lead_id: z.string().nullish(),
      test_type: z.enum(TEST_TYPES, { error: "Pick which test this is." }),
      overall_score: optionalScore,
      listening_score: optionalScore,
      reading_score: optionalScore,
      writing_score: optionalScore,
      speaking_score: optionalScore,
      test_date: z
        .string()
        .nullish()
        .refine((value) => !value || value <= today(), {
          message: "The test date can't be in the future.",
        }),
      certificate_number: z.string().nullish(),
      expiry_date: z.string().nullish(),
    })
    .superRefine((row, ctx) => {
      // Zod skips this refinement while a field above is still invalid (e.g. no
      // test type picked yet); the guard is belt-and-braces for that contract.
      const rule = LANGUAGE_TEST_SCORE_RULES[row.test_type] as
        | LanguageTestScoreRule
        | undefined;
      if (rule) {
        const message = `${languageTestTypeLabel(row.test_type)} scores are ${describeScoreRule(rule)}.`;
        for (const { field } of LANGUAGE_TEST_SCORE_FIELDS) {
          const value = row[field];
          if (value != null && !scoreFitsRule(value, rule)) {
            ctx.addIssue({ code: "custom", path: [field], message });
          }
        }
      }
      if (
        row.test_date &&
        row.expiry_date &&
        row.expiry_date <= row.test_date
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["expiry_date"],
          message: "The expiry date must be after the test date.",
        });
      }
    });
}

export interface LanguageTestsSchemaOptions extends LanguageTestRowSchemaOptions {
  /** Most rows allowed (a lead holds at most 10). Omit for no cap. */
  max?: number;
}

/**
 * The list schema to place at the host form's path, e.g.
 * `z.object({ …, language_certificates: createLanguageTestsSchema({ max: 10 }) })`.
 */
export function createLanguageTestsSchema(
  options: LanguageTestsSchemaOptions = {},
) {
  const list = z.array(createLanguageTestRowSchema(options));
  return options.max === undefined
    ? list
    : list.max(options.max, `Add at most ${options.max} language tests.`);
}
