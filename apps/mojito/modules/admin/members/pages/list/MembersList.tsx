"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../../members.api";
import { membersColumns } from "./members.columns";
import { memberQueryKeys } from "../../members.queryKeys";
import { MemberForm } from "../../form/MemberForm";
import type { Member } from "../../members.types";

const tabs: DataTableShellTab[] = [
  { label: "All Members", icon: UsersIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "Suspended", icon: ProhibitIcon, filter: { status: "suspended" } },
];

export function MembersList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<Member>
        queryKey={memberQueryKeys.list()}
        queryGetFn={fetchMembers}
        dataKey="data"
        paginationKey="meta"
        columns={membersColumns}
        moduleInfo={{
          name: "members",
          label: "Members",
          description: "Manage library members and memberships",
        }}
        idAccessor="id"
        createFormComponent={MemberForm}
        editFormComponent={MemberForm}
        onCreateApi={(values) => createMember(values)}
        onEditApi={(values) => updateMember(values.id, values)}
        onDeleteApi={(id) => deleteMember(String(id))}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/members"
      />
    </Paper>
  );
}
