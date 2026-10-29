"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  ActionIcon,
  Badge,
  Group,
  Input,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import {
  ACADEMIC_SCORE_RANGE,
  ACADEMIC_SCORE_TYPE_OPTIONS,
  DraftNumberInput,
  QUALIFICATION_LEVEL_OPTIONS,
  YEAR_CALENDAR_OPTIONS,
  qualificationLevelLabel,
  yearCalendarLabel,
} from "@/components/academic";
import type { AcademicScoreType, YearCalendar } from "@/components/academic";
import { COMPLETION_STATUS_LABELS } from "../../../../../applicants.labels";
import type { EducationCompletionStatus } from "../../../../../applicants.types";
import type { ApplicantFormValues } from "../../../../ApplicantForm.types";
import { educationYearBounds } from "../../../../education.utils";
import type {
  EducationRowProps,
  EducationRowSectionProps,
} from "./EducationRow.types";

const STATUS_DATA = (
  Object.keys(COMPLETION_STATUS_LABELS) as EducationCompletionStatus[]
).map((value) => ({ value, label: COMPLETION_STATUS_LABELS[value] }));

/** What it was, where, and whether it's finished — the facts a marksheet leads with. */
function EducationBasics({ base, row }: EducationRowSectionProps) {
  const { form } = useFormInstance<ApplicantFormValues>();

  const changeStatus = (value: string) => {
    form.setFieldValue(
      `${base}.completion_status`,
      value as EducationCompletionStatus,
    );
    // An ongoing course has no completion year — drop it rather than send it.
    if (value === "ongoing") {
      form.setFieldValue(`${base}.completion_year`, null);
      form.clearFieldError(`${base}.completion_year`);
    }
  };

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <Select
          label="Level"
          placeholder="Pick a level"
          required
          data={QUALIFICATION_LEVEL_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps(`${base}.level`)}
        />
        <TextInput
          label="Qualification"
          description="Programme or stream"
          placeholder="BBS"
          {...form.getInputProps(`${base}.qualification`)}
        />
        <Input.Wrapper label="Status" description="Ongoing has no end year">
          <SegmentedControl
            fullWidth
            size="xs"
            data={STATUS_DATA}
            value={row.completion_status}
            onChange={changeStatus}
            aria-label="Completion status"
          />
        </Input.Wrapper>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput
          label="Institution"
          placeholder="Shanker Dev Campus"
          {...form.getInputProps(`${base}.institution`)}
        />
        <TextInput
          label="Country"
          placeholder="Nepal"
          autoComplete="country-name"
          {...form.getInputProps(`${base}.country`)}
        />
      </SimpleGrid>
    </>
  );
}

/**
 * Score and its type are one fact ("3.45 GPA"), so the score box takes its
 * range from the type and stays disabled until one is picked; clearing the
 * type clears the score with it. The grading-system label is free text for
 * divisions and letter grades the backend does not validate.
 */
function EducationScoreFields({ base, row }: EducationRowSectionProps) {
  const { form } = useFormInstance<ApplicantFormValues>();
  const range = row.score_type ? ACADEMIC_SCORE_RANGE[row.score_type] : null;

  const changeType = (value: string | null) => {
    form.setFieldValue(`${base}.score_type`, value as AcademicScoreType | null);
    if (!value) form.setFieldValue(`${base}.score`, null);
    form.clearFieldError(`${base}.score`);
    form.clearFieldError(`${base}.score_type`);
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
      <Select
        label="Score type"
        placeholder="GPA or %"
        clearable
        data={ACADEMIC_SCORE_TYPE_OPTIONS}
        {...form.getInputProps(`${base}.score_type`)}
        onChange={changeType}
      />
      <DraftNumberInput
        label="Score"
        description={range ? `${range.min}–${range.max}` : "Pick a type first"}
        placeholder={row.score_type === "percentage" ? "78.5" : "3.45"}
        min={range?.min}
        max={range?.max}
        step={range?.step ?? 0.01}
        suffix={range?.suffix}
        decimalScale={2}
        clampBehavior="none"
        hideControls
        inputMode="decimal"
        disabled={!range}
        {...form.getInputProps(`${base}.score`)}
        value={row.score}
        onNumberChange={(value) => form.setFieldValue(`${base}.score`, value)}
      />
      <TextInput
        label="Grading system"
        placeholder="GPA (4.0)"
        {...form.getInputProps(`${base}.grading_system`)}
      />
    </SimpleGrid>
  );
}

/**
 * Years are bare years in a calendar — a BS year spans two AD years — so the
 * calendar comes first and sets each year box's range.
 */
function EducationYearFields({ base, row }: EducationRowSectionProps) {
  const { form } = useFormInstance<ApplicantFormValues>();
  const calendar = row.year_calendar;
  const bounds = calendar ? educationYearBounds(calendar) : null;
  const ongoing = row.completion_status === "ongoing";
  const hint = bounds
    ? `${yearCalendarLabel(calendar)} ${bounds.min}–${bounds.max}`
    : undefined;

  const changeCalendar = (value: string) => {
    form.setFieldValue(`${base}.year_calendar`, value as YearCalendar);
    for (const field of ["year_calendar", "start_year", "completion_year"]) {
      form.clearFieldError(`${base}.${field}`);
    }
  };

  const yearInput = (
    field: "start_year" | "completion_year",
    label: string,
  ) => (
    <DraftNumberInput
      label={label}
      description={hint}
      placeholder={calendar === "ad" ? "2020" : "2077"}
      min={bounds?.min}
      max={bounds?.max}
      allowDecimal={false}
      clampBehavior="none"
      hideControls
      inputMode="numeric"
      {...form.getInputProps(`${base}.${field}`)}
      value={row[field]}
      onNumberChange={(value) => form.setFieldValue(`${base}.${field}`, value)}
    />
  );

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
      <Input.Wrapper
        label="Year calendar"
        error={form.errors[`${base}.year_calendar`]}
      >
        <SegmentedControl
          fullWidth
          size="xs"
          data={YEAR_CALENDAR_OPTIONS}
          value={calendar ?? ""}
          onChange={changeCalendar}
          aria-label="Year calendar"
        />
      </Input.Wrapper>
      {yearInput("start_year", "Start year")}
      {ongoing ? null : yearInput("completion_year", "Completion year")}
    </SimpleGrid>
  );
}

/**
 * One education record as one card, laid out the way a marksheet reads: what
 * and where, the result, then the years. Only the level is required.
 */
export function EducationRow({ index, row, onRemove }: EducationRowProps) {
  const base = `educations.${index}`;
  const ordinal = index + 1;
  const heading = row.level
    ? `Education ${ordinal} · ${qualificationLevelLabel(row.level)}`
    : `Education ${ordinal}`;

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      role="group"
      aria-label={`Education ${ordinal}`}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap="xs">
            <Text size="sm" fw={600}>
              {heading}
            </Text>
            {row.source_lead_id ? (
              <Badge size="xs" variant="light" color="blue" radius="sm">
                From lead
              </Badge>
            ) : null}
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={`Remove education ${ordinal}`}
            onClick={() => onRemove(index)}
          >
            <TrashIcon size={16} aria-hidden />
          </ActionIcon>
        </Group>
        <EducationBasics base={base} row={row} />
        <EducationScoreFields base={base} row={row} />
        <EducationYearFields base={base} row={row} />
      </Stack>
    </Paper>
  );
}
