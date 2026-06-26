import { PositionList } from "../../../../../modules/admin/organization/positions";

export default function PositionsPage({ params }: { params: { id: string } }) {
  return <PositionList orgId={params.id} />;
}
