"use client";

import { Divider, SimpleGrid, Stack, dayjs } from "@peppermint/ui";
import { ProfileField, ProfileSection } from "@/components/profile";
import {
  OUTCOME_LABELS,
  STUDY_LEVEL_LABELS,
} from "../../../applicantJourneys.labels";
import type { ApplicantJourneyDetail } from "../../../applicantJourneys.types";

function formatDateTime(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY h:mm A") : null;
}

/**
 * The journey's key facts — the body of the sticky profile sidebar, grouped the
 * same way the applicant profile's is: what they're trying to do, how it's
 * paid for, and then — only when it applies — how it ended.
 *
 * Exactly one of closed/deferred applies by contract, so at most one lifecycle
 * block is ever drawn. Stage lives above this (in the sidebar header) as the
 * record's indicator.
 */
export function JourneyOverviewPanel({
  journey,
}: {
  journey: ApplicantJourneyDetail;
}) {
  const isClosed = journey.stage === "completed" || journey.stage === "closed";
  const isDeferred = journey.stage === "deferred";

  return (
    <Stack gap="lg">
      <ProfileSection title="Objective">
        <Stack gap="sm">
          <ProfileField
            label="Target institution"
            value={journey.target_institution_name}
          />
          <ProfileField
            label="Target program"
            value={journey.target_program_name}
          />
          <SimpleGrid
            cols={{ base: 1, xs: 2 }}
            spacing="sm"
            verticalSpacing="sm"
          >
            <ProfileField
              label="Study level"
              value={
                journey.study_level
                  ? STUDY_LEVEL_LABELS[journey.study_level]
                  : null
              }
            />
            <ProfileField
              label="Field of study"
              value={journey.field_of_study}
            />
            <ProfileField
              label="Preferred intake"
              value={journey.preferred_intake}
            />
          </SimpleGrid>
        </Stack>
      </ProfileSection>

      <Divider />

      <ProfileSection title="Funding">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="sm">
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
            value={journey.scholarship_interest ? "Interested" : "Not sought"}
          />
        </SimpleGrid>
      </ProfileSection>

      {journey.notes ? (
        <>
          <Divider />
          <ProfileSection title="Notes">
            <ProfileField label="Internal notes" value={journey.notes} />
          </ProfileSection>
        </>
      ) : null}

      {isClosed ? (
        <>
          <Divider />
          <ProfileSection title="Outcome">
            <Stack gap="sm">
              <ProfileField
                label="Outcome"
                value={journey.outcome ? OUTCOME_LABELS[journey.outcome] : null}
              />
              {journey.closure_reason ? (
                <ProfileField
                  label="Explanation"
                  value={journey.closure_reason}
                />
              ) : null}
              <SimpleGrid
                cols={{ base: 1, xs: 2 }}
                spacing="sm"
                verticalSpacing="sm"
              >
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
              </SimpleGrid>
            </Stack>
          </ProfileSection>
        </>
      ) : null}

      {isDeferred ? (
        <>
          <Divider />
          <ProfileSection title="Deferment">
            <Stack gap="sm">
              <ProfileField
                label="Deferred to intake"
                value={journey.deferred_to_intake}
              />
              {journey.deferment_reason ? (
                <ProfileField label="Reason" value={journey.deferment_reason} />
              ) : null}
              <SimpleGrid
                cols={{ base: 1, xs: 2 }}
                spacing="sm"
                verticalSpacing="sm"
              >
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
              </SimpleGrid>
            </Stack>
          </ProfileSection>
        </>
      ) : null}
    </Stack>
  );
}
