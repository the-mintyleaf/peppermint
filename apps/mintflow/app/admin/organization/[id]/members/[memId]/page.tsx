import { MembershipView } from "../../../../../../modules/admin/organization/memberships";

export default function MembershipViewPage({
  params,
}: {
  params: { id: string; memId: string };
}) {
  return <MembershipView orgId={params.id} membershipId={params.memId} />;
}
