"use client";

import Link from "next/link";
import { Badge, Group, Skeleton, Stack, Text } from "@peppermint/ui";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";

import { QueryErrorState } from "@/components/QueryErrorState";
import {
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "@/modules/admin/applicant/_shared/applicant.enums";
import type { ApplicantListRow } from "@/modules/admin/applicant/_shared/applicant.types";

import { formatRelative } from "../../Home.utils";
import styles from "./RecentApplicants.module.css";
import type { RecentApplicantsProps } from "./RecentApplicants.types";

// `first_name` is not in either list projection — only the detail one carries it —
// so the old fallback through it was always undefined. `full_name` is guaranteed.
function displayName(row: ApplicantListRow): string {
  return row.full_name.trim() || row.applicant_code;
}

export function RecentApplicants({
  rows,
  now,
  isLoading,
  isError,
  onRetry,
  isRetrying,
}: RecentApplicantsProps) {
  if (isLoading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={40} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load recent applicants."
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Group gap="sm" align="center" py="xs">
        <UsersThreeIcon size={20} aria-hidden />
        <Text size="sm" c="dimmed">
          No applicants yet. New records will appear here as they&apos;re added.
        </Text>
      </Group>
    );
  }

  return (
    <Stack gap={4}>
      {rows.map((row) => (
        <Link
          key={row.id}
          href={`/admin/applicants/${row.id}`}
          className={styles.row}
        >
          <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                {displayName(row)}
              </Text>
              <Text size="xs" c="dimmed">
                {row.applicant_code} · updated{" "}
                {formatRelative(row.updated_at, now)}
              </Text>
            </Stack>
            <Badge
              size="sm"
              variant="light"
              color={LIFECYCLE_STAGE_COLORS[row.lifecycle_stage]}
            >
              {LIFECYCLE_STAGE_LABELS[row.lifecycle_stage]}
            </Badge>
          </Group>
        </Link>
      ))}
    </Stack>
  );
}
