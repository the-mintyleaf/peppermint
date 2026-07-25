"use client";

import { useState } from "react";
import { Group, Select, Text, TextInput } from "@peppermint/ui";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import type { DashboardFilterBarProps } from "./DashboardFilterBar.types";

const FISCAL_YEAR_PATTERN = /^\d{4}\/\d{2}$/;

/**
 * Only `fiscal_year` + `country` — the shared filter set's remaining fields
 * (`journey_stage`/`offer_status`/`document_status`/`checklist_status`) are
 * validated then silently ignored by every section (INTEGRATION.md §3/§9), so
 * no control is rendered for them here; a control that looks live but does
 * nothing would read as broken.
 *
 * `fiscal_year` is validated client-side (`YYYY/YY`) before it's committed —
 * both `fiscal_year` and `country` are now sent to ALL EIGHT sections (§3),
 * so committing every keystroke would fire 8 requests per keystroke, each
 * 400ing on every malformed intermediate value ("2", "208", "2082/8", …) and
 * flashing every panel into its error state while the user is mid-type. The
 * local input tracks what's on screen; only a complete, valid label (or an
 * empty string, to clear the filter) is ever handed to `onFiscalYearChange`.
 */
export function DashboardFilterBar({
  fiscalYear,
  country,
  onFiscalYearChange,
  onCountryChange,
}: DashboardFilterBarProps) {
  const { data: countries, isLoading: isLoadingCountries } = useCountries();

  // "Adjust state when a prop changes" via a render-time comparison (React's
  // documented alternative to an effect for this exact case) — keeps the
  // input in sync if `fiscalYear` is ever cleared/changed from outside this
  // component (e.g. browser back/forward), without re-syncing on every
  // render and without re-committing a value mid-type.
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
    <Group align="flex-end" gap="md" wrap="wrap">
      <TextInput
        label="Fiscal year"
        placeholder="2082/83"
        description="Format YYYY/YY"
        error={isFiscalYearValid ? undefined : "Use format YYYY/YY"}
        value={localFiscalYear}
        onChange={(event) => handleFiscalYearChange(event.currentTarget.value)}
        w={160}
      />
      <Select
        label="Destination country"
        placeholder="All countries"
        data={countryOptions}
        value={country || null}
        onChange={(value) => onCountryChange(value ?? "")}
        disabled={isLoadingCountries}
        clearable
        searchable
        w={220}
      />
      <Text size="xs" c="dimmed" maw={280}>
        Narrows most sections below. Exceptions: Recent activity honours only
        fiscal year, and a few individual figures (noted where they appear)
        ignore the country filter.
      </Text>
    </Group>
  );
}
