"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";

import { RequireStaff } from "@/components/RequireStaff";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { UserEditForm } from "../../form/UserEditForm";
import { UserForm } from "../../form/UserForm";
import type { CreateUserPayload, UpdateUserPayload } from "../../users.api";
import { createUser, fetchUsers, updateUser } from "../../users.api";
import { usersQueryKeys } from "../../users.queryKeys";
import type { User } from "../../users.types";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { getUsersColumns } from "./users.columns";

const tabs: DataTableShellTab[] = [
  { label: "All Users", icon: UsersIcon },
  {
    label: "Active",
    icon: CheckCircleIcon,
    filter: { account_status: "active" },
  },
  {
    label: "Suspended",
    icon: ProhibitIcon,
    filter: { account_status: "suspended" },
  },
  {
    label: "Deactivated",
    icon: ArchiveIcon,
    filter: { account_status: "deactivated" },
  },
];

function UsersListContent() {
  const { user: currentUser } = useCurrentUser();
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const columns = getUsersColumns({
    currentUserId: currentUser?.id,
    onViewDetails: setDetailUser,
  });

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Users", href: "/admin/authenticate/users" },
        ]}
      />
      <ModalPaper withBorder>
        <ModalTableShell<User>
          queryKey={usersQueryKeys.list()}
          queryGetFn={fetchUsers}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "user",
            label: "Users",
            description: "Manage staff, human accounts, and service actors",
          }}
          idAccessor="id"
          createFormComponent={UserForm}
          editFormComponent={UserEditForm}
          onCreateApi={(values) =>
            createUser(values as unknown as CreateUserPayload)
          }
          onEditApi={(values, record) =>
            updateUser(record.id, values as unknown as UpdateUserPayload)
          }
          getErrorMessage={getApiErrorMessage}
          disableReviewButton
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
          tabs={tabs}
          basePath="/admin/authenticate/users"
        />
      </ModalPaper>
      <UserDetailDrawer
        user={detailUser}
        opened={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
      />
    </>
  );
}

export function UsersList() {
  return (
    <RequireStaff>
      <UsersListContent />
    </RequireStaff>
  );
}
