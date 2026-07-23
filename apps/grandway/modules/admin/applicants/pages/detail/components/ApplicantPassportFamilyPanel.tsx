"use client";

import {
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import type { ApplicantDetail } from "../../../applicants.types";

/**
 * Expiry matters operationally (blocks visas) — colored by urgency rather
 * than a plain date, per `docs/backend/applicants/CONCEPT.md`: green when
 * comfortably valid, amber inside a 90-day window, red once past.
 */
function expiryTone(expiryDate: string): { color: string; label: string } {
  const days = dayjs(expiryDate).diff(dayjs(), "day");
  if (days < 0) return { color: "red", label: "Expired" };
  if (days <= 90) return { color: "yellow", label: "Expiring soon" };
  return { color: "green", label: "Valid" };
}

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

export function ApplicantPassportFamilyPanel({
  applicant,
}: {
  applicant: ApplicantDetail;
}) {
  const passport = applicant.passport;
  const expiry = passport?.expiry_date
    ? expiryTone(passport.expiry_date)
    : null;

  return (
    <Stack gap="md">
      <Divider label="Passport" labelPosition="left" />
      {passport ? (
        <Stack gap="xs">
          <Field label="Passport number" value={passport.passport_number} />
          <Field
            label="Issuing country"
            value={passport.issuing_country ?? null}
          />
          <Field
            label="Place of issue"
            value={passport.place_of_issue ?? null}
          />
          <Field
            label="Issued"
            value={
              passport.issued_date
                ? dayjs(passport.issued_date).format("MMM D, YYYY")
                : null
            }
          />
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Text size="xs" c="dimmed">
              Expiry
            </Text>
            <Group gap={6}>
              <Text size="xs" ta="right">
                {passport.expiry_date
                  ? dayjs(passport.expiry_date).format("MMM D, YYYY")
                  : "—"}
              </Text>
              {expiry ? (
                <Badge size="xs" variant="light" color={expiry.color}>
                  {expiry.label}
                </Badge>
              ) : null}
            </Group>
          </Group>
        </Stack>
      ) : (
        <Text size="xs" c="dimmed">
          No passport on file.
        </Text>
      )}

      <Divider label="Family members" labelPosition="left" />
      {applicant.family_members.length === 0 ? (
        <Text size="xs" c="dimmed">
          No family members on file.
        </Text>
      ) : (
        applicant.family_members.map((member) => (
          <Card key={member.id ?? member.full_name_np} withBorder padding="xs">
            <Stack gap={2}>
              <Group justify="space-between">
                <Text size="xs" fw={500}>
                  {member.full_name_en || member.full_name_np}
                </Text>
                <Badge size="xs" variant="light" tt="capitalize">
                  {member.relationship}
                </Badge>
              </Group>
              {member.occupation ? (
                <Text size="xs" c="dimmed">
                  {member.occupation}
                </Text>
              ) : null}
              {member.contact_number ? (
                <Text size="xs" c="dimmed">
                  {member.contact_number}
                </Text>
              ) : null}
            </Stack>
          </Card>
        ))
      )}

      <Divider label="Emergency contacts" labelPosition="left" />
      {applicant.emergency_contacts.length === 0 ? (
        <Text size="xs" c="dimmed">
          No emergency contacts on file.
        </Text>
      ) : (
        applicant.emergency_contacts.map((contact) => (
          <Card
            key={contact.id ?? contact.full_name_np}
            withBorder
            padding="xs"
          >
            <Stack gap={2}>
              <Group justify="space-between">
                <Text size="xs" fw={500}>
                  {contact.full_name_en || contact.full_name_np}
                </Text>
                <Badge size="xs" variant="light">
                  {contact.relationship}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {contact.contact_number}
              </Text>
              {contact.email ? (
                <Text size="xs" c="dimmed">
                  {contact.email}
                </Text>
              ) : null}
              {contact.address ? (
                <Text size="xs" c="dimmed">
                  {contact.address}
                </Text>
              ) : null}
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}
