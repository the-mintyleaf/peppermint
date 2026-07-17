"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import {
  ModalPaper,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { RoleEditForm, RoleForm } from "../form";
import type { RoleFormValues } from "../form/RoleForm.types";
import type { RoleEditFormValues } from "../form/RoleEditForm.types";
import type { CreateRolePayload, UpdateRolePayload } from "../roles.api";
import {
  deprecateRole,
  fetchRoles,
  updateRole,
  createRole,
} from "../roles.api";
import { buildRolesColumns } from "../roles.columns";
import { roleQueryKeys } from "../roles.queryKeys";
import type { Role } from "../roles.types";
import { RolePermissionsDrawer } from "./components/RolePermissionsDrawer";

export function RolesList() {
  return (
    <RequireStaff>
      <RolesListContent />
    </RequireStaff>
  );
}

function RolesListContent() {
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  const invalidateRoles = () => {
    void queryClient.invalidateQueries({ queryKey: roleQueryKeys.listKey() });
  };

  const deprecateMutation = useMutation({
    mutationFn: (role: Role) => deprecateRole(role.id),
    onSuccess: (_result, role) => {
      notifications.show({
        color: "green",
        title: "Role deprecated",
        message: `${role.display_name} is now deprecated and no longer assignable.`,
      });
      invalidateRoles();
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Couldn't deprecate role",
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const requestDeprecate = (role: Role) => {
    modals.openConfirmModal({
      title: "Deprecate role",
      children: (
        <>
          Deprecating <b>{role.display_name}</b> sets it to inactive and not
          assignable. Existing bindings that already reference this role are{" "}
          <b>not</b> automatically revoked — revoke them separately from the
          Bindings screen if needed.
        </>
      ),
      labels: { confirm: "Deprecate", cancel: "Cancel" },
      confirmProps: { color: "orange" },
      onConfirm: () => deprecateMutation.mutate(role),
    });
  };

  const columns = buildRolesColumns({
    onManagePermissions: setPermissionsRole,
    onDeprecate: requestDeprecate,
  });

  return (
    <>
      <ModalTableShell<Role, RoleFormValues, RoleEditFormValues>
        queryKey={roleQueryKeys.list()}
        queryGetFn={fetchRoles}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={columns}
        moduleInfo={{
          name: "role",
          label: "Roles",
          description: "Reusable permission-key packages.",
        }}
        idAccessor="id"
        createFormComponent={RoleForm}
        editFormComponent={RoleEditForm}
        onCreateApi={(values) => createRole(values as CreateRolePayload)}
        onEditApi={(values, record) =>
          updateRole(record.id, values as UpdateRolePayload)
        }
        getErrorMessage={getApiErrorMessage}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/authenticate/roles"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />
      <RolePermissionsDrawer
        role={permissionsRole}
        opened={Boolean(permissionsRole)}
        onClose={() => setPermissionsRole(null)}
      />
    </>
  );
}
