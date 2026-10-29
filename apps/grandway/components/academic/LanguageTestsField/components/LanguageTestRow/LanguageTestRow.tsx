"use client";

import {
  ActionIcon,
  Badge,
  DateInput,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  dayjs,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import {
  LANGUAGE_TEST_SCORE_FIELDS,
  LANGUAGE_TEST_SCORE_RULES,
  LANGUAGE_TEST_TYPE_OPTIONS,
  describeScoreRule,
  languageTestTypeLabel,
} from "../../../academic.labels";
import { DraftNumberInput } from "../../../DraftNumberInput";
import { nepalTodayIso } from "../../../languageTest.schema";
import type {
  LanguageTestScoreField,
  LanguageTestType,
} from "../../../academic.types";
import type { LanguageTestRowProps } from "./LanguageTestRow.types";

const DATE_DISPLAY = "D MMM YYYY";

function dayAfter(date: string | null): string | undefined {
  return date ? dayjs(date).add(1, "day").format("YYYY-MM-DD") : undefined;
}

/**
 * One test as one card, laid out the way a certificate reads: which test and
 * when, the scores, then the reference details. Score inputs take their range
 * and step from the picked test type and stay disabled until one is picked —
 * a range-less score box would invite a number the server then rejects.
 */
export function LanguageTestRow({
  path,
  index,
  row,
  onRemove,
  disabled,
  popoverZIndex,
}: LanguageTestRowProps) {
  const { form } = useFormInstance<Record<string, unknown>>();
  const base = `${path}.${index}`;
  const rule = row.test_type ? LANGUAGE_TEST_SCORE_RULES[row.test_type] : null;
  const ordinal = index + 1;
  const popoverProps =
    popoverZIndex !== undefined ? { zIndex: popoverZIndex } : undefined;
  const heading = row.test_type
    ? `Test ${ordinal} · ${languageTestTypeLabel(row.test_type)}`
    : `Test ${ordinal}`;

  const changeType = (value: string | null) => {
    form.setFieldValue(`${base}.test_type`, value as LanguageTestType | null);
    // Range messages named the previous test; they no longer apply.
    for (const { field } of LANGUAGE_TEST_SCORE_FIELDS) {
      form.clearFieldError(`${base}.${field}`);
    }
  };

  // `DraftNumberInput` keeps partial text ("6.") on screen while typing — a
  // plain controlled NumberInput fed the parsed number would collapse it.
  const scoreInput = (field: LanguageTestScoreField, label: string) => (
    <DraftNumberInput
      key={field}
      label={label}
      placeholder={rule?.example}
      min={rule?.min}
      max={rule?.max ?? undefined}
      step={rule?.step ?? 1}
      decimalScale={1}
      clampBehavior="none"
      hideControls
      inputMode="decimal"
      disabled={disabled || !rule}
      {...form.getInputProps(`${base}.${field}`)}
      value={row[field]}
      onNumberChange={(value) => form.setFieldValue(`${base}.${field}`, value)}
    />
  );

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      role="group"
      aria-label={`Language test ${ordinal}`}
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
            aria-label={`Remove test ${ordinal}`}
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <TrashIcon size={16} aria-hidden />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <Select
            label="Test"
            placeholder="Pick a test"
            required
            data={LANGUAGE_TEST_TYPE_OPTIONS}
            allowDeselect={false}
            comboboxProps={popoverProps}
            disabled={disabled}
            {...form.getInputProps(`${base}.test_type`)}
            onChange={changeType}
          />
          <DateInput
            label="Test date"
            placeholder="12 Mar 2026"
            valueFormat={DATE_DISPLAY}
            maxDate={nepalTodayIso()}
            clearable
            popoverProps={popoverProps}
            disabled={disabled}
            {...form.getInputProps(`${base}.test_date`)}
          />
          <DateInput
            label="Expiry date"
            placeholder="12 Mar 2028"
            valueFormat={DATE_DISPLAY}
            minDate={dayAfter(row.test_date)}
            clearable
            popoverProps={popoverProps}
            disabled={disabled}
            {...form.getInputProps(`${base}.expiry_date`)}
          />
        </SimpleGrid>

        <Stack gap={4}>
          <SimpleGrid cols={{ base: 3, sm: 5 }} spacing="sm">
            {LANGUAGE_TEST_SCORE_FIELDS.map(({ field, label }) =>
              scoreInput(field, label),
            )}
          </SimpleGrid>
          <Text size="xs" c="dimmed">
            {rule
              ? `${languageTestTypeLabel(row.test_type)} scores are ${describeScoreRule(rule)}. All optional.`
              : "Pick the test first — its score range sets these boxes."}
          </Text>
        </Stack>

        <TextInput
          label="Certificate number"
          placeholder="23NP012345"
          maw={320}
          disabled={disabled}
          {...form.getInputProps(`${base}.certificate_number`)}
        />
      </Stack>
    </Paper>
  );
}
