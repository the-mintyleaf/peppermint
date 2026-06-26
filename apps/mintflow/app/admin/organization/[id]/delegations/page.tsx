import { DelegationList } from "../../../../../modules/admin/organization/delegations";

export default function DelegationsPage({
  params,
}: {
  params: { id: string };
}) {
  return <DelegationList orgId={params.id} />;
}
