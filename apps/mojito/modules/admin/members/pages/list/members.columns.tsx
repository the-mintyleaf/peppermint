import { Badge } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Member, MemberStatus, MembershipType } from "../../members.types";

const statusColor: Record<MemberStatus, string> = {
  active: "green",
  suspended: "red",
};

const membershipColor: Record<MembershipType, string> = {
  basic: "gray",
  premium: "violet",
};

export const membersColumns: DataTableShellColumn<Member>[] = [
  { accessor: "name",           title: "Name",            sortable: true },
  { accessor: "email",          title: "Email",           sortable: true },
  { accessor: "phone",          title: "Phone" },
  {
    accessor: "membershipType",
    title: "Membership",
    render: (record) => (
      <Badge size="xs" color={membershipColor[record.membershipType as MembershipType]}>
        {record.membershipType}
      </Badge>
    ),
  },
  { accessor: "joinedDate", title: "Joined", sortable: true },
  {
    accessor: "status",
    title: "Status",
    render: (record) => (
      <Badge size="xs" color={statusColor[record.status as MemberStatus]}>
        {record.status}
      </Badge>
    ),
  },
];
