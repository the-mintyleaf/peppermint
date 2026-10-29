"use client";

import { useState } from "react";
import {
  Alert,
  List,
  MonthPickerInput,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  modals,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import {
  MAX_ATTENDANCE_MONTHS,
  consecutiveMonths,
  describeRowMonth,
  formatMonth,
  planMonthRange,
  readMonthRange,
  type AttendanceRangePlan,
} from "./attendanceRange";
import { CertificateAttendanceTable } from "./CertificateAttendanceTable";
import type {
  AttendanceRangeDraft,
  CertificateAttendanceRangeProps,
  CertificateAttendanceRow,
  CertificateFormInstance,
  CertificateFormValues,
  CertificateSectionProps,
} from "./CertificateForm.types";

const COUNT_OPTIONS = Array.from({ length: MAX_ATTENDANCE_MONTHS }, (_, k) => ({
  value: String(k + 1),
  label: k === 0 ? "1 month" : `${k + 1} months`,
}));

/**
 * The attendance table, set by a start month and a number of months: picking
 * them lists that many consecutive months (across year ends). Only the days
 * held and the days attended are typed per row. Changing the range later keeps
 * what was typed for months still inside it, and asks before removing months
 * that hold data. An older table that forms no range (gaps, repeats, an
 * unreadable month) is shown as saved, each row still fixable, until the
 * operator sets a range.
 */
export function CertificateAttendanceField({
  disabled,
}: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const rows = form.values.attendance;
  const range = readMonthRange(rows);
  const legacy = rows.length > 0 && !range;
  const listError = form.errors.attendance;

  return (
    <FormSection
      title="Attendance"
      description="Pick the first month and how many months the course ran, then type the days held and days attended for each. Hours (days × hours per class), absent hours and the percentage are worked out for you."
    >
      <AttendanceRangeControls
        range={range}
        legacy={legacy}
        disabled={disabled}
      />
      {legacy ? (
        <Alert color="yellow" variant="light" p="xs">
          <Text size="xs">
            These months were saved with gaps, repeats or a month that
            can&apos;t be read, so they&apos;re shown as saved. Fix each row
            below, or pick a start month and number of months to rebuild the
            table — days and hours already typed for months in the new range are
            kept.
          </Text>
        </Alert>
      ) : null}
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          No months yet. The attendance table prints empty until you pick a
          start month and the number of months.
        </Text>
      ) : (
        <CertificateAttendanceTable
          rangeDriven={Boolean(range)}
          disabled={disabled}
        />
      )}
      {typeof listError === "string" && listError ? (
        <Text size="xs" c="red" role="alert">
          {listError}
        </Text>
      ) : null}
    </FormSection>
  );
}

/**
 * Start month + number of months. When the rows form a range, both show it and
 * a change applies at once. Otherwise (no rows yet, or an older table) the
 * picks are held here until both are set — kept across tab switches because
 * the tab panels stay mounted.
 */
function AttendanceRangeControls({
  range,
  legacy,
  disabled,
}: CertificateAttendanceRangeProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const [draft, setDraft] = useState<AttendanceRangeDraft>({
    start: null,
    count: null,
  });

  const start = range ? range.start : draft.start;
  const count = range ? range.count : draft.count;
  const months = range ? consecutiveMonths(range.start, range.count) : [];
  const lastMonth = months[months.length - 1];

  const requestRange = (nextStart: string | null, nextCount: number | null) => {
    const next = { start: nextStart, count: nextCount };
    if (range && nextStart === range.start && nextCount === range.count) return;
    if (!nextStart && range) {
      // Clearing the start month empties the table (after asking, if typed).
      applyPlan(form, planMonthRange(form.values.attendance, null, 0), () =>
        setDraft(next),
      );
      return;
    }
    if (!nextStart || !nextCount) {
      setDraft(next);
      return;
    }
    applyPlan(
      form,
      planMonthRange(form.values.attendance, nextStart, nextCount),
      () => setDraft(next),
    );
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
      <MonthPickerInput
        label="Start month"
        placeholder="Pick a month"
        valueFormat="MMM YYYY"
        clearable
        disabled={disabled}
        value={start}
        onChange={(value) => requestRange(value || null, count)}
        // Always present, so the row never jumps — only the wording changes.
        description={
          start && !count
            ? "Now pick the number of months"
            : "First month of classes"
        }
      />
      <Select
        label="Number of months"
        placeholder={legacy ? "Pick to rebuild" : "Pick 1–12"}
        data={COUNT_OPTIONS}
        allowDeselect={false}
        disabled={disabled}
        value={count ? String(count) : null}
        onChange={(value) => requestRange(start, value ? Number(value) : null)}
        description={
          lastMonth ? `Through ${formatMonth(lastMonth)}` : "1 to 12 months"
        }
      />
      {/* Stored as `course_hours_per_day` — the same figure the certificate
          prints as hours per day; it is what turns days held into class hours. */}
      <NumberInput
        label="Hours per class"
        placeholder="2"
        min={0}
        max={24}
        decimalScale={1}
        hideControls
        required
        description="Class hours = days held × this"
        disabled={disabled}
        {...form.getInputProps("course_hours_per_day")}
      />
    </SimpleGrid>
  );
}

/**
 * Writes the planned table, asking first when it would remove months that hold
 * typed attendance. Errors on the old rows are cleared — their indexes no
 * longer match.
 */
function applyPlan(
  form: CertificateFormInstance,
  plan: AttendanceRangePlan,
  onApplied: () => void,
) {
  const write = () => {
    const kept = Object.fromEntries(
      Object.entries(form.errors).filter(
        ([path]) => path !== "attendance" && !path.startsWith("attendance."),
      ),
    );
    form.setFieldValue("attendance", plan.rows);
    form.setErrors(kept);
    onApplied();
  };
  if (plan.dropped.length === 0) write();
  else confirmDropMonths(plan.dropped, write);
}

function confirmDropMonths(
  dropped: CertificateAttendanceRow[],
  onConfirm: () => void,
) {
  const one = dropped.length === 1;
  modals.openConfirmModal({
    title: one
      ? "Remove a month with attendance?"
      : `Remove ${dropped.length} months with attendance?`,
    children: (
      <Stack gap="xs">
        <Text size="sm">
          The new range leaves out {one ? "this month" : "these months"}, and
          the days and hours typed for {one ? "it" : "them"} will be removed:
        </Text>
        <List size="sm" spacing={2}>
          {dropped.map((row, i) => (
            <List.Item key={i}>{describeRowMonth(row)}</List.Item>
          ))}
        </List>
        <Text size="xs" c="dimmed">
          Nothing is saved until you save the certificate.
        </Text>
      </Stack>
    ),
    labels: { confirm: "Remove", cancel: "Keep the current months" },
    confirmProps: { color: "red" },
    // The theme zeroes modal body padding; this module's confirms restore it
    // on the body so the text and the buttons both clear the edges.
    styles: { body: { padding: "var(--mantine-spacing-md)" } },
    onConfirm,
  });
}
