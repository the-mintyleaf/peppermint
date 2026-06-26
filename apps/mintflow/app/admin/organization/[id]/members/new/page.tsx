import { MembershipNew } from "../../../../../../modules/admin/organization/memberships";

export default function MembersNewPage({ params }: { params: { id: string } }) {
  return <MembershipNew orgId={params.id} />;
}
