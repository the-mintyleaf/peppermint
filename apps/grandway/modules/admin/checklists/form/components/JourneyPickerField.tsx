"use client";

import { Select, Stack, Text, useQuery } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
// Concrete-file imports, never the applicant-journeys barrel — avoids a
// barrel-to-barrel import cycle (offers.api.ts / offers' JourneyPickerField precedent).
import { listJourneys } from "@/modules/admin/applicant-journeys/applicantJourneys.api";
import { journeyQueryKeys } from "@/modules/admin/applicant-journeys/applicantJourneys.queryKeys";
import type { ApplicantJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.types";
import type { ChecklistCreateValues } from "../ChecklistCreateForm.types";

function journeyLabel(journey: ApplicantJourney): string {
  const name = journey.applicant.full_name;
  const target =
    journey.target_institution_name ||
    journey.target_program_name ||
    journey.target_country ||
    "No destination set";
  return `${name} — ${target}`;
}

/**
 * Every checklist belongs to exactly one journey, supplied on create and never
 * changeable. The journeys endpoint has no free-text search, so this fetches a
 * generous newest-first page and lets the Select filter it client-side by
 * label (same pattern as `offers/form/components/JourneyPickerField.tsx`).
 */
export function JourneyPickerField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ChecklistCreateValues>();

  const { data, isFetching, isError } = useQuery({
    queryKey: journeyQueryKeys.list({
      page: 1,
      pageSize: 100,
      search: "",
      sort: [],
      filters: {},
    }),
    queryFn: () =>
      listJourneys({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
  });

  const journeys = data?.data ?? [];
  const options = journeys.map((journey) => ({
    value: journey.id,
    label: journeyLabel(journey),
  }));
  const truncated = (data?.meta.total ?? 0) > journeys.length;

  return (
    <Stack gap={4}>
      <Select
        label="Journey"
        description="Which applicant is this checklist for? Not changeable later."
        placeholder="Search by applicant or destination"
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
