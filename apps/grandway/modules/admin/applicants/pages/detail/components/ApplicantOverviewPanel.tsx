"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { ProfileField, ProfileSection } from "@/components/profile";
import { CREATION_SOURCE_LABELS } from "../../../applicants.labels";
import type {
  ApplicantDetail,
  ApplicantAddress,
} from "../../../applicants.types";

function formatAddress(address: ApplicantAddress | undefined): string | null {
  if (!address) return null;
  return (
    [
      address.street_address,
      address.municipality,
      address.ward ? `Ward ${address.ward}` : null,
      address.district,
      address.province,
      address.country,
      address.postal_code,
    ]
      .filter(Boolean)
      .join(", ") || null
  );
}

/** The applicant's numbers, primary first, each with its own label. */
function ContactNumbers({
  numbers,
}: {
  numbers: ApplicantDetail["contact_numbers"];
}) {
  return (
    <Stack gap={4}>
      {numbers.map((c) => (
        <Group key={c.id ?? c.number} gap={6} wrap="nowrap">
          <Text size="sm" fw={500}>
            {c.number}
          </Text>
          <Text size="xs" c="dimmed" tt="capitalize">
            {c.label}
          </Text>
          {c.is_primary ? (
            <Badge size="xs" variant="light" color="blue">
              Primary
            </Badge>
          ) : null}
        </Group>
      ))}
    </Stack>
  );
}

/**
 * The applicant's key facts — the body of the sticky profile sidebar.
 *
 * Grouped, not a flat run: identity, how to reach them, where they live, and
 * how the record came to exist are four different questions, and a single
 * undifferentiated column gave "Nationality" the same weight as "Permanent
 * address". Density inside a group, air between groups. Status lives in the
 * page header, where its switch is.
 */
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
    <Stack gap="lg">
      <ProfileSection title="Identity">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="sm">
          <ProfileField
            label="Date of birth"
            value={
              applicant.date_of_birth
                ? dayjs(applicant.date_of_birth).format("MMM D, YYYY")
                : null
            }
          />
          <ProfileField label="Gender" value={applicant.gender || null} />
          <ProfileField label="Nationality" value={applicant.nationality} />
        </SimpleGrid>
      </ProfileSection>

      <Divider />

      <ProfileSection title="Contact">
        <Stack gap="sm">
          <ProfileField label="Email" value={applicant.email} />
          <ProfileField
            label="Phone"
            value={
              applicant.contact_numbers.length === 0 ? null : (
                <ContactNumbers numbers={applicant.contact_numbers} />
              )
            }
          />
        </Stack>
      </ProfileSection>

      <Divider />

      <ProfileSection title="Address">
        <Stack gap="sm">
          <ProfileField label="Permanent" value={formatAddress(permanent)} />
          <ProfileField label="Current" value={formatAddress(current)} />
        </Stack>
      </ProfileSection>

      <Divider />

      <ProfileSection title="Record">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="sm">
          <ProfileField
            label="Added"
            value={dayjs(applicant.created_at).format("MMM D, YYYY")}
          />
          {/* One provenance field, not two: `creation_source` and
              `originating_lead_id` answer the same question, and the lead link
              is the useful half — so the source becomes the link when there is
              a lead behind it, and stays a plain fact when there isn't. */}
          <ProfileField
            label="Source"
            value={
              applicant.originating_lead_id ? (
                <Anchor
                  size="sm"
                  fw={500}
                  component={Link}
                  href="/admin/lead-management"
                >
                  <Group gap={4} wrap="nowrap">
                    <ArrowsLeftRightIcon size={14} aria-hidden />
                    {CREATION_SOURCE_LABELS.lead_conversion}
                  </Group>
                </Anchor>
              ) : (
                CREATION_SOURCE_LABELS[applicant.creation_source]
              )
            }
          />
        </SimpleGrid>
      </ProfileSection>
    </Stack>
  );
}
