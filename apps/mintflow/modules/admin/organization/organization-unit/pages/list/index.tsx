"use client";

import { DataTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { ShieldIcon } from "@phosphor-icons/react/dist/csr/Shield";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { fetchOrgUnits } from "../../organization-unit.api";
import { ORG_UNIT_COLUMNS } from "./list.columns";
import type { OrganizationUnit } from "../../organization-unit.api";

const TABS: DataTableShellTab[] = [
  { label: "All Units", icon: TreeStructureIcon },
  { label: "Ministries", icon: BuildingsIcon, filter: { unitType: "ministry" } },
  { label: "Departments", icon: BuildingsIcon, filter: { unitType: "department" } },
  { label: "Field Offices", icon: MapPinIcon, filter: { unitType: "district_office" } },
  { label: "Security", icon: ShieldIcon, filter: { unitType: "security_agency" } },
  { label: "Archived", icon: ArchiveIcon, filter: { status: "archived" } },
];

export function OrgUnitList() {
  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)">
      <DataTableShell<OrganizationUnit>
        queryKey="org-units.list"
        queryGetFn={(params) => fetchOrgUnits(params)}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={ORG_UNIT_COLUMNS}
        moduleInfo={{
          name: "OrganizationUnit",
          label: "Organizations",
          description: "Manage the office hierarchy — ministries, departments, and field offices",
        }}
        basePath="/admin/organization"
        tabs={TABS}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
      />
    </Paper>
  );
}
