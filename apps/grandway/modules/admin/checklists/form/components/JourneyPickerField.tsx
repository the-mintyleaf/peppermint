"use client";

import { Select, Stack, Text, useQuery } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
// Concrete-file imports, never the applicant-journeys barrel — avoids a
// barrel-to-barrel import cycle (offers.api.ts / offers' JourneyPickerField precedent).
import { listJourneys } from "@/modules/admin/applicant-journeys/applicantJourneys.api";
import { journeyQueryKeys } from "@/modules/admin/applicant-journeys/applicantJourneys.queryKeys";
import type { ApplicantJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.types";
import type { ChecklistCreateValues } from "../ChecklistCreateForm.types";

function journeyDestination(journey: ApplicantJourney): string {
  return (
    journey.target_institution_name ||
    journey.target_program_name ||
    journey.target_country ||
    "No destination set"
  );
}

/**
 * Scoped to one applicant, their name is on every option and carries nothing —
 * the destination is what tells two of their journeys apart.
 */
function journeyLabel(journey: ApplicantJourney, scoped: boolean): string {
  const destination = journeyDestination(journey);
  return scoped
    ? destination
    : `${journey.applicant.full_name} — ${destination}`;
}

/**
 * Every checklist belongs to exactly one journey, supplied on create and never
 * changeable. The journeys endpoint has no free-text search, so this fetches a
 * generous newest-first page and lets the Select filter it client-side by
 * label (same pattern as `offers/form/components/JourneyPickerField.tsx`).
 *
 * `applicantId` narrows the page to that person's journeys — the worklist
 * drawer already knows whose worklist is being created, so the field becomes
 * "which of their objectives" instead of a search of everyone's. The params
 * are the same shape either way, so the scoped read is its own cache entry
 * rather than a filtered view of the unscoped one.
 */
export function JourneyPickerField({
  isLoading,
  applicantId,
}: {
  isLoading: boolean;
  applicantId?: string;
}) {
  const { form } = useFormInstance<ChecklistCreateValues>();

  const params = {
    page: 1,
    pageSize: 100,
    search: "",
    sort: [],
    filters: applicantId ? { applicant: applicantId } : {},
  };

  const { data, isFetching, isError } = useQuery({
    queryKey: journeyQueryKeys.list(params),
    queryFn: () => listJourneys(params),
  });

  const journeys = data?.data ?? [];
  const options = journeys.map((journey) => ({
    value: journey.id,
    label: journeyLabel(journey, applicantId !== undefined),
  }));
  const truncated = (data?.meta.total ?? 0) > journeys.length;

  return (
    <Stack gap={4}>
      <Select
        label="Journey"
        description={
          applicantId
            ? "Which of this applicant's objectives is it for? Not changeable later."
            : "Which applicant is this checklist for? Not changeable later."
        }
        placeholder={
          applicantId
            ? "Search by destination"
            : "Search by applicant or destination"
        }
        required
        searchable
        data={options}
        disabled={isLoading}
        nothingFoundMessage={
          isError
            ? "Couldn't load journeys"
            : isFetching
              ? "Loading…"
              : "No journeys found"
        }
        {...form.getInputProps("journey")}
        onChange={(value) => form.setFieldValue("journey", value ?? "")}
      />
      {truncated ? (
        <Text size="xs" c="dimmed">
          Showing the {journeys.length} most recent journeys. Open the checklist
          from the applicant&apos;s journey if you don&apos;t see it here.
        </Text>
      ) : null}
    </Stack>
  );
}
