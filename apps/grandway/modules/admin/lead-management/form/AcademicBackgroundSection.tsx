"use client";

import { useState } from "react";
import { useFormInstance } from "@peppermint/admin";
import {
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  TextInput,
} from "@peppermint/ui";
import {
  ACADEMIC_SCORE_RANGE,
  ACADEMIC_SCORE_TYPE_OPTIONS,
  QUALIFICATION_LEVEL_OPTIONS,
  YEAR_CALENDAR_OPTIONS,
  yearCalendarLabel,
} from "@/components/academic";
import type {
  AcademicScoreType,
  QualificationLevel,
  YearCalendar,
} from "@/components/academic";
import { FormSection } from "@/components/FormSection";
import type { LeadFormValues } from "./LeadForm.types";
import { passYearRange, unambiguousYearCalendar } from "./LeadForm.utils";

const SCORE_TYPE_OPTIONS = ACADEMIC_SCORE_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label:
    option.value === "gpa"
      ? `${option.label} (0–${ACADEMIC_SCORE_RANGE.gpa.max})`
      : option.label,
}));

/** NumberInput emits `""` when cleared; the form holds `number | null`. */
function toNullableNumber(value: string | number): number | null {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Narrows a Select value to its option set; `null`/unknown → `""` (unset). */
function pick<TValue extends string>(
  options: { value: TValue }[],
  value: string | null,
): TValue | "" {
  return options.find((option) => option.value === value)?.value ?? "";
}

/**
 * Their highest completed education. The level (a pick) sits next to the
 * free-text programme it qualifies ("Bachelor's" + "BBS"), because together
 * they are one answer. Grade and pass year are paired rows — value, then its
 * unit — revealed once a level is chosen (or a value already exists, so an
 * edit never hides data): a grade with no level to attach it to means
 * little, and at conversion only a lead WITH a level becomes a real
 * education record on the applicant (`INTEGRATION.md` §7 convert).
 *
 * The grade's type is never guessed — a 10-point CGPA of 8.5 is not "8.5%" —
 * so a grade with no type is a validation error naming both choices. The
 * calendar is filled in only when the year allows just one (2080 → BS, 1998
 * → AD), and the field then says so ("Read as BS") until the user touches the
 * calendar; an overlap year (2000 … this AD year + 1) must be picked.
 * Out-of-range values are NOT clamped — the schema names the range instead,
 * so a typo is visible rather than rewritten.
 *
 * States: empty — level only, with a hint; read-only / deleted / loading /
 * request-failed — N/A (the host modal owns them; a deleted lead has no Edit).
 */
export function AcademicBackgroundSection() {
  const { form } = useFormInstance<LeadFormValues>();
  // True only while the calendar shown is one this section filled in itself.
  const [calendarInferred, setCalendarInferred] = useState(false);
  const interest = form.values.study_interest;
  const showDetail =
    interest.highest_qualification_level !== "" ||
    interest.academic_score !== null ||
    interest.academic_score_type !== "" ||
    interest.pass_year !== null ||
    interest.pass_year_calendar !== "";

  const scoreType = interest.academic_score_type;
  const scoreRange = scoreType ? ACADEMIC_SCORE_RANGE[scoreType] : null;
  const yearRange = interest.pass_year_calendar
    ? passYearRange(interest.pass_year_calendar)
    : null;

  const scoreNeedsType = interest.academic_score !== null && scoreType === "";

  // Runs when focus leaves the year PAIR (React's `onBlur` bubbles), so the
  // inputs keep their own `getInputProps` blur handling untouched.
  const handleYearPairBlur = () => {
    if (interest.pass_year === null || interest.pass_year_calendar !== "") {
      return;
    }
    const calendar = unambiguousYearCalendar(interest.pass_year);
    if (!calendar) return;
    form.setFieldValue("study_interest.pass_year_calendar", calendar);
    setCalendarInferred(true);
  };

  const yearDescription =
    calendarInferred && interest.pass_year_calendar
      ? `Read as ${yearCalendarLabel(interest.pass_year_calendar)} — change the calendar if not.`
      : undefined;

  return (
    <FormSection
      title="Academic background (optional)"
      description="Their highest completed qualification — it becomes an education record on the applicant at conversion."
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="Highest qualification"
          placeholder="Pick a level"
          description={
            showDetail ? undefined : "Pick a level to add the grade and year."
          }
          data={QUALIFICATION_LEVEL_OPTIONS}
          clearable
          {...form.getInputProps("study_interest.highest_qualification_level")}
          onChange={(value) =>
            form.setFieldValue(
              "study_interest.highest_qualification_level",
              pick<QualificationLevel>(QUALIFICATION_LEVEL_OPTIONS, value),
            )
          }
        />
        <TextInput
          label="Programme or stream"
          placeholder="BBS, Science, BSc CSIT"
          {...form.getInputProps("study_interest.highest_qualification")}
        />
      </SimpleGrid>

      {showDetail ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Group align="flex-start" wrap="nowrap" gap="xs">
            <NumberInput
              label="Grade"
              description={
                scoreNeedsType
                  ? "Pick GPA (out of 4) or percentage."
                  : undefined
              }
              placeholder={scoreType === "percentage" ? "78.5" : "3.45"}
              min={scoreRange?.min ?? 0}
              max={scoreRange?.max}
              step={scoreRange?.step}
              clampBehavior="none"
              decimalScale={2}
              suffix={scoreRange?.suffix}
              style={{ flex: 1, minWidth: 0 }}
              {...form.getInputProps("study_interest.academic_score")}
              onChange={(value) =>
                form.setFieldValue(
                  "study_interest.academic_score",
                  toNullableNumber(value),
                )
              }
            />
            <Select
              label="Graded as"
              placeholder="Type"
              data={SCORE_TYPE_OPTIONS}
              clearable
              w={130}
              {...form.getInputProps("study_interest.academic_score_type")}
              onChange={(value) =>
                form.setFieldValue(
                  "study_interest.academic_score_type",
                  pick<AcademicScoreType>(SCORE_TYPE_OPTIONS, value),
                )
              }
            />
          </Group>

          <Group
            align="flex-start"
            wrap="nowrap"
            gap="xs"
            onBlur={handleYearPairBlur}
          >
            <NumberInput
              label="Pass year"
              description={yearDescription}
              placeholder="2080"
              allowDecimal={false}
              allowNegative={false}
              min={yearRange?.min}
              max={yearRange?.max}
              clampBehavior="none"
              inputMode="numeric"
              style={{ flex: 1, minWidth: 0 }}
              {...form.getInputProps("study_interest.pass_year")}
              onChange={(value) =>
                form.setFieldValue(
                  "study_interest.pass_year",
                  toNullableNumber(value),
                )
              }
            />
            <Select
              label="Calendar"
              placeholder="BS / AD"
              data={YEAR_CALENDAR_OPTIONS}
              clearable
              w={110}
              {...form.getInputProps("study_interest.pass_year_calendar")}
              onChange={(value) => {
                // The user's own pick — stop saying it was read for them.
                setCalendarInferred(false);
                form.setFieldValue(
                  "study_interest.pass_year_calendar",
                  pick<YearCalendar>(YEAR_CALENDAR_OPTIONS, value),
                );
              }}
            />
          </Group>
        </SimpleGrid>
      ) : null}
    </FormSection>
  );
}
