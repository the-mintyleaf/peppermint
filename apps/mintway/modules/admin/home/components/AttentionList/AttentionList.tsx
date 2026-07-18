"use client";

import Link from "next/link";
import { Badge, Group, Skeleton, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

import { QueryErrorState } from "@/components/QueryErrorState";
import {
  FOLLOW_UP_PRIORITY_COLORS,
  FOLLOW_UP_PRIORITY_LABELS,
} from "@/modules/admin/applicant/_shared/applicant.enums";
import type { ApplicantListRow } from "@/modules/admin/applicant/_shared/applicant.types";

import styles from "./AttentionList.module.css";
import type { AttentionListProps } from "./AttentionList.types";

/** Human due label — overdue counts up in days, today reads "Due today". */
function dueLabel(
  dateStr: string,
  now: number,
): { text: string; overdue: boolean } {
  const due = new Date(dateStr);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const days = Math.round(
    (startOfToday.getTime() - dueDay.getTime()) / 86_400_000,
  );
  if (days <= 0) return { text: "Due today", overdue: false };
  return { text: `Overdue ${days}d`, overdue: true };
}

function displayName(row: ApplicantListRow): string {
  return row.full_name?.trim() || row.first_name || row.applicant_code;
}

export function AttentionList({
  rows,
  now,
  isLoading,
  isError,
  onRetry,
  isRetrying,
}: AttentionListProps) {
  if (isLoading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={44} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load follow-ups."
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <Group gap="sm" align="center" py="xs">
        <ThemeIcon size={36} radius="xl" variant="light" color="teal">
          <CheckCircleIcon size={20} weight="fill" aria-hidden />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            You&apos;re all caught up
          </Text>
          <Text size="xs" c="dimmed">
            No follow-ups are overdue or due today.
          </Text>
        </Stack>
      </Group>
    );
  }

  return (
    <Stack gap={4}>
      {rows.map((row) => {
        const due = dueLabel(row.next_follow_up_at as string, now);
        const priority = row.follow_up_priority;
        return (
          <Link
            key={row.id}
            href={`/admin/applicants/${row.id}`}
            className={styles.row}
          >
            <Group
              justify="space-between"
              align="center"
              gap="sm"
              wrap="nowrap"
            >
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text size="sm" fw={500} truncate>
                  {displayName(row)}
                </Text>
                <Text
                  size="xs"
                  c={due.overdue ? "red" : "dimmed"}
                  fw={due.overdue ? 600 : 400}
                >
                  {due.text}
                </Text>
              </Stack>
              {priority ? (
                <Badge
                  size="sm"
                  variant="light"
                  color={FOLLOW_UP_PRIORITY_COLORS[priority]}
                >
                  {FOLLOW_UP_PRIORITY_LABELS[priority]}
                </Badge>
              ) : null}
            </Group>
          </Link>
        );
      })}
    </Stack>
  );
}
