"use client";

import { Select, Stack, Text, useQuery } from "@peppermint/ui";
import {
  fetchOrganizations,
  fetchOrganizationUnits,
} from "../organizationScope.api";
import type { ScopeFieldsProps } from "./ScopeFields.types";

const SCOPE_TYPE_OPTIONS = [
  { value: "global", label: "Global — applies everywhere" },
  {
    value: "organization",
    label: "Organization — applies within one organization",
  },
  {
    value: "organization_unit",
    label: "Organization unit — applies within one unit",
  },
];

export function ScopeFields({
  value,
  onChange,
  disabled,
  error,
}: ScopeFieldsProps) {
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ["organization", "organizations", "list"],
    queryFn: fetchOrganizations,
    enabled: value.scope_type !== "global",
    staleTime: 60_000,
  });

  const { data: units, isLoading: loadingUnits } = useQuery({
    queryKey: ["organization", "units", value.organization],
    queryFn: () => fetchOrganizationUnits(value.organization as string),
    enabled:
      value.scope_type === "organization_unit" && Boolean(value.organization),
    staleTime: 60_000,
  });

  return (
    <Stack gap="sm">
      <Select
        label="Scope"
        required
        disabled={disabled}
        error={error}
        data={SCOPE_TYPE_OPTIONS}
        value={value.scope_type}
        onChange={(scopeType) =>
          onChange({
            scope_type: (scopeType ??
              "global") as ScopeFieldsProps["value"]["scope_type"],
            organization: null,
            organization_unit: null,
          })
        }
      />

      {value.scope_type !== "global" && (
        <Select
          label="Organization"
          required
          disabled={disabled || loadingOrgs}
          placeholder={
            loadingOrgs ? "Loading organizations..." : "Select organization"
          }
          searchable
          data={(organizations ?? []).map((org) => ({
            value: org.id,
            label: `${org.name} (${org.code})`,
          }))}
          value={value.organization}
          onChange={(organization) =>
            onChange({ ...value, organization, organization_unit: null })
          }
        />
      )}

      {value.scope_type === "organization_unit" && value.organization && (
        <Select
          label="Organization unit"
          required
          disabled={disabled || loadingUnits}
          placeholder={loadingUnits ? "Loading units..." : "Select unit"}
          searchable
          data={(units ?? []).map((unit) => ({
            value: unit.id,
            label: `${unit.name} (${unit.code})`,
          }))}
          value={value.organization_unit}
          onChange={(organizationUnit) =>
            onChange({ ...value, organization_unit: organizationUnit })
          }
        />
      )}

      {value.scope_type === "organization_unit" && !value.organization && (
        <Text size="xs" c="dimmed">
          Select an organization first to choose a unit.
        </Text>
      )}
    </Stack>
  );
}
