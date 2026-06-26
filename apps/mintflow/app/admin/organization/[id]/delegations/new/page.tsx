import { DelegationNew } from "../../../../../../modules/admin/organization/delegations";

export default function DelegationNewPage({
  params,
}: {
  params: { id: string };
}) {
  return <DelegationNew orgId={params.id} />;
}
