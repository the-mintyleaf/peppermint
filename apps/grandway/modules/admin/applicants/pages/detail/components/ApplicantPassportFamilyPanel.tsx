"use client";

import { Badge, Group, SimpleGrid, Stack, Text, dayjs } from "@peppermint/ui";
import {
  ProfileField,
  ProfileList,
  ProfileListRow,
  ProfilePanelHeader,
  ProfileSection,
} from "@/components/profile";
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

/**
 * One row per named person — the same shape for family members and emergency
 * contacts. A list, not cards: these are short records whose whole content is
 * a name, a relationship and a couple of contact facts, and a card per person
 * spent a border and half the column width on each of them.
 */
function PersonRow({
  name,
  relationship,
  facts,
}: {
  name: string;
  relationship: string;
  facts: string[];
}) {
  return (
    <ProfileListRow>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text size="sm" fw={600}>
            {name}
          </Text>
          <Text size="xs" c="dimmed">
            {facts.length > 0 ? facts.join(" · ") : "No contact details"}
          </Text>
        </Stack>
        <Badge size="xs" variant="light" tt="capitalize">
          {relationship}
        </Badge>
      </Group>
    </ProfileListRow>
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
    <Stack gap="lg">
      <ProfilePanelHeader
        title="Passport & Family"
        description="Travel document, next of kin, and who to call"
      />

      <ProfileSection title="Passport">
        {passport ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            spacing="sm"
            verticalSpacing="sm"
          >
            <ProfileField
              label="Passport number"
              value={passport.passport_number}
            />
            <ProfileField
              label="Issuing country"
              value={passport.issuing_country ?? null}
            />
            <ProfileField
              label="Place of issue"
              value={passport.place_of_issue ?? null}
            />
            <ProfileField
              label="Issued"
              value={
                passport.issued_date
                  ? dayjs(passport.issued_date).format("MMM D, YYYY")
                  : null
              }
            />
            <ProfileField
              label="Expiry"
              value={
                passport.expiry_date ? (
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={500}>
                      {dayjs(passport.expiry_date).format("MMM D, YYYY")}
                    </Text>
                    {expiry ? (
                      <Badge size="xs" variant="light" color={expiry.color}>
                        {expiry.label}
                      </Badge>
                    ) : null}
                  </Group>
                ) : null
              }
            />
          </SimpleGrid>
        ) : (
          <Text size="xs" c="dimmed">
            No passport on file.
          </Text>
        )}
      </ProfileSection>

      <ProfileSection
        title="Family members"
        action={
          applicant.family_members.length ? (
            <Badge size="xs" variant="light" circle>
              {applicant.family_members.length}
            </Badge>
          ) : undefined
        }
      >
        {applicant.family_members.length === 0 ? (
          <Text size="xs" c="dimmed">
            No family members on file.
          </Text>
        ) : (
          <ProfileList>
            {applicant.family_members.map((member) => (
              <PersonRow
                key={member.id ?? `${member.relationship}:${member.full_name}`}
                name={member.full_name || "Unnamed"}
                relationship={member.relationship}
                facts={[member.occupation, member.contact_number].filter(
                  (f): f is string => Boolean(f),
                )}
              />
            ))}
          </ProfileList>
        )}
      </ProfileSection>

      <ProfileSection
        title="Emergency contacts"
        action={
          applicant.emergency_contacts.length ? (
            <Badge size="xs" variant="light" circle>
              {applicant.emergency_contacts.length}
            </Badge>
          ) : undefined
        }
      >
        {applicant.emergency_contacts.length === 0 ? (
          <Text size="xs" c="dimmed">
            No emergency contacts on file.
          </Text>
        ) : (
          <ProfileList>
            {applicant.emergency_contacts.map((contact) => (
              <PersonRow
                key={
                  contact.id ?? `${contact.relationship}:${contact.full_name}`
                }
                name={contact.full_name || "Unnamed"}
                relationship={contact.relationship}
                facts={[
                  contact.contact_number,
                  contact.email,
                  contact.address,
                ].filter((f): f is string => Boolean(f))}
              />
            ))}
          </ProfileList>
        )}
      </ProfileSection>
    </Stack>
  );
}
