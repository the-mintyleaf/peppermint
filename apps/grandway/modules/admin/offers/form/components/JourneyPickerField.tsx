"use client";

import { Select, Stack, Text, useQuery } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
// Concrete-file imports, never the applicant-journeys barrel — avoids a
// barrel-to-barrel import cycle (CLAUDE / dispatch brief).
import { listJourneys } from "@/modules/admin/applicant-journeys/applicantJourneys.api";
import { journeyQueryKeys } from "@/modules/admin/applicant-journeys/applicantJourneys.queryKeys";
import type { ApplicantJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.types";
import type { OfferCreateValues } from "../OfferCreateForm.types";

function journeyLabel(journey: ApplicantJourney): string {
  const name =
    journey.applicant.full_name ||
    journey.applicant.full_name_en ||
    journey.applicant.full_name_np ||
    "Unnamed applicant";
  const target =
    journey.target_institution_name ||
    journey.target_program_name ||
    journey.target_country ||
    "No destination set";
  return `${name} — ${target}`;
}

/**
 * Every offer belongs to exactly one journey, supplied on create and never
 * changeable (§6). The journeys endpoint has NO free-text search (§3), so this
 * fetches a generous newest-first page and lets the Select filter it
 * client-side by label; a consultancy with more journeys than one page is an
 * edge case the disclosure below names rather than hides.
 */
export function JourneyPickerField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();

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
        label="Select applicant"
        description="Which applicant journey is this offer for? Not changeable later."
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
          Showing the {journeys.length} most recent journeys. Open the offer
          from the applicant&apos;s journey if you don&apos;t see it here.
        </Text>
      ) : null}
    </Stack>
  );
}
