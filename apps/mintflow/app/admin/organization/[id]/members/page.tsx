import { MembershipList } from "../../../../../modules/admin/organization/memberships";

export default function MembersPage({ params }: { params: { id: string } }) {
  return <MembershipList orgId={params.id} />;
}
