"use client";

import {
  Badge,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
} from "@peppermint/ui";
import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
  formatTuition,
  QUALIFICATION_LEVEL_LABELS,
} from "../../../../../institutions.constants";
import { useProgramDetail } from "../../../../../institutions.hooks";
import type { ProgramDetail } from "../../../../../institutions.types";
import type { ProgramDetailDrawerProps } from "./ProgramDetailDrawer.types";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

function LongText({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Text>
    </Stack>
  );
}

function ProgramDetailBody({ program }: { program: ProgramDetail }) {
  return (
    <Stack gap="sm">
      <Group gap="xs">
        <Badge
          size="xs"
          color={AVAILABILITY_COLORS[program.availability_status]}
        >
          {AVAILABILITY_LABELS[program.availability_status]}
        </Badge>
        {program.is_usable ? null : (
          <Badge size="xs" variant="light" color="gray">
            Not usable on its own
          </Badge>
        )}
      </Group>

      <Divider label="Overview" labelPosition="left" />
      <Row label="Institution" value={program.institution.name} />
      <Row label="Campus" value={program.campus?.name ?? null} />
      <Row label="Country" value={program.country.name} />
      <Row
        label="Qualification level"
        value={QUALIFICATION_LEVEL_LABELS[program.qualification_level]}
      />
      <Row label="Field" value={program.field.name} />
      <Row
        label="Duration"
        value={
          program.duration_months ? `${program.duration_months} months` : null
        }
      />
      <Row label="Intake pattern" value={program.intake_pattern || null} />
      <Row
        label="Tuition"
        value={formatTuition(
          program.tuition_amount,
          program.tuition_currency,
          program.tuition_fee_period,
        )}
      />
      {program.tuition_is_indicative ? (
        <Row label="Tuition basis" value="Indicative only" />
      ) : null}
      <Row
        label="Scholarship"
        value={program.scholarship_available ? "Available" : "None"}
      />
      {program.availability_note ? (
        <Row label="Availability note" value={program.availability_note} />
      ) : null}

      <Divider label="Entry expectations" labelPosition="left" />
      <LongText label="Tuition notes" value={program.tuition_notes} />
      <LongText
        label="Academic requirement"
        value={program.academic_requirement}
      />
      <LongText
        label="English requirement"
        value={program.english_requirement}
      />
      <LongText label="Backlog tolerance" value={program.backlog_tolerance} />
      <LongText
        label="Document expectation"
        value={program.document_expectation}
      />
      <LongText label="Selection notes" value={program.selection_notes} />
      <LongText label="Scholarship notes" value={program.scholarship_notes} />
      <LongText label="Notes" value={program.notes} />
    </Stack>
  );
}

export function ProgramDetailDrawer({
  programId,
  opened,
  onClose,
}: ProgramDetailDrawerProps) {
  const { data, isLoading, isError, refetch } = useProgramDetail(
    opened ? programId : null,
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={data ? data.title : "Program"}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="sm" />
        </Center>
      ) : isError || !data ? (
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Couldn&apos;t load this program.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        <ProgramDetailBody program={data} />
      )}
    </Drawer>
  );
}
