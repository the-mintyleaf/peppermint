"use client";

import { Group, Stack, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";

import {
  ENGAGEMENT_STATUS_COLORS,
  ENGAGEMENT_STATUS_LABELS,
  FOLLOW_UP_PRIORITY_COLORS,
  FOLLOW_UP_PRIORITY_LABELS,
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "../../../_shared";
import type {
  ApplicantListRow,
  EngagementStatus,
  FollowUpPriority,
  LifecycleStage,
} from "../../../_shared";
import { ApplicantActionsMenu } from "../../components/ApplicantActions";

function contactLine(value?: string) {
  return value ? (
    <Text size="xs">{value}</Text>
  ) : (
    <Text size="xs" c="dimmed">
      —
    </Text>
  );
}

/**
 * List columns. The common set is staff-safe (identity + contact + lifecycle); admin
 * adds the follow-up column (a protected projection). Columns are assembled by role so
 * a staff token never renders a field its projection omits.
 */
export function getApplicantColumns(
  isAdmin: boolean,
): DataTableShellColumn<ApplicantListRow>[] {
  const columns: DataTableShellColumn<ApplicantListRow>[] = [
    {
      accessor: "full_name",
      title: "Applicant",
      render: (a) => (
        <Stack gap={0}>
          <Group gap={6} align="center">
            <Text size="xs" fw={500}>
              {a.full_name}
            </Text>
            {a.is_locked && (
              <LockKeyIcon
                size={12}
                weight="fill"
                color="var(--mantine-color-orange-6)"
                aria-label="Locked"
              />
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {a.applicant_code}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "primary_email",
      title: "Contact",
      render: (a) => (
        <Stack gap={0}>
          {contactLine(a.primary_email)}
          {contactLine(a.primary_phone)}
        </Stack>
      ),
    },
    {
      accessor: "lifecycle_stage",
      title: "Stage",
      render: (a) => (
        <StatusBadge<LifecycleStage>
          value={a.lifecycle_stage}
          colorMap={LIFECYCLE_STAGE_COLORS}
          labelMap={LIFECYCLE_STAGE_LABELS}
        />
      ),
    },
    {
      accessor: "engagement_status",
      title: "Engagement",
      render: (a) => (
        <StatusBadge<EngagementStatus>
          value={a.engagement_status}
          colorMap={ENGAGEMENT_STATUS_COLORS}
          labelMap={ENGAGEMENT_STATUS_LABELS}
        />
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      accessor: "next_follow_up_at",
      title: "Follow-up",
      render: (a) => {
        const d = a.next_follow_up_at ? dayjs(a.next_follow_up_at) : null;
        return (
          <Stack gap={2}>
            {d && d.isValid() ? (
              <Text size="xs">{d.format("MMM D, YYYY")}</Text>
            ) : (
              <Text size="xs" c="dimmed">
                —
              </Text>
            )}
            {a.follow_up_priority && (
              <StatusBadge<FollowUpPriority>
                value={a.follow_up_priority}
                colorMap={FOLLOW_UP_PRIORITY_COLORS}
                labelMap={FOLLOW_UP_PRIORITY_LABELS}
              />
            )}
          </Stack>
        );
      },
    });
  }

  columns.push(
    {
      accessor: "updated_at",
      title: "Updated",
      render: (a) => {
        const d = a.updated_at ? dayjs(a.updated_at) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (a) => <ApplicantActionsMenu applicant={a} />,
    },
  );

  return columns;
}
