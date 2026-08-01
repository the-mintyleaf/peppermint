"use client";

import Link from "next/link";
import { Badge, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import {
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/modules/admin/applicants/applicants.labels";
import { formatSince } from "../dashboard.utils";
import type { ApplicantRowViewProps } from "./ApplicantRowView.types";

/** The destinations are derived from journeys, so a brand-new applicant has none yet. */
function destinationLabel(applicant: ApplicantRowViewProps["applicant"]) {
  const names = Array.from(
    new Set(
      applicant.destinations
        .map(
          (destination) =>
            destination.country_name || destination.target_country,
        )
        .filter(Boolean),
    ),
  );
  if (names.length === 0) return "No destination yet";
  if (names.length <= 2) return names.join(" · ");
  return `${names.slice(0, 2).join(" · ")} +${names.length - 2}`;
}

/**
 * One newly-added applicant. Unlike a lead, an applicant HAS its own route, so
 * the whole row is the link — the largest, easiest target for the most likely
 * next move (§1.5), rather than a small chevron at the end of it.
 *
 * Status is a Badge and sits apart from the name: a fact about the record, never
 * something that looks like it changes the record (§1.9).
 */
export function ApplicantRowView({ applicant }: ApplicantRowViewProps) {
  return (
    <UnstyledButton
      component={Link}
      href={`/admin/applicants/${applicant.id}`}
      aria-label={`Open ${applicant.full_name}`}
      style={{ display: "block", width: "100%" }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm" py={6}>
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {applicant.full_name}
          </Text>
          <Group gap={5} wrap="nowrap">
            <MapPinIcon size={12} aria-hidden />
            <Text size="xs" c="dimmed" truncate>
              {destinationLabel(applicant)}
            </Text>
          </Group>
        </Stack>

        <Group gap="xs" wrap="nowrap" style={{ flex: "none" }}>
          <Text size="xs" c="dimmed" visibleFrom="sm">
            {formatSince(applicant.created_at)}
          </Text>
          <Badge
            size="xs"
            radius="sm"
            variant="light"
            color={STATUS_COLORS[applicant.status]}
          >
            {STATUS_LABELS[applicant.status]}
          </Badge>
        </Group>
      </Group>
    </UnstyledButton>
  );
}
