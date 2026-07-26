"use client";

import { SimpleGrid, Stack, dayjs } from "@peppermint/ui";
import { ProfileField } from "@/components/profile";
import {
  OUTCOME_LABELS,
  STUDY_LEVEL_LABELS,
} from "../../../applicantJourneys.labels";
import type { ApplicantJourneyDetail } from "../../../applicantJourneys.types";

function formatDateTime(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY h:mm A") : null;
}

/**
 * The journey's key facts — the body of the sticky profile sidebar. Objective
 * fields first; then closure or deferment detail, rendered only when present
 * (exactly one of active/closed/deferred applies by contract). Stage lives above
 * this (in the sidebar header) as the record's indicator.
 */
export function JourneyOverviewPanel({
  journey,
}: {
  journey: ApplicantJourneyDetail;
}) {
  const isClosed = journey.stage === "completed" || journey.stage === "closed";
  const isDeferred = journey.stage === "deferred";

  return (
    <Stack gap="md">
      <ProfileField
        label="Target institution"
        value={journey.target_institution_name}
      />
      <ProfileField
        label="Target program"
        value={journey.target_program_name}
      />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        <ProfileField
          label="Study level"
          value={
            journey.study_level ? STUDY_LEVEL_LABELS[journey.study_level] : null
          }
        />
        <ProfileField label="Field of study" value={journey.field_of_study} />
        <ProfileField
          label="Preferred intake"
          value={journey.preferred_intake}
        />
        <ProfileField
          label="Budget"
          value={
            journey.budget_amount
              ? `${journey.budget_amount} ${journey.budget_currency}`
              : null
          }
        />
        <ProfileField
          label="Scholarship"
          value={journey.scholarship_interest ? "Yes" : "No"}
        />
      </SimpleGrid>

      {journey.notes ? (
        <ProfileField label="Notes" value={journey.notes} />
      ) : null}

      {isClosed ? (
        <>
          <ProfileField
            label="Outcome"
            value={journey.outcome ? OUTCOME_LABELS[journey.outcome] : null}
          />
          {journey.closure_reason ? (
            <ProfileField label="Explanation" value={journey.closure_reason} />
          ) : null}
          <ProfileField
            label="Closed at"
            value={formatDateTime(journey.closed_at)}
          />
          <ProfileField
            label="Closed by"
            value={
              journey.closed_by?.display_name ||
              journey.closed_by?.username ||
              null
            }
          />
        </>
      ) : null}

      {isDeferred ? (
        <>
          <ProfileField
            label="Deferred to intake"
            value={journey.deferred_to_intake}
          />
          {journey.deferment_reason ? (
            <ProfileField label="Reason" value={journey.deferment_reason} />
          ) : null}
          <ProfileField
            label="Deferred at"
            value={formatDateTime(journey.deferred_at)}
          />
          <ProfileField
            label="Deferred by"
            value={
              journey.deferred_by?.display_name ||
              journey.deferred_by?.username ||
              null
            }
          />
        </>
      ) : null}
    </Stack>
  );
}
