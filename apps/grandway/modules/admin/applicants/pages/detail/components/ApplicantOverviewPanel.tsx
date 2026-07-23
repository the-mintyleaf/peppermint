"use client";

import { Badge, Divider, Group, Stack, Text, dayjs } from "@peppermint/ui";
import type { ApplicantDetail } from "../../../applicants.types";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

function Field({ label, value }: { label: string; value: string | null }) {
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

/** Identity, contact numbers, and addresses — the fields most files are read for day to day. */
export function ApplicantOverviewPanel({
  applicant,
}: {
  applicant: ApplicantDetail;
}) {
  const permanent = applicant.addresses.find(
    (a) => a.address_type === "permanent",
  );
  const current = applicant.addresses.find((a) => a.address_type === "current");

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <Badge
          size="xs"
          variant="light"
          color={STATUS_COLORS[applicant.status]}
        >
          {STATUS_LABELS[applicant.status]}
        </Badge>
      </Group>

      <Divider label="Identity" labelPosition="left" />
      <Field label="Full name (Nepali)" value={applicant.full_name_np} />
      <Field label="Full name (English)" value={applicant.full_name_en} />
      <Field label="Romanized name" value={applicant.full_name_romanized} />
      <Field
        label="Date of birth"
        value={
          applicant.date_of_birth
            ? dayjs(applicant.date_of_birth).format("MMM D, YYYY")
            : null
        }
      />
      <Field label="Gender" value={applicant.gender} />
      <Field label="Nationality" value={applicant.nationality} />
      <Field label="Email" value={applicant.email} />

      <Divider label="Contact numbers" labelPosition="left" />
      {applicant.contact_numbers.length === 0 ? (
        <Text size="xs" c="dimmed">
          No contact numbers on file.
        </Text>
      ) : (
        applicant.contact_numbers.map((c) => (
          <Group key={c.id ?? c.number} justify="space-between" gap="xs">
            <Text size="xs">{c.number}</Text>
            <Group gap={4}>
              <Text size="xs" c="dimmed" tt="capitalize">
                {c.label}
              </Text>
              {c.is_primary ? (
                <Badge size="xs" variant="light" color="blue">
                  Primary
                </Badge>
              ) : null}
            </Group>
          </Group>
        ))
      )}

      <Divider label="Permanent address" labelPosition="left" />
      {permanent ? (
        <Text size="xs">
          {[
            permanent.street_address,
            permanent.municipality,
            permanent.ward ? `Ward ${permanent.ward}` : null,
            permanent.district,
            permanent.province,
            permanent.country,
            permanent.postal_code,
          ]
            .filter(Boolean)
            .join(", ")}
        </Text>
      ) : (
        <Text size="xs" c="dimmed">
          Not on file.
        </Text>
      )}

      <Divider label="Current address" labelPosition="left" />
      {current ? (
        <Text size="xs">
          {[
            current.street_address,
            current.municipality,
            current.ward ? `Ward ${current.ward}` : null,
            current.district,
            current.province,
            current.country,
            current.postal_code,
          ]
            .filter(Boolean)
            .join(", ")}
        </Text>
      ) : (
        <Text size="xs" c="dimmed">
          Not on file.
        </Text>
      )}
    </Stack>
  );
}
