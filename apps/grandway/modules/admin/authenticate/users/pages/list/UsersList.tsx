"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireStaff } from "@/components/RequireStaff";
import { useManagedTier } from "@/config/access";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { AUTHORITY_LABELS } from "@/modules/admin/authenticate/_shared/authenticate.labels";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { UserForm, UserProfileEditForm } from "../../form";
import { createUser, fetchUsers, updateUser } from "../../users.api";
import { usersQueryKeys } from "../../users.queryKeys";
import type {
  CreateUserValues,
  UpdateUserValues,
  User,
} from "../../users.types";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { getUsersColumns } from "./users.columns";

function UsersListContent() {
  // The one tier this caller manages — it names the screen, titles the create modal,
  // and is the `authority_type` the payload must carry. All three read it from here
  // so the copy can never promise a tier the request doesn't send.
  const managedTier = useManagedTier();
  const managedLabel = managedTier ? AUTHORITY_LABELS[managedTier] : "account";
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);

  const columns = getUsersColumns({ onViewDetails: setDetailUser });

  return (
    <>
      <ModalTableShell<User, CreateUserValues, UpdateUserValues>
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
          description: `Manage ${managedLabel} accounts`,
        }}
        createModalTitle={`Create ${managedLabel} account`}
        editModalTitle="Edit profile"
        createFormComponent={UserForm}
        editFormComponent={UserProfileEditForm}
        onCreateApi={(values) => {
          // Unreachable behind `RequireStaff` (admin/superadmin both manage a tier),
          // but the payload field is required — fail loudly rather than send a
          // guess the backend would 403 as `AUTH_INVALID_AUTHORITY`.
          if (!managedTier) {
            return Promise.reject(
              new Error("Your role can't create accounts."),
            );
          }
          // Capture the admin-set temporary password so it can be re-shown once
          // after creation (the backend never returns it if the admin supplied one).
          const temp = values.password;
          return createUser({
            ...values,
            authority_type: managedTier,
          }).then((created) => {
            setIssuedPassword(created.temporary_password ?? temp ?? null);
            return created;
          });
        }}
        onEditApi={(values, record) => updateUser(record.id, values)}
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/authenticate/users"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <UserDetailDrawer
        user={detailUser}
        opened={detailUser !== null}
        onClose={() => setDetailUser(null)}
      />

      <OneTimeSecretModal
        opened={issuedPassword !== null}
        onClose={() => setIssuedPassword(null)}
        title="Account created"
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
