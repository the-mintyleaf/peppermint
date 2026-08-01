"use client";

import { useState } from "react";
import { Button, Group, Select, Text, TextInput } from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import { formatFetchedAt } from "../dashboard.utils";
import type { DashboardHeaderControlsProps } from "./DashboardHeaderControls.types";

const FISCAL_YEAR_PATTERN = /^\d{4}\/\d{2}$/;

/**
 * The dashboard's two live filters — `fiscal_year` + destination `country` — plus
 * "Refresh all", rendered compactly in the module header's right slot rather than a
 * body filter bar (they scope every section, so they belong with the page chrome).
 * The other shared-filter fields (`journey_stage`/`offer_status`/…) are validated then
 * silently ignored by every section (INTEGRATION.md §3/§9), so no control is shown.
 *
 * `fiscal_year` is validated client-side (`YYYY/YY`) before it is committed: both filters
 * fan out to all eight sections, so committing every keystroke would fire 8 requests per
 * key and 400 on each malformed intermediate value. The local input tracks what is on
 * screen; only a complete, valid label (or an empty string, to clear) reaches the parent.
 */
export function DashboardHeaderControls({
  fiscalYear,
  country,
  onFiscalYearChange,
  onCountryChange,
  onRefresh,
  fetchedAt,
}: DashboardHeaderControlsProps) {
  const { data: countries, isLoading: isLoadingCountries } = useCountries();

  // "Adjust state when a prop changes" via a render-time comparison (React's documented
  // alternative to an effect) — keeps the input in sync if `fiscalYear` is cleared/changed
  // from outside (browser back/forward) without re-committing a value mid-type.
  const [localFiscalYear, setLocalFiscalYear] = useState(fiscalYear);
  const [committedFiscalYear, setCommittedFiscalYear] = useState(fiscalYear);
  if (fiscalYear !== committedFiscalYear) {
    setCommittedFiscalYear(fiscalYear);
    setLocalFiscalYear(fiscalYear);
  }

  const isFiscalYearValid =
    localFiscalYear === "" || FISCAL_YEAR_PATTERN.test(localFiscalYear);

  const handleFiscalYearChange = (value: string) => {
    setLocalFiscalYear(value);
    if (value === "" || FISCAL_YEAR_PATTERN.test(value)) {
      onFiscalYearChange(value);
    }
  };

  const countryOptions = (countries ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Group gap="xs" wrap="nowrap" align="center">
      {/* Freshness sits beside Refresh because that is the control it explains:
          nothing polls, so this is when the figures on screen were fetched. */}
      <Text size="xs" c="dimmed" ff="monospace" visibleFrom="md">
        Fetched {formatFetchedAt(fetchedAt)}
      </Text>
      <TextInput
        size="xs"
        w={116}
        aria-label="Fiscal year (format YYYY/YY)"
        placeholder="FY 2082/83"
        // Boolean error keeps the red affordance without expanding the 55px header
        // with a message; the placeholder documents the format.
        error={isFiscalYearValid ? undefined : true}
        value={localFiscalYear}
        onChange={(event) => handleFiscalYearChange(event.currentTarget.value)}
      />
      <Select
        size="xs"
        w={172}
        aria-label="Destination country"
        placeholder="All countries"
        data={countryOptions}
        value={country || null}
        onChange={(value) => onCountryChange(value ?? "")}
        disabled={isLoadingCountries}
        clearable
        searchable
      />
      <Button
        size="xs"
        variant="default"
        leftSection={<ArrowClockwiseIcon size={14} aria-hidden />}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </Group>
  );
}
