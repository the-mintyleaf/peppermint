"use client";

import { useState } from "react";
import { Button, Group, Stack, Text } from "@peppermint/ui";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import { useApplicantsByCountry } from "../dashboard.hooks";
import { CategoryBarChart } from "./CategoryBarChart";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { ApplicantCountryStatsProps } from "./ApplicantCountryStats.types";

/**
 * One country = one request, so the visible count IS the request count. It grows
 * one STEP at a time and there is deliberately no "show all" — `useCountries`
 * alone returns up to 100 rows, and a single click must never be able to fan out
 * across a whole catalogue.
 */
const INITIAL_COUNT = 8;
const STEP = 8;

/**
 * Where the applicants are going. A magnitude comparison, so it is a single-hue
 * bar chart with the value printed on every bar — the length and the number
 * carry the meaning, never the colour (there is no "good" destination, so
 * colouring destinations would be inventing a judgement).
 *
 * Sorted by headcount, largest first, because the question this answers is
 * "which destination is carrying the book of work" and the catalogue's own
 * alphabetical order answers nothing. Countries whose count has not landed yet
 * are simply not bars yet — a country is never drawn at zero because its
 * request is still in flight.
 */
export function ApplicantCountryStats({ filters }: ApplicantCountryStatsProps) {
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const { data: countries, isPending, isError, refetch } = useCountries();

  const shown = (countries ?? []).slice(0, visible);
  const results = useApplicantsByCountry(shown, filters.fiscalYear);

  const items = shown
    .map((country, index) => ({
      label: country.name,
      value: results[index]?.data ?? 0,
      isSettled: results[index]?.isSuccess ?? false,
    }))
    .filter((item) => item.isSettled)
    .sort((a, b) => b.value - a.value);

  const isLoadingCounts = results.some((result) => result.isPending);
  const failed = results.filter((result) => result.isError).length;
  const hasMore = (countries?.length ?? 0) > visible;

  return (
    <PanelCard
      title="Applicants by destination"
      subtitle="Headcount per country — one count each, no group-by endpoint exists"
      icon={GlobeHemisphereWestIcon}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load the destination catalogue."
        onRetry={() => refetch()}
        isEmpty={!isLoadingCounts && items.length === 0}
        emptyMessage="No destinations with an applicant yet."
        skeletonHeight={260}
      >
        <Stack gap="sm">
          {items.length > 0 ? (
            <CategoryBarChart
              items={items}
              color="brand"
              orientation="horizontal"
              ariaLabel="Applicants per destination country, largest first"
            />
          ) : (
            <Text size="sm" c="dimmed">
              Counting…
            </Text>
          )}

          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {items.length} of {countries?.length ?? 0} destinations
              {failed > 0 ? ` · ${failed} couldn't be counted` : ""}
            </Text>
            {hasMore ? (
              <Button
                size="compact-xs"
                variant="default"
                onClick={() => setVisible((count) => count + STEP)}
              >
                Count {STEP} more
              </Button>
            ) : null}
          </Group>
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
