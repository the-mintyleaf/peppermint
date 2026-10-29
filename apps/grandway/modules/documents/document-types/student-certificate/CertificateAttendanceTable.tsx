"use client";

import {
  ActionIcon,
  MonthPickerInput,
  NumberInput,
  Table,
  Text,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { formatMonth } from "./attendanceRange";
import { attendancePercent, classHoursFor } from "./certificateForm.utils";
import type {
  CertificateAttendanceRowProps,
  CertificateAttendanceTableProps,
  CertificateFormValues,
  CertificateMonthNameProps,
} from "./CertificateForm.types";

/** A field's message as text, or `undefined` when it has none. */
function errorText(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

/**
 * The month rows. Only the days held and the hours attended are typed — class
 * hours, absent hours and the percentage follow from the course's hours per
 * day, and are shown as they will print.
 */
export function CertificateAttendanceTable({
  disabled,
  rangeDriven,
}: CertificateAttendanceTableProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const rows = form.values.attendance;

  return (
    <Table.ScrollContainer minWidth={520}>
      <Table verticalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Month</Table.Th>
            <Table.Th>Days held</Table.Th>
            <Table.Th>Hours attended</Table.Th>
            <Table.Th>Attendance</Table.Th>
            {rangeDriven ? null : <Table.Th aria-label="Remove" />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, i) => (
            <AttendanceRow
              key={form.key(`attendance.${i}`)}
              form={form}
              row={row}
              index={i}
              rangeDriven={rangeDriven}
              disabled={disabled}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function AttendanceRow({
  form,
  row,
  index: i,
  rangeDriven,
  disabled,
}: CertificateAttendanceRowProps) {
  const classHours = classHoursFor(row, form.values.course_hours_per_day);
  const present = Number(row.present) || 0;
  const percent = attendancePercent(present, classHours);
  const monthName = formatMonth(row.month);
  const label = monthName || `month ${i + 1}`;

  return (
    <Table.Tr>
      <Table.Td>
        {rangeDriven ? (
          <MonthName
            name={monthName}
            error={errorText(form.errors[`attendance.${i}.month`])}
          />
        ) : (
          <MonthPickerInput
            aria-label={`Month ${i + 1}`}
            placeholder="Pick a month"
            valueFormat="MMM YYYY"
            description={
              !row.month && row.source_month
                ? `Saved as “${row.source_month}” — pick the month`
                : undefined
            }
            disabled={disabled}
            {...form.getInputProps(`attendance.${i}.month`)}
          />
        )}
      </Table.Td>
      <Table.Td>
        <NumberInput
          aria-label={`Days held, ${label}`}
          placeholder="22"
          min={0}
          max={31}
          allowDecimal={false}
          hideControls
          disabled={disabled}
          {...form.getInputProps(`attendance.${i}.total_days`)}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          aria-label={`Hours attended, ${label}`}
          placeholder="40"
          min={0}
          hideControls
          disabled={disabled}
          {...form.getInputProps(`attendance.${i}.present`)}
        />
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {present} of {classHours} h ({percent}%)
        </Text>
      </Table.Td>
      {rangeDriven ? null : (
        <Table.Td>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={`Remove ${label}`}
            onClick={() => form.removeListItem("attendance", i)}
            disabled={disabled}
          >
            <TrashIcon />
          </ActionIcon>
        </Table.Td>
      )}
    </Table.Tr>
  );
}

/** The month a range-driven row covers; a server refusal on it shows beneath. */
function MonthName({ name, error }: CertificateMonthNameProps) {
  return (
    <>
      <Text size="sm" fw={500}>
        {name}
      </Text>
      {error ? (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      ) : null}
    </>
  );
}
