"use client";

import {
  Badge,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  dayjs,
} from "@peppermint/ui";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import {
  ProfileCard,
  ProfileField,
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

/** A named person card — one shape for both family members and emergency contacts. */
function PersonCard({
  name,
  relationship,
  lines,
}: {
  name: string;
  relationship: string;
  lines: string[];
}) {
  return (
    <ProfileCard>
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <ThemeIcon variant="light" color="gray" size="md" radius="xl">
          <UserIcon size={14} aria-hidden />
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text size="sm" fw={600}>
              {name}
            </Text>
            <Badge size="xs" variant="light" tt="capitalize">
              {relationship}
            </Badge>
          </Group>
          {lines.map((line) => (
            <Text key={line} size="xs" c="dimmed">
              {line}
            </Text>
          ))}
        </Stack>
      </Group>
    </ProfileCard>
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
    <Stack gap="xl">
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
                    <Text size="xs" fw={500}>
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
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {applicant.family_members.map((member, index) => (
              <PersonCard
                key={member.id ?? `${member.relationship}-${index}`}
                name={member.full_name || "Unnamed"}
                relationship={member.relationship}
                lines={[member.occupation, member.contact_number].filter(
                  (l): l is string => Boolean(l),
                )}
              />
            ))}
          </SimpleGrid>
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
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {applicant.emergency_contacts.map((contact, index) => (
              <PersonCard
                key={contact.id ?? `${contact.relationship}-${index}`}
                name={contact.full_name || "Unnamed"}
                relationship={contact.relationship}
                lines={[
                  contact.contact_number,
                  contact.email,
                  contact.address,
                ].filter((l): l is string => Boolean(l))}
              />
            ))}
          </SimpleGrid>
        )}
      </ProfileSection>
    </Stack>
  );
}
