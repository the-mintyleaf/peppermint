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
import { StatusBadge } from "@peppermint/admin";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import {
  ENGAGEMENT_STATUS_COLORS,
  ENGAGEMENT_STATUS_LABELS,
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "../../../_shared";
import type { EngagementStatus, LifecycleStage } from "../../../_shared";
import { useProfileImageUrl } from "../../../addresses/profile-image";
import type { ProfileHeroProps } from "./ProfileHero.types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function Fact({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <Group gap={6} align="center" wrap="nowrap">
      {icon}
      <Text size="xs" c="dimmed" truncate>
        {value}
      </Text>
    </Group>
  );
}

/**
 * The applicant's identity anchor: photo, name + code, and the lifecycle/engagement
 * state as the dominant read (a badge, never an action). Key contact facts sit beneath;
 * archived/merged records surface a banner so a terminal state can't be missed.
 */
export function ProfileHero({ applicant }: ProfileHeroProps) {
  const { url } = useProfileImageUrl(applicant.id);
  const isArchived = Boolean(applicant.archived_at);
  const isMerged = Boolean(applicant.merged_into);

  return (
    <Stack gap="sm">
      <Group gap="md" align="flex-start" wrap="nowrap">
        <Avatar src={url} size={72} radius="md" color="gray">
          {initials(applicant.full_name) || <UserIcon size={32} aria-hidden />}
        </Avatar>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center" wrap="nowrap">
            <Title order={3} lineClamp={1}>
              {applicant.full_name}
            </Title>
            {applicant.is_locked && (
              <Badge
                color="orange"
                variant="light"
                leftSection={
                  <LockKeyIcon size={12} weight="fill" aria-hidden />
                }
              >
                Locked
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {applicant.applicant_code}
          </Text>
          <Group gap="xs">
            <StatusBadge<LifecycleStage>
              value={applicant.lifecycle_stage}
              colorMap={LIFECYCLE_STAGE_COLORS}
              labelMap={LIFECYCLE_STAGE_LABELS}
            />
            <StatusBadge<EngagementStatus>
              value={applicant.engagement_status}
              colorMap={ENGAGEMENT_STATUS_COLORS}
              labelMap={ENGAGEMENT_STATUS_LABELS}
            />
          </Group>
          <Group gap="md" mt={2}>
            <Fact
              icon={<EnvelopeSimpleIcon size={13} aria-hidden />}
              value={applicant.primary_email}
            />
            <Fact
              icon={<PhoneIcon size={13} aria-hidden />}
              value={applicant.primary_phone}
            />
            <Fact
              icon={<GlobeHemisphereWestIcon size={13} aria-hidden />}
              value={applicant.nationality}
            />
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
