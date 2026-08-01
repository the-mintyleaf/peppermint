"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import { useCountrySummaries } from "../dashboard.hooks";
import type { CountryCardsProps } from "./CountryCards.types";

/**
 * Each card is one request (see `useCountrySummaries` — there is no group-by
 * endpoint), so the visible count IS the request count. It grows one STEP at a
 * time and there is deliberately **no "show all"**: a single click must never be
 * able to fan out across a whole catalogue (`useCountries` alone returns up to
 * 100 rows). Widening the comparison stays an explicit, bounded choice.
 */
const INITIAL_COUNT = 8;
const STEP = 8;

/**
 * `useCountries` fetches one generous page (`pageSize: 100`). At exactly that
 * many rows we cannot tell a 100-country catalogue from a truncated one, so the
 * caption says so rather than printing a total that may be short.
 */
const COUNTRY_PAGE_SIZE = 100;

interface CountryStat {
  id: string;
  name: string;
  journeys: number | undefined;
  applicants: number | undefined;
  overdue: number | undefined;
  isPending: boolean;
  isError: boolean;
}

/**
 * Destination comparison — "where is the book of work, and which destination is
 * carrying the overdue items?".
 *
 * Built by asking `/summary/` once per country because the contract offers no
 * per-country breakdown (§3: `country` is a filter). Two consequences the UI has
 * to be honest about, both surfaced in the caption:
 *
 * 1. The loaded cards are the catalogue's OWN order, not the busiest — volume
 *    can't be known before the request that reports it. They are then sorted by
 *    journeys among those that have actually landed, and "Show N more" widens
 *    the comparison a bounded step at a time.
 * 2. The strip ignores the header's country filter on purpose — it IS the
 *    cross-country view. The filtered country is highlighted instead, and
 *    activating a card sets that filter for the rest of the page.
 */
export function CountryCards({
  fiscalYear,
  selectedCountry,
  onSelectCountry,
}: CountryCardsProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const { data: countries, isPending: isLoadingCountries } = useCountries();

  const all = countries ?? [];
  const visible = all.slice(0, visibleCount);
  const results = useCountrySummaries(
    visible.map((country) => country.id),
    fiscalYear,
  );

  if (isLoadingCountries) {
    return <Skeleton height={140} radius="md" />;
  }

  if (all.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No destination countries in the catalogue yet — add one to compare
        destinations here.
      </Text>
    );
  }

  const stats: CountryStat[] = visible.map((country, index) => {
    const result = results[index];
    return {
      id: country.id,
      name: country.name,
      journeys: result?.data?.volumes.journeys_total,
      applicants: result?.data?.volumes.applicants_active,
      overdue: result?.data?.alerts.overdue_checklist_items,
      isPending: result?.isPending ?? true,
      isError: result?.isError ?? false,
    };
  });

  // Three bands, in this order: loaded (by journeys, descending — a real 0 ranks
  // last among them but is still ranked), then still-loading, then failed. Cards
  // DO move as their requests land, which is unavoidable when the sort key is
  // the thing being fetched; banding at least keeps a resolved 0 from being
  // interleaved with placeholders, and a failure from floating into the middle.
  const band = (stat: CountryStat) =>
    stat.journeys !== undefined ? 0 : stat.isError ? 2 : 1;

  const ordered = [...stats].sort((a, b) => {
    const byBand = band(a) - band(b);
    if (byBand !== 0) return byBand;
    return (b.journeys ?? 0) - (a.journeys ?? 0);
  });

  const max = Math.max(1, ...stats.map((stat) => stat.journeys ?? 0));
  const isCatalogueCapped = all.length >= COUNTRY_PAGE_SIZE;

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="sm">
        {ordered.map((stat) => (
          <CountryCard
            key={stat.id}
            stat={stat}
            max={max}
            isSelected={stat.id === selectedCountry}
            onSelect={() =>
              onSelectCountry(stat.id === selectedCountry ? "" : stat.id)
            }
          />
        ))}
      </SimpleGrid>

      <Group justify="space-between" align="baseline" wrap="wrap" gap="xs">
        <Text size="xs" c="dimmed">
          {visible.length === all.length
            ? `All ${all.length}${isCatalogueCapped ? "+" : ""} destinations, one request each, sorted by journeys.`
            : `${visible.length} of ${all.length}${isCatalogueCapped ? "+" : ""} destinations, in catalogue order — volume is only known once each is fetched.`}
          {isCatalogueCapped
            ? " The catalogue list itself is capped at 100."
            : ""}{" "}
          Select a card to scope the page to it.
        </Text>
        <Group gap="xs">
          {visible.length < all.length ? (
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() =>
                setVisibleCount((count) => Math.min(count + STEP, all.length))
              }
            >
              Show {Math.min(STEP, all.length - visible.length)} more
            </Button>
          ) : null}
          {visibleCount > INITIAL_COUNT ? (
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() => setVisibleCount(INITIAL_COUNT)}
            >
              Show fewer
            </Button>
          ) : null}
        </Group>
      </Group>
    </Stack>
  );
}

function CountryCard({
  stat,
  max,
  isSelected,
  onSelect,
}: {
  stat: CountryStat;
  max: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <UnstyledButton
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={
        isSelected
          ? `${stat.name}, currently scoping the page. Select to clear.`
          : `${stat.name}. Select to scope the page to this destination.`
      }
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <Card
        withBorder
        radius="md"
        p="md"
        h="100%"
        style={{
          borderColor: isSelected ? "var(--mantine-color-brand-6)" : undefined,
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text size="sm" fw={600} truncate>
              {stat.name}
            </Text>
            {stat.overdue ? (
              <Badge size="sm" color="red" variant="light">
                {stat.overdue} overdue
              </Badge>
            ) : null}
          </Group>

          {stat.isPending ? (
            <Skeleton height={26} width={64} radius="sm" />
          ) : (
            <Group gap={6} align="baseline">
              <Text
                fz={24}
                fw={700}
                lh={1.1}
                style={{ letterSpacing: "-0.02em" }}
              >
                {stat.isError || stat.journeys === undefined
                  ? "—"
                  : stat.journeys.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                journeys
              </Text>
            </Group>
          )}

          <Progress
            value={
              stat.journeys === undefined ? 0 : (stat.journeys / max) * 100
            }
            color={stat.journeys ? "brand" : "gray"}
            size="sm"
            radius="sm"
            aria-hidden
          />

          <Text size="xs" c="dimmed">
            {stat.isError
              ? "Couldn't load this destination."
              : stat.applicants === undefined
                ? " "
                : `${stat.applicants.toLocaleString()} active applicants`}
          </Text>
        </Stack>
      </Card>
    </UnstyledButton>
  );
}
