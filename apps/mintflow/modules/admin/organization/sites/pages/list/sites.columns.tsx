"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { Badge } from "@peppermint/ui";
import { BuildingIcon } from "@phosphor-icons/react/dist/csr/Building";
import { FingerprintIcon } from "@phosphor-icons/react/dist/csr/Fingerprint";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import type { Site } from "../../sites.types";

const SITE_TYPE_LABELS: Record<string, string> = {
  headquarters: "Headquarters",
  field_office: "Field Office",
  regional_office: "Regional Office",
  district_office: "District Office",
  service_centre: "Service Centre",
  warehouse: "Warehouse",
  other: "Other",
};

export const sitesColumns: DataTableShellColumn<Site>[] = [
  {
    accessor: "name",
    title: "Site Name",
    icon: BuildingIcon,
    sortable: true,
    width: 220,
  },
  {
    accessor: "code",
    title: "Code",
    icon: FingerprintIcon,
    sortable: true,
    width: 120,
  },
  {
    accessor: "site_type",
    title: "Type",
    icon: TagIcon,
    width: 160,
    render: (record) =>
      SITE_TYPE_LABELS[record.site_type] || record.site_type || "—",
  },
  {
    accessor: "city",
    title: "City",
    icon: MapPinIcon,
    sortable: true,
    width: 140,
    render: (record) => record.city || "—",
  },
  {
    accessor: "country_code",
    title: "Country",
    icon: GlobeIcon,
    width: 100,
    render: (record) => record.country_code || "—",
  },
  {
    accessor: "is_active",
    title: "Status",
    icon: PulseIcon,
    width: 100,
    render: (record) => (
      <Badge size="xs" color={record.is_active ? "green" : "gray"}>
        {record.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];
