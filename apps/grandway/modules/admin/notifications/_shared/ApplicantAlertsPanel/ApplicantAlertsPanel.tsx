"use client";

import { Loader, Stack, Text } from "@peppermint/ui";
import { ProfilePanelHeader } from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useApplicantNotifications } from "../../notifications.hooks";
import { NotificationRow } from "../NotificationRow";
import type { ApplicantAlertsPanelProps } from "./ApplicantAlertsPanel.types";

/**
 * Every alert addressed to YOU that is about this applicant — `?applicant_id=`,
 * which spans all source records (status changes, assignments, journeys,
 * visit notes, documents, expiry, applicant reminders…). That is wider than
 * `RecordAlertsPanel`, whose `source_entity_id` filter only matches alerts whose
 * source IS the given row.
 *
 * No `status` filter: the panel is the record's alert history (active +
 * dismissed + resolved). Titled "Your alerts", never "All alerts" — other
 * staff's alerts are invisible here; a cross-user history is `audit`.
 *
 * Honest limits, stated in the empty state's footnote: alerts raised before
 * 2026-10-29 carry no applicant link, and event alerts are deleted after 90
 * days, so an old applicant can legitimately show nothing. A muted category
 * also never produces alerts, so absence is not proof nothing happened.
 *
 * States: loading → `Loader`; failed → `QueryErrorState` + retry; empty →
 * message + limits note; rows reuse `NotificationRow` (own read/dismiss
 * levers). Permission-denied / read-only are N/A — the host applicant page
 * owns the gate (the feed itself is always the caller's own).
 */
export function ApplicantAlertsPanel({
  applicantId,
}: ApplicantAlertsPanelProps) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useApplicantNotifications(applicantId);

  const notifications = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const truncated = total > notifications.length;

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Alerts"
        description="Your alerts about this applicant — other staff see their own"
      />

      {isLoading ? <Loader size="sm" /> : null}

      {isError ? (
        <QueryErrorState
          message="Couldn't load alerts for this applicant."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : null}

      {!isLoading && !isError && notifications.length === 0 ? (
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            No alerts about this applicant.
          </Text>
          <Text size="xs" c="dimmed">
            Alerts raised before 29 Oct 2026 aren&apos;t linked to applicants,
            and event alerts are removed after 90 days.
          </Text>
        </Stack>
      ) : null}

      {!isLoading && !isError && notifications.length > 0 ? (
        <Stack gap="xs">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
          {truncated ? (
            <Text size="xs" c="dimmed">
              Showing the {notifications.length} most recent of {total} alerts.
            </Text>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
