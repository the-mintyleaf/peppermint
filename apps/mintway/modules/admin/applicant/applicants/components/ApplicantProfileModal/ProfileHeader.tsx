"use client";

import {
  Alert,
  Avatar,
  Badge,
  Group,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import {
  ENGAGEMENT_STATUS_COLORS,
  ENGAGEMENT_STATUS_LABELS,
  LIFECYCLE_STAGE_LABELS,
} from "../../../_shared";
import { useProfileImageUrl } from "../../../addresses/profile-image";
import type { ProfileHeaderProps } from "./ProfileHeader.types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Persistent identity header for the profile hub — the applicant's photo, name, and the
 * engagement state as a single at-a-glance pill (a fact, not a lever), with the lifecycle
 * stage as the "role" subtitle. Terminal (archived/merged) state banners sit here so they
 * read from every section tab, not just the overview.
 */
export function ProfileHeader({ applicant }: ProfileHeaderProps) {
  const { url } = useProfileImageUrl(applicant.id);
  const engagementColor = ENGAGEMENT_STATUS_COLORS[applicant.engagement_status];
  const isArchived = Boolean(applicant.archived_at);
  const isMerged = Boolean(applicant.merged_into);

  return (
    <Stack gap="sm">
      <Group gap="md" align="center" wrap="nowrap">
        <Avatar src={url} size={64} radius="xl" color="gray">
          {initials(applicant.full_name) || <UserIcon size={28} aria-hidden />}
        </Avatar>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" align="center" wrap="wrap">
            <Title order={3} lineClamp={1}>
              {applicant.full_name}
            </Title>
            <Badge
              size="lg"
              radius="sm"
              variant="light"
              color={engagementColor}
              leftSection={
                <CheckCircleIcon size={14} weight="fill" aria-hidden />
              }
            >
              {ENGAGEMENT_STATUS_LABELS[applicant.engagement_status]}
            </Badge>
            {applicant.is_locked && (
              <Badge
                color="orange"
                variant="light"
                radius="sm"
                leftSection={
                  <LockKeyIcon size={12} weight="fill" aria-hidden />
                }
              >
                Locked
              </Badge>
            )}
          </Group>
          <Group gap="xs" align="center">
            <Text size="sm" c="dimmed">
              {LIFECYCLE_STAGE_LABELS[applicant.lifecycle_stage]}
            </Text>
            <Text size="sm" c="dimmed">
              ·
            </Text>
            <Text size="sm" c="dimmed">
              {applicant.applicant_code}
            </Text>
          </Group>
        </Stack>
      </Group>

      {isMerged && (
        <Alert color="gray" variant="light" title="Merged record">
          This applicant was merged into another record and is retained for
          history.
        </Alert>
      )}
      {isArchived && !isMerged && (
        <Alert color="orange" variant="light" title="Archived">
          This applicant is archived. Reactivate it before making further
          changes.
        </Alert>
      )}
    </Stack>
  );
}
