"use client";

import { Text } from "@peppermint/ui";
import { statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import {
  AVAILABILITY_COLORS,
  AVAILABILITY_LABELS,
  AVAILABILITY_OPTIONS,
  INSTITUTION_TYPE_LABELS,
  INSTITUTION_TYPE_OPTIONS,
} from "../../../institutions.constants";
import type {
  AvailabilityStatus,
  Country,
  Institution,
} from "../../../institutions.types";
import { InstitutionRowActions } from "./components/InstitutionRowActions";

interface ProvidersColumnsOptions {
  countries: Country[];
  canManage: boolean;
  onManageCampuses: (institution: Institution) => void;
}

export function getProvidersColumns({
  countries,
  canManage,
  onManageCampuses,
}: ProvidersColumnsOptions): DataTableShellColumn<Institution>[] {
  return [
    {
      accessor: "name",
      title: "Name",
      icon: BuildingsIcon,
      key: "name",
      render: (row) => (
        <Text size="xs" fw={500}>
          {row.name}
        </Text>
      ),
    },
    {
      accessor: "common_name",
      title: "Common name",
      icon: TagIcon,
      key: "common_name",
      render: (row) => (
        <Text size="xs" c={row.common_name ? undefined : "dimmed"}>
          {row.common_name || "—"}
        </Text>
      ),
    },
    {
      accessor: "country",
      title: "Country",
      icon: GlobeIcon,
      key: "country",
      filter: {
        type: "select",
        options: countries.map((c) => ({ label: c.name, value: c.id })),
      },
      render: (row) => <Text size="xs">{row.country.name}</Text>,
    },
    {
      accessor: "institution_type",
      title: "Type",
      icon: TagIcon,
      key: "institution_type",
      filter: { type: "select", options: INSTITUTION_TYPE_OPTIONS },
      render: (row) => (
        <Text size="xs">{INSTITUTION_TYPE_LABELS[row.institution_type]}</Text>
      ),
    },
    statusColumn<Institution, AvailabilityStatus>("availability_status", {
      title: "Availability",
      icon: PulseIcon,
      key: "availability_status",
      colorMap: AVAILABILITY_COLORS,
      labelMap: AVAILABILITY_LABELS,
      filter: { type: "select", options: AVAILABILITY_OPTIONS },
    }),
    {
      accessor: "actions",
      title: "",
      key: "actions",
      textAlign: "right",
      render: (row) => (
        <InstitutionRowActions
          institution={row}
          canManage={canManage}
          onManageCampuses={onManageCampuses}
        />
      ),
    },
  ];
}
