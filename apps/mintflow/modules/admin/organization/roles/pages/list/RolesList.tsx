"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { ShieldIcon } from "@phosphor-icons/react/dist/csr/Shield";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { fetchRoles, createRole, updateRole, deleteRole } from "../../roles.api";
import { roleQueryKeys } from "../../roles.queryKeys";
import { ROLES_COLUMNS } from "./roles.columns";
import { RolesForm } from "../../form/RolesForm";
import type { Role } from "../../roles.types";

const TABS: DataTableShellTab[] = [
  { label: "All Roles", icon: ShieldIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "Inactive", icon: ProhibitIcon, filter: { status: "inactive" } },
];

export function RolesList() {
  return (
    <Paper p={0} withBorder radius="md" h="calc(100vh - 16px)">
      <ModalTableShell<Role>
        queryKey={roleQueryKeys.list()}
        queryGetFn={fetchRoles}
        dataKey="data"
        paginationKey="meta"
        columns={ROLES_COLUMNS}
        moduleInfo={{
          name: "roles",
          label: "Roles & Permissions",
          description: "Define roles and control what each role can access",
        }}
        idAccessor="id"
        createFormComponent={RolesForm}
        editFormComponent={RolesForm}
        onCreateApi={(values) => createRole(values as Partial<Role>)}
        onEditApi={(values) => { const v = values as Role; return updateRole(String(v.id), v); }}
        onDeleteApi={(id) => deleteRole(String(id))}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        tabs={TABS}
        basePath="/admin/organization/roles"
      />
    </Paper>
  );
}
