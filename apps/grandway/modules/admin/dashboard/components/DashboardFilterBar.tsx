"use client";

import { Group, Select, Text, TextInput } from "@peppermint/ui";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import type { DashboardFilterBarProps } from "./DashboardFilterBar.types";

/**
 * Only `fiscal_year` + `country` — the shared filter set's remaining fields
 * (`journey_stage`/`offer_status`/`document_status`/`checklist_status`) are
 * validated then silently ignored by every section (INTEGRATION.md §3/§9), so
 * no control is rendered for them here; a control that looks live but does
 * nothing would read as broken.
 */
export function DashboardFilterBar({
  fiscalYear,
  country,
  onFiscalYearChange,
  onCountryChange,
}: DashboardFilterBarProps) {
  const { data: countries, isLoading: isLoadingCountries } = useCountries();

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
        value={fiscalYear}
        onChange={(event) => onFiscalYearChange(event.currentTarget.value)}
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
        Applies to Conversion and Final outcomes; the Recent activity feed only
        honours fiscal year.
      </Text>
    </Group>
  );
}
