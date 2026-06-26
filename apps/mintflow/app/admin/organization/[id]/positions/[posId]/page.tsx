import { PositionView } from "../../../../../../modules/admin/organization/positions";

export default function PositionViewPage({
  params,
}: {
  params: { id: string; posId: string };
}) {
  return <PositionView orgId={params.id} positionId={params.posId} />;
}
