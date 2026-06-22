import { Badge, Stack, Text } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { OrganizationUnit, OrgUnitStatus, OrgUnitType } from "../../organization-unit.api";

const UNIT_TYPE_LABELS: Record<OrgUnitType, string> = {
  ministry: "Ministry",
  department: "Department",
  division: "Division",
  section: "Section",
  district_office: "District Office",
  area_office: "Area Office",
  security_agency: "Security Agency",
  other: "Other",
};

const UNIT_TYPE_COLORS: Record<OrgUnitType, string> = {
  ministry: "violet",
  department: "blue",
  division: "cyan",
  section: "teal",
  district_office: "orange",
  area_office: "yellow",
  security_agency: "red",
  other: "gray",
};

const STATUS_COLORS: Record<OrgUnitStatus, string> = {
  active: "green",
  inactive: "orange",
  archived: "gray",
};

export const ORG_UNIT_COLUMNS: DataTableShellColumn<OrganizationUnit>[] = [
  {
    accessor: "name",
    title: "Office Name",
    sortable: true,
    width: 280,
    render: (record) => (
      <Stack gap={0}>
        <Text size="xs" fw={500}>{record.name}</Text>
        {record.nameNepali && <Text size="xs" c="dimmed">{record.nameNepali}</Text>}
      </Stack>
    ),
  },
  { accessor: "code", title: "Code", sortable: true, width: 100 },
  {
    accessor: "unitType",
    title: "Unit Type",
    width: 140,
    render: (record) => (
      <Badge size="xs" color={UNIT_TYPE_COLORS[record.unitType as OrgUnitType] ?? "gray"}>
        {UNIT_TYPE_LABELS[record.unitType as OrgUnitType] ?? record.unitType}
      </Badge>
    ),
  },
  { accessor: "province", title: "Province", sortable: true, width: 130 },
  { accessor: "district", title: "District", sortable: true, width: 120 },
  { accessor: "headName", title: "Office Head", width: 160 },
  {
    accessor: "status",
    title: "Status",
    width: 90,
    render: (record) => (
      <Badge size="xs" color={STATUS_COLORS[record.status as OrgUnitStatus] ?? "gray"}>
        {record.status}
      </Badge>
    ),
  },
];
