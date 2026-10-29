"use client";

import {
  ActionIcon,
  Button,
  MonthPickerInput,
  NumberInput,
  Table,
  Text,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { FormSection } from "@/components/FormSection";
import {
  MAX_ATTENDANCE_MONTHS as MAX_MONTHS,
  attendancePercent,
  classHoursFor,
} from "./certificateForm.utils";
import type {
  CertificateFormValues,
  CertificateSectionProps,
} from "./CertificateForm.types";

/**
 * One row per month the student attended. Only the days held and the hours
 * attended are typed — class hours, absent hours and the percentage follow from
 * the course's hours per day, and are shown here as they will print.
 */
export function CertificateAttendanceField({
  disabled,
}: CertificateSectionProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const rows = form.values.attendance;

  const addRow = () =>
    form.insertListItem("attendance", {
      month: null,
      total_days: "",
      present: "",
    });

  return (
    <FormSection
      title="Attendance"
      description="One row per month. Class hours, absent hours and the percentage are worked out from the hours per day."
      actions={
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusIcon aria-hidden />}
          onClick={addRow}
          disabled={disabled || rows.length >= MAX_MONTHS}
        >
          Add month
        </Button>
      }
    >
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          No months yet. The attendance table prints empty until you add one.
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={520}>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Days held</Table.Th>
                <Table.Th>Hours attended</Table.Th>
                <Table.Th>Attendance</Table.Th>
                <Table.Th aria-label="Remove" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row, i) => {
                const classHours = classHoursFor(
                  row,
                  form.values.course_hours_per_day,
                );
                const present = Number(row.present) || 0;
                return (
                  <Table.Tr key={form.key(`attendance.${i}`)}>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`Days held, month ${i + 1}`}
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
                        aria-label={`Hours attended, month ${i + 1}`}
                        placeholder="40"
                        min={0}
                        hideControls
                        disabled={disabled}
                        {...form.getInputProps(`attendance.${i}.present`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {present} of {classHours} h (
                        {attendancePercent(present, classHours)}%)
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Remove month ${i + 1}`}
                        onClick={() => form.removeListItem("attendance", i)}
                        disabled={disabled}
                      >
                        <TrashIcon />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </FormSection>
  );
}
