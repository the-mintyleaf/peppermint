"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { UserForm, UserProfileEditForm } from "../../form";
import { createUser, fetchUsers, updateUserProfile } from "../../users.api";
import { usersQueryKeys } from "../../users.queryKeys";
import type {
  CreateUserValues,
  ProfileUpdateValues,
  UserAdmin,
} from "../../users.types";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { getUsersColumns } from "./users.columns";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: UsersIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  {
    label: "Suspended",
    icon: PauseCircleIcon,
    filter: { status: "suspended" },
  },
  {
    label: "Deactivated",
    icon: ArchiveIcon,
    filter: { status: "deactivated" },
  },
];

function UsersListContent() {
  const { user: currentUser, isSuperadmin } = useCurrentUser();
  const [detailUser, setDetailUser] = useState<UserAdmin | null>(null);
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);

  const columns = getUsersColumns({
    currentUserId: currentUser?.id,
    isSuperadmin,
    onViewDetails: setDetailUser,
  });

  return (
    <>
      <ModalTableShell<UserAdmin, CreateUserValues, ProfileUpdateValues>
        queryKey={usersQueryKeys.lists()}
        queryGetFn={fetchUsers}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "user",
          label: "Users",
          description: "Manage accounts, roles, and employee profiles",
        }}
        createModalTitle="Create user"
        editModalTitle="Edit profile"
        createFormComponent={UserForm}
        editFormComponent={UserProfileEditForm}
        onCreateApi={(values) => {
          // Capture the admin-set temporary password so it can be re-shown once
          // after creation (the backend never returns it).
          const temp = values.temporary_password;
          return createUser(values).then((created) => {
            setIssuedPassword(temp);
            return created;
          });
        }}
        onEditApi={(values, record) => updateUserProfile(record.id, values)}
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={TABS}
        basePath="/admin/authenticate/users"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <UserDetailDrawer
        user={detailUser}
        opened={detailUser !== null}
        onClose={() => setDetailUser(null)}
        isSuperadmin={isSuperadmin}
      />

      <OneTimeSecretModal
        opened={issuedPassword !== null}
        onClose={() => setIssuedPassword(null)}
        title="User created"
        description="Share this temporary password with the new user securely."
        secrets={issuedPassword ? [issuedPassword] : []}
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
