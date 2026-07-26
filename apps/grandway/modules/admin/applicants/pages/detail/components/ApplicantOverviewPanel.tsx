"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Group,
  SimpleGrid,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { ProfileField } from "@/components/profile";
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

/**
 * The applicant's key facts — the body of the sticky profile sidebar. Identity
 * essentials tile two-up; the longer contact/address fields run full width.
 * Status lives above this (in the sidebar header) as the record's indicator.
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
    <Stack gap="md">
      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
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
        <ProfileField
          label="Added"
          value={dayjs(applicant.created_at).format("MMM D, YYYY")}
        />
      </SimpleGrid>

      <ProfileField label="Email" value={applicant.email} />

      <ProfileField
        label="Phone"
        value={
          applicant.contact_numbers.length === 0 ? null : (
            <Stack gap={4}>
              {applicant.contact_numbers.map((c) => (
                <Group key={c.id ?? c.number} gap={6} wrap="nowrap">
                  <Text size="xs" fw={500}>
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
          )
        }
      />

      <ProfileField
        label="Permanent address"
        value={formatAddress(permanent)}
      />
      <ProfileField label="Current address" value={formatAddress(current)} />

      {applicant.originating_lead_id ? (
        <ProfileField
          label="Origin"
          value={
            <Anchor
              size="xs"
              fw={500}
              component={Link}
              href="/admin/lead-management"
            >
              <Group gap={4} wrap="nowrap">
                <ArrowsLeftRightIcon size={13} aria-hidden />
                Converted from a lead
              </Group>
            </Anchor>
          }
        />
      ) : null}
    </Stack>
  );
}
