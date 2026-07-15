"use client";

import {
  ModalPaper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  dayjs,
} from "@peppermint/ui";

import {
  FOLLOW_UP_PRIORITY_LABELS,
  GENDER_LABELS,
  LEAD_SOURCE_LABELS,
} from "../../../../_shared";
import type { Applicant } from "../../../../_shared";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value ? value : "—"}</Text>
    </Stack>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ModalPaper withBorder>
      <Stack gap="sm">
        <Title order={6}>{title}</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {children}
        </SimpleGrid>
      </Stack>
    </ModalPaper>
  );
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

/**
 * Read-only overview of the applicant's core fields. Protected blocks (identity dates,
 * counselling notes, follow-up) render only for admin — the staff projection omits them
 * from the API, so `isAdmin` gates the whole card rather than individual rows.
 */
export function OverviewContent({
  applicant,
  isAdmin,
}: {
  applicant: Applicant;
  isAdmin: boolean;
}) {
  return (
    <Stack gap="md">
      <Card title="Identity">
        <InfoRow label="Full name" value={applicant.full_name} />
        <InfoRow label="Native name" value={applicant.name_native} />
        <InfoRow
          label="Preferred name"
          value={applicant.preferred_display_name}
        />
        <InfoRow label="Nationality" value={applicant.nationality} />
        {isAdmin && (
          <>
            <InfoRow
              label="Date of birth"
              value={fmtDate(applicant.date_of_birth)}
            />
            <InfoRow
              label="Gender"
              value={
                applicant.gender ? GENDER_LABELS[applicant.gender] : undefined
              }
            />
            <InfoRow label="Religion" value={applicant.religion} />
          </>
        )}
      </Card>

      <Card title="Contact">
        <InfoRow label="Primary email" value={applicant.primary_email} />
        <InfoRow label="Primary phone" value={applicant.primary_phone} />
        <InfoRow label="Alternate email" value={applicant.alternate_email} />
        <InfoRow label="Alternate phone" value={applicant.alternate_phone} />
      </Card>

      <Card title="Lead">
        <InfoRow
          label="Lead source"
          value={
            applicant.lead_source
              ? LEAD_SOURCE_LABELS[applicant.lead_source]
              : undefined
          }
        />
        <InfoRow label="Detail" value={applicant.lead_source_detail} />
        <InfoRow label="Initial interest" value={applicant.initial_interest} />
      </Card>

      {isAdmin && (
        <Card title="Engagement & follow-up">
          <InfoRow
            label="Follow-up priority"
            value={
              applicant.follow_up_priority
                ? FOLLOW_UP_PRIORITY_LABELS[applicant.follow_up_priority]
                : undefined
            }
          />
          <InfoRow
            label="Next follow-up"
            value={fmtDate(applicant.next_follow_up_at)}
          />
          <InfoRow
            label="Last contacted"
            value={fmtDate(applicant.last_contacted_at)}
          />
          <InfoRow label="Converted" value={fmtDate(applicant.converted_at)} />
          <InfoRow label="Summary" value={applicant.summary} />
          <InfoRow
            label="Eligibility summary"
            value={applicant.eligibility_summary}
          />
          <InfoRow
            label="Counselling notes"
            value={applicant.counselling_notes}
          />
        </Card>
      )}
    </Stack>
  );
}
