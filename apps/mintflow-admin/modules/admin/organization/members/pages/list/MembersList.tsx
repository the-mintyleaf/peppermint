"use client";

import { useParams, useRouter } from "next/navigation";
import { ModalPaper } from "@peppermint/ui";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { InviteMemberForm } from "../../form";
import type { InviteMemberFormValues } from "../../form";
import { createMembership, fetchMemberships } from "../../members.api";
import type { CreateMembershipPayload } from "../../members.api";
import { membersQueryKeys } from "../../members.queryKeys";
import type { OrganizationMembership } from "../../members.types";
import { getMembersColumns } from "./members.columns";

const tabs: DataTableShellTab[] = [
  { label: "All Members", icon: UsersIcon },
  {
    label: "Pending",
    icon: ClockIcon,
    filter: { membership_status: "invited" },
  },
  {
    label: "Active",
    icon: CheckCircleIcon,
    filter: { membership_status: "active" },
  },
  {
    label: "Suspended",
    icon: ProhibitIcon,
    filter: { membership_status: "suspended" },
  },
  { label: "Ended", icon: ArchiveIcon, filter: { membership_status: "ended" } },
];

function MembersListContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const router = useRouter();
  const columns = getMembersColumns();

  return (
    <ModalTableShell<OrganizationMembership, InviteMemberFormValues>
      queryKey={membersQueryKeys.list(orgId)}
      queryGetFn={(params) => fetchMemberships(orgId, params)}
      dataKey="data"
      paginationKey="meta"
      columns={columns}
      moduleInfo={{
        name: "membership",
        label: "Members",
        description: "Actors invited into this organization",
      }}
      idAccessor="id"
      createFormComponent={InviteMemberForm}
      onCreateApi={(values) => {
        const formValues = values;
        const payload: CreateMembershipPayload = {
          user_id: formValues.user_id as string,
          employee_code: formValues.employee_code || undefined,
          joined_at: formValues.joined_at || undefined,
          is_primary: formValues.is_primary,
        };
        return createMembership(orgId, payload);
      }}
      onReviewClick={(record) =>
        router.push(`/admin/organization/${orgId}/members/${record.id}`)
      }
      getErrorMessage={getApiErrorMessage}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      tabs={tabs}
      basePath={`/admin/organization/${orgId}/members`}
      mainComponent={ModalPaper}
    />
  );
}

export function MembersList() {
  return (
    <RequireStaff>
      <MembersListContent />
    </RequireStaff>
  );
}
